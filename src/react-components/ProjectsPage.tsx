import * as React from 'react';
import * as Router from 'react-router-dom';
import * as Firestore from 'firebase/firestore';


import { LoadingIcon, SearchProjectBox, ProjectCard, CounterBox } from '../react-components';
import { useProjectsCache, useProjectSearch } from '../hooks'
import { STORAGE_KEY, CACHE_TIMESTAMP_KEY, SYNC_INTERVAL } from '../const';

import { useProjectsManager, NewProjectForm } from './index.tsx';
import { firebaseDB, getProjectsFromDB } from '../services/firebase/index.ts'
import { getCollection } from '../services/firebase/index.ts'

//import NewProjectForm from './NewProjectForm.tsx';
//import { ProjectCard } from './ProjectCard.tsx';
//import { useProjectsManager } from './ProjectsManagerContext';

import { ProjectsManager } from '../classes/ProjectsManager';
import { IProject, Project } from '../classes/Project';
import { showModal, closeModal, toggleModal, } from "../classes/UiManager.ts"
import { log } from 'three/examples/jsm/nodes/Nodes.js';


interface Props {
    projectsManager: ProjectsManager,
    onProjectUpdate: (updatedProject: Project) => void
    onNewProjectCreated: (newProjectCreated: Project) => void
}
const projectsCollection = getCollection<IProject>("/projects")

export function ProjectsPage({ projectsManager, onProjectUpdate, onNewProjectCreated }: Props) {

    const [isNewProjectFormOpen, setIsNewProjectFormOpen] = React.useState(false)
    const [isInitialLoading, setIsInitialLoading] = React.useState(false);
    const [isSyncing, setIsSyncing] = React.useState(false)

    const lastSyncRef = React.useRef<number>(Date.now());

    // Use custom hooks for cache and search
    const {
        projects,
        updateCache,
        hasCache,
        isStale
    } = useProjectsCache()

    const {
        searchTerm,
        setSearchTerm,
        filteredProjects,
        // updateOriginalProjects
    } = useProjectSearch(projects)

    // Verificar si necesitamos sincronizar
    const shouldSync = React.useCallback(() => {
        const now = Date.now();
        return now - lastSyncRef.current > SYNC_INTERVAL;
    }, []);


    //Loading projects at the beginnig
    React.useEffect(() => {
        const syncWithDatabase = async () => {
            try {
                // Si hay caché válido, y no ha pasado el intervalo, no hacer nada
                if (hasCache && !isStale && projects.length > 0) {
                    console.log('Using cached projects, next sync in:', {
                        minutes: Math.round((SYNC_INTERVAL - (Date.now() - lastSyncRef.current)) / 60000)
                    });
                    // Ensure ProjectManager and search state are in sync with cache
                    projects.forEach(project => {
                        if (!projectsManager.getProject(project.id!)) {
                            projectsManager.newProject(project, project.id);
                        }
                    });
                    //updateOriginalProjects(projects);
                    return;
                }


                // Mostrar loading solo si no hay caché
                if (!hasCache) {
                    setIsInitialLoading(true);
                } else {
                    setIsSyncing(true);
                }

                const firebaseProjects = await getProjectsFromDB()

                // // Actualizar solo si hay cambios
                // const currentProjects = projectsManager.list;
                // const hasChanges = JSON.stringify(firebaseProjects) !== JSON.stringify(currentProjects);

                // Create Project instances using ProjectManager for each project from Firebase
                // if (hasChanges) {
                firebaseProjects.forEach(projectData => {
                    projectsManager.newProject(projectData, projectData.id);
                })


                const currentProjects = projectsManager.list

                //Update cache and local state
                updateCache(currentProjects)
                //updateOriginalProjects(currentProjects)

                console.log('Projects loaded:', {
                    count: currentProjects.length,
                    timestamp: new Date().toISOString()
                })
                // }
                // Actualizar timestamp de última sincronización
                lastSyncRef.current = Date.now();


            } catch (error) {
                console.error("Error loading projects:", error);
                // Handle error appropriately - maybe set an error state
            } finally {
                setIsInitialLoading(false);
                setIsSyncing(false)
            }
        }
        syncWithDatabase();
    }, [hasCache, isStale, projects.length])


    //Suscription to ProjectsManager events with control of refreshing
    React.useEffect(() => {
        const handleProjectsUpdate = () => {
            //const updatedProjects = [...projectsManager.list];
            const updatedProjects = projectsManager.list.map(project => ({
                ...project,
                todoList: project.todoList.map(todo => ({
                    ...todo,
                    dueDate: todo.dueDate instanceof Date
                        ? new Date(todo.dueDate.getTime())
                        : new Date(todo.dueDate),
                    createdDate: todo.createdDate instanceof Date
                        ? new Date(todo.createdDate.getTime())
                        : new Date(todo.createdDate)
                }))
            }))



            //update cache and localStorage
            updateCache(updatedProjects);
            //localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProjects));
            //localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());            
            //updateOriginalProjects([...projectsManager.list])
            lastSyncRef.current = Date.now(); // Actualice timestamp

            console.log('Projects cache updated with todos:', {
                projectsCount: updatedProjects.length,
                todosCount: updatedProjects.reduce((acc, p) => acc + p.todoList.length, 0)
            });
        };


        //projectsManager.onProjectCreated = (newProject) => { updateCache([...projectsManager.list]) };

        projectsManager.onProjectCreated = handleProjectsUpdate;
        projectsManager.onProjectDeleted = handleProjectsUpdate;
        // projectsManager.onProjectDeleted = (id: string) => {
        //     const updatedProjects = projectsManager.list.filter(p => p.id !== id);
        //     updateCache(updatedProjects); // <- Actualiza el cache y el estado
        // };
        projectsManager.onProjectUpdated = handleProjectsUpdate;



        // projectsManager.onProjectCreated = (newProject) => { updateCache([...projectsManager.list]) }
        // projectsManager.onProjectDeleted = () => { updateCache([...projectsManager.list]) }
        // projectsManager.onProjectUpdated = () => { updateCache([...projectsManager.list]) }

        return () => {
            projectsManager.onProjectCreated = () => { }
            projectsManager.onProjectDeleted = () => { }
            projectsManager.onProjectUpdated = () => { }
        }
    }, [updateCache, projectsManager])


    // React.useEffect(() => {
    //     console.log("Projects state update", projects)
    // }, [projects])


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


    // Memorizar lista de ProjectCards
    const projectCardsList = React.useMemo(() =>
        filteredProjects.map((project) => (
            <Router.Link to={`/project/${project.id}`} key={project.id}>
                <ProjectCard project={project} />
            </Router.Link>
        )),
        [filteredProjects]
    )
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
                    <button onClick={onNewProjectClick} id="new-project-btn">
                        <span className="material-icons-round">add</span>New Project
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