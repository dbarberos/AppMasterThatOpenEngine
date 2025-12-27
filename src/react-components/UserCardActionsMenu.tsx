import * as React from 'react';
import * as ReactDOM from 'react-dom'; // Importar ReactDOM para los portales
import { CloseIcon, AssignProjectIcon, EditIcon, TrashIcon } from './icons';

interface UserActionsMenuProps {
    isOpen: boolean;
    onClose: () => void;
    onAssignProjects: () => void;
    onEditUser: () => void;
    onDeleteUser: () => void;
    // Props para el control de acceso basado en roles
    authRole?: 'admin' | 'superadmin' | string;
    authUserId?: string;
    targetUserId?: string;
    menuButtonRef: React.RefObject<HTMLButtonElement | null>;
}

export const UserCardActionsMenu: React.FC<UserActionsMenuProps> = ({
    isOpen,
    onClose,
    onAssignProjects,
    onEditUser,
    onDeleteUser,
    authRole,
    authUserId,
    targetUserId,
    menuButtonRef,
}) => {

    // Ref para el propio menú, para detectar clics fuera de él.
    const menuRef = React.useRef<HTMLDivElement>(null);
    // Estado para almacenar la posición calculada del menú.
    const [menuPosition, setMenuPosition] = React.useState<{ top: number; right: number } | null>(null);

    // Efecto para calcular la posición del menú cuando se abre.
    React.useEffect(() => {
        if (isOpen && menuButtonRef.current) {
            const rect = menuButtonRef.current.getBoundingClientRect();
            setMenuPosition({
                top: rect.bottom + window.scrollY + 5, // Posicionar 5px por debajo del botón
                right: window.innerWidth - rect.right - window.scrollX, // Alinear los bordes derechos
            });
        }
    }, [isOpen, menuButtonRef]);

    // Efecto para manejar los clics fuera del menú para cerrarlo.
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target as Node) &&
                menuButtonRef.current &&
                !menuButtonRef.current.contains(event.target as Node)
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
    }, [isOpen, onClose, menuButtonRef]);



    if (!isOpen  || !menuPosition) return null;

    // --- Lógica de Permisos ---
    const isSuperAdmin = authRole === 'superadmin';
    const isAdmin = authRole === 'admin';
    const isOwner = authUserId === targetUserId;

    // Superadmin y Admin pueden asignar proyectos a cualquier usuario.
    const canAssign = isSuperAdmin || isAdmin;

    // Solo Superadmin puede borrar.
    const canDelete = isSuperAdmin;

    // Superadmin/Admin pueden editar a cualquiera. Usuarios normales solo a sí mismos.
    const canEdit = isSuperAdmin || isAdmin || isOwner;

    // El menú solo debe ser visible si el usuario tiene al menos una acción disponible.
    // Esto evita mostrar un menú vacío a un usuario viendo el perfil de otro.
    const canPerformAnyAction = canAssign || canEdit || canDelete;

    // Si no hay ninguna acción posible, no renderizar el menú.
    if (!canPerformAnyAction) return null;








    return ReactDOM.createPortal(
        <div
            ref={menuRef}
            className="user-actions-menu"
            onClick={(e) => e.stopPropagation()}
            style={{
                position: 'fixed',
                top: `${menuPosition.top}px`,
                right: `${menuPosition.right}px`,
                zIndex: 1100, // Un z-index alto para que aparezca por encima de otros contenidos
            }}
        >
            <button
                className="close-button"
                onClick={onClose}
                style={{
                    position: "absolute",
                    top: 5,
                    right: 5,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    boxShadow: "none",
                    marginBottom: 5,
                }}
            >
                <CloseIcon size={16}
                    className="todo-icon-edit"
                    color="var(--color-fontbase)"
                />
            </button>
        
            <div className="menu-actions" style={{marginTop: 25, marginBottom: 15}}>               
                {canAssign && (
                    <button
                        onClick={onAssignProjects}
                        className="btn-secondary action-button"
                        title={'Assign Projects'}
                    >
                        <AssignProjectIcon size={24}
                            className="todo-icon-edit"
                            color="var(--color-fontbase-dark)"
                        />
                    </button>
                )}
                
                {canEdit && (
                    <button
                        onClick={onEditUser}
                        className="btn-secondary action-button"
                        title={'Edit User'}
                    >
                        <EditIcon size={24}
                            className="todo-icon-edit"
                            color="var(--color-fontbase-dark)"
                        />
                    </button>
                )}
                
                {canDelete && (
                    <button
                        onClick={ onDeleteUser }
                        className="btn-secondary delete action-button"
                        title={'Delete User'}
                    >
                        <TrashIcon
                            size={24}
                            className="todo-icon-edit"
                            color="var(--color-fontbase-dark)"
                        />
                    </button>
                )}
            </div>
        </div>,
        document.body 
    );
};

UserCardActionsMenu.displayName = 'UserCardActionsMenuRow';