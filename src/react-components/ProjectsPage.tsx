import * as React from 'react';
import { useState } from 'react';
import { useProjectsManager,NewProjectForm, ProjectCard } from './index.tsx';

//import NewProjectForm from './NewProjectForm.tsx';
//import { ProjectCard } from './ProjectCard.tsx';
//import { useProjectsManager } from './ProjectsManagerContext';

import { ProjectsManager } from '../classes/ProjectsManager';
import { Project } from '../classes/Project';
import { showModal,closeModal, toggleModal, } from "../classes/UiManager.ts"
import { log } from 'three/examples/jsm/nodes/Nodes.js';






export function ProjectsPage() {
    const [isNewProjectFormOpen, setIsNewProjectFormOpen] = useState(false)

    const projectsManager = useProjectsManager(); // Access projectsManager
    //const [projectsManager] = React.useState(new ProjectsManager())
    const [projects, setProjects] = React.useState<Project[]>(projectsManager.list)
    
    projectsManager.onProjectCreated = () => { setProjects([...projectsManager.list]) }
    projectsManager.onProjectDeleted = () => { setProjects([...projectsManager.list]) }


    const projectCardsList = projects.map((project) => {
        return (
            <ProjectCard
                key={project.id}
                project={project}
            />
        );
    });
    

    React.useEffect(() => { 
        console.log("Projects state update", projects)
    }, [projects])


    
    const onNewProjectClick = () => {

        setIsNewProjectFormOpen(true);
        // showModal("new-project-modal") //**Old call to the Form**

        const projectForm = document.getElementById("new-project-form") as HTMLFormElement;
        if (projectForm) {

            // *** RESET THE FORM ***
            // 1. Target specific input types
            const inputsToReset = projectForm.querySelectorAll('input[type="text"], input[type="date"], input[type="number"], textarea, select');

            // 2. Loop through and reset each element
            inputsToReset.forEach(element => {
                (element as HTMLInputElement).value = ''; // Reset to empty string

                // Additional handling for select elements:
                if (element instanceof HTMLSelectElement) {
                    element.selectedIndex = 0; // Reset to the first option
                }
            });
        }

        // Set Modal in case previously we updated a project
        // Update Modal Title
        const modalProjectTitle = document.getElementById("modal-project-title");
        if (modalProjectTitle) {
            modalProjectTitle.textContent = "New Project";
        }
        // Update Button Text and remove dataset -projectID from it
        const submitButton = document.getElementById("accept-project-btn");
        if (submitButton) {
            submitButton.textContent = "Accept"
            submitButton.dataset.projectId= ""
        }

        const discardButton = document.getElementById("cancel-project-btn");
        if (discardButton) {
            discardButton.textContent = "Cancel";
        }
        //Remove the delete project button from the modal in case previously we updated a project
        const parentDeleteBtn = document.getElementById("titleModalNewProject")
        if (parentDeleteBtn) {
            const deleteButton = document.getElementById("delete-project-btn")
            if (deleteButton) {
                parentDeleteBtn.removeChild(deleteButton)
            }
        }
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
        <NewProjectForm onClose={handleCloseForm} />
    ) : null;

    



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
            <div id="project-list">{projectCardsList}
                {/*<div className="project-card" style={{ display: "" }}></div>*/}
            </div>
            {/*  Render the form if  isNewProjectFormOpen = true  */}
            {newProjectForm}
        </section>
    )
}