import * as React from 'react';
import * as Router from 'react-router-dom';
import * as Firestore from 'firebase/firestore';


import { LoadingIcon, SearchProjectBox, ProjectCard, CounterBox } from '../react-components';
import { useProjectsCache, useProjectSearch } from '../hooks'


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
    //const [projects, setProjects] = React.useState<Project[]>(projectsManager.list)
    const [isLoading, setIsLoading] = React.useState(false)

    //const [displayedProjects, setDisplayedProjects] = React.useState<Project[]>([]);
    //const originalProjectsRef = React.useRef<Project[]>([]);
    //const [searchTerm, setSearchTerm] = React.useState('');

    // Use custom hooks for cache and search
    const {
        projects,
        updateCache,
        setProjects
    } = useProjectsCache()

    const {
        searchTerm,
        setSearchTerm,
        filteredProjects,
        updateOriginalProjects,
        setOriginalProjectsRef
    } = useProjectSearch(projects)


    //Loading projects at the beginnig
    React.useEffect(() => {
        const loadProjects = async () => {
            try {
                setIsLoading(true)
                const firebaseProjects = await getProjectsFromDB()

                // Create Project instances using ProjectManager for each project from Firebase
                firebaseProjects.forEach(projectData => {
                    projectsManager.newProject(projectData, projectData.id);
                })

                const currentProjects = projectsManager.list

                //Update cache and local state
                updateCache(currentProjects)
                updateOriginalProjects(currentProjects)
                setOriginalProjectsRef(currentProjects)
                
                console.log('Projects loaded:', {
                    count: currentProjects.length,
                    projects: currentProjects
                })

            } catch (error) {
                console.error("Error loading projects:", error);
                // Handle error appropriately - maybe set an error state
            } finally {
                setIsLoading(false);
            }
        }
        loadProjects();
    }, [])


    //Suscription to ProjectsManager events
    React.useEffect(() => {
    
        projectsManager.onProjectCreated = (newProject) => { setProjects([...projectsManager.list]) }
        projectsManager.onProjectDeleted = () => { setProjects([...projectsManager.list]) }
        projectsManager.onProjectUpdated = () => { setProjects([...projectsManager.list]) }

        return () => {
            projectsManager.onProjectCreated = () => { }
            projectsManager.onProjectDeleted = () => { }
            projectsManager.onProjectUpdated = () => { }
        }
    }, [])


    React.useEffect(() => {
        console.log("Projects state update", projects)
    }, [projects])


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
            {isLoading ? (
                <LoadingIcon/>
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