import * as React from 'react';
import * as Router from 'react-router-dom';
import { ProjectDetailsCard, ProjectDetailsToDoList, ThreeJSViewer } from '../react-components';

import { ProjectsManager } from '../classes/ProjectsManager';
import { type ToDoIssue } from '../classes/ToDoIssue';
import { Project } from '../classes/Project';

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
    onToDoIssueUpdated: (updatedToDoIssue: ToDoIssue) => void
}


export function ProjectDetailsPage({ projectsManager, onProjectCreate, onProjectUpdate, onToDoIssueCreated, onToDoIssueUpdated }: Props) {

    const  routeParams  = Router.useParams<{ id: string }>();
    console.log("I am the ID of the proyect selected", routeParams.id);
    const navigateTo = Router.useNavigate();

    const projectId = routeParams.id;

    // Retrieve project based on projectId as soon as possible.
    const initialProject = projectId ? projectsManager.getProject(projectId) : null;

    const [currentProject, setCurrentProject] = React.useState<Project | null>(initialProject!);

    console.log("I am the ID of the proyect selected", routeParams.id);
    console.log('ProjectDetailsPage rendering with project:', currentProject);

    //const project = projectId ? projectsManager.getProject(projectId): undefined;
    
    //console.log('ProjectDetailsPage rendering with project:', project);

    // Redirect if project is not found
    React.useEffect(() => {
        if (!projectId) {
            navigateTo('/'); // Redirect to home
        }
        if (projectId && !currentProject) {
            navigateTo('/')
        }
        
    }, [projectId, navigateTo, currentProject])


    // Update current project if the route params change.
    React.useEffect(() => {
        if (projectId) {
            const project = projectsManager.getProject(projectId);
            if (project) {
                setCurrentProject(project)
            } else {
                navigateTo('/')
            }
        }
    }, [projectId, projectsManager, navigateTo])


    //const [projectState, setProjectState] = React.useState<Project | undefined>(project);
 


    // If project is found, render the details
    // if (!project) {
    //     return null
    // }



    const handleCreatedProject = (createdProject: Project) => {
        //Update the parent project object to trigger the rerender.
        setCurrentProject(createdProject)
        onProjectCreate(createdProject)
    }

    const handleUpdatedProject = (updatedProject: Project) => {
        //Update the parent project object to trigger the rerender.
        setCurrentProject(updatedProject)
        onProjectUpdate(updatedProject)
    }

    

    const handleToDoCreated = (newTodo: ToDoIssue) => {
        if (!currentProject) return

        // Find current project in the list by ID
        const projectIndex = projectsManager.list.findIndex(p => p.id === currentProject?.id);
        if (projectIndex === -1) {
            console.error(`Project with ID ${currentProject.id} not found in the manager.`);
            return;
        }
        //Create a new list with the updated project
        const updatedProject = new Project({
            ...currentProject
        })

        // Then set the todoList property
        updatedProject.todoList = [...currentProject.todoList, newTodo]; // Add the new ToDo
        

        // Update the state of the current project
        setCurrentProject(updatedProject);
        // Update the project in the manager list
        projectsManager.updateReactProjects(updatedProject)
        
        // Notify parent for state update
        onToDoIssueCreated(newTodo) 
        
    }


    const handleUpdatedToDo = (updatedTodo: ToDoIssue) => {
        // Update the ToDoIssue in the todoList inside the project inside the manager list
        //projectsManager.updateToDoIssue(updatedTodo.todoProject, updatedTodo.id ,updatedTodo) ******* he quitado este pero hay que comprobarlo lo tiene el padre
        onToDoIssueUpdated(updatedTodo)

        //*****???????? */

        // Find the project in the list and update its todoList
        const projectIndex = projectsManager.list.findIndex(p => p.id === currentProject?.id);
        if (projectIndex !== -1 && currentProject) {
            const updatedProject = new Project({
                ...currentProject
            });
            const todoIndex = updatedProject.todoList.findIndex(todo => todo.id === updatedTodo.id);
            if (todoIndex !== -1) {
                updatedProject.todoList[todoIndex] = updatedTodo;
                // Update the state of the current project
                setCurrentProject(updatedProject);
                // Update the project in the manager list
                projectsManager.updateReactProjects(updatedProject);
            }
        }

        //*****???????? */

    }


    // If project is not found (after checking), return null.
    if (!currentProject) {
        return null;
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
                    <h2 data-project-info="name">{currentProject.name}</h2>
                {/* <p style="color: var(--color-grey)"> Community hospital location city</p> */}
                </div>
            </header>
            <div className="main-page-content">
                <div style={{ display: "flex", flexDirection: "column", rowGap: 40 }}>
                        <ProjectDetailsCard
                            project={currentProject}
                            onCreatedProject={handleCreatedProject}
                            onUpdatedProject={handleUpdatedProject}
                            projectsManager={projectsManager}
                        />
                        <ProjectDetailsToDoList
                            project={currentProject as Project}
                            onUpdatedProject={handleUpdatedProject}
                            onCreatedToDoIssue={handleToDoCreated}
                            onUpdatedToDoIssue={handleUpdatedToDo}
                        />
                </div>
                <ThreeJSViewer />
            </div>
            </section>
        </ErrorBoundary>
    );
}

