import * as React from 'react';
import * as Router from 'react-router-dom';
//import { db } from '../firebase-config'; // Asegúrate que esta ruta sea correcta
import { firestoreDB as db, getUsersFromDB } from '../services/firebase'; 
import { collection, getDocs, doc, setDoc, onSnapshot } from 'firebase/firestore';


import { User } from '../classes/User'; // Definir esta clase/interfaz
//import { IProjectAssignment, } from '../types'; 
import { IProjectAssignment, IUser, UserRoleInAppKey } from '../types'; 
import { ProjectsManager } from '../classes/ProjectsManager';
import { LoadingIcon, NewUserForm, UsersBoardList, ProjectSelector, SearchUserBox, MessagePopUp, type MessagePopUpProps, CounterBox, UsersSortMenu, type UserSortKey, UserInvitationForm } from '../react-components'; 


import { MainUsersIndex, SearchIcon, AddIcon, }  from './icons';
import { Project } from '../classes/Project';
import { useUserSearch, useUsersCache, useStickyState, useDebounce } from '../hooks';
import { UsersManager } from '../classes/UsersManager';
import { useAuth } from '../Auth/react-components/AuthContext';
import { USERS_CACHE_KEY, CACHE_TIMESTAMP_KEY, SYNC_INTERVAL } from '../const';
import { getAuth, sendSignInLinkToEmail } from 'firebase/auth';



interface Props {
    usersManager: UsersManager,
    projectsManager: ProjectsManager,
    onUserCreate: (newUserCreate: User) => void
    onUserUpdate: (updatedUser: User) => void
}


export function UsersBoardPage({
    usersManager,
    projectsManager,
    onUserCreate,
    onUserUpdate,
}: Props) {
    const { currentUser, userProfile, loading: authLoading } = useAuth();
    const [viewMode, setViewMode] = React.useState<'allUsers' | 'projectUsers'>('allUsers');
    //const [users, setUsers] = React.useState<User[]>([]);
    //const [projects, setProjects] = React.useState<Project[]>([]); 

    const projects = React.useMemo(() => {
        return projectsManager?.list || [];
      }, [projectsManager?.list]); // Solo cambia cuando cambia la lista


    const [selectedProject, setSelectedProject] = React.useState<string | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    //const [isSyncing, setIsSyncing] = React.useState(false)

    // Estado para el modal de editar un usuario
    const [isNewUserFormOpen, setIsNewUserFormOpen] = React.useState(false);
    const [userToEdit, setUserToEdit] = React.useState<User | null>(null);

    // Estado para el modal de asignación de proyectos (ejemplo)
    const [isAssignFormOpen, setIsAssignFormOpen] = React.useState(false);
    const [currentUserForAssignment, setCurrentUserForAssignment] = React.useState<User | null>(null);

    const [showMessagePopUp, setShowMessagePopUp] = React.useState(false)
    const [messagePopUpContent, setMessagePopUpContent] = React.useState<MessagePopUpProps | null>(null)

    const [isInvitationModalOpen, setIsInvitationModalOpen] = React.useState(false);


    // Estados para el menú de ordenación
    const [isSortMenuOpen, setIsSortMenuOpen] = React.useState(false);
    const sortButtonRef = React.useRef<HTMLButtonElement>(null);
    // // Estado para la lógica de ordenación (preparado para el siguiente paso)
    // const [sortBy, setSortBy] = React.useState<UserSortKey>('nickName');
    // Clave única para guardar la preferencia de ordenación en localStorage, específica para cada usuario.
    const userSortByKey = currentUser ? `userSortBy_${currentUser.uid}` : 'userSortBy_guest';
    // Reemplazamos React.useState con nuestro hook useStickyState para hacer la ordenación persistente.
    const [sortBy, setSortBy] = useStickyState<UserSortKey>('nickName', userSortByKey);


    // Lógica de permisos para la página
    const canManageUsers = userProfile?.roleInApp === 'admin' || userProfile?.roleInApp === 'superadmin';

    // Estado para el término de búsqueda global
    //const [userSearchTerm, setUserSearchTerm] = React.useState('');

    const lastSyncRef = React.useRef<number>(Date.now());

    const {
        users,
        setUsers,
        updateCache,
        hasCache,
        isStale,        
    } = useUsersCache(usersManager)

    const {
        userSearchTerm, // Término de búsqueda actual
        setUserSearchTerm,
        filteredUsers, // Lista de usuarios filtrada 
        handleSearchChange: handleUserSearchChange // Función para actualizar el término de búsqueda
    } = useUserSearch(users)



    // Verificar si necesitamos sincronizar
    const shouldSync = React.useCallback(() => {
        const now = Date.now();
        return now - lastSyncRef.current > SYNC_INTERVAL;
    }, []);



    /**
     * Efecto para gestionar el estado de carga inicial de la página.
     * La página se considera "cargando" hasta que la autenticación haya terminado y
     * ambos managers (ProjectsManager y UsersManager) estén listos.
     */
    React.useEffect(() => {
        console.log('[UsersBoardPage] useEffect for initial loading triggered.');
        if (authLoading) {
            setIsLoading(true);
            return;
        }

        // Establecer isLoading a true si alguno de los managers no está listo
        setIsLoading(!projectsManager.isReady || !usersManager.isReady);

        const onManagersReady = () => {
            if (projectsManager.isReady && usersManager.isReady) {
                setIsLoading(false);
                console.log('[UsersBoardPage] Both managers ready. Initial loading complete.');
            }
        };

        // Registrar callbacks para actualizar el estado de carga
        projectsManager.onReady(onManagersReady);
        usersManager.onReady(onManagersReady);

        // No es necesario un cleanup específico para estos callbacks en singletons.
    }, [authLoading, projectsManager, usersManager]);
    


    //Suscription to ProjectsManager events with control of refreshing    
    React.useEffect(() => {
        console.log('[UsersBoardPage] Subscribing to UsersManager events.');
        const handleUsersUpdate = () => {
            const updatedUsers = usersManager.list.map(user => ({
                ...user,
                accountCreatedAt: user.accountCreatedAt instanceof Date
                    ? new Date(user.accountCreatedAt.getTime())
                    : new Date(user.accountCreatedAt),
                lastLoginAt: user.lastLoginAt instanceof Date
                    ? new Date(user.lastLoginAt.getTime())
                    : new Date(user.lastLoginAt),
                // projectsAssigned: user.projectsAssigned.map(project => ({
                //     ...project,
                //     startDate: project.startDate instanceof Date
                //         ? new Date(project.startDate.getTime())
                //         : new Date(project.startDate),
                //     endDate: project.endDate instanceof Date
                //         ? new Date(project.endDate.getTime())
                //         : new Date(project.endDate)
                // })),
            }))



            //update cache and localStorage
            updateCache(updatedUsers);

            lastSyncRef.current = Date.now(); // Actualice timestamp

            console.log('User cache updated with projectsAssigned:', {
                usersCount: updatedUsers.length,
                projectsAssigendCount: updatedUsers.reduce((acc, u) => acc + u.projectsAssigned.length, 0)
            });
        };


        // Suscripción al callback general
        usersManager.onUsersListUpdated = handleUsersUpdate;


        return () => {
            console.log('[UsersBoardPage] Cleaning up UsersManager subscriptions.');
            usersManager.onUsersListUpdated = null;
        }
    }, [updateCache, usersManager])



    
    







    // ***************. useCallback para funciones  *******************



    const handleOpenNewUserModal = React.useCallback((user: User) => {
        setUserToEdit(user) // Guarda el usuario a editar
        console.log("Open edit user modal");
        setIsNewUserFormOpen(true);
    }, []);

    const handleCloseNewUserModal = React.useCallback(() => {
        setIsNewUserFormOpen(false);
        setUserToEdit(null); // Limpiar usuario al cerrar
    }, []);

    // Handler para abrir/cerrar el menú de ordenación
    const toggleSortMenu = React.useCallback(() => {
        setIsSortMenuOpen(prev => !prev);
    }, []);

    // Handler para cuando se selecciona una opción de ordenación
    const handleSort = React.useCallback((key: UserSortKey) => {
        console.log(`Sorting by: ${key}`);
        setSortBy(key);
    }, []);



    // CREO QUE ESTA NO HACE FALTA
    const onNewUserClick = () => {
        setIsNewUserFormOpen(true);
    };


// VEREMOS SI ESTA ES POSIBLE DESDE EL MENU DE CADA USERCARDROW
    const handleDeleteUser = (userId: string) => {
        console.log("Delete user ID:", userId);
        // Logic to delete a user
    };




    const auth = getAuth();


    /**
     * Envía un enlace de inicio de sesión al correo electrónico proporcionado.
     * Esta es la función principal para el flujo de invitación.
     */
    const handleSendInvitation = async (email: string) => {
        // Configuración para el enlace de acción de Firebase
        const actionCodeSettings = {
            // URL a la que se redirigirá al usuario después de hacer clic en el enlace.
            // Aquí es donde tu app manejará la finalización del registro.
            // El email se pasa como parámetro para pre-rellenar el formulario.
            url: `${window.location.origin}/finish-signup?email=${encodeURIComponent(email)}`,
            handleCodeInApp: true, // El flujo se completará en la app.
        };

        try {
            // Llama a la función de Firebase Auth para enviar el correo.
            // NOTA: Para que esto funcione, debes habilitar "Inicio de sesión con enlace de correo electrónico"
            // en tu consola de Firebase > Authentication > Sign-in method.
            await sendSignInLinkToEmail(auth, email, actionCodeSettings);
            // El feedback de éxito se maneja con toast.promise en el modal.
        } catch (error: any) {
            console.error("Error sending invitation link:", error);
            // Propaga el error para que toast.promise lo capture.
            throw new Error(error.message || "Could not send invitation.");
        }
    };




    // Hook useMemo para ordenar la lista de usuarios de forma eficiente.
    // Se re-ejecutará solo si la lista de usuarios filtrados (filteredUsers) o la clave de ordenación (sortBy) cambian.
    const sortedAndFilteredUsers = React.useMemo(() => {
        // Si no hay una clave de ordenación, devolvemos la lista filtrada tal cual.
        if (!sortBy) {
            return filteredUsers;
        }

        // Usamos .toSorted() para crear una nueva matriz ordenada sin mutar la original.
        // Esto es una práctica recomendada en React para evitar efectos secundarios.
        return filteredUsers.toSorted((a, b) => {
            // Obtenemos los valores a comparar. Usamos '?? '' como fallback para
            // propiedades que podrían ser null o undefined, evitando errores.
            const valueA = a[sortBy] ?? '';
            const valueB = b[sortBy] ?? '';

            // localeCompare es el método ideal para ordenar cadenas de texto alfabéticamente,
            // ya que maneja correctamente acentos y caracteres especiales.
            return valueA.localeCompare(valueB);
        });
    }, [filteredUsers, sortBy]); // Dependencias del hook




    const handleCreateUser = React.useCallback(async (userData: Omit<User, 'id' | 'projectsAssigned'>) => {
        try {
            // Esta función será llamada por NewUserForm después de crear el usuario en Firebase Auth y Firestore

        // Aquí integrarías Firebase Authentication para crear el usuario
        // y luego guardarías userData en Firestore con el UID obtenido.
        // Por ahora, simularemos la creación en Firestore.
        // const newUserRef = doc(collection(db, "users")); // Firestore genera ID
        // await setDoc(newUserRef, { ...userData, accountCreatedAt: new Date() });
            console.log("User data to create:", userData);
            // setIsNewUserModalOpen(false); // Cierra el modal después de crear
        // La lista se actualizará automáticamente gracias a onSnapshot
        // Si necesitas pasar el usuario creado al componente padre (App.tsx), puedes usar `onUserCreate(createdUser)`.
            setIsNewUserFormOpen(false);
        } catch (error) {
            console.error('Error creating user:', error);
            setError('Failed to create user');
        }
    }, []);




    const handleUpdateUser = React.useCallback((updatedUser: User) => {
        console.log("User updated (callback in UsersBoardPage):", updatedUser);
        // `users` state se actualizará automáticamente por `onSnapshot`.
            // Si necesitas pasar el usuario actualizado al componente padre (App.tsx), puedes usar `onUserUpdate(updatedUser)`.

    
    }, []);



    // Funciones para abrir/cerrar modal de asignación y manejar la asignación
    const handleOpenAssignModal = React.useCallback((user: User) => {
        setCurrentUserForAssignment(user);
        setIsAssignFormOpen(true);
    }, []);
    
    const handleAssignProjectsToUser = async (userId: string, assignments: IProjectAssignment[]) => {
        // Lógica para escribir en la subcolección 'projectsAssigned' de Firestore
        console.log(`Assigning projects to user ${userId}:`, assignments);
        // assignments.forEach(async (assignment) => {
        //   const assignmentRef = doc(db, `users/${userId}/projectsAssigned/${assignment.projectId}`);
        //   await setDoc(assignmentRef, assignment, { merge: true });
        // });
        setIsAssignFormOpen(false);
    };


    const handleProjectSelectionForView = (projectId: string | null) => {
        setSelectedProject(projectId);
        setViewMode(projectId ? 'projectUsers' : 'allUsers');
    };
    
    
    const handleUserSearch = React.useCallback((value: string) => {
        setUserSearchTerm(value)
    }, [setUserSearchTerm])



    // **************. useEffect para side effects **********************

    // // This useEffect now only sets the initial loading state based on auth and current user.
    // // The actual user data fetching and syncing is handled by the UsersManager instance itself (via its internal onSnapshot).
    // React.useEffect(() => { 
    //     // Only set loading if auth is still loading or no user is present
    //     if (authLoading || !currentUser) {
    //         console.log('UsersBoardPage: Skipping user fetch, auth loading or no user.');
    //         setIsLoading(false); 
    //         return;
    //     }


    //     // If we have a user and auth is done, and we don't have cached data yet, show loading.
    //     // The actual data will come from UsersManager's internal subscription.
    //     if (!hasCache && !isLoading) {
    //         setIsLoading(true);
    //     }
        
    //     // Once usersManager.list is populated (via its internal onSnapshot),
    //     // the handleUsersUpdate callback (defined above) will update the local `users` state and `hasCache`.
    //     // This will then cause `isLoading` to be set to `false`.
    //     // No need for a direct onSnapshot here.
    //     setIsLoading(false); // Assume UsersManager will handle loading state internally or via callbacks
    // }, [authLoading, currentUser, hasCache]);






//     // **********************. useMemo para cálculos pesados ***********************

    
//     // --- Lógica de Búsqueda y Filtrado ---


//     // Calcular la lista filtrada usando useMemo
//     const usersListFiltered = React.useMemo(() => {

//         return filteredUsers.map((user) => (
//             <Router.Link
//                 to={`/userBoard/${user.id}`}
//                 key={user.id}
//                 onClick={() => handleUserLinkClick(user.id!)}
//             >
//                  {/* UserCardRow will be used inside UsersBoardList */}
//     //             <div>User: {user.nickName || user.email}</div>
//             </Router.Link>
//         ))
//     }, [filteredUsers])
//    // This useMemo might not be needed if UsersBoardList handles the direct rendering of UserCardRow 




    
   if (authLoading || isLoading) return <LoadingIcon />; // Mostrar loading si auth está cargando O si la carga de usuarios está en curso
    if (error) return <p>Error: {error}</p>;



    const authCurrentUserRole = "admin"



    return (
        <section className="page" id="users-page" data-page="">
            <header className="header-users" style={{ height: 120 }}>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        rowGap: 25,
                    }}>
                    
                    <h2 style={{ display: "flex", alignItems: "center", columnGap: 20 }}>
                        Users Board
                        <MainUsersIndex size={24}
                            className="todo-icon-edit"
                            color="var(--color-fontbase)"
                        />
                    
                        {/* Selector de Proyecto (para Parte 2) */}
                        <div style={{ display: "flex", alignItems: "center", columnGap: 10 }}>
                            <ProjectSelector
                                currentProject={projects.find(p => p.id === selectedProject) || null}
                                projectsList={projects}
                                onProjectSelect={handleProjectSelectionForView}
                            />
                        </div>
                    </h2>
                    <ul
                        id="users-sliding-nav1"
                        style={{
                            display: "flex",
                            columnGap: 25,
                            transform: "translateY(15px)",
                            zIndex: 100,
                            alignItems: "center"
                        }}
                    >
                        <li className="users-slide1" />
                        <li className="users-slide2" />
                        <li>
                            <a href="#/users" className="tab-buttons">
                                <span className="material-icons-round">people_alt</span>
                                Users
                            </a>
                        </li>
                        <li>
                            <a href="#/teams" className="tab-buttons" style={{ width: 175 }}>
                                <span className="material-icons-round">diversity_3</span>
                                Users by Proyects
                            </a>
                        </li>
                    </ul>
                    {/* <div style="display: flex; column-gap: 25px; transform: translateY(35px); z-index:100;" >
                            <button class="tab-button">
                                <span class="material-icons-round">people_alt</span>
                                Users
                            </button>
                            <button class="tab-button" style="width: 200px;">
                                <span class="material-icons-round">diversity_3</span>
                                Projects Teams
                            </button>
                        </div> */}
                </div>

                {/* Seccion de busqueda del header (ej: Nuevo Usuario) */}
                <div>
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "row-reverse",
                            columnGap: 20,
                            alignItems: "center"
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "row",
                                alignContent: "space-between"
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    columnGap: 10,
                                    justifyContent: "flex-end"
                                }}>
                                <div style={{ display: "flex", alignItems: "center", columnGap: 15, justifyContent: 'flex-end' }}>
                                    <SearchIcon size={24} className="todo-icon-plain" color="var(--color-fontbase)" />
                                    <SearchUserBox onChange={handleUserSearchChange} />
                                </div>
                                {/* <input
                                    type="search"
                                    id="search-user"
                                    placeholder="Search by name, email or phone number"
                                    style={{ width: 350 }}
                                />
                                <span className="material-icons-round">search</span> */}
                            </div>
                        </div>
                        {/* <div style={{ display: "flex", flexDirection: "end", columnGap: 10 }}>
                            <button
                                className="btn-secondary"
                                style={{ borderRadius: 10, width: "auto", border: 0 }}
                            >
                                <span className="material-icons-round">filter_alt</span>
                            </button>
                        </div> */}
                    </div>
                </div>
            </header>

            {/* OPCIONES DEL TABULADOR DE USUARIOS USUARIOS TOTALES Y EQUIPOS/PROYECTOS */}
            <div
                className="users-page-content"
                style={{ height: "calc(130px + 100vh)", position: "relative" 

                }}
            >

                <div className="header-user-page-content">
                    <div style={{ display: "flex", flexDirection: "row", columnGap: 20 }}>
                        <button
                            ref={sortButtonRef}
                            onClick={toggleSortMenu}
                            style={{ borderRadius: 10, width: "auto" }}
                            className="btn-secondary"
                        >
                            <span className="material-icons-round">swap_vert</span>
                            <p>Sort By</p>
                            <span className="material-icons-round">expand_more</span>
                        </button>
                        {/* El botón solo se renderiza si el usuario tiene permisos */}
                        {canManageUsers && (
                            <button
                                // onClick={onNewUserClick}
                                onClick={() => setIsInvitationModalOpen(true)} // Abre el nuevo modal de invitación
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
                {viewMode === 'allUsers' && (
                    <UsersBoardList
                        //users={filteredUsers}
                        users={sortedAndFilteredUsers}
                        onAssignProjects={handleOpenAssignModal}
                        onEditUser={handleOpenNewUserModal} 
                        onDeleteUser={handleDeleteUser}
                        onSort={handleSort}
                    />
                    //<p>Vista de Todos los Usuarios (UserList irá aquí)</p>
                )}
                {viewMode === 'projectUsers' && selectedProject && (
                    // <UsersBoardProjectView projectId={selectedProject} />
                    //<p>Vista de Usuarios por Proyecto {selectedProject} (ProjectUserView irá aquí)</p>
                    <div>
                        <h3>Users in Project: {projects.find(p => p.id === selectedProject)?.name || 'Unknown Project'}</h3>
                        {/* Aquí iría el componente UsersBoardProjectView, que filtraría los usuarios
                        basándose en el selectedProject y sus asignaciones.
                        Por ahora, un placeholder: */}
                        <p>Displaying users assigned to project ID: {selectedProject}. (UsersBoardProjectView component will go here)</p>
                        {/* Ejemplo de cómo podrías filtrar y mostrar:
                    <UsersBoardList users={filteredUsers.filter(u => u.projectsAssigned?.some(pa => pa.projectId === selectedProject))} onAssignProjects={handleOpenAssignModal} />
                    */}
                    </div>

                )}
                {viewMode === 'projectUsers' && !selectedProject && projects.length > 0 && (
                    <p>Please select a project from the dropdown to see assigned users.</p>
                )}
                {viewMode === 'projectUsers' && !selectedProject && projects.length === 0 && (
                    <p>No projects available to display users by project.</p>
                )}
            
            </div>

            <UserInvitationForm
                isOpen={isInvitationModalOpen}
                onClose={() => setIsInvitationModalOpen(false)}
                onSendInvitation={handleSendInvitation}
            />

            


            {/* {isAssignFormOpen && currentUserForAssignment && (
            <UserProjectAssignmentsModal
                isOpen={isAssignFormOpen}
                onClose={() => setIsAssignFormOpen(false)}
                user={currentUserForAssignment}
                projects={projects} // Pasar la lista de todos los proyectos
                onSubmitAssignments={handleAssignProjectsToUser}
            />
            )} */ }
            
            {/* {isLoading ? (
                            <LoadingIcon />
                        ) : (
                            <div id="project-list">
                                {filteredUsers.length > 0 ? usersListFiltered  : <p>No projects found</p>}
                            </div>
            )} */}
            {/* Render the NewUserForm conditionally */}
            {isNewUserFormOpen &&
                <NewUserForm
                    key={userToEdit?.id}
                    currentUserData={userToEdit} // Pass the userProfile data
                    usersManager={usersManager} // Pass the usersManager instance
                    authCurrentUserRole={userProfile?.roleInApp as UserRoleInAppKey | undefined} // Pass the role if needed for form logic
                    onClose={handleCloseNewUserModal}
                // onProfileUpdate={handleUpdateUser}
                    onProfileUpdate={(updatedData) => {
                    // Aquí puedes manejar la actualización si es necesario
                        console.log("User updated:", updatedData);
                        
                  }}
                    
                    onTriggerChangePassword={() => {
                        // No aplica para editar otros usuarios
                      }}
                


                    authCurrentUserRole={authCurrentUserRole}
                    onClose={handleCloseNewUserModal}
                    usersManager ={usersManager}
                    projectsManager={projectsManager}
                    onAssignProjects={handleOpenAssignModal}
                    onCreateUser={handleCreateUser}
                    onUpdateUser={handleUpdateUser}
                />}
            {showMessagePopUp && messagePopUpContent && (<MessagePopUp {...messagePopUpContent} />)}
            {isSortMenuOpen && (
                <UsersSortMenu
                    isOpen={isSortMenuOpen}
                    onClose={() => setIsSortMenuOpen(false)}
                    onSort={handleSort}
                    buttonRef={sortButtonRef}
                />
            )}



        </section>
    )
}


// Add display name for debugging purposes
UsersBoardPage.displayName = 'UsersBoardPage'


