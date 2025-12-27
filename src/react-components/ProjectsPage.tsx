import * as React from 'react';
import * as Router from 'react-router-dom';
//import * as Firestore from 'firebase/firestore';


import { LoadingIcon, SearchProjectBox, ProjectCard, CounterBox} from '../react-components';
import { AddIcon } from './icons.tsx'
import { useProjectsCache, useProjectSearch, useStickyState, useDebounce,  useUsersCache } from '../hooks'
import { STORAGE_KEY, CACHE_TIMESTAMP_KEY, SYNC_INTERVAL } from '../const';

import { useProjectsManager, NewProjectForm } from './index.tsx';
import { getProjectsFromDB, getUsersFromDB } from '../services/firebase/index.ts'
import { getCollection } from '../services/firebase/index.ts'

import { useAuth } from '../Auth/react-components/AuthContext.tsx'; 

//import NewProjectForm from './NewProjectForm.tsx';
//import { ProjectCard } from './ProjectCard.tsx';
//import { useProjectsManager } from './ProjectsManagerContext';

import { ProjectsManager } from '../classes/ProjectsManager';
import { UsersManager } from '../classes/UsersManager.ts';
import { IProject, Project } from '../classes/Project';
import { showModal, closeModal, toggleModal, } from "../classes/UiManager.ts"
import { log } from 'three/examples/jsm/nodes/Nodes.js';
import { toast } from 'sonner';


interface Props {
    projectsManager: ProjectsManager,
    usersManager: UsersManager,
    onProjectUpdate: (updatedProject: Project) => void
    onNewProjectCreated: (newProjectCreated: Project) => void
}
//const projectsCollection = getCollection<IProject>("/projects")

export function ProjectsPage({ projectsManager, usersManager, onProjectUpdate, onNewProjectCreated }: Props) {

    const { currentUser, loading: authLoading } = useAuth(); // Obtener estado de autenticación


    const [isNewProjectFormOpen, setIsNewProjectFormOpen] = React.useState(false)
    const [isInitialLoading, setIsInitialLoading] = React.useState(false);
    const [isSyncing, setIsSyncing] = React.useState(false)

    const lastSyncRef = React.useRef<number>(Date.now());

    // Use custom hooks for cache and search
    const {
        projects,
        updateCache: updateProjectsCache,
        hasCache: hasProjectsCache,
        isStale: isProjectsCacheStale
    } = useProjectsCache(projectsManager)

    const {
        users, // This state from the hook will be updated by updateUsersCache
        updateCache: updateUsersCache,
        hasCache: hasUsersCache,
        isStale: isUsersCacheStale
    } = useUsersCache(usersManager);



    const {
        searchTerm,
        setSearchTerm,
        filteredProjects,
        // updateOriginalProjects
    } = useProjectSearch(projects)



    // Clave para useStickyState: específica del usuario o genérica si no hay usuario.
    const selectedProjectIdKey = currentUser ? `selectedProjectId_${currentUser.uid}` : 'selectedProjectId_guest';
    const [selectedProjectId, setSelectedProjectId] = useStickyState<string | null>(null, selectedProjectIdKey);
    //const [selectedProjectId, setSelectedProjectId] = useStickyState<string | null>(null, 'selectedProjectId')



    // Verificar si necesitamos sincronizar
    const shouldSync = React.useCallback(() => {
        const now = Date.now();
        return now - lastSyncRef.current > SYNC_INTERVAL;
    }, []);


    //Loading projects and users at the beginnig

        /**
     * Efecto para gestionar el estado de carga inicial de la página.
     * La página se considera "cargando" hasta que ambos managers (ProjectsManager y UsersManager)
     * hayan completado su carga inicial desde Firebase.
     */
    React.useEffect(() => {
        console.log('[ProjectsPage] useEffect for initial loading triggered.');
        // Si la autenticación aún está cargando o no hay usuario, no podemos determinar el estado de carga de los managers.
        // Podríamos mostrar un loading genérico o esperar a que auth termine.
        if (authLoading) {
            setIsInitialLoading(true);
            return;
        }

        const checkAndSetReady = () => {
            if (projectsManager.isReady && usersManager.isReady) {
                setIsInitialLoading(false);
                console.log('[ProjectsPage] Both managers ready. Initial loading complete.');

                // La lógica de poblar el caché ahora está dentro del hook useProjectsCache/useUsersCache,
                // que se activa cuando el manager notifica que está listo.



                
            
                // // *** NEW: Populate cache with initial data from managers ***
                // // This is crucial because the onProjectCreated/Updated/Deleted callbacks
                // // only fire for *changes* after the initial load.
                // // The initial snapshot population needs to be explicitly pushed to the cache.
                // const currentProjects = projectsManager.list.map(project => ({
                //     ...project,
                //     todoList: project.todoList.map(todo => ({
                //         ...todo,
                //         dueDate: todo.dueDate instanceof Date
                //             ? new Date(todo.dueDate.getTime())
                //             : new Date(todo.dueDate),
                //         createdDate: todo.createdDate instanceof Date
                //             ? new Date(todo.createdDate.getTime())
                //             : new Date(todo.createdDate)
                //     }))
                // }));
                // updateProjectsCache(currentProjects);
                // console.log('[ProjectsPage] Initial projects loaded into cache:', currentProjects.length);

                // const currentUsers = usersManager.list.map(user => ({
                //     ...user,
                //     accountCreatedAt: user.accountCreatedAt instanceof Date
                //         ? new Date(user.accountCreatedAt.getTime())
                //         : new Date(user.accountCreatedAt),
                //     lastLoginAt: user.lastLoginAt instanceof Date
                //         ? new Date(user.lastLoginAt.getTime())
                //         : new Date(user.lastLoginAt),
                // }));
                // updateUsersCache(currentUsers);
                // console.log('[ProjectsPage] Initial users loaded into cache:', currentUsers.length);

            } else {
                setIsInitialLoading(true); // Keep loading if not all are ready
            }
        }
        
        // // Call immediately in case managers are already ready
        checkAndSetReady();

        //  // Register callbacks for managers becoming ready
        projectsManager.onReady(checkAndSetReady);
        usersManager.onReady(checkAndSetReady);

        // No specific cleanup needed for these singletons' onReady callbacks
        // as they are meant to persist.
        //}, [authLoading, projectsManager, usersManager, updateProjectsCache, updateUsersCache]); 
    }, [authLoading, projectsManager, usersManager]); 


    // // Solo intentar sincronizar si la autenticación ha terminado de cargar y hay un usuario autenticado
    // //     if (authLoading || !currentUser) {
    // //         console.log('[ProjectsPage] Skipping sync. Auth loading:', authLoading, 'CurrentUser:', !!currentUser);
    // //         setIsInitialLoading(false); // Asegurarse de que no se quede en estado de carga si no hay usuario
    // //         return;
    // //     }



    // //     const syncWithDatabase = async () => {

    // //         // Comprobar si necesitamos sincronizar proyectos
    // //         const shouldSyncProjects = !hasProjectsCache || isProjectsCacheStale || projects.length === 0;
    // //         // Comprobar si necesitamos sincronizar usuarios
    // //         const shouldSyncUsers = !hasUsersCache || isUsersCacheStale || users.length === 0;


    // //         if (!shouldSyncProjects && !shouldSyncUsers) {
    // //             console.log('[ProjectsPage] Using cached data for projects and users.', {
    // //                 minutes: Math.round((SYNC_INTERVAL - (Date.now() - lastSyncRef.current)) / 60000)
    // //             });

    // //             // Asegurar que los proyectos estén en el manager
    // //             projects.forEach(project => {
    // //                 if (!projectsManager.getProject(project.id!)) {
    // //                 projectsManager.newProject(project, project.id);
    // //                 }
    // //             });

    // //             // Asegurar que los usuarios estén en el manager
    // //             users.forEach(user => {
    // //                 if (!usersManager.getUser(user.id!)) {
    // //                 usersManager.newUser(user, user.id);
    // //                 }
    // //             });
                    
    // //             return;
    // //         }

    // //         try {
    // //             console.log('[ProjectsPage] Starting database sync for projects and users.')
    // //             setIsInitialLoading(true)
                

    // //             // Cargar proyectos y usuarios en paralelo solo si es necesario
    // //             const [firebaseProjects, firebaseUsers] = await Promise.all([
    // //                 shouldSyncProjects ? getProjectsFromDB() : Promise.resolve([]),
    // //                 shouldSyncUsers ? getUsersFromDB() : Promise.resolve([])
    // //             ]);

    // //             // Procesar proyectos
    // //             if (shouldSyncProjects) {
    // //                 firebaseProjects.forEach(projectData => {
    // //                     projectsManager.newProject(projectData, projectData.id);
    // //                 })
    // //                 const currentProjects = projectsManager.list
    // //                 //Update cache and local state
    // //                 updateProjectsCache(currentProjects)

    // //                 console.log('[ProjectsPage] Projects loaded/synced:', {
    // //                     count: currentProjects.length,
    // //                     timestamp: new Date().toISOString()
    // //                 })
    // //             }

    // //             // Procesar usuarios
    // //             if (shouldSyncUsers) {
    // //                 firebaseUsers.forEach(userData => {
    // //                     usersManager.newUser(userData, userData.id);
    // //                 });
    // //                 const currentUsers = usersManager.list;
    // //                 updateUsersCache(currentUsers);
    // //                 console.log('[ProjectsPage] Users loaded/synced:', { count: currentUsers.length })
    // //             }

    // //             // Actualizar timestamp de última sincronización
    // //             lastSyncRef.current = Date.now();
    // //             console.log('[ProjectsPage] Sync finished.');


    // //         } catch (error) {
    // //             console.error("Error loading initial data:", error);
    // //             toast.error("Error loading initial data. Please try again later.");
    // //         } finally {
    // //             setIsInitialLoading(false)
    // //         }
    // //     }
    // //     syncWithDatabase();
    // // }, [authLoading, currentUser,                     hasProjectsCache, isProjectsCacheStale, projects.length, projectsManager, updateProjectsCache, usersManager, updateUsersCache, hasUsersCache, isUsersCacheStale, users.length ])


    // //Suscription to ProjectsManager events with control of refreshing
    // React.useEffect(() => {
    //     const handleProjectsUpdate = () => {
    //         //const updatedProjects = [...projectsManager.list];
    //         const updatedProjects = projectsManager.list.map(project => ({
    //             ...project,
    //             todoList: project.todoList.map(todo => ({
    //                 ...todo,
    //                 dueDate: todo.dueDate instanceof Date
    //                     ? new Date(todo.dueDate.getTime())
    //                     : new Date(todo.dueDate),
    //                 createdDate: todo.createdDate instanceof Date
    //                     ? new Date(todo.createdDate.getTime())
    //                     : new Date(todo.createdDate)
    //             }))
    //         }))



    //         //update cache and localStorage
    //         updateProjectsCache(updatedProjects);
    //         //localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProjects));
    //         //localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());            
    //         //updateOriginalProjects([...projectsManager.list])
    //         lastSyncRef.current = Date.now(); // Actualice timestamp

    //         console.log('Projects cache updated with todos:', {
    //             projectsCount: updatedProjects.length,
    //             todosCount: updatedProjects.reduce((acc, p) => acc + p.todoList.length, 0)
    //         });
    //     };


    //     //projectsManager.onProjectCreated = (newProject) => { updateProjectsCache([...projectsManager.list]) };

    //     projectsManager.onProjectCreated = handleProjectsUpdate;
    //     projectsManager.onProjectDeleted = handleProjectsUpdate;
    //     // projectsManager.onProjectDeleted = (id: string) => {
    //     //     const updatedProjects = projectsManager.list.filter(p => p.id !== id);
    //     //     updateProjectsCache(updatedProjects); // <- Actualiza el cache y el estado
    //     // };
    //     projectsManager.onProjectUpdated = handleProjectsUpdate;

    //     return () => {
    //         projectsManager.onProjectCreated = () => { }
    //         projectsManager.onProjectDeleted = () => { }
    //         projectsManager.onProjectUpdated = () => { }
    //     }
    // }, [updateProjectsCache, projectsManager])



    // // Subscription to UsersManager events with control of refreshing
    // React.useEffect(() => {
    //     const handleUsersUpdate = () => {
    //         const updatedUsers = usersManager.list.map(user => ({
    //             ...user,
    //             accountCreatedAt: user.accountCreatedAt instanceof Date
    //                 ? new Date(user.accountCreatedAt.getTime())
    //                 : new Date(user.accountCreatedAt),
    //             lastLoginAt: user.lastLoginAt instanceof Date
    //                 ? new Date(user.lastLoginAt.getTime())
    //                 : new Date(user.lastLoginAt),
    //             // projectsAssigned: user.projectsAssigned.map(project => ({ // Asegúrate de manejar esto si es necesario
    //             //     ...project,
    //             //     assignedDate: project.assignedDate instanceof Firestore.Timestamp ? project.assignedDate.toDate() : project.assignedDate,
    //             // })),
                
    //         }));

    //         updateUsersCache(updatedUsers);
    //         lastSyncRef.current = Date.now();
    //         console.log('Users cache updated:', { usersCount: updatedUsers.length });
    //     };

    //     // usersManager.onUserCreated = handleUsersUpdate;
    //     // usersManager.onUserDeleted = handleUsersUpdate;
    //     // usersManager.onUserUpdated = handleUsersUpdate;
    //     // Suscribirse al callback general de actualización de lista
    //     usersManager.onUsersListUpdated = handleUsersUpdate;

    //     return () => {
    //         // usersManager.onUserCreated = () => {};
    //         // usersManager.onUserDeleted = () => {};
    //         // usersManager.onUserUpdated = () => { };
    //         // Limpiar la suscripción al desmontar el componente
    //         usersManager.onUsersListUpdated = null;
    //     };
    // }, [updateUsersCache, usersManager]);






    //Handlers


    const onNewProjectClick = () => {
        setIsNewProjectFormOpen(true);
    }


    const handleCloseForm = () => {
        // Cierra el formulario
        setIsNewProjectFormOpen(false);
    };


    const handleExportProjectsBtnClick = () => {
        const exportProjectsBtn = document.getElementById("export-projects-JSON-btn")
        if (exportProjectsBtn) {
            projectsManager.exprtToJSON()
        } else {
            console.log("The export button was not found. Check the ID!")
        }
    };


    const handleImportProjectsBtnClick = () => {
        const importProjectsBtn = document.getElementById("import-projects-JSON-btn")
        if (importProjectsBtn) {
            projectsManager.imprtFromJSON()
        } else {
            console.log("The import button was not found. Check the ID!")
        }
    };


    const handleFormSubmit = (formData: any) => {
        // Aquí puedes manejar el envío del formulario, como guardar el proyecto
        console.log('Form submitted:', formData);
        // Cierra el formulario después de enviar
        handleCloseForm();
    }


    const handleProjectSearch = React.useCallback((value: string) => {
        setSearchTerm(value)
    }, [setSearchTerm])
    // const onProjectSearch = (value: string) => {
    //     setProjects(projectsManager.filterProjects(value))
    // }


    // Función para manejar el clic en el Link
    const handleProjectLinkClick = (projectId: string) => {
        console.log('Setting selectedProjectId using useStickyState:', projectId);
        setSelectedProjectId(projectId); // Usa el setter del hook
    };

    // Memorizar lista de ProjectCards
    const projectCardsList = React.useMemo(() =>
        filteredProjects.map((project) => (
            <Router.Link
                to={`/project/${project.id}`}
                key={project.id}
                onClick={() => handleProjectLinkClick(project.id!)}
                >
                <ProjectCard project={project} />
            </Router.Link>
        )),
        [filteredProjects]
    )

    // Mostrar LoadingIcon si la autenticación está cargando ó si la carga inicial de proyectos está en curso
    if (authLoading || isInitialLoading) {
        return <LoadingIcon />;
    }

    // const projectCardsList = projects.map((project) => {
    //     return (
    //         <Router.Link to={`/project/${project.id}`} key={project.id}>
    //             <ProjectCard
    //                 project={project}
    //             />
    //         </Router.Link>

    //     );
    // });


    const newProjectForm = isNewProjectFormOpen ? (
        <NewProjectForm
            onClose={handleCloseForm}
            projectsManager={projectsManager}
            onCreatedProject={onNewProjectCreated}
            onUpdatedProject={onProjectUpdate}
        />
    ) : null


    return (
        <section
            className="page"
            id="project-page"
            data-page=""
            style={{ display: "" }}
        >
            <header>
                <h2 style={{ display: "flex", alignItems: "center", columnGap: 20 }}>
                    Projects
                    <span className="material-icons-round" style={{ padding: 10 }}>
                        location_city
                    </span>

                    <SearchProjectBox onChange={handleProjectSearch} />
                    <CounterBox
                        filteredItemsNum={filteredProjects.length > 0
                            ? filteredProjects.length
                            : 0}
                        totalItemsNum={projects.length > 0
                            ? projects.length
                            : 0}
                    />
                    <div>
                        {isSyncing && (
                            <small style={{
                                //color: 'var(--color-text-secondary)',
                                fontSize: 'var(--font-base)',
                                color: 'var(--color-fontbase-dark)',
                                position: 'absolute',
                                margin: 'auto',
                            }}>
                                Syncing...
                            </small>
                        )}
                    </div>
                </h2>


                <div style={{ display: "flex", alignItems: "center", columnGap: 5 }}>

                    <div>
                        <button
                            title="Export project/s"
                            id="export-projects-JSON-btn"
                            style={{
                                borderRadius: "var(--br-circle)",
                                aspectRatio: 1,
                                padding: 0,
                                display: "flex",
                                justifyContent: "center"
                            }}
                        >
                            <span onClick={handleExportProjectsBtnClick} className="material-icons-round">file_upload</span>
                        </button>
                    </div>
                    <div>
                        <button
                            title="Import project/s"
                            id="import-projects-JSON-btn"
                            style={{
                                borderRadius: "var(--br-circle)",
                                aspectRatio: 1,
                                padding: 0,
                                display: "flex",
                                justifyContent: "center"
                            }}
                        >
                            <span onClick={handleImportProjectsBtnClick} className="material-icons-round">file_download</span>
                        </button>
                    </div>
                    <button onClick={onNewProjectClick} id="new-project-btn" style={{whiteSpace: 'nowrap'}}>
                        <AddIcon size={24} className="todo-icon-plain" color="var(--color-fontbase)" />New Project
                    </button>
                </div>
            </header>
            {isInitialLoading ? (
                <LoadingIcon />
            ) : (
                <div id="project-list">
                    {filteredProjects.length > 0 ? projectCardsList : <p>No projects found</p>}
                </div>
            )}
            {/*  Render the form if  isNewProjectFormOpen = true  */}
            {newProjectForm}

        </section>
    )
}