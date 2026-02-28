import * as React from 'react';
import * as Router from 'react-router-dom';
import { ProjectDetailsCard, ProjectDetailsToDoList, ThreeJSViewer, ProjectSelector } from '../react-components';
import { updateDocument} from '../services/Firebase';

import { ProjectsManager } from '../classes/ProjectsManager';
import { type ToDoIssue } from '../classes/ToDoIssue';
import { Project } from '../classes/Project';
import { IToDoIssue } from '../types';

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
    //onToDoIssueUpdated: (updatedToDoIssue: ToDoIssue) => void
    //onToDoIssueUpdated: (todoId: string, updates: Partial<IToDoIssue>) => Promise<void>
    onToDoIssueUpdated: (projectId: string, todoId: string, updates: Partial<IToDoIssue>) 
        => Promise<void>
    onToDoIssueDeleted: (projectId: string, todoId: string) => Promise<void>
}


export function ProjectDetailsPage({ projectsManager, onProjectCreate, onProjectUpdate, onToDoIssueCreated, onToDoIssueUpdated,onToDoIssueDeleted }: Props) {

    const  routeParams  = Router.useParams<{ id: string }>();
    console.log("I am the ID of the proyect selected", routeParams.id);
    const navigateTo = Router.useNavigate();

    const projectId = routeParams.id;

    // // Retrieve project based on projectId as soon as possible.
    // const initialProject = projectId ? projectsManager.getProject(projectId) : null;

    // const [currentProject, setCurrentProject] = React.useState<Project | null>(initialProject!);

    // Derivar el proyecto directamente de las props en cada renderizado.
    // Esto elimina el estado local obsoleto y asegura que siempre tengamos la última versión.
    const currentProject = projectId ? projectsManager.getProject(projectId) : null;

    console.log("I am the ID of the proyect selected", routeParams.id);
    console.log('ProjectDetailsPage rendering with project:', currentProject);

    //const project = projectId ? projectsManager.getProject(projectId): undefined;
    
    //console.log('ProjectDetailsPage rendering with project:', project);

    // Redirect if project is not found
    React.useEffect(() => {
        if (!projectId) {
            navigateTo('/'); // Redirect to home
        }
        // if (projectId && !currentProject) {
        //     navigateTo('/')
        // }
        // Si el projectsManager ha cargado y el proyecto sigue sin encontrarse, redirigir.
        if (projectId && !currentProject && projectsManager.list.length > 0) {
            console.warn(`ProjectDetailsPage: Project with ID "${projectId}" not found. Redirecting.`);
            navigateTo('/');
        }


    }, [projectId, currentProject, projectsManager.list, navigateTo]); 
    // }, [projectId, navigateTo, currentProject])


    // // Update current project if the route params change.
    // React.useEffect(() => {
    //     if (projectId) {
    //         const project = projectsManager.getProject(projectId);
    //         if (project) {
    //             setCurrentProject(project)
    //         } else {
    //             navigateTo('/')
    //         }
    //     }
    //}, [projectId, projectsManager, navigateTo])


    //const [projectState, setProjectState] = React.useState<Project | undefined>(project);
 


    // If project is found, render the details
    // if (!project) {
    //     return null
    // }



    const handleCreatedProject = (createdProject: Project) => {
        //Update the parent project object to trigger the rerender.
        //setCurrentProject(createdProject)
        onProjectCreate(createdProject)
    }

    const handleUpdatedProject = (updatedProject: Project) => {
        //Update the parent project object to trigger the rerender.
        //setCurrentProject(updatedProject)
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
        //setCurrentProject(updatedProject);
        // Update the project in the manager list
        projectsManager.updateReactProjects(updatedProject)
        
        // Notify parent for state update
        onToDoIssueCreated(newTodo) 
        
    }


    // const handleUpdatedToDo = (updatedTodo: ToDoIssue) => {
    //     // Update the ToDoIssue in the todoList inside the project inside the manager list
    //     //projectsManager.updateToDoIssue(updatedTodo.todoProject, updatedTodo.id ,updatedTodo) ******* he quitado este pero hay que comprobarlo lo tiene el padre
    //     onToDoIssueUpdated(updatedTodo)
        
    //     // Find the project in the list and update its todoList
    //     const projectIndex = projectsManager.list.findIndex(p => p.id === currentProject?.id);
    //     if (projectIndex !== -1 && currentProject) {
    //         const updatedProject = new Project({
    //             ...currentProject
    //         });
    //         const todoIndex = updatedProject.todoList.findIndex(todo => todo.id === updatedTodo.id);
    //         if (todoIndex !== -1) {
    //             updatedProject.todoList[todoIndex] = updatedTodo;
    //             // Update the state of the current project
    //             setCurrentProject(updatedProject);
    //             // Update the project in the manager list
    //             projectsManager.updateReactProjects(updatedProject);
    //         }
    //     }
    // }

    // Este handler ahora solo propaga el evento hacia arriba.
    // La lógica de actualización del estado local se elimina, ya que onSnapshot se encargará.

    //const handleUpdatedToDo = async (todoId: string, updates: Partial<IToDoIssue>) => {
        // console.log("ProjectDetailsPage: Propagando evento onToDoIssueUpdated", { todoId, updates });
    const handleUpdatedToDo = async (projectId: string, todoId: string, updates: Partial<IToDoIssue>) => {
        console.log("ProjectDetailsPage: Propagando evento onToDoIssueUpdated", { projectId, todoId, updates });
        // Llama a la prop recibida de index.tsx
        // await onToDoIssueUpdated(todoId, updates);
        await onToDoIssueUpdated(projectId, todoId, updates);
    }




        const handleProjectSelectionInDetails = (newProjectId: string | null) => {
        if (newProjectId && newProjectId !== projectId) {
            navigateTo(`/project/${newProjectId}`);
        } else if (!newProjectId) {
            // Opcional: manejar el caso donde no se selecciona ningún proyecto
            // navigateTo('/'); 
        }
    };



    //  HANDLER para el reordenamiento
    const handleTodoListReordered = async (reorderedList: ToDoIssue[]) => {
        if (!currentProject?.id) return;

        console.log("ProjectDetailsPage: Handling reordered list", reorderedList.map(t => t.id));


        // --- Identificar el ToDo que cambió su sortOrder ---
        // Compara la nueva lista con la lista original (antes del D&D)
        // ¡OJO! Necesitamos la lista ANTES del D&D para comparar.
        // Podríamos pasarla desde ProjectDetailsToDoList o buscarla en currentProject *antes* de actualizarlo.
        // Asumamos que `currentProject.todoList` tiene el estado *antes* del D&D aquí.
        let movedTodo: ToDoIssue | undefined;
        const originalListMap = new Map(currentProject.todoList.map(t => [t.id, t.sortOrder]));

        for (const todo of reorderedList) {
            const originalSortOrder = originalListMap.get(todo.id);
            if (originalSortOrder !== todo.sortOrder) {
                movedTodo = todo;
                break; // Encontramos el que cambió
            }
        }
        // --- Fin Identificar ---


        // Crear una nueva instancia del proyecto con la lista reordenada
        const updatedProjectData = {
            ...currentProject,
            todoList: reorderedList, // La lista ya viene ordenada y con el sortOrder actualizado
        };
        const updatedProjectInstance = new Project(updatedProjectData)


        // Actualizar el estado local de ProjectDetailsPage
        //setCurrentProject(updatedProjectInstance);

        // Actualizar el proyecto en ProjectsManager (importante para consistencia)
        projectsManager.updateReactProjects(updatedProjectInstance);

        // Notificar al componente App (index.tsx) para actualizar el estado global si es necesario
        // y potencialmente guardar el nuevo orden en la base de datos.
        onProjectUpdate(updatedProjectInstance);

        // --- Actualizar SOLO el sortOrder en Firebase ---
        if (movedTodo && movedTodo.id) {
            try {
                await updateDocument(
                    movedTodo.id, // ID del documento ToDo a actualizar
                    { sortOrder: movedTodo.sortOrder }, // Solo actualizar el campo sortOrder
                    {
                        basePath: 'projects',
                        subcollection: 'todoList',
                        parentId: currentProject.id,
                        todoId: movedTodo.id,
                        isArrayCollection: false
                    }
                )
                console.log("Firebase sortOrder updated successfully.")

            } catch (error) {
                // Manejo de errores
                console.error("Error updating sortOrder in Firebase:", error);
                //setCurrentProject(currentProject); // Revertir estado local
                projectsManager.updateReactProjects(currentProject); // Revertir en manager
                onProjectUpdate(currentProject);// Notificar al padre del rollback
                // Mostrar un mensaje de error al usuario gestionado desde services\firebase
            }
        } else {
            console.warn("Could not identify the moved ToDo or its ID for Firebase update.")
        }

    };





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
                                
                        <ProjectSelector
                            currentProject={currentProject}
                            projectsList={projectsManager.list}
                            onProjectSelect={handleProjectSelectionInDetails}
                        />
                        {/* <select
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
                        ></select> */}
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
                            onTodoListReordered={handleTodoListReordered}
                        />
                </div>
                <ThreeJSViewer />
            </div>
            </section>
        </ErrorBoundary>
    );
}

