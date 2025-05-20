import * as React from 'react';


/**
 * Helper para parsear un valor de localStorage.
 * Devuelve el valor parseado, o null si el valor es null/undefined o hay un error de parseo.
 */
function parseJSONSafely<T>(jsonString: string | null, keyForErrorReporting: string): T | null {
    // Treat null, undefined, or empty string as invalid JSON for parsing.
    if (jsonString === null || jsonString === undefined || jsonString === "") {
        // If it was an empty string, it's corrupt data. Clean it up.
        if (jsonString === "") {
            console.warn(`useTrackedLocalStorage: Found empty string in localStorage for key "${keyForErrorReporting}". Treating as null and cleaning up.`);
            //window.localStorage.removeItem(keyForErrorReporting); // Clean up the empty string
       }
       
        return null;
    }
    try {
        return JSON.parse(jsonString) as T;
    } catch (error) {
        console.error(`useTrackedLocalStorage: Error parsing JSON for key “${keyForErrorReporting}” (value: "${jsonString}").`, error);
        return null; // O un valor por defecto específico si es apropiado
    }
}


/**
 * Hook personalizado para leer un valor de localStorage y escuchar sus cambios.
 * Devuelve el valor actual de la clave en localStorage y se actualiza
 * si la clave cambia en localStorage debido a acciones externas (otra pestaña, etc.).
 *
 * @param key La clave en localStorage que se quiere rastrear.
 * @returns El valor actual de la clave (string) o null si no existe o hay un error.
 */
export function useTrackedLocalStorage(key: string): string | null {
    // El tipo de retorno debería ser genérico T | null si el hook fuera genérico.
    // Para selectedProjectId, que es string | null, esto está bien.

    // Estado para almacenar el valor de localStorage.
    // Se inicializa leyendo directamente de localStorage.
    const [storedValue, setStoredValue] = React.useState<string | null>(() => {
        if (typeof window === "undefined") {
        return null; // Evitar errores en SSR (Server-Side Rendering)
        }
        // try {
        //     const item = window.localStorage.getItem(key);
        //     return item === "null" ? null : item; // Normalize "null" string to actual null
        // } catch (error) {
        // console.error(`Error al leer la clave de localStorage “${key}”:`, error);
        // return null;
        // }
        const item = window.localStorage.getItem(key);
        console.log(`useTrackedLocalStorage: Initial read for key “${key}” (raw value: "${item}")`);
        return parseJSONSafely<string>(item, key);
    });

    // useCallback para memoRizar el manejador del evento.
    // Esto evita que se cree una nueva función en cada renderizado,
    // optimizando el useEffect que lo usa como dependencia.
    const handleStorageChange = React.useCallback((event: StorageEvent) => {
        // Verificar si el evento 'storage' corresponde a la clave que estamos rastreando
        // y si el cambio ocurrió en localStorage.
        if (event.key === key && event.storageArea === window.localStorage) {
        // try {
            // event.newValue es el nuevo valor como string, o null si se eliminó la clave.
        //     const newValueFromEvent = event.newValue;
        //     setStoredValue(newValueFromEvent === "null" ? null : newValueFromEvent); // Normalize "null" string
        // } catch (error) {
        //     console.error(`Error al procesar el evento de storage para la clave “${key}”:`, error);
        //     setStoredValue(null); // Fallback en caso de error
            // }


            setStoredValue(parseJSONSafely<string>(event.newValue, key));
        }
    }, [key]); // Dependencia: la clave que rastreamos

    React.useEffect(() => {
        if (typeof window === "undefined") {
        return; // Salir si no estamos en el navegador
        }

        // Sincronizar el valor al montar, en caso de que haya cambiado entre el renderizado inicial y el efecto.
        const rawCurrentValueFromStorage = window.localStorage.getItem(key);
        console.log(`useTrackedLocalStorage: useEffect sync read for key “${key}” (raw value: "${rawCurrentValueFromStorage}")`)
        // const normalizedCurrentValue = rawCurrentValueFromStorage === "null" ? null : rawCurrentValueFromStorage; // Normalize
        // if (normalizedCurrentValue !== storedValue) { // Compare normalized with current state
        //     setStoredValue(normalizedCurrentValue);


        const parsedCurrentValue = parseJSONSafely<string>(rawCurrentValueFromStorage, key);

        // Compara el valor parseado actual con el estado actual.
        // Para string | null, la comparación directa es suficiente.
        if (parsedCurrentValue !== storedValue) {
            setStoredValue(parsedCurrentValue);

        }

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [key, handleStorageChange, storedValue]);

    return storedValue;
}