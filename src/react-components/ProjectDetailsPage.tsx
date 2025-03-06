import * as React from 'react';
import * as Router from 'react-router-dom';
import { ProjectDetailsCard, ProjectDetailsToDoList, ThreeJSViewer } from '../react-components';

import { ProjectsManager } from '../classes/ProjectsManager';
import { type ToDoIssue } from '../classes/ToDoIssue';
import { type Project } from '../classes/Project';

import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error }: { error: Error }) {
    return (
        <div role="alert">
            <p>Something went wrong:</p>
            <pre style={{ color: 'red' }}>{error.message}</pre>
        </div>
    );
}

interface Props {
    projectsManager: ProjectsManager
    onProjectCreate: (updatedProject: Project) => void
    onProjectUpdate: (updatedProject: Project) => void
    onToDoIssueCreated: (createdToDoIssue: ToDoIssue) => void
}


export function ProjectDetailsPage({ projectsManager, onProjectCreate, onProjectUpdate, onToDoIssueCreated }: Props) {

    const routeParams = Router.useParams<{ id: string }>();
    console.log("I am the ID of the proyect selected", routeParams.id);
    const navigateTo = Router.useNavigate();
    const [currentProject, setCurrentProject] = React.useState<Project | null>(null);

    const projectId = routeParams.id;

    const project = projectId ? projectsManager.getProject(projectId): undefined;
    
    console.log('ProjectDetailsPage rendering with project:', project);

    // Redirect if project is not found
    React.useEffect(() => {
        if (!project) {
            navigateTo('/'); // Redirect to home
        }
    }, [])

    React.useEffect(() => {
        if (routeParams.id) {
            const project = projectsManager.list.find(p => p.id === routeParams.id);
            if (project) {
                setCurrentProject(project);
            }
        }
    }, [routeParams, projectsManager])


    const [projectState, setProjectState] = React.useState<Project | undefined>(project);
    

    React.useEffect(() => {
        // Update projectState if project prop changes (e.g., after navigation)
        setProjectState(project);
    }, [project])


    // If project is found, render the details
    if (!project) {
        return null
    }



    const handleCreatedProject = (createdProject: Project) => {
        //Update the parent project object to trigger the rerender.
        setProjectState(createdProject)
        onProjectCreate(createdProject)
    }

    const handleUpdatedProject = (updatedProject: Project) => {
        //Update the parent project object to trigger the rerender.
        setProjectState(updatedProject)
        onProjectUpdate(updatedProject)
    }

    const handleToDoCreated = (newTodo: ToDoIssue) => {
        if (!currentProject) return

        // Find current project
        const project = projectsManager.list.find(p => p.id === currentProject?.id);
        if (project) {
            // Check if todo already exists
            const existingTodoIndex = project.todoList.findIndex(
                todo => todo.id === newTodo.id
            )
            
            if (existingTodoIndex === -1) {
                // Only add if it doesn't exist
                project.todoList.push(newTodo)
                // Update current project state
                setCurrentProject({ ...project })
            }
            // Notify parent for state update
            onToDoIssueCreated(newTodo)
            
        }
    }
    





    return (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
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
                    <ProjectDetailsCard project={project} onCreatedProject={handleCreatedProject} onUpdatedProject={handleUpdatedProject} projectsManager={projectsManager}/>
                    <ProjectDetailsToDoList project={projectState as Project} onUpdatedProject={handleUpdatedProject} onCreatedToDoIssue={handleToDoCreated} />
                </div>
                <ThreeJSViewer />                
            </div>
            </section>
        </ErrorBoundary>
    );
}

