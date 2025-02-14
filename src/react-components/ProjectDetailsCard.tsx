import * as React from 'react';
import * as Router from 'react-router-dom';

import { NewProjectForm } from '../react-components';


import { ProjectsManager } from '../classes/ProjectsManager';
import { Project } from '../classes/Project';

interface Props {   
    project: Project,
    onUpdatedProject: (updatedProject: Project) => void
    projectsManager: ProjectsManager
}

export function ProjectDetailsCard({ project, onUpdatedProject, projectsManager }:Props) {

    const [isNewProjectFormOpen, setIsNewProjectFormOpen] = React.useState(false)   

    const handleCloseForm = () => {
        // Cierra el formulario
        setIsNewProjectFormOpen(false);
    };



    const onEditProjectDetailsClick = () => {
        setIsNewProjectFormOpen(true)
    }


    const handleUpdatedProject = (updatedProject: Project) => {
            onUpdatedProject(updatedProject)
        }

    const updateProjectDetailsForm = isNewProjectFormOpen ? (
        <NewProjectForm onClose={handleCloseForm} updateProject={project} onUpdatedProject={handleUpdatedProject} projectsManager={projectsManager} />
    ) : null


    return (
        <div
            id="form-project-details"
            className="dashboard-card"
            style={{ padding: 17, rowGap: "20px 15px" }}
        >
            <div
            style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 30
            }}
            >
            <abbr
                title="Acronym of the project"
                style={{
                fontSize: 20,
                backgroundColor: "#f08080",
                padding: 15,
                borderRadius: "100%",
                aspectRatio: 1,
                color: "#343537",
                display: "flex",
                alignItems: "center"
                }}
                data-project-info="acronym"
            >
                {project.acronym}
            </abbr>
                <button
                    id="edit-project-details"
                    className=""
                    onClick={onEditProjectDetailsClick}>
                Edit
            </button>
            </div>
            <div
            style={{
                padding: "0 30px",
                wordWrap: "break-word",
                overflowWrap: "break-word",
                wordBreak: "break-all",
                maxWidth: "95%",
                marginRight: 15,
                overflow: "auto",
                scrollbarWidth: "none",
                height: "100%"
            }}
            >
            <h5 data-project-info="name">{project.name}</h5>
            <p data-project-info="description">{project.description}</p>
            </div>
            <div
            style={{
                display: "flex",
                columnGap: 15,
                padding: "15px 0px",
                justifyContent: "space-around"
            }}
            >
            <div>
                <p
                style={{
                    color: "var(--color-grey)",
                    fontSize: "var(--font-base)",
                    flexBasis: "auto"
                }}
                >
                Business Unit
                </p>
                <p data-project-info="businessUnit">{project.businessUnit}</p>
            </div>
            <div>
                <p
                style={{
                    color: "var(--color-grey)",
                    fontSize: "var(--font-base)",
                    flexBasis: "auto"
                }}
                >
                Status
                </p>
                <p data-project-info="status">{project.status}</p>
            </div>
            <div>
                <p
                style={{
                    color: "var(--color-grey)",
                    fontSize: "var(--font-base)",
                    flexBasis: "auto"
                }}
                >
                Cost
                </p>
                <p data-project-info="cost">$ {project.cost}</p>
            </div>
            <div>
                <p
                style={{
                    color: "var(--color-grey)",
                    fontSize: "var(--font-base)",
                    flexBasis: "auto"
                }}
                >
                Role
                </p>
                <p data-project-info="userRole">{project.userRole}</p>
            </div>
            <div>
                <p
                style={{
                    color: "var(--color-grey)",
                    fontSize: "var(--font-base)",
                    flexBasis: "auto"
                }}
                >
                Finish Date
                </p>
                <p data-project-info="finishDate">{project.finishDate.toISOString().split('T')[0]}</p>
            </div>
            </div>
            <div>
            <p
                data-project-info="progress="
                style={{
                color: "var(--color-grey)",
                fontSize: "var(--font-base)",
                flexBasis: "auto"
                }}
            >
                Progress
            </p>
            <progress value={Math.max(0, Math.min(project.progress || 0, 100))} max={100} />
            </div>
            {updateProjectDetailsForm}
        </div> 
    )
}
