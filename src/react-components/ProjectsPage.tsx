import * as React from 'react';
import * as Router from 'react-router-dom';
import * as Firestore from 'firebase/firestore';


import { SearchProjectBox } from '../react-components';


import { useProjectsManager, NewProjectForm, ProjectCard } from './index.tsx';
import { firebaseDB } from '../services/Firebase/index.ts'
import { getCollection } from '../services/Firebase/index.ts'

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
    const [projects, setProjects] = React.useState<Project[]>(projectsManager.list)



    projectsManager.onProjectCreated = (newProject) => {setProjects([...projectsManager.list]) }
    projectsManager.onProjectDeleted = () => { setProjects([...projectsManager.list]) }
    projectsManager.onProjectUpdated = () => { setProjects([...projectsManager.list]) }



    //Retrieve information from Firebase
    const getFirestoreProjects = async () => {

        const firebaseProjects = await Firestore.getDocs(projectsCollection)
        for (const doc of firebaseProjects.docs) {
            const data = doc.data()
            const project: IProject = {
                ...data,
                finishDate: (data.finishDate as unknown as Firestore.Timestamp).toDate()
            }
            projectsManager.newProject(project, doc.id)
        }
    }

    React.useEffect(() => {
        getFirestoreProjects()
        return () => {
        }
    }, [])




    /* CONSIDERAR iterar dentro de la base de datos para recoger la lista de ToDos, tags y assigned users.
    const getFirestoreProjects = async () => {
        const projectsCollection = getCollection<IProject>( "/projects");
        const firebaseProjects = await Firestore.getDocs(projectsCollection);
        
        for (const doc of firebaseProjects.docs) {
            const data = doc.data();
            const project: IProject = {
                ...data,
                finishDate: (data.finishDate as unknown as Firestore.Timestamp).toDate(),
                todos: [] // Inicializa un array para los todos
            };
    
            // Recuperar los "todos" de la subcolección
            const todosCollection = Firestore.collection(firebaseDB, `/projects/${doc.id}/todos`);
            const firebaseTodos = await Firestore.getDocs(todosCollection);
            
            for (const todoDoc of firebaseTodos.docs) {
                const todoData = todoDoc.data();
                const todo = {
                    ...todoData,
                    // Aquí puedes agregar más lógica para recuperar tags y assignedUsers si es necesario
                };
                project.todos.push(todo); // Agrega el todo al proyecto
            }
    
            projectsManager.newProjectFromDB(project, doc.id);
        }
    };
    
    */


    const projectCardsList = projects.map((project) => {
        return (
            <Router.Link to={`/project/${project.id}`} key={project.id}>
                <ProjectCard
                    project={project}
                />
            </Router.Link>

        );
    });


    React.useEffect(() => {
        console.log("Projects state update", projects)
    }, [projects])



    const onNewProjectClick = () => {
        setIsNewProjectFormOpen(true);
    }


    const handleCloseForm = () => {
        // Cierra el formulario
        setIsNewProjectFormOpen(false);
    };

    const handleFormSubmit = (formData: any) => {
        // Aquí puedes manejar el envío del formulario, como guardar el proyecto
        console.log('Form submitted:', formData);
        // Cierra el formulario después de enviar
        handleCloseForm();
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


    const newProjectForm = isNewProjectFormOpen ? (
        <NewProjectForm
            onClose={handleCloseForm}
            projectsManager={projectsManager}
            onCreatedProject={onNewProjectCreated}
            onUpdatedProject={onProjectUpdate} 
        />
    ) : null;


    const onProjectSearch = (value: string) => {
        setProjects(projectsManager.filterProjects(value))
    }





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

                    <SearchProjectBox onChange={(value) => onProjectSearch(value)} />
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
            <div id="project-list">
                {projects.length > 0 ? projectCardsList : <p>No projects found</p>}

            </div>
            {/*  Render the form if  isNewProjectFormOpen = true  */}
            {newProjectForm}
            
        </section>
    )
}