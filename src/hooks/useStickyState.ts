import * as React from 'react';

export function useStickyState<T>(defaultValue: T, key: string): [T, React.Dispatch<React.SetStateAction<T>>] {
    const [value, setValue] = React.useState<T>(() => {
        try {
            const stickyValue = window.localStorage.getItem(key);
            // Intenta parsear solo si hay un valor guardado y no es 'undefined' o 'null' como string literal
            if (stickyValue !== null && stickyValue !== undefined && stickyValue !== '') {
                // Si guardas 'null' o 'undefined' como strings literales, manéjalos:
                if (stickyValue === 'null') {
                    // Si T puede ser null, esto funciona. Necesita `unknown` para type safety.
                    return null as unknown as T;
                }
                if (stickyValue === 'undefined') {
                    // Si T puede ser undefined, esto funciona.
                    return undefined as unknown as T;
                }
                // Solo parsea si es un string JSON válido y no vacío                
                return JSON.parse(stickyValue) as T;

            }
            
        } catch (error) {
            console.error(`Error parsing localStorage key “${key}”:`, error);
        }
        // Si no hay valor guardado, o es 'undefined'/'null', o hubo error, usa defaultValue
        // Fallback si no hay valor, es null, undefined, vacío, o hubo error
        return defaultValue;
    });

    
    React.useEffect(() => {
        try {
            // Guarda 'null' o 'undefined' como strings literales o elimina la clave
            if (value === undefined) {

                window.localStorage.setItem(key, 'undefined')
            } else if (value === null) {
                window.localStorage.setItem(key, 'null')
            } else {
                window.localStorage.setItem(key, JSON.stringify(value))
            }
        } catch (error) {
            console.error(`Error setting localStorage key “${key}”:`, error);
        }
    }, [key, value]);
    
    return [value, setValue];
}


// https://www.joshwcomeau.com/react/persisting-react-state-in-localstorage/
// https://www.joshwcomeau.com/snippets/react-hooks/use-sticky-state/