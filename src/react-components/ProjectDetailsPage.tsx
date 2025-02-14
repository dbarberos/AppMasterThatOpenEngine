import * as React from 'react';
import * as Router from 'react-router-dom';
import { ProjectDetailsCard, ProjectDetailsToDoList, ThreeJSViewer } from '../react-components';

import { ProjectsManager } from '../classes/ProjectsManager';
import { Project } from '../classes/Project';

interface Props {
    projectsManager: ProjectsManager
    onProjectUpdate: (updatedProject: Project) => void
}


export function ProjectDetailsPage({ projectsManager, onProjectUpdate }: Props) {



    const routeParams = Router.useParams<{ id: string }>();
    console.log("I´m the ID of the proyect selected", routeParams.id);
    const navigateTo = Router.useNavigate();

    const projectId = routeParams.id;

    const project = projectId ? projectsManager.getProject(projectId): undefined;
    

    // Redirect if project is not found
    React.useEffect(() => {
        if (!project) {
            navigateTo('/'); // Redirect to home
        }
    }, []);


    const [projectState, setProjectState] = React.useState<Project | undefined>(project);
    

    React.useEffect(() => {
        // Update projectState if project prop changes (e.g., after navigation)
        setProjectState(project);
    }, [project]);


    // If project is found, render the details
    if (!project) {
        return null; 
    }



    const handleUpdatedProject = (updatedProject: Project) => {
        //Update the parent project object to trigger the rerender.
        setProjectState(updatedProject)
        onProjectUpdate(updatedProject)
    }




    return (
        <section
            className="page"
            id="project-details"
            data-page=""
            style={{ display: "" }}
            >
            <header
                style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
                flexWrap: "wrap",
                gap: 20,
                columnGap: 100,
                userSelect: "none"
                }}
            >
                <div style={{ display: "flex", columnGap: 20 }}>
                    <h2 style={{ display: "flex", alignItems: "center", columnGap: 20 }}>
                        Project Details
                        <span className="todo-task-move">
                            <span className="material-icons-round" style={{ padding: 10 }}>
                                home_work
                            </span>
                        </span>
                    </h2>
                <div style={{ display: "flex", alignItems: "center", columnGap: 10 }}>
                    <p>Swap project: </p>
                    <select
                    id="projectSelectedProjectDetailPage"
                    style={{
                        padding: 10,
                        borderRadius: 5,
                        fontSize: "var(--font-lg)",
                        lineHeight: 1,
                        letterSpacing: "normal",
                        textTransform: "none",
                        display: "inline-block",
                        whiteSpace: "nowrap",
                        wordWrap: "normal"
                    }}
                    ></select>
                </div>
                </div>
                <div>
                    <h2 data-project-info="name">{project.name}</h2>
                {/* <p style="color: var(--color-grey)"> Community hospital location city</p> */}
                </div>
            </header>
            <div className="main-page-content">
                <div style={{ display: "flex", flexDirection: "column", rowGap: 40 }}>
                    <ProjectDetailsCard project={project} onUpdatedProject={handleUpdatedProject} projectsManager={projectsManager}/>
                    <ProjectDetailsToDoList project={projectState as Project} onUpdatedProject={handleUpdatedProject} />
                </div>
                <ThreeJSViewer />                
            </div>
            </section>
 );
}

