import * as React from 'react';
import { debounce } from '../utils'


interface Props {
    onChange: (value: string) => void;
  }


export function SearchUserBox(props: Props) {

    const [inputValue, setInputValue] = React.useState('');

    const debouncedOnChange = React.useMemo(
        () => debounce(props.onChange, 250), // 250ms de espera
        [props.onChange] // La dependencia es la prop onChange
    );


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        // Actualiza el estado local inmediatamente para que el input se sienta responsivo
        setInputValue(newValue);
        // Llama a la versión debounced de la prop onChange
        debouncedOnChange(newValue);
    };

    // React.useEffect(() => {
    //     // La función retornada por debounce (debouncedOnChange) puede tener un método 'cancel'
    //     // si lo implementaste así. Si no, esta limpieza es más compleja.
    //     // Asumiendo que tu debounce no tiene 'cancel', esta limpieza es más conceptual.
    //     // El clearTimeout dentro de debounce se encargará si se llama de nuevo.
    //     // Si necesitas cancelar explícitamente al desmontar, tu debounce necesitaría exponer un método cancel.
    //     return () => {
    //         // Si tu debounce tuviera un método cancel:
    //         // debouncedOnChange.cancel?.();
    //     };
    // }, [debouncedOnChange]);


    return (
        <div style={{ display: "flex", alignItems: "center", columnGap : 10, width: "50%" }}>
        <input
            type="search"
            placeholder="Search by name, phone number, organization, status, role, etc "
            style={{ width: "clamp(200px, 900px, 1500px)" }}
            value={inputValue}
            onChange={handleChange}
        />
        </div>
    )
}


// Add display name for debugging purposes
SearchUserBox.displayName = 'SearchUserBox'