import * as React from 'react';
import * as Router from 'react-router-dom';


import { SearchProjectBox } from '../react-components';

import { useProjectsManager,NewProjectForm, ProjectCard } from './index.tsx';

//import NewProjectForm from './NewProjectForm.tsx';
//import { ProjectCard } from './ProjectCard.tsx';
//import { useProjectsManager } from './ProjectsManagerContext';

import { ProjectsManager } from '../classes/ProjectsManager';
import { Project } from '../classes/Project';
import { showModal,closeModal, toggleModal, } from "../classes/UiManager.ts"
import { log } from 'three/examples/jsm/nodes/Nodes.js';


interface Props {
    projectsManager: ProjectsManager,
    onProjectUpdate: (updatedProject: Project) => void
    
}

export function ProjectsPage({ projectsManager, onProjectUpdate } : Props) {
    const [isNewProjectFormOpen, setIsNewProjectFormOpen] = React.useState(false)

    //const projectsManager = useProjectsManager(); // Access projectsManager
    //const [projectsManager] = React.useState(new ProjectsManager())
    const [projects, setProjects] = React.useState<Project[]>(projectsManager.list)
    
    projectsManager.onProjectCreated = () => { setProjects([...projectsManager.list]) }
    projectsManager.onProjectDeleted = () => { setProjects([...projectsManager.list]) }


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

    const handleUpdatedProjectList = (updatedProject: Project) => {
        const prevProjects = projectsManager.list
        setProjects((prevProjects) =>
                    prevProjects.map((project) => (project.id === updatedProject.id ? updatedProject : project))
                );
        onProjectUpdate(updatedProject)
    }
    


 
    const newProjectForm = isNewProjectFormOpen ? (
        <NewProjectForm
            onClose={handleCloseForm}
            projectsManager={projectsManager}
            onUpdatedProject={handleUpdatedProjectList}
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