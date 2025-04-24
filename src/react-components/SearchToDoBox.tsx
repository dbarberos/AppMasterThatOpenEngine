import * as React from 'react';
import { debounce } from '../utils'

interface Props {
    onChange: (value: string) => void;
  }


export function SearchToDoBox(props: Props) {

    const [inputValue, setInputValue] = React.useState('');

    const debouncedOnChange = React.useMemo(
        () => debounce(props.onChange, 250), 
        [props.onChange]// La dependencia es la prop onChange
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        // Actualiza el estado local inmediatamente para que el input se sienta responsivo
        setInputValue(newValue);
        // Llama a la versión debounced de la prop onChange
        debouncedOnChange(newValue);
    };

    // //  Opcional: Limpieza si debounce tuviera un método cancel
    // React.useEffect(() => {
    //     return () => {
    //         // Si tu debounce tuviera un método cancel:
    //         // debouncedOnChange.cancel?.();
    //     };
    // }, [debouncedOnChange]);



    return (        
            <div style={{ display: "flex", alignItems: "center", }}>
                <input
                    id="todo-search-in-Project-Details"
                    type="search"
                    placeholder="Search inside TO-DO... "
                style={{}}
                value={inputValue}
                onChange={handleChange}
                />
            </div>
        
    )
}


// Add display name for debugging purposes
SearchToDoBox.displayName = 'SearchToDoBox'