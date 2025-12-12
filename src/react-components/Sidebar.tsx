import * as React from 'react';
import * as Router from 'react-router-dom';
import { User as FirebaseUser } from 'firebase/auth';

import { LoadingIcon, MainProjectCatalog, MainProjectDetails, MainToDoBoard, MainUsersIndex } from './icons';
import { useStickyState } from '../hooks'
import { ProjectsManager } from '../classes/ProjectsManager'



import { useAuth, UserProfile } from '../Auth/react-components/AuthContext.tsx'; // Ajusta la ruta
import { signOut } from '../services/firebase/firebaseAuth'; // Usamos nuestra función signOut centralizada
import { UserIcon, ChevronDownIcon, ProfileIcon, LoginIcon, LogoutIcon } from './icons';
import { NewUserForm } from './NewUserForm';
import { UserProfileNavButton } from './UserProfileNavButton';
import { UsersManager } from '../classes/UsersManager.ts';
import { toast } from 'sonner';

import { ChangePasswordForm } from '../Auth/react-components/ChangePasswordForm';
import { UserRoleInAppKey } from '../types';

interface SidebarProps { // Añadir props
    // currentUser: FirebaseUser | null; // Recibir currentUser
    // userProfile: any | null; // Recibir userProfile (usamos any por simplicidad, idealmente un tipo más específico)
    // onNavigate: (path: 'profile' | 'signin' | 'change-password') => void;
    projectsManager: ProjectsManager;
    usersManager: UsersManager;
}

// Sidebar ahora obtiene currentUser y userProfile directamente del contexto

export function Sidebar({ projectsManager, usersManager }: SidebarProps) {
    console.log('Sidebar: Component rendering / re-rendering TOP');
    
    const location = Router.useLocation(); // Hook para obtener la ubicación actual

    const navigate = Router.useNavigate();
    

    // const { currentUser, userProfile, loading } = useAuth();
    // const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
    // const dropdownRef = React.useRef<HTMLDivElement>(null);

    const { currentUser, userProfile, loading: authLoading, updateUserProfile } = useAuth(); // Renombrar loading para claridad
    
    const [isProfileFormModalOpen, setIsProfileFormModalOpen] = React.useState(false); // State for modal

    // Usamos useStickyState para gestionar el estado principal y su persistencia
    // Clave para useStickyState: específica del usuario o genérica si no hay usuario.
    const selectedProjectIdKey = currentUser ? `selectedProjectId_${currentUser.uid}` : 'selectedProjectId_guest';
    const [selectedProjectId, setSelectedProjectId] = useStickyState<string | null>(null, selectedProjectIdKey);
    //const [selectedProjectId, setSelectedProjectId] = useStickyState<string | null>(null,  currentUser ? 'selectedProjectId' : 'selectedProjectIdKey');

    const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = React.useState(false); 

    const getInitials = (firstName?: string, lastName?: string): string => {
        if (firstName && lastName) return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
        if (firstName) return firstName.substring(0, 2).toUpperCase();
        if (userProfile?.nickname) return userProfile.nickname.substring(0, 2).toUpperCase();
        if (currentUser?.email) return currentUser.email.substring(0, 2).toUpperCase();
        return '??';
    };

    // const handleLogout = async () => {
    //     try {
    //         await signOut(); // Llama a la función de signOut de firebaseAuth.ts
    //         setIsDropdownOpen(false);
    //       // AuthProvider detectará el cambio y la UI se actualizará.
    //       // onNavigate('signin') podría ser llamado por el componente padre si es necesario forzar la vista.
    //     } catch (error) {
    //         console.error("Error al cerrar sesión:", error);
    //         // Considera mostrar un toast o mensaje de error al usuario
    //     }
    // };

    // console.log('Sidebar: Current state', {
    //     selectedProjectId,
    //     pathname: location.pathname,
    //     projectsCount: projectsManager?.list.length
    // });



    // React.useEffect(() => {
    //     const handleClickOutside = (event: MouseEvent) => {
    //         if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
    //             setIsDropdownOpen(false);
    //         }
    //     };
    //     document.addEventListener('mousedown', handleClickOutside);
    //     return () => document.removeEventListener('mousedown', handleClickOutside);
    // }, []);


    // Efecto para sincronizar el estado cuando cambia el usuario
    React.useEffect(() => {
        if (!authLoading  && currentUser) {
            // Sincronizar selectedProjectId con la nueva clave de usuario
            const newKey = `selectedProjectId_${currentUser.uid}`;
            const stickyValue = window.localStorage.getItem(newKey);
            
            if (stickyValue !== null) {
                try {
                    const parsedValue = JSON.parse(stickyValue);
                    if (parsedValue !== selectedProjectId) {
                        setSelectedProjectId(parsedValue);
                    }
                } catch (error) {
                    console.error("Error parsing sticky state", error);
                    localStorage.removeItem(newKey);
                }
            } else {
                // Limpiar estado si no hay valor para el nuevo usuario
                setSelectedProjectId(null);
            }
        } else if (!authLoading  && !currentUser) {
            // Usuario invitado
            const guestValue = localStorage.getItem('selectedProjectId_guest');
            setSelectedProjectId(guestValue ? JSON.parse(guestValue) : null);
        }
    }, [currentUser, authLoading , setSelectedProjectId, selectedProjectIdKey]);



    // Efecto para gestionar el ciclo de vida de los listeners de Firestore.
    // Se asegura de que los listeners estén activos solo cuando hay un usuario autenticado.
    React.useEffect(() => {
        if (currentUser) {
            // Si hay un usuario, nos aseguramos de que los listeners estén activos.
            // Las clases Manager deberían ser idempotentes y no duplicar listeners si ya existen.
            console.log("Sidebar Effect: User detected, ensuring listeners are active.");
            projectsManager.init?.();
            usersManager.init?.();
        // } else {
        //     // Si no hay usuario (se ha cerrado sesión), detenemos los listeners para evitar los errores de permisos.
        //     console.log("Sidebar Effect: No user detected, stopping listeners.");
        //     projectsManager.cleanup?.();
        //     usersManager.cleanup?.();
        } 
        // La limpieza se manejará de forma imperativa en el sign-out para evitar race conditions.
    }, [currentUser, projectsManager, usersManager]);





    
    // Mover la declaración de initials aquí, y solo calcular si hay datos.
    let initials: string = '';
    
    if (!currentUser || !userProfile) {
        // Si no hay usuario, el botón de Sign In/Up se mostrará al final del sidebar.
        // La lógica de navegación principal del sidebar (Projects Catalog, etc.) aún puede mostrarse.
    } else {
        // Solo calcular iniciales si hay usuario y perfil
        initials = getInitials(userProfile.firstName, userProfile.lastName);    
    }
    





    // Función para manejar el clic en el botón "Projects Catalog"
    const handleCatalogClick = () => {
        const key = currentUser
            ? `selectedProjectId_${currentUser.uid}`
            : 'selectedProjectId_guest';
        
        // console.log('Sidebar: Clearing selectedProjectId using useStickyState setter');
        
        // setSelectedProjectId(null); // Actualiza el estado inmediatamente

        // // Eliminación directa para casos donde el estado no cambia
        // window.localStorage.removeItem(key);

        console.log('Sidebar: Navigating to catalog. Project ID will persist.');

        // Añadir navegación para forzar actualización
        navigate('/', { replace: true }); 
    };




    // Manejador de navegación interna del sidebar
    const handleUserProfileNavActions = async (action: 'profile' | 'auth' | 'change-password' | 'signout') => {
        // El portal se cierra internamente en UserProfileNavButton
        if (action === 'profile') {
            // navigate('/profile');
            // Open the modal instead of navigating
            setIsProfileFormModalOpen(true);

        } else if (action === 'auth') {
            if (currentUser) { // "Cambiar Cuenta" (Sign Out y luego a Auth)
                await signOut();
            }
            navigate('/auth'); // Navega a /auth si no hay usuario o después de cerrar sesión
        } else if (action === 'change-password') {
            //navigate('/change-password');
            setIsChangePasswordModalOpen(true);
            
        } else if (action === 'signout') {
            projectsManager.cleanup?.();
            usersManager.cleanup?.();
            
            await signOut();

            // if (location.pathname !== '/auth') { // Evitar navegación redundante si ya estamos en /auth
            //     navigate('/auth'); // O a la página de inicio: navigate('/');
            // } else { 
            //     // Si ya estamos en /auth, no es necesario navegar de nuevo.
            //     // El AuthProvider se encargará de actualizar el estado.
            // }
            
        }
    };





    React.useEffect(() => {

        console.log('Sidebar: Location effect triggered', {
            pathname: location.pathname,
            selectedProjectId
        });


        const currentPath = location.pathname;
        console.log('Sidebar: location effect running.', {
            pathname: currentPath,
            currentSelectedProjectId: selectedProjectId
        });

        //RETIRADA DE SOLUCION RIGIDA QUE DIVIDE LA URL PARA LOCALIZAR EL PROJECTID
        // let extractedProjectId: string | null = null;
        // const parts = currentPath.split('/'); // e.g., ["", "project", "ID"] or ["", "project", "todoBoard", "ID"]


        // if (currentPath === '/') {
            
        //     if (selectedProjectId !== null) {
        //         console.log('Sidebar: Navigated to home. Clearing selectedProjectId.');
        //         setSelectedProjectId(null);
        //     }
        //     return  // Early exit for home page
        // }

        //RETIRADA DE SOLUCION RIGIDA QUE DIVIDE LA URL PARA LOCALIZAR EL PROJECTID
        // // Palabras clave que indican segmentos de ruta que NO son IDs de proyecto por sí mismos
        // // cuando aparecen como el último segmento de una ruta que no termina en un ID.
        // // Ejemplos: /project, /project/todoBoard, /usersBoard
        // // Asegúrate de incluir aquí cualquier segmento que pueda ser el último en una URL
        // // donde quieras que el selectedProjectId se mantenga "sticky" en lugar de intentar
        // // extraer un ID.
        // const pathKeywords = ["project", "todoboard", "usersboard", "settings",'auth', 'profile', 'change-password', 'signin', 'signup']; // Añade más según sea necesario

        // let potentialProjectId = parts[parts.length - 1];

        // // Si el último segmento está vacío (ej: URL termina en '/'), o es una palabra clave conocida.
        // if (!potentialProjectId || pathKeywords.includes(potentialProjectId.toLowerCase())) {
        //     // Estamos en una ruta como /project/ o /project/todoBoard (sin ID al final), o /users.
        //     // En estos casos, selectedProjectId mantiene su valor "sticky".
        //     // Si selectedProjectId era null, seguirá siendo null.
        //     // Si selectedProjectId tenía un valor, lo conservará.
        //     // Esto permite que si navegas de /project/ID_VALIDO a /project/todoBoard (sin ID en la URL),
        //     // el botón "Project Details" siga activo con ID_VALIDO.
            
        //     console.log('Sidebar: Last segment is empty or a keyword. selectedProjectId remains sticky:', selectedProjectId);
        //     return
        // } else {
        //     // El último segmento no está vacío y no es una palabra clave conocida.
        //     // VERIFICAR SI EL ID EXTRAÍDO DE LA URL EXISTE EN ProjectsManager
        // if (projectsManager.getProject(potentialProjectId)) {
        //     extractedProjectId = potentialProjectId;
        // } else {
        //     // El ID extraído de la URL no corresponde a un proyecto conocido.
        //     // No actualizaremos selectedProjectId con este ID inválido, manteniendo el valor "sticky" anterior.
        //     // Solo mostrar advertencia si el projectsManager tiene proyectos cargados, para evitar falsos positivos durante la carga inicial.
        //     if (projectsManager && projectsManager.list.length > 0) {
        //         console.warn(`Sidebar: Project ID "${potentialProjectId}" from URL not found in ProjectsManager. Keeping sticky ID: ${selectedProjectId}`);
        //     } else if (!projectsManager) {
        //         console.warn(`Sidebar: ProjectsManager not available while checking project ID "${potentialProjectId}".`);
        //     }
        // }
        // }

        // // If a project ID was extracted from the URL
        // if (extractedProjectId ) {
        //     if (extractedProjectId !== selectedProjectId) {
        //         console.log('Sidebar: Syncing selectedProjectId with extracted URL Project ID:', extractedProjectId);
        //         setSelectedProjectId(extractedProjectId);
                
        //     }
        // } else {
        //     // Si no se extrajo un ID válido de la URL (o la URL era '/', o era una página no específica de proyecto)
        //     // selectedProjectId mantiene su valor "sticky".
        //     // Si currentPath es '/', selectedProjectId ya se habrá puesto a null antes.
        //     if (currentPath !== '/') {
        //         console.log('Sidebar: No valid project ID extracted from URL or on non-project page. selectedProjectId remains sticky:', selectedProjectId);
        //     }
        // }


        //NUEVA FORMA MAS ESCALABLE Y MANTENIBLE DE LEER LA URL PARA TENER ACTUALIZADO EL PROYECTO QUE SE GUARDA EN LOCAL STORAGE COMO ACTUAL.

                // 1. Define una lista de todas las rutas que contienen un ID de proyecto.
        const projectRoutes = [
            '/project/:projectId',
            '/project/todoBoard/:projectId',
            '/usersBoard/teams/:projectId'
            // ¡Añade aquí futuras rutas que contengan un ID de proyecto!
            //EJEMPLO: '/project/graphs/:projectId' // <-- ¡Solo tienes que añadir esta línea! Y añadir en el index.tsx el Router.Route
        ];
        // 2. Usa `matchPath` para ver si la URL actual coincide con alguno de esos patrones.

        //la función matchPath de react-router-dom espera que la propiedad path sea una única cadena de texto (un solo patrón de ruta), pero tú le estás pasando projectRoutes, que es un array de cadenas de texto (string[]).
        //matchPath no está diseñado para aceptar un array de patrones directamente.
        //La solución es iterar sobre tu array projectRoutes y llamar a matchPath para cada ruta individualmente hasta que encuentres una que coincida.

        //const match = Router.matchPath({ path: projectRoutes, end: true }, currentPath);
        let match = null;
        for (const route of projectRoutes) {
            // Intentamos hacer match con cada ruta de la lista.
            const potentialMatch = Router.matchPath({ path: route, end: true }, currentPath);
            if (potentialMatch) {
                // Si encontramos una coincidencia, la guardamos y rompemos el bucle.
                match = potentialMatch;
                break;
            }
        }


        const extractedProjectId = match?.params.projectId ?? null;
        
        
        // 3. Actúa solo si se encontró un ID de proyecto válido.
        if (extractedProjectId) {
            // El ID extraído de la URL existe en ProjectsManager
            if (projectsManager.getProject(extractedProjectId)) {
                if (extractedProjectId !== selectedProjectId) {
                    console.log('Sidebar: Syncing selectedProjectId with extracted URL Project ID:', extractedProjectId);
                    setSelectedProjectId(extractedProjectId);
                }
            } else {
                // El ID de la URL no es un proyecto válido, mantenemos el anterior y advertimos.
                if (projectsManager.list.length > 0) {
                    console.warn(`Sidebar: Project ID "${extractedProjectId}" from URL not found in ProjectsManager. Keeping sticky ID: ${selectedProjectId}`);
                }
            }
        } else {
            // La URL no contiene un ID de proyecto. selectedProjectId mantiene su valor "sticky".
            console.log('Sidebar: No valid project ID extracted from URL or on non-project page. selectedProjectId remains sticky:', selectedProjectId);
        }






        console.log("🔍 Project ID check:", {
            extractedProjectId,
            isValid: extractedProjectId && projectsManager.getProject(extractedProjectId),
            projectList: projectsManager.list.map(p => p.id)
        });


    }, [location.pathname, selectedProjectId, setSelectedProjectId, projectsManager]);


    // This is the crucial part for rendering the button.
    // It uses `selectedProjectId` which is the state managed by `useStickyState` in THIS component.
    const isProjectSelected = !!selectedProjectId; // Booleano para saber si hay un proyecto seleccionado
    console.log('Sidebar RENDER: selectedProjectId for button logic:', selectedProjectId, 'isProjectSelected:', isProjectSelected);


    //Si no hay ID, usa '0' como placeholder. Si hay ID, úsalo.
    const toDoBoardPath = selectedProjectId ? `/project/todoBoard/${selectedProjectId}` : '/project/todoBoard/0';
    




    // Handler to close the profile form modal
    const handleCloseProfileFormModal = () => {
        setIsProfileFormModalOpen(false);
    };

    const handleProfileUpdateSuccess = (updatedData: Partial<UserProfile>) => {

        setIsProfileFormModalOpen(false);
        updateUserProfile(updatedData);
        toast.success('Profile updated successfully!');
    };





    return (
        <aside id="sidebar" style={{ height: '100vh' }}>
            <div className="sidebar-organization">
                <img
                    id="company-logo"
                    src="/assets/company-logo.svg"
                    alt="Construction company"
                    title="company-logo"
                />
                <ul id="navigation-bar">
                    <Router.Link
                        to="/"
                        onClick={handleCatalogClick}
                    >
                        <li id="asideBtnProjects" className="nav-button" title="Projects Catalog" >
                            <MainProjectCatalog size={37}
                                className="todo-icon-edit"
                                color="var(--color-fontbase)"

                            />
                            Projects
                            Catalog
                        </li>
                    </Router.Link >

                    {/* Button Project Details */}

                            {/* <Router.Link to={`/project/${selectedProjectId}`}>
                                <li
                                    id="asideBtnProjectDetails"
                                    className="nav-button"
                                    title="Project Details"
                                >
                                    <MainProjectDetails size={37}
                                        className="todo-icon-edit"
                                        color="var(--color-fontbase)"
                                    />
                                    Project Details
                                </li>
                            </Router.Link> */}


                    {isProjectSelected
                        ? (
                            <Router.Link to={`/project/${selectedProjectId}`}>
                                <li
                                    id="asideBtnProjectDetails"
                                    className="nav-button"
                                    title="Project Details"
                                >
                                    <MainProjectDetails size={37}
                                        className="todo-icon-edit"
                                        color="var(--color-fontbase)"
                                    />
                                    Project Details
                                </li>
                            </Router.Link>
                        ) : (
                            <li
                                id="asideBtnProjectDetailsDisabled"
                                className="nav-button disabled" // La clase 'disabled' maneja el estilo visual
                                title="Select a project first"
                            >
                                <MainProjectDetails size={37}
                                    className="todo-icon-edit"
                                    color="var(--color-fontbase)" // El color se mantiene, pero la opacidad lo atenúa
                                />
                                Project Details
                            </li>
                        )
                    }
                    

                    {/* Button To-Do Boards  */}
                    {/* <Router.Link to={toDoBoardPath}>
                        <li
                            id="asideBtnToDoBoards"
                            className="nav-button"
                            title="To-Do Boards"
                        >
                            <MainToDoBoard size={37}
                                className="todo-icon-edit"
                                color="var(--color-fontbase)"
                            />
                            To-Do Boards
                        </li>
                    </Router.Link> */}

                    {isProjectSelected
                        ? (
                            <Router.Link to={`/project/todoBoard/${selectedProjectId}`}>
                                <li
                                    id="asideBtnToDoBoards"
                                    className="nav-button"
                                    title="To-Do Boards"
                                >
                                    <MainToDoBoard size={37}
                                        className="todo-icon-edit"
                                        color="var(--color-fontbase)"
                                    />
                                    To-Do Boards
                                </li>
                            </Router.Link>
                        ) : (
                            <li
                                id="asideBtnToDoBoardsDisabled"
                                className="nav-button disabled"
                                title="Select a project first"
                            >
                                <MainToDoBoard size={37} className="todo-icon-edit" color="var(--color-fontbase)" />
                                To-Do Boards
                            </li>
                        )}





                    {/* Botón Users Index */}
                    <Router.Link to='/usersBoard'>
                        <li
                            id="asideBtnUsers"
                            className="nav-button"
                            title="Index Users"
                        >
                            <MainUsersIndex size={37}
                                className="todo-icon-edit"
                                color="var(--color-fontbase)"
                            />
                            Index Users
                        </li>
                    </Router.Link>
                </ul>  {/* End of navigation-bar */}


                {/* User Profile / Auth Section - Placed before sidebar controls */}
                {/* Nuevo UserProfileNavButton integrado como un elemento de la lista de navegación */}
                <ul
                    style={{
                        listStyle: 'none',
                        padding: 0,
                        margin: 'auto -25px 150px 0' ,
                        
                    }}> {/* Contenedor para el botón de perfil */}
                    <UserProfileNavButton
                        currentUser={currentUser}
                        userProfile={userProfile}
                        authLoading={authLoading}
                        onNavigate={handleUserProfileNavActions}
                    />
                </ul>

                {/* Render the NewUserForm modal conditionally */}
                {/* {isProfileFormModalOpen && currentUser && userProfile && ( */}
                {isProfileFormModalOpen && userProfile &&(
                    <NewUserForm
                        key={userProfile.uid}
                        currentUserData={userProfile} // Pass the userProfile data
                        usersManager={usersManager} // Pass the usersManager instance
                        onClose={handleCloseProfileFormModal}
                        onProfileUpdate={handleProfileUpdateSuccess}
                        authCurrentUserRole={userProfile.roleInApp as UserRoleInAppKey | undefined} // Pass the role if needed for form logic
                        onTriggerChangePassword={() => setIsChangePasswordModalOpen(true)} 
                    />
                )}

                {isChangePasswordModalOpen && (
                    <ChangePasswordForm onPasswordChanged={() => setIsChangePasswordModalOpen(false)} onCancel={() => setIsChangePasswordModalOpen(false)} />
                )}
                
                {/*  End of sidebar-user-auth-section */}

                
                    
                {/* Sidebar Controls Section (Toggle and Theme) */}
                <div
                    className="sidebar-controls-section"
                    style={{
                        padding: '0.5rem 1rem',
                        borderTop: '1px solid #eee'
                    }}>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    
                
                        <input
                            type="checkbox"
                            id="sidebar-checkbox-switch"
                            defaultChecked={false}
                        />
                        <label htmlFor="sidebar-checkbox-switch" className="open-sidebar-btn">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                height="100%"
                                viewBox="0 0 24 24"
                                width="100%"
                                fill="var(--color-fontbase)"
                                transform="rotate(90)"
                                style={{ background: "transparent" }}
                            >
                                <path d="M0 0h24v24H0V0z" fill="none" />
                                <path d="M12 5.83l2.46 2.46c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L12.7 3.7c-.39-.39-1.02-.39-1.41 0L8.12 6.88c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0L12 5.83zm0 12.34l-2.46-2.46c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41l3.17 3.18c.39.39 1.02.39 1.41 0l3.17-3.17c.39-.39.39-1.02 0-1.41-.39-.39-1.02-.39-1.41 0L12 18.17z" />
                            </svg>
                        </label>
                        <div className="show-sidebar">
                            <label htmlFor="sidebar-checkbox-switch" className="close-sidebar-btn">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    height="100%"
                                    viewBox="0 0 24 24"
                                    width="100%"
                                    fill="var(--color-fontbase)"
                                    transform="rotate(90)"
                                    style={{ background: "transparent" }}
                                >
                                    <path d="M24 0v24H0V0h24z" fill="none" opacity=".87" />
                                    <path d="M8.12 19.3c.39.39 1.02.39 1.41 0L12 16.83l2.47 2.47c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41l-3.17-3.17c-.39-.39-1.02-.39-1.41 0l-3.17 3.17c-.4.38-.4 1.02-.01 1.41zm7.76-14.6c-.39-.39-1.02-.39-1.41 0L12 7.17 9.53 4.7c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.03 0 1.42l3.17 3.17c.39.39 1.02.39 1.41 0l3.17-3.17c.4-.39.4-1.03.01-1.42z" />
                                </svg>
                            </label>
                        </div>
                    </div>
                    {/* <div
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            alignContent: "space-between"
                        }}
                    /> */}
                    <button id="theme-switch">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            enableBackground="new 0 0 24 24"
                            height="24px"
                            viewBox="0 0 24 24"
                            width="24px"
                            fill="#808b9f"
                        >
                            <rect fill="none" height={24} width={24} />
                            <path d="M12,7c-2.76,0-5,2.24-5,5s2.24,5,5,5s5-2.24,5-5S14.76,7,12,7L12,7z M2,13l2,0c0.55,0,1-0.45,1-1s-0.45-1-1-1l-2,0 c-0.55,0-1,0.45-1,1S1.45,13,2,13z M20,13l2,0c0.55,0,1-0.45,1-1s-0.45-1-1-1l-2,0c-0.55,0-1,0.45-1,1S19.45,13,20,13z M11,2v2 c0,0.55,0.45,1,1,1s1-0.45,1-1V2c0-0.55-0.45-1-1-1S11,1.45,11,2z M11,20v2c0,0.55,0.45,1,1,1s1-0.45,1-1v-2c0-0.55-0.45-1-1-1 C11.45,19,11,19.45,11,20z M5.99,4.58c-0.39-0.39-1.03-0.39-1.41,0c-0.39,0.39-0.39,1.03,0,1.41l1.06,1.06 c0.39,0.39,1.03,0.39,1.41,0s0.39-1.03,0-1.41L5.99,4.58z M18.36,16.95c-0.39-0.39-1.03-0.39-1.41,0c-0.39,0.39-0.39,1.03,0,1.41 l1.06,1.06c0.39,0.39,1.03,0.39,1.41,0c0.39-0.39,0.39-1.03,0-1.41L18.36,16.95z M19.42,5.99c0.39-0.39,0.39-1.03,0-1.41 c-0.39-0.39-1.03-0.39-1.41,0l-1.06,1.06c-0.39,0.39-0.39,1.03,0,1.41s1.03,0.39,1.41,0L19.42,5.99z M7.05,18.36 c0.39-0.39,0.39-1.03,0-1.41c-0.39-0.39-1.03-0.39-1.41,0l-1.06,1.06c-0.39,0.39-0.39,1.03,0,1.41s1.03,0.39,1.41,0L7.05,18.36z" />
                        </svg>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            enableBackground="new 0 0 24 24"
                            height="24px"
                            viewBox="0 0 24 24"
                            width="24px"
                            fill="#5f6368"
                        >
                            <rect fill="none" height={24} width={24} />
                            <path d="M11.01,3.05C6.51,3.54,3,7.36,3,12c0,4.97,4.03,9,9,9c4.63,0,8.45-3.5,8.95-8c0.09-0.79-0.78-1.42-1.54-0.95 c-0.84,0.54-1.84,0.85-2.91,0.85c-2.98,0-5.4-2.42-5.4-5.4c0-1.06,0.31-2.06,0.84-2.89C12.39,3.94,11.9,2.98,11.01,3.05z" />
                        </svg>
                    </button>
                </div>
            </div> {/* End of sidebar-organization */}
        </aside>
    )
}

// Add display name for debugging purposes
Sidebar.displayName = 'Sidebar'