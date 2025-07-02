// src/react-components/UserList.tsx (Conceptual)
import React from 'react';
import { User } from '../classes/User';
import { EditIcon, TrashIcon } from './icons'; // Asumiendo que tienes iconos
import { UserCardRow } from '../react-components/';
import { useAuth } from '../Auth/react-components/AuthContext'

interface UserListProps {
    users: User[];
    onAssignProjects: (user: User) => void; // Función para abrir el modal de asignación
    onEditUser: (user: User) => void; // Función para abrir el modal de edición
    onDeleteUser: (userId: string) => void; // Función para manejar la eliminación
}

export const UsersBoardList: React.FC<UserListProps> = ({
    users,
    onAssignProjects,
    onEditUser,
    onDeleteUser
}) => {

    
    //solo un elemento pueda estar expandido a la vez
    const [expandedUserId, setExpandedUserId] = React.useState<string | null>(null);

    // Obtén el perfil del usuario autenticado desde el contexto
    const { userProfile } = useAuth();
    
    // // Ejemplo de utilidad de permisos. ************ Pasado dentro de UserCardRow ***************
    // const userPermissions = {
    //     canViewUserDetails: (userToView: User, currentUser: User) => {
    //         // Admins pueden ver todo
    //         if (currentUser.roleInApp === 'admin' || currentUser.roleInApp === 'superadmin') return true;
        
    //         // Managers pueden ver usuarios de su mismo departamento
    //         if (currentUser.role === 'manager') {
    //             return userToView.department === currentUser.department;
    //         }
        
    //         // Usuarios normales solo pueden verse a sí mismos
    //         return userToView.id === currentUser.id;
    //     }
    // }
    
    if (users.length === 0) {
        return <p>No users found.</p>;
    }

    return (
        <div className="users-list" >
            

            {/* Cabecera de la tabla/lista de usuarios */}
            <div
                className="user-container-header"
                style={{ border: "none", backgroundColor: "transparent" }}
            >                
                <div
                    style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "left",
                        columnGap: 10
                    }}
                >
                    {/* <label for=""></label> */}
                    <label className="radio">
                        <input
                            name="bulk-checkbox"
                            type="checkbox"                        
                            defaultValue="all-selected"
                            title="Select all"
                        
                        //value={user.id}
                        />
                        <span className="checkmark"></span>
                    </label>
                    
                    <div>
                        <button
                            style={{ borderRadius: 10, width: "auto", whiteSpace: 'nowrap' }}
                            className="btn-secondary"
                        >
                            Bulk Actions
                            <label>
                                <span className="material-icons-round">expand_more</span>
                                {/* <select name="" id="" style="appearance: none;">
                                        <option value="Asign proyect">Asign proyect</option>
                                        <option value="Remove all projects">Remove all projects</option>
                                        <option value="Remove all roles">Remove all roles</option>
                                        <option value="Email Validation Accounts">Email Validation Accounts</option>
                                        <option value="Disable account">Disable account</option>
                                        <option value="Delete users">Delete users</option>
                                    </select> */}
                            </label>
                        </button>
                    </div>
                </div>
                <h5 style={{ width: '20%' }}></h5>
                <h5 style={{ width: '20%' }}>EMAIL</h5>
                <h5 style={{ width: '15%' }}>PHONE</h5>
                <h5 style={{ width: '15%', whiteSpace: 'nowrap' }}>ORGANIZATION / ROLE</h5>
                <h5 style={{ width: '', textAlign: 'center' }}>PROJECTS</h5>
                <h5 style={{ width: '', textAlign: 'center' }}>STATUS</h5>
                <h5 style={{ width: '', textAlign: 'center' }}>ACTIONS</h5>
            </div>
            {users.map(user => (
                <UserCardRow
                    key={user.id}
                    user={user}
                    isExpanded={expandedUserId === user.id}
                    onExpandToggle={(userId) => {
                        setExpandedUserId(prev => prev === userId ? null : userId);
                    }}
                    onAssignProjects={onAssignProjects}
                    onEditUser={onEditUser}
                    onDeleteUser={onDeleteUser}
                    authRole={userProfile?.roleInApp}
                />
            ))}

        </div>
    );
};


// Add display name for debugging purposes
UsersBoardList.displayName = 'UsersBoardList'

