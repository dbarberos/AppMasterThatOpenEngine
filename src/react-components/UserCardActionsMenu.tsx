import * as React from 'react';
import { CloseIcon, AssignProjectIcon, EditIcon, TrashIcon } from './icons';

interface UserActionsMenuProps {
    isOpen: boolean;
    onClose: () => void;
    onAssignProjects: () => void;
    onEditUser: () => void;
    onDeleteUser: () => void;
}

export const UserCardActionsMenu: React.FC<UserActionsMenuProps> = ({
    isOpen,
    onClose,
    onAssignProjects,
    onEditUser,
    onDeleteUser,
}) => {
    if (!isOpen) return null;

    return (
        <div className="user-actions-menu" onClick={(e) => e.stopPropagation()} style={{
            position: 'absolute',
        top: 'calc(100% + 10px)', // AQUÍ EL CAMBIO: 10px debajo del padre
        right: 0,
        zIndex: 1000,
        
        }}>
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
                
                <button onClick={onAssignProjects} className="btn-secondary action-button" title='Assign Projects'>
                    <AssignProjectIcon size={24}
                        className="todo-icon-edit"
                        color="var(--color-fontbase-dark)"
                    />            
                </button>
                
                <button onClick={onEditUser} className="btn-secondary action-button" title='Edit User'>
                    <EditIcon size={24}
                        className="todo-icon-edit"
                        color="var(--color-fontbase-dark)"
                    />            
                </button>
                
                <button onClick={onDeleteUser} className="btn-secondary delete action-button" title='Delete User'>
                        <TrashIcon size={24}
                        className="todo-icon-edit"
                        color="var(--color-fontbase-dark)"
                    />            
                </button>
            </div>
        </div>
    );
};
