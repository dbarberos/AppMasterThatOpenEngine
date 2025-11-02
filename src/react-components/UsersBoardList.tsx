// src/react-components/UserList.tsx (Conceptual)
import React from 'react';
import { User } from '../classes/User';
import { AddIcon, EditIcon, TrashIcon } from './icons';
import { UserCardRow, UserSortKey, UsersSortMenu,  type SortOption  } from '../react-components/';
import { useAuth } from '../Auth/react-components/AuthContext';
import { useUserBoardContext } from './UsersBoardPage';



// interface UserListProps {
//     users: User[];
//     onAssignProjects: (user: User) => void; // Función para abrir el modal de asignación
//     onEditUser: (user: User) => void; // Función para abrir el modal de edición
//     onDeleteUser: (userId: string) => void; // Función para manejar la eliminación
//     onSort: (sortKey: UserSortKey) => void; // Función para manejar el ordenamiento
// }

// export const UsersBoardList: React.FC<UserListProps> = ({
//     users,
//     onAssignProjects,
//     onEditUser,
//     onDeleteUser,
//     onSort,
// }) => {

export const UsersBoardList: React.FC = () => {
    const {
        sortedAndFilteredUsers: users, // Renombramos para usarlo localmente
        onAssignProjects,
        onEditUser,
        onDeleteUser,
        onSortUsers: onSort, // Renombramos la prop del contexto para claridad
        onInviteUser,
    } = useUserBoardContext();

        console.log('[UsersBoardList] Componente Renderizado con props:', {
        userCount: users.length,
        users: users.map(u => u.nickName || u.email)
    });


    // Estados y ref para el menú de ordenación, ahora locales a este header
    const [isSortMenuOpen, setIsSortMenuOpen] = React.useState(false);
    const sortButtonRef = React.useRef<HTMLButtonElement>(null);
    
    //solo un elemento pueda estar expandido a la vez
    const [expandedUserId, setExpandedUserId] = React.useState<string | null>(null);

    // Obtén el perfil del usuario autenticado desde el contexto
    const { currentUser, userProfile } = useAuth();
    
    // Lógica de permisos para acciones en masa
    const canPerformBulkActions = userProfile?.roleInApp === 'admin' || userProfile?.roleInApp === 'superadmin';
    
    
    // Lógica de permisos para acciones en masa
    const canManageUsers = userProfile?.roleInApp === 'admin' || userProfile?.roleInApp === 'superadmin';

    
    const toggleSortMenu = React.useCallback(() => {
        setIsSortMenuOpen(prev => !prev);
    }, []);






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
        console.log('[UsersBoardList] No hay usuarios para renderizar.');
        return <p>No users found.</p>;
    }

    return (
        <>
            {/* --- HEADER SECUNDARIO --- */}
            {/* Este es el header que movimos desde UsersBoardPage */}
            <div className="header-user-page-content">
                <div style={{ display: "flex", flexDirection: "row", columnGap: 20 }}>
                    <button
                        ref={sortButtonRef}
                        onClick={toggleSortMenu}
                        style={{  width: "auto" }}
                        // className="btn-secondary"
                    >
                        <AddIcon size={24} className="todo-icon-plain" color="var(--color-fontbase-dark)" />
                        {/* <p style={{ color: "var(--color-fontbase-dark)" }}>Invite a new User</p>
                        <span className="material-icons-round">swap_vert</span> */}
                        <p style={{ color: "var(--color-fontbase-dark)" }}>Sort By</p>
                        <span className="material-icons-round">expand_more</span>
                    </button>

                    {canManageUsers && (
                        <button
                            onClick={onInviteUser} // Usamos la función del contexto
                            id="new-user-btn"
                            style={{ whiteSpace: 'nowrap' }}
                            title="Invite a new User"
                        >
                            <AddIcon size={24} className="todo-icon-plain" color="var(--color-fontbase-dark)" />
                            <p style={{ color: "var(--color-fontbase-dark)" }}>Invite a new User</p>
                        </button>
                    )}
                </div>
            </div>


        <div className="users-list" style={{ gap: '1.5rem' }}>
            

            {/* Cabecera de la tabla/lista de usuarios */}
            <div
                className="user-container-header"
                style={{ border: "none", backgroundColor: "transparent" }}
            >
                {/* El contenedor de acciones en masa solo se renderiza si el usuario tiene permisos */}
                    {/* {canPerformBulkActions ? ( */}
                    {canManageUsers ? (
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
                                title= "Select all"
                            
                            //value={user.id}
                            />
                            <span className="checkmark"></span>
                        </label>
                        
                        <div>
                            <button
                                style={{
                                    borderRadius: 10,
                                    width: "auto",
                                    whiteSpace: 'nowrap'
                                }}
                                className="btn-secondary"  
                                title= "Bulk Actions"
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
                ) :
                    <div></div>
                }
                <h5 style={{ width: '20%' }}></h5>
                {/* <h5 style={{ width: '20%' }}>EMAIL</h5> */}
                <button
                    style={{ width: '20%' }}
                    className="header-sort-button"
                    onClick={() => onSort('email')}
                >
                    EMAIL
                </button>
                <h5 style={{ width: '15%' }}>PHONE</h5>
                <div style={{display: 'flex', flexDirection: 'row',  width: '20%' }}>
                    <button
                        // style={{ width: '20%' }}
                        className="header-sort-button"
                        onClick={() => onSort('organization')}
                    >
                        ORGANIZATION/
                    </button>
                    <button
                        style={{ width: '20%' }}
                        className="header-sort-button"
                        onClick={() => onSort('roleInApp')}
                    >
                        ROLE
                    </button>
                </div>
                {/* <h5 style={{ width: '15%', whiteSpace: 'nowrap' }}>ORGANIZATION / ROLE</h5> */}
                <h5 style={{ width: '', textAlign: 'center' }}>PROJECTS</h5>
                <button
                    style={{ justifyContent: 'center' }}
                    className="header-sort-button" onClick={() => onSort('status')}>
                    STATUS
                </button>
                {/* <h5 style={{ width: '', textAlign: 'center' }}>STATUS</h5> */}
                <h5 style={{ width: '', textAlign: 'center' }}>ACTIONS</h5>
                </div>
                
                <div> 
                    {users.map(user => (
                        <React.Fragment key={user.id}>
                            {console.log(`[UsersBoardList] Mapeando usuario a UserCardRow: ${user.id} - ${user.nickName || user.email}`)}
                            
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
                            authUserId={currentUser?.uid}
                        />
                        </React.Fragment>
                    ))}
                </div>

            </div>
            
            {isSortMenuOpen && (
                <UsersSortMenu
                    isOpen={isSortMenuOpen}
                    onClose={() => setIsSortMenuOpen(false)}
                    onSort={onSort}
                    buttonRef={sortButtonRef}
                    sortOptions={[
                        { key: 'nickName', label: 'Nickname' },
                        { key: 'email', label: 'Email' },
                        { key: 'organization', label: 'Organization' },
                        { key: 'roleInApp', label: 'Role in App' },
                        { key: 'status', label: 'Status' },
                    ] as SortOption[]}
                />
            )}

        </>
    );
};


// Add display name for debugging purposes
UsersBoardList.displayName = 'UsersBoardList'

