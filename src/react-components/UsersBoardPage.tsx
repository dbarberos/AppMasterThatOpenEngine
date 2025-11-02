import * as React from 'react';
import * as Router from 'react-router-dom';
//import { db } from '../firebase-config'; // Asegúrate que esta ruta sea correcta
import { firestoreDB as db, getUsersFromDB } from '../services/firebase'; 
import { collection, getDocs, doc, setDoc, onSnapshot } from 'firebase/firestore';


import { User as AppUserClass } from '../classes/User'; // Definir esta clase/interfaz
//import { IProjectAssignment, } from '../types'; 
import { IProjectAssignment, IUser, UserRoleInAppKey } from '../types'; 
import { ProjectsManager } from '../classes/ProjectsManager';
import { LoadingIcon, NewUserForm, UsersBoardList, ProjectSelector, SearchUserBox, MessagePopUp, type MessagePopUpProps, CounterBox, UsersSortMenu, type UserSortKey, UserInvitationForm } from '../react-components'; 


import { MainUsersIndex, SearchIcon, AddIcon, }  from './icons';
import { Project } from '../classes/Project';
import { useUserSearch, useUsersCache, useStickyState, useDebounce } from '../hooks';
import { UsersManager } from '../classes/UsersManager';
import { useAuth, UserProfile } from '../Auth/react-components/AuthContext';
import { USERS_CACHE_KEY, CACHE_TIMESTAMP_KEY, SYNC_INTERVAL, USER_ROL_IN_APP_PERMISSIONS } from '../const';
import { getAuth, sendSignInLinkToEmail, User as FirebaseUser,  } from 'firebase/auth';
import { UserProjectAssignmentModal } from './UserProjectAssignmentModal';


interface UserBoardContextType {
    users: AppUserClass[];
    projects: Project[];
    onAssignProjects: (user: AppUserClass) => void;
    onEditUser: (user: AppUserClass | null) => void;
    onDeleteUser: (userId: string) => void;
    // onSort: (sortKey: UserSortKey) => void;  //Manejamos los sortBy según donde rendericemos el compoenente
    onSortUsers: (sortKey: UserSortKey) => void; // Específico para la lista de usuarios
    onSortTeams: (sortKey: UserSortKey) => void; // Específico para la lista de equipos
    sortedAndFilteredUsers: AppUserClass[];
    // selectedProject: string | null;
    onProjectSelect: (projectId: string | null) => void
    onInviteUser: () => void; // Añadimos el handler para invitar
    userProfile: UserProfile | null; // Añadido para permisos
    currentUser: FirebaseUser | null; // Añadido para permisos
    // No necesitamos pasar los elementos del header, ya que se quedan en el padre
}

export const useUserBoardContext = () => {
    return Router.useOutletContext<UserBoardContextType>();
};


interface Props {
    usersManager: UsersManager,
    projectsManager: ProjectsManager,
    onUserCreate: (newUserCreate: AppUserClass) => void
    onUserUpdate: (updatedUser: AppUserClass) => void
}


export function UsersBoardPage({
    usersManager,
    projectsManager,
    onUserCreate,
    onUserUpdate,
}: Props) {
    const navigate = Router.useNavigate()
    const { currentUser, userProfile, loading: authLoading } = useAuth();
    const [viewMode, setViewMode] = React.useState<'allUsers' | 'projectUsers'>('allUsers');
    //const [users, setUsers] = React.useState<User[]>([]);
    //const [projects, setProjects] = React.useState<Project[]>([]); 

    const projects = React.useMemo(() => {
        return projectsManager?.list || [];
    }, [projectsManager?.list]); // Solo cambia cuando cambia la lista


    //const [selectedProject, setSelectedProject] = React.useState<string | null>(null);

    // Usamos useStickyState para leer/escribir el ID del proyecto seleccionado en localStorage
    const selectedProjectIdKey = currentUser ? `selectedProjectId_${currentUser.uid}` : 'selectedProjectId_guest';
    const [selectedProjectId, setSelectedProjectId] = useStickyState<string | null>(null, selectedProjectIdKey);


    const [error, setError] = React.useState<string | null>(null);
    //const [isSyncing, setIsSyncing] = React.useState(false)

    // Estado para el modal de editar un usuario
    const [isNewUserFormOpen, setIsNewUserFormOpen] = React.useState(false);
    const [userToEdit, setUserToEdit] = React.useState<AppUserClass | null>(null);

    // Estado para el modal de asignación de proyectos
    const [isAssignmentModalOpen, setIsAssignmentModalOpen] = React.useState(false);
    const [userForAssignment, setUserForAssignment] = React.useState<AppUserClass | null>(null);

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
    const teamsSortByKey = currentUser ? `TeamsUsersSortBy_${currentUser.uid}` : 'TeamsUsersSortBy_guest';

    // // Reemplazamos React.useState con nuestro hook useStickyState para hacer la ordenación persistente.
    // const [sortBy, setSortBy] = useStickyState<UserSortKey>('nickName', userSortByKey);


    // Creamos dos estados de ordenación persistentes separados.
    const [userSortBy, setUserSortBy] = useStickyState<UserSortKey>('nickName', userSortByKey);
    const [teamsSortBy, setTeamsSortBy] = useStickyState<UserSortKey>('nickName', teamsSortByKey);


    // Referencias y hooks para la navegación deslizante
    const navRef = React.useRef<HTMLUListElement>(null);
    const location = Router.useLocation();


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
        loading: usersLoading,
    } = useUsersCache(usersManager)

    const {
        userSearchTerm, // Término de búsqueda actual
        setUserSearchTerm,
        filteredUsers, // Lista de usuarios filtrada 
        handleSearchChange: handleUserSearchChange // Función para actualizar el término de búsqueda
    } = useUserSearch(users)

    console.log('[UsersBoardPage] Datos de los hooks:', {
        usersFromCacheHook_count: users.length,
        filteredUsersFromSearchHook_count: filteredUsers.length,
    });

    // Verificar si necesitamos sincronizar
    const shouldSync = React.useCallback(() => {
        const now = Date.now();
        return now - lastSyncRef.current > SYNC_INTERVAL;
    }, []);

    const toggleSortMenu = React.useCallback(() => {
        setIsSortMenuOpen(prev => !prev);
    }, []);


    // // Handler para cuando se selecciona una opción de ordenación
    // const handleSort = React.useCallback((key: UserSortKey) => {
    //     console.log(`Sorting by: ${key}`)
    //     setSortBy(key);
    // }, [setSortBy]);


    // Handlers de ordenación separados para cada vista.
    const handleUserSort = React.useCallback((key: UserSortKey) => {
        console.log(`Sorting UserList by: ${key}`);
        setUserSortBy(key);
    }, [setUserSortBy]);

    const handleTeamsSort = React.useCallback((key: UserSortKey) => {
        console.log(`Sorting TeamsList by: ${key}`);
        setTeamsSortBy(key);
    }, [setTeamsSortBy]);


    // Determinamos qué clave de ordenación usar basándonos en la ruta actual.
    const activeSortBy = location.pathname.startsWith('/usersBoard/teams') ? teamsSortBy : userSortBy;








    // --- Handlers para el modal de asignación de proyectos ---
    const handleOpenAssignmentModal = (user: AppUserClass) => {
        console.log('[UsersBoardPage] Abriendo modal. ViewMode:', viewMode, 'selectedProjectId:', selectedProjectId);
        setUserForAssignment(user);
        setIsAssignmentModalOpen(true);
    };


    const handleCloseAssignmentModal = () => {
        setIsAssignmentModalOpen(false);
        setUserForAssignment(null);
    };

    const handleSaveAssignments = (newAssignments: { [projectId: string]: IProjectAssignment }) => {
        if (!userForAssignment) return;

        const updatedUser = new AppUserClass(
            {
                ...userForAssignment,
                projectsAssigned: Object.values(newAssignments),
            },
            userForAssignment.id
        );

        // Llama a la función del padre para actualizar el usuario en el manager y en Firestore.
        onUserUpdate(updatedUser);
    };

    // --- Handlers para el modal de edición/creación de usuario ---
    const handleOpenNewUserModal = (user: AppUserClass | null) => {
        setUserToEdit(user);
        setIsNewUserFormOpen(true);
    };

    const handleCloseNewUserModal = () => {
        setIsNewUserFormOpen(false);
        setUserToEdit(null);
    };

    // CREO QUE ESTA NO HACE FALTA
    const onNewUserClick = () => {
        setIsNewUserFormOpen(true);
    };


    // VEREMOS SI ESTA ES POSIBLE DESDE EL MENU DE CADA USERCARDROW
    const handleDeleteUser = (userId: string) => {
        console.log("Delete user button clicked for user ID:", userId);
        setMessagePopUpContent({
            type: "info",
            title: "Secure Deletion Feature (Work in Progress)",
            message: (
                <>
                    <br />
                    For security reasons, deleting a user and all their associated data is a critical operation handled by a secure backend (a Cloud Function).
                    <br /><br />
                    Deploying this backend function requires upgrading the project to the 'Blaze' (Pay-as-you-go) plan. This is a standard Firebase requirement to enable advanced APIs like Cloud Build and prevent abuse.
                    <br /><br />
                    <strong>As this is a course exercise, this feature is currently disabled.</strong> To delete a user, please contact the system administrator for manual and secure removal.
                    <br />
                    
                </>
            ),
            actions: ["Understood"],
            messageHeight: "400px",
            onActionClick: { "Understood": () => setShowMessagePopUp(false) },
            onClose: () => setShowMessagePopUp(false)
        });
        setShowMessagePopUp(true)
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

        // // Si no hay una clave de ordenación, devolvemos la lista filtrada tal cual.
        // if (!sortBy) {

        // Usamos la clave de ordenación activa determinada por la ruta.
        if (!activeSortBy) {
            
            return filteredUsers;
        }

        // // Usamos .toSorted() para crear una nueva matriz ordenada sin mutar la original.
        // // Esto es una práctica recomendada en React para evitar efectos secundarios.
        // return filteredUsers.toSorted((a, b) => {


        // Usamos [...filteredUsers].sort() para crear una copia y ordenarla.
        // .toSorted() es más moderno y podría no estar disponible en todos los entornos.
        const sorted = [...filteredUsers].sort((a, b) => {
            // Lógica de ordenación especial para 'roleInProject'
            if (activeSortBy === 'roleInProject') {
                const roleA = a.projectsAssigned?.find(p => p.projectId === selectedProjectId)?.roleInProject || 'zzzz';
                const roleB = b.projectsAssigned?.find(p => p.projectId === selectedProjectId)?.roleInProject || 'zzzz';
                return roleA.localeCompare(roleB);
            }

            // Obtenemos los valores a comparar. Usamos '?? '' como fallback para
            // propiedades que podrían ser null o undefined, evitando errores.
            // const valueA = a[sortBy] ?? '';
            // const valueB = b[sortBy] ?? '';
            const valueA = a[activeSortBy as keyof AppUserClass] ?? '';
            const valueB = b[activeSortBy as keyof AppUserClass] ?? '';


            // localeCompare es el método ideal para ordenar cadenas de texto alfabéticamente,
            // ya que maneja correctamente acentos y caracteres especiales.
            return valueA.localeCompare(valueB);
        });
        console.log('[UsersBoardPage] sortedAndFilteredUsers calculado:', {
            count: sorted.length,
            users: sorted.map(u => u.nickName || u.email)
        });
        return sorted;

    }, [filteredUsers, activeSortBy, selectedProjectId]); // Dependencias del hook




    const handleCreateUser = React.useCallback(async (userData: Omit<AppUserClass, 'id' | 'projectsAssigned'>) => {
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




    const handleUpdateUser = React.useCallback((updatedUser: AppUserClass) => {
        console.log("User updated (callback in UsersBoardPage):", updatedUser);
        // `users` state se actualizará automáticamente por `onSnapshot`.
        // Si necesitas pasar el usuario actualizado al componente padre (App.tsx), puedes usar `onUserUpdate(updatedUser)`.

    
    }, []);



    // Funciones para abrir/cerrar modal de asignación y manejar la asignación


    // const handleProjectSelectionForView = (projectId: string | null) => {
        // setSelectedProject(projectId);
        // setViewMode(projectId ? 'projectUsers' : 'allUsers');

        // Esta función es llamada por el ProjectSelector.
        // Su única responsabilidad es actualizar el estado persistente y navegar cambiando la url

    
    const handleProjectSelectionForView = React.useCallback((projectId: string | null) => {
        // 1. Actualiza el estado persistente (y localStorage) a través del hook.
        setSelectedProjectId(projectId);
    
        //}



        // // Efecto para NAVEGAR cuando el estado persistente cambia.
        // React.useEffect(() => {
        //     if (selectedProjectId) {
        //         // Si hay un proyecto seleccionado, navegamos a la URL con su ID.
        //         navigate(`/usersBoard/teams/${selectedProjectId}`);
        //     } else {
        //         // Si no hay proyecto, navegamos a la URL base.
        //         navigate('/usersBoard/teams');
        //     }
        //     }, [selectedProjectId, ]);


    
        // 2. Navega explícitamente a la URL correspondiente.
        // Esto asegura que el componente hijo (UserBoardProjectsTeamsPage) se
        // vuelva a renderizar con el nuevo `projectId` de la URL.
        if (projectId) {
            navigate(`/usersBoard/teams/${projectId}`);
        } else {
            navigate('/usersBoard/teams');
        }
    }, [setSelectedProjectId, navigate]);
    





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


    const contextValue: UserBoardContextType = {
        users,
        projects,
        onAssignProjects: handleOpenAssignmentModal,
        onEditUser: handleOpenNewUserModal,
        onDeleteUser: handleDeleteUser,
        // onSort: handleSort,
        onSortUsers: handleUserSort,
        onSortTeams: handleTeamsSort,
        sortedAndFilteredUsers,
        onInviteUser: () => setIsInvitationModalOpen(true),
        // selectedProject: selectedProject, // selectedProject ya no es necesario en el contexto, el hijo lo leerá de la URL.
        onProjectSelect: handleProjectSelectionForView,
        userProfile, // Pasamos el perfil del usuario autenticado
        currentUser, // Pasamos el usuario de Firebase actual
    };






    // Efecto para actualizar la posición del indicador deslizante
    React.useEffect(() => {
        // Si la referencia al contenedor de navegación no existe, no hacemos nada.
        if (!navRef.current) return;

        // Buscamos el enlace que tiene la clase 'active'.
        // react-router-dom añade esta clase automáticamente al NavLink de la ruta actual.
        const activeLink = navRef.current.querySelector('a.active') as HTMLElement;

        if (activeLink) {
            // Obtenemos el elemento <li> padre del enlace activo.
            const activeListItem = activeLink.parentElement as HTMLLIElement;
            if (activeListItem) {
                // Obtenemos la posición y el ancho del <li> activo.
                const { offsetLeft, offsetWidth } = activeListItem;
                // Actualizamos las variables CSS en el elemento <ul> para mover el indicador.
                navRef.current.style.setProperty('--_indicator-left', `${offsetLeft}px`);
                navRef.current.style.setProperty('--_indicator-width', `${offsetWidth}px`);
            }
        } else {
            // Opcional: Si no se encuentra un enlace activo, puedes ocultar el indicador.
            // navRef.current.style.setProperty('--_indicator-width', `0px`);
        }
    }, [location.pathname, sortedAndFilteredUsers]); // Añadimos sortedAndFilteredUsers como dependencia // Este efecto se ejecuta cada vez que la URL cambia.


    // Efecto para sincronizar el viewMode con la ruta actual. Usando el hook useLocation de react-router-dom y un React.useEffect.Para que cuando mostremos el modal de permisos de proyectos desde el TeamsUser solo se muestre un proyecto. el selectedProyectId que tenemos guardado en el estado
    React.useEffect(() => {
        if (location.pathname.startsWith('/usersBoard/teams')) {
            setViewMode('projectUsers');
        } else {
            setViewMode('allUsers');
        }
    }, [location.pathname]); // Se ejecuta cada vez que la URL cambia



    // --- Handlers para la animación de hover del indicador ---
    const handleTabMouseEnter = (e: React.MouseEvent<HTMLLIElement>) => {
        if (!navRef.current) return;
        const target = e.currentTarget;
        // Actualizamos las variables CSS para el estado de hover
        navRef.current.style.setProperty('--_hover-left', `${target.offsetLeft}px`);
        navRef.current.style.setProperty('--_hover-width', `${target.offsetWidth}px`);
        // Añadimos una clase para activar la transición del hover en el CSS
        navRef.current.classList.add('is-hovering');
    };

    const handleTabMouseLeave = () => {
        if (!navRef.current) return;
        // Quitamos la clase para que el indicador vuelva a su posición activa
        navRef.current.classList.remove('is-hovering');
    };




    // El estado de carga ahora depende directamente de la autenticación Y de la carga de usuarios del hook.
    if (authLoading || usersLoading) {
        console.log('[UsersBoardPage] Renderizando LoadingIcon porque:', { authLoading, usersLoading });
        return <LoadingIcon />; // Mostrar loading si auth está cargando O si la carga de usuarios está en curso
    }

    if (error) {
        console.error('[UsersBoardPage] Renderizando mensaje de error:', error);
        return <p>Error: {error}</p>;
    }


    const authCurrentUserRole = "admin"



    console.log('[UsersBoardPage] A punto de renderizar UsersBoardList con props:', {
        userCount: sortedAndFilteredUsers.length
    });

    
    return (
        <section className="page" id="users-page" data-page="">
            <header className="header-users" style={{ height: "fit-content", minHeight: 110 }}>
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
                
                        {/* Selector de Proyecto (para Parte 2) Solo aparece cuando esta en la pestana de projects Teams*/}
                        {/* <div style={{ display: "flex", alignItems: "center", columnGap: 10 }}>
                        <ProjectSelector
                            currentProject={projects.find(p => p.id === selectedProject) || null}
                            projectsList={projects}
                            onProjectSelect={handleProjectSelectionForView}
                        />
                    </div> */}
                    </h2>
                    <ul
                        ref={navRef}
                        id="users-sliding-nav" // Cambiado de users-sliding-nav1 para coincidir con el nuevo CSS
                        style={{
                            display: "flex",
                            columnGap: 25,
                            transform: "translateY(15px)",
                            zIndex: 100,
                            alignItems: "center"
                        }}
                    >
                        {/* <li className="users-slide1" />
                    <li className="users-slide2" /> */}
                        {/* Los <li> con las clases slide se eliminan, el indicador ahora es un pseudo-elemento ::after */}

                        <li
                            className="nav-item-users"
                            onMouseEnter={handleTabMouseEnter}
                            onMouseLeave={handleTabMouseLeave}
                        >
                            {/* <a href="#/users" className="tab-buttons"> */}
                            {/* Este NavLink se activará SOLO cuando la ruta sea EXACTAMENTE "/usersBoard" */}
                            <Router.NavLink to="/usersBoard" end className="tab-buttons">
                                <span className="material-icons-round">people_alt</span>
                                Users
                                {/* </a> */}
                            </Router.NavLink>
                        </li>
                        <li
                            className="nav-item-teams"
                            onMouseEnter={handleTabMouseEnter}
                            onMouseLeave={handleTabMouseLeave}
                        >
                            {/* <a href="#/teams" className="tab-buttons" style={{ width: 175 }}> */}
                            {/* Usamos NavLink para que react-router-dom gestione la clase 'active' */}
                            {/* <Router.NavLink to="/usersBoard/teams" className="tab-buttons" style={{ width: 175 }}> */}
                            {/* Al hacer clic, navegamos a la ruta de equipos. Si hay un proyecto guardado, vamos a él. */}
                            <Router.NavLink
                                to={selectedProjectId ? `/usersBoard/teams/${selectedProjectId}` : "/usersBoard/teams"}
                                className="tab-buttons"
                                style={{ width: 175 }}
                            >
                                <span className="material-icons-round">diversity_3</span>
                                Users by Projects
                                {/* </a> */}
                            </Router.NavLink>
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

                    </div>
                </div>
            </header>




            {/* OPCIONES DEL TABULADOR DE USUARIOS USUARIOS TOTALES Y EQUIPOS/PROYECTOS */}
            <div
                className="users-page-content"
                style={{
                    height: "calc(130px + 100vh)", position: "relative"

                }}
            >

            
                {/* --- HEADER SECUNDARIO CONDICIONAL --- */}
                {/* Solo mostramos estos botones si estamos en la ruta raíz de usersBoard */}
                {/* {location.pathname === '/usersBoard' && (
                <div className="header-user-page-content">
                    <div style={{ display: "flex", flexDirection: "row", columnGap: 20 }}>
                        
                        <button
                            // onClick={() => setIsInvitationModalOpen(true)} // Abre el nuevo modal de invitación
                            // id="new-user-btn"
                            // style={{ whiteSpace: 'nowrap' }}
                            // title="Invite a new User"

                            ref={sortButtonRef}
                            onClick={toggleSortMenu}
                            style={{  width: "auto" }}
                            // className="btn-secondary"
                        >
                            <AddIcon size={24} className="todo-icon-plain" color="var(--color-fontbase-dark)" />
                            
                            <p style={{ color: "var(--color-fontbase-dark)" }}>Sort By</p>
                            <span className="material-icons-round">expand_more</span>

                        </button>

                        {canManageUsers && (
                            <button
                                onClick={() => setIsInvitationModalOpen(true)}
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
            )} */}
            
                <Router.Outlet context={contextValue} />
        
            </div>

            <UserInvitationForm
                isOpen={isInvitationModalOpen}
                onClose={() => setIsInvitationModalOpen(false)}
                onSendInvitation={handleSendInvitation}
                usersManager={usersManager}
            />
        
            {isAssignmentModalOpen && userForAssignment && (
                <UserProjectAssignmentModal
                    isOpen={isAssignmentModalOpen}
                    onClose={handleCloseAssignmentModal}
                    projects={projects}
                    existingAssignments={userForAssignment.projectsAssigned || {}}
                    userRoleInApp={userForAssignment.roleInApp}
                    //filterProjectId={viewMode === 'projectUsers' ? selectedProjectId : undefined}
                    filterProjectId={viewMode === 'projectUsers' ? (selectedProjectId ?? undefined) : undefined}
                    onSave={handleSaveAssignments}
                />
            )}


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
            


                // authCurrentUserRole={authCurrentUserRole}
                // onClose={handleCloseNewUserModal}
                // usersManager ={usersManager}
                // projectsManager={projectsManager}
                // onAssignProjects={handleOpenAssignModal}
                // onCreateUser={handleCreateUser}
                // onUpdateUser={handleUpdateUser}
                />}
            {showMessagePopUp && messagePopUpContent && (<MessagePopUp {...messagePopUpContent} />)}
            {/* {isSortMenuOpen && (
            <UsersSortMenu
                isOpen={isSortMenuOpen}
                onClose={() => setIsSortMenuOpen(false)}
                onSort={handleSort}
                buttonRef={sortButtonRef}
            />
        )} */}



        </section>
    )
}



// Add display name for debugging purposes
UsersBoardPage.displayName = 'UsersBoardPage'
