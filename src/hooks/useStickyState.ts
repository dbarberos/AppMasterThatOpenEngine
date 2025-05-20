import * as React from 'react';

/**
 * Hook personalizado que persiste un estado en localStorage.
 * Utiliza JSON.stringify y JSON.parse para manejar diferentes tipos de datos.
 *
 * @param defaultValue El valor inicial si no hay nada en localStorage.
 * @param key La clave de localStorage a usar.
 * @returns Un array con el valor actual y una función para actualizarlo.
 */

export function useStickyState<T>(defaultValue: T, key: string): [T, React.Dispatch<React.SetStateAction<T>>] {
    const [value, setValue] = React.useState<T>(() => {
        if (typeof window === "undefined") {
            return defaultValue; // Manejar Server-Side Rendering
        }
        const stickyValue = window.localStorage.getItem(key);
        if (stickyValue !== null) { // Comprobar si el ítem existe
            if (stickyValue === "") { // Manejo explícito de cadena vacía
                console.warn(`useStickyState: Found empty string for key "${key}". Treating as defaultValue and cleaning up.`);
                window.localStorage.removeItem(key); // Limpiar la cadena vacía
                return defaultValue;
            }
            try {
                // If stickyValue is an empty string, JSON.parse will throw an error.
                // This will be caught by the catch block, and defaultValue will be returned, which is correct.
                // Siempre parsear. JSON.parse maneja "null", "true", números y cadenas entrecomilladas correctamente.
                // Por ejemplo, JSON.parse('"null"') devuelve null. JSON.parse('""abc""') devuelve "abc".
                console.log(`useStickyState: Attempting to parse localStorage key “${key}” (raw value: "${stickyValue}")`);
                return JSON.parse(stickyValue) as T;
            } catch (error) {
                console.error(`useStickyState: Error parsing localStorage key “${key}” (value: "${stickyValue}"). Falling back to defaultValue.`, error);
                // Si el parseo falla (ej. JSON malformado), retornar defaultValue.
                // Eliminar el ítem corrupto para evitar el error en futuras cargas.
                window.localStorage.removeItem(key);
                
                return defaultValue;
            }
        }
        // Si no hay valor guardado o hubo error, usa defaultValue
        return defaultValue;
    });


    
    React.useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }
        try {
            if (value === null || value === undefined) {
                // Eliminar la clave si el valor es null/undefined, sin importar su estado previo
                window.localStorage.removeItem(key);
            } else {
                window.localStorage.setItem(key, JSON.stringify(value))
            }
        } catch (error) {
            console.error(`Error setting localStorage key “${key}”:`, error);
        }
    }, [key, value]);
    
    return [value, setValue] as const;
    // El uso de 'as const' asegura que el tipo de retorno sea exactamente [T, React.Dispatch<React.SetStateAction<T>>]
}


// https://www.joshwcomeau.com/react/persisting-react-state-in-localstorage/
// https://www.joshwcomeau.com/snippets/react-hooks/use-sticky-state/