import * as React from 'react';

interface SwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
    title?: string;
}

export function ToDoBoardSwitchDnD({ checked, onChange, disabled = false, title = 'Enable drag & drop' }: SwitchProps) {
    const id = React.useId(); // Generate a unique ID for accessibility
    
    const handleToggle = () => {        
        if (!disabled) { // Solo cambiar si no está deshabilitado
            onChange(!checked);
        }
    }

    return (
        <li
            className="checkbox-json"
            style={{                
                marginLeft: '15px',
                display: 'flex',
                alignItems: 'center',
                userSelect: 'none', 
                opacity: disabled ? 0.5 : 1, // Atenuar si está deshabilitado
                }}
        >
            <label
                htmlFor={id}
                className="radio"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    gap: '4px',
                }}
            >
                <input
                    type="checkbox"
                    id={id}
                    checked={checked}
                    onChange={handleToggle}
                    style={{ // Visually hide the default checkbox
                        cursor: disabled ? 'not-allowed' : 'pointer', // Cambiar cursor si está deshabilitado
                        position: 'absolute',
                        opacity: 0,
                        height: 0,
                        width: 0,
                    }}
                />
                <span
                    className="checkmark"
                    aria-hidden="true" // Hide from screen readers
                    style={{ cursor: disabled ? 'not-allowed' : 'pointer' }} // Aplicar cursor al checkmark también
                />
            </label>
            {title &&
                <span
                    style={{
                        fontSize: 'var(--font-lg)',
                        color: 'var(--color-fontbase)',
                        textShadow: '1px 1px 0 var(--color-light)',
                        userSelect: 'none',
                        display: 'inline-block',
                        cursor: disabled ? 'not-allowed' : 'default', // Cursor para el texto
                    }}
                >{title}</span>}
            
        </li>

    );
}