import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { IUser } from '../types';

// Definimos un tipo para las claves de ordenación válidas.
// // Usamos `keyof Pick<IUser, ...>` para asegurar que solo se puedan usar
// // propiedades válidas del tipo IUser, lo que previene errores.
// export type UserSortKey = keyof Pick<IUser, 'nickName' | 'email' | 'organization' | 'roleInApp' | 'status'>;


// Ampliamos el tipo para incluir todas las posibles claves de ordenación de IUser.
// Esto hace que el tipo sea más completo para futuros usos.
export type UserSortKey = keyof IUser;
export interface SortOption {
    key: UserSortKey;
    label: string;
}

interface UsersSortMenuProps {
    isOpen: boolean;
    onClose: () => void;
    onSort: (sortKey: UserSortKey) => void;
    buttonRef: React.RefObject<HTMLButtonElement | null>;
    sortOptions: SortOption[]; // Nueva prop para pasar las opciones de ordenación
}

export const UsersSortMenu: React.FC<UsersSortMenuProps> = ({
    isOpen,
    onClose,
    onSort,
    buttonRef,
    sortOptions,
}) => {
    const menuRef = React.useRef<HTMLDivElement>(null);
    const [menuPosition, setMenuPosition] = React.useState<{ top: number; left: number } | null>(null);

    // Efecto para calcular la posición del menú cuando se abre.
    // Se posicionará justo debajo del botón que lo activó.
    React.useEffect(() => {
        if (isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setMenuPosition({
                top: rect.bottom + window.scrollY + 5, // 5px por debajo del botón
                left: rect.left + window.scrollX,      // Alinear a la izquierda del botón
            });
        }
    }, [isOpen, buttonRef]);

    // Efecto para manejar los clics fuera del menú para cerrarlo.
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            // Si se hace clic fuera del menú y fuera del botón que lo abre, se cierra.
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target as Node) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target as Node)
            ) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose, buttonRef]);

    // No renderizar nada si el menú no está abierto o no se ha calculado su posición.
    if (!isOpen || !menuPosition) return null;

    // Función para manejar el clic en una opción de ordenación.
    const handleSortClick = (sortKey: UserSortKey) => {
        onSort(sortKey); // Llama a la función del padre.
        onClose();       // Cierra el menú.
    };

    // No hace falta ahora emplear esta seccion porque las opciones se pasan como prop.
    
    // // Definimos las opciones del menú.
    // const sortOptions: { key: UserSortKey; label: string }[] = [
    //     { key: 'nickName', label: 'Nickname' },
    //     { key: 'email', label: 'Email' },
    //     { key: 'organization', label: 'Organization' },
    //     { key: 'roleInApp', label: 'Role' },
    //     { key: 'status', label: 'Status' },
    // ];

    // Usamos un portal para renderizar el menú en el body, evitando problemas de z-index y overflow.
    return ReactDOM.createPortal(
        <div
            ref={menuRef}
            className="user-actions-menu" // Clase para estilos CSS.
            onClick={(e) => e.stopPropagation()}
            style={{
                position: 'absolute', // Usamos 'absolute' porque scrollY ya está en el cálculo.
                top: `${menuPosition.top}px`,
                left: `${menuPosition.left}px`,
                zIndex: 1100,
                width:  'fit-content'
            }}
        >
            <div className="menu-actions" style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {sortOptions.map(option => (
                    <button
                        key={option.key}
                        onClick={() => handleSortClick(option.key)}
                        className="btn-secondary action-button"
                        style={{ justifyContent: 'flex-start', width: '100%' }}
                    >
                        {option.label}
                    </button>
                ))}
            </div>
        </div>,
        document.body
    );
};

UsersSortMenu.displayName = 'UsersSortMenu';

