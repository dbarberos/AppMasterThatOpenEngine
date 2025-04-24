type DebouncedCallback<T extends (...args: any[]) => any> = (...args: Parameters<T>) => void


/** 
 * Crea una versión "debounced" de una función.
 * La función debounced solo se ejecutará después de que haya pasado un cierto tiempo (`wait`)
 * sin que se haya llamado de nuevo.
 *
 * @param callback La función original a la que aplicar debounce.
 * @param wait El número de milisegundos a esperar antes de ejecutar el callback.
 * @returns Una nueva función debounced.
 */

export function debounce<T extends (...args: any[]) => any>(
    callback,
    wait
): DebouncedCallback<T> {
    // ReturnType<typeof setTimeout> para compatibilidad entre navegador y Node.js
    //let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let timeoutId: number | null = null;

    return (...args: Parameters<T>):void => {
        if (timeoutId !== null) {
            window.clearTimeout(timeoutId)
        }
        //window.clearTimeout(timeoutId);

        // Establecemos un nuevo timeout para ejecutar el callback después del tiempo de espera
        timeoutId = window.setTimeout(() => {
            // Usamos 'apply' para llamar al callback original.
            // 'null' se usa como contexto 'this' (puedes cambiarlo si necesitas un contexto específico).
            // 'args' son los argumentos pasados a la función debounced.
            callback.apply(null, args);
        }, wait);
    };
}


// https://www.joshwcomeau.com/snippets/javascript/debounce/