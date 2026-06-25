import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import * as Router from 'react-router-dom';

import { Sidebar, ProjectsPage, ProjectDetailsPage, ToDoBoardPage, UsersBoardPage, UsersBoardList, UserBoardProjectsTeamsPage, UserUnverifiedPage, UserFinishSignUpPage } from './react-components';
import { ProjectsManagerProvider, useProjectsManager } from './react-components/ProjectsManagerContext';
import { UsersManagerProvider, useUsersManager } from './react-components/UsersManagerContext.tsx';

//import { ProjectsManagerProvider, } from './react-components/ProjectsManagerContext';
import { CheckCircleIcon, NotificationsActiveIcon, WarningIcon, ReportIcon, UpdateIcon } from './react-components/icons.tsx'
import { IProject, ProjectStatus, UserRole, BusinessUnit, Project } from "./classes/Project.ts";
import { ToDoIssue } from "./classes/ToDoIssue.ts"
import type { IToDoIssue, IUser } from './types.d.ts';
import { ProjectsManager } from "./classes/ProjectsManager.ts";
import { User as AppUserClass } from './classes/User'; // Renombrado para evitar conflicto
import { UsersManager } from "./classes/UsersManager.ts";
import { showModal, closeModal, toggleModal, changePageContent } from "./classes/UiManager.ts";
//import { updateAsideButtonsState } from './classes/HTMLUtilities.ts';
//import "./classes/LightMode.ts";  //cambiado a Zustand
import { MessagePopUp } from "./classes/MessagePopUp.ts"
import { newToDoIssue, getProjectByToDoIssueId, deleteToDoIssue, closeToDoIssueDetailPage, renderToDoIssueList, searchTodoIssues, navigateSearchResults, selectCurrentSearchResult, setupProjectDetailsSearch, resetSearchState } from "./classes/ToDoManager.ts"

import { setUpToDoBoard, setupTodoPageSearch, } from "./classes/DragAndDropManager.ts";
import "./classes/DragAndDropManager.ts";
//import { setUpUserPage } from "./classes/UsersManager.ts";
import { ErrorBoundary } from 'react-error-boundary';
import { toast, Toaster } from 'sonner'
//import "./classes/VisorModelManager.ts";
import { AuthProvider, useAuth } from './Auth/react-components/AuthContext.tsx'; // Usar el AuthContext que creamos
import { AuthForm } from './Auth/react-components/AuthForm.tsx';
import { NewUserForm } from './react-components/NewUserForm.tsx'; // NewUserForm adaptado
import { ChangePasswordForm } from './Auth/react-components/ChangePasswordForm.tsx';
import { LoadingIcon } from './react-components/icons.tsx';
import { deleteToDoWithSubcollections } from './services/Firebase/index.ts';
import { signOut } from './services/Firebase/firebaseAuth.ts'; // Para el logout
import { auth } from './services/Firebase/index.ts'
import { UserRoleInAppKey } from './types.ts';
import { UserEmailVerificationSuccess } from './Auth/react-components/UserEmailVerificationSuccess.tsx'
import { ProtectedRoute } from './Auth/react-components/ProtectedRoute.tsx';
import { useThemeStore } from './stores/useThemeStore.ts';

// Cargar la librería e inicializar los elementos de That Open UI (como los modales) para que estén disponibles en toda la aplicación sin necesidad de importarlos en cada componente.
import * as BUI from "@thatopen/ui";

BUI.Manager.init();
console.log("That Open UI Manager has been initialized successfully.");

declare global {
    namespace JSX {
        interface IntrinsicElements {
            // 'bim-label': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
            'bim-label': any;
            'bim-button': any;
            'bim-text-input': any;
            'bim-grid': any;
        }
    }
}

const App = () => {
    const projectsManager = useProjectsManager();
    const usersManager = useUsersManager();
    const [projects, setProjects] = React.useState(projectsManager.list);
    const isLightMode = useThemeStore((state) => state.isLightMode);

    // Efecto para sincronizar el estado de React con el DOM (body class)
    React.useEffect(() => {
        if (isLightMode) {
            document.body.classList.add('light-mode');
        } else {
            document.body.classList.remove('light-mode');
        }
    }, [isLightMode]);





    function handleNewProject(newProject: Project) {
        projectsManager.updateReactProjects(newProject);
        setProjects([...projectsManager.list])
    }

    const handleProjectCreate = (createProject) => {
        projectsManager.updateReactProjects(createProject); // Update the project in projectsManager

        setProjects([...projectsManager.list]);

    };
    const handleProjectUpdate = (updatedProject) => {
        console.log("index.tsx: handleProjectUpdate called", { updatedProject })
        projectsManager.updateProject(updatedProject.id, updatedProject); // Update the project in projectsManager

        setProjects([...projectsManager.list]);

    };

    let callCounter = 0

    const handleToDoIssueCreated = (todoIssueCreated) => {
        callCounter++
        console.log(`handleToDoIssueCreated - CALL #${callCounter} at ${Date.now()}: Calling updateProjectToDoList for todo ID ${todoIssueCreated.id}`);

        try {

            projectsManager.updateProjectToDoList(todoIssueCreated.todoProject, todoIssueCreated)
            console.log(`handleToDoIssueCreated - CALL #${callCounter}: updateProjectToDoList finished.`);

            setProjects([...projectsManager.list]);
        } catch (error) {
            console.error(`handleToDoIssueCreated - CALL #${callCounter}: Error calling updateProjectToDoList`, error);
        }
    }


    // const handleToDoIssueUpdated = (todoIssueUpdated) => {
    // const handleToDoIssueUpdated = async (todoId: string, updates: Partial<IToDoIssue>) => {
    //     console.log("index.tsx: handleToDoIssueUpdated (centralized) called", { todoId, updates })
    const handleToDoIssueUpdated = async (projectId: string, todoId: string, updates: Partial<IToDoIssue>) => {
        console.log("index.tsx: handleToDoIssueUpdated (centralized) called", { projectId, todoId, updates })


        // projectsManager.updateToDoIssue(todoIssueUpdated.todoProject, todoIssueUpdated.id, todoIssueUpdated)
        // console.log("index.tsx: handleToDoIssueUpdated called", { todoIssueUpdated })
        // setProjects([...projectsManager.list]);


        // // 1. Encontrar el proyecto al que pertenece el ToDo.
        // const project = projectsManager.getProjectByToDoIssueId(todoId);

        if (!projectId) {
            const errorMsg = `index.tsx: No se pudo encontrar el proyecto para el ToDo con ID: ${todoId}`;
            console.error(errorMsg);
            toast.error("Could not update the ToDo item because the project ID was missing.");
            throw new Error(errorMsg);
        }

        try {
            // 2. Llamar al método del manager que se encarga de la escritura en Firebase.
            // await projectsManager.updateToDoIssue(project.id, todoId, updates);
            await projectsManager.updateToDoIssue(projectId, todoId, updates );

            // La UI se actualizará automáticamente gracias al listener onSnapshot de ProjectsManager.
            const updatedFields = Object.keys(updates).join(', ');
            toast.success(`ToDo field(s) '${updatedFields}' updated successfully.`);

            // 3. Notificar a React que el estado en projectsManager ha cambiado para que vuelva a renderizar la UI.
            setProjects([...projectsManager.list]);

            console.log(`index.tsx: ToDo ${todoId} actualizado correctamente.`);
        } catch (error) {
            console.error(`index.tsx: Error al actualizar el ToDo ${todoId}:`, error);
            toast.error("Failed to update the ToDo item.");
            //o
            // throw error; // Relanzar para que el componente que originó lo sepa.
        }

    }


    const handleToDoIssueDeleted = async (projectId: string, todoId: string) => {
        console.log("index.tsx: handleToDoIssueDeleted (centralized) called", { projectId, todoId });

        if (!projectId || !todoId) {
            const errorMsg = "Project ID or ToDo ID is missing for deletion.";
            console.error(errorMsg);
            toast.error(errorMsg);
            throw new Error(errorMsg);
        }

        try {

             // Call the service function that handles the deletion logic in Firebase.
            await deleteToDoWithSubcollections(projectId, todoId);
             // The UI will update automatically thanks to the onSnapshot listener in ProjectsManager,
            // which will detect the change in the database and update the application state.

            // 2. Borra en ProjectsManager y actualiza localStorage

            projectsManager.deleteToDoIssue(projectId, todoId); //Esto actualiza la lista interna del manager
            // 3. Notificar a React que el estado ha cambiado para forzar el re-renderizado.
            setProjects([...projectsManager.list]);


        } catch (error) {
            console.error(`index.tsx: Error deleting ToDo ${todoId}:`, error);
            toast.error("Failed to delete the ToDo item.");
        }
    };





    function handleUserCreate(newUserCreate: AppUserClass): void {
        // Lógica para manejar la creación de un usuario si es necesario a nivel de App
        console.log("App: User created", newUserCreate);
        usersManager.newUser(newUserCreate, newUserCreate.id!); // Actualizar UsersManager
    }

    function handleUserUpdate(updatedUser: AppUserClass): void {
        // Lógica para manejar la actualización de un usuario si es necesario a nivel de App
        console.log("App: User updated", updatedUser);
        usersManager.updateUser(updatedUser.id!, updatedUser); // Actualizar UsersManager
    }

    return (
        <Router.BrowserRouter>
            <Sidebar
                projectsManager={projectsManager}
                usersManager={usersManager}
            />
            <MainLayout
                projectsManager={projectsManager}
                usersManager={usersManager}
                onNewProject={handleNewProject}
                onProjectCreate={handleProjectCreate}
                onProjectUpdate={handleProjectUpdate}
                onToDoIssueCreated={handleToDoIssueCreated}
                onToDoIssueUpdated={handleToDoIssueUpdated}
                onToDoIssueDeleted={handleToDoIssueDeleted}
                onUserCreate={handleUserCreate}
                onUserUpdate={handleUserUpdate}
            />
        </Router.BrowserRouter>
    )
}

interface MainLayoutProps {
    projectsManager: ProjectsManager;
    usersManager: UsersManager;
    onNewProject: (newProject: Project) => void;
    onProjectCreate: (createProject: Project) => void;
    onProjectUpdate: (updatedProject: Project) => void;
    onToDoIssueCreated: (todoIssueCreated: ToDoIssue) => void;
    //onToDoIssueUpdated: (updatedTodo: ToDoIssue) => void;
    // onToDoIssueUpdated: (todoId: string, updates: Partial<IToDoIssue>) => Promise<void>;
    onToDoIssueUpdated: (projectId: string, todoId: string, updates: Partial<IToDoIssue>) => Promise<void>;
    onToDoIssueDeleted: (projectId: string, todoId: string) => Promise<void>;
    onUserCreate: (newUserCreate: AppUserClass) => void;
    onUserUpdate: (updatedUser: AppUserClass) => void;
}

const MainLayout: React.FC<MainLayoutProps> = (props) => {
    const { currentUser, userProfile, loading } = useAuth();
    const navigate = Router.useNavigate();

    // Redirigir si no autenticado
    React.useEffect(() => {
        // Solo redirigir si la autenticación ha terminado de cargar Y no hay usuario autenticado
        if (!loading && !currentUser && location.pathname !== '/auth' && location.pathname !== '/change-password') { // Añadir /change-password para permitir acceso si se llega por reset de password (aunque no implementado aún)
        navigate('/auth');
        }
    }, [currentUser, loading, location.pathname])


        // Si la autenticación está cargando, muestra el icono de carga global
    // Esto se muestra ANTES de renderizar el grid, ocupando toda la pantalla.
    // Una vez que loading es false, el grid se renderiza.
    if (loading) {
        return <LoadingIcon />;
    }


    console.log("🔄 Current path:", location.pathname,
        "| Authenticated:", !!currentUser,
        "| Loading:", loading);


    return (
        <main style={{ flexGrow: 1, padding: '1rem' }}>
            <Router.Routes>
                <Router.Route path="/auth" element={
                    currentUser ? <Router.Navigate to="/" /> : <AuthForm onUserAuthenticated={() => navigate('/')} initialMode="signUp" />
                } />


                {/* Esta ruta debe estar fuera de la protección para que el usuario pueda llegar a ella */}
                <Router.Route path="/auth-successfull" element={
                    <UserEmailVerificationSuccess />
                } />

                {/* Ruta para finalizar el registro a través del enlace de correo */}
                <Router.Route path="/finish-signup" element={
                    <UserFinishSignUpPage onSignUpSuccess={() => navigate('/')} />
                } />



                {/* --- INICIO DE RUTAS PROTEGIDAS --- */}
                <Router.Route element={<ProtectedRoute />}>
                    {/* Si el usuario está verificado, Outlet renderizará una de estas rutas hijas */}

                    <Router.Route path="/" element={
                        <ProjectsPage
                            projectsManager={props.projectsManager}
                            usersManager={props.usersManager}
                            onNewProjectCreated={props.onNewProject}
                            onProjectUpdate={props.onProjectUpdate}
                            />
                    } />

                    <Router.Route path="/project/:id" element={
                        <ProjectDetailsPage
                                projectsManager={props.projectsManager}
                                onProjectCreate={props.onProjectCreate}
                                onProjectUpdate={props.onProjectUpdate}
                                onToDoIssueCreated={props.onToDoIssueCreated}
                                onToDoIssueUpdated={props.onToDoIssueUpdated}
                                onToDoIssueDeleted={props.onToDoIssueDeleted}
                            />

                    } />

                    <Router.Route path="/project/todoBoard/:id" element={

                            <ToDoBoardPage
                                projectsManager={props.projectsManager}
                                onProjectCreate={props.onProjectCreate}
                                onProjectUpdate={props.onProjectUpdate}
                                onToDoIssueCreated={props.onToDoIssueCreated}
                                onToDoIssueUpdated={props.onToDoIssueUpdated}
                                onToDoIssueDeleted={props.onToDoIssueDeleted}
                            />

                    } />

                    <Router.Route path="/usersBoard" element={
                        <UsersBoardPage
                                usersManager={props.usersManager}
                                projectsManager={props.projectsManager}
                                onUserCreate={props.onUserCreate}
                                onUserUpdate={props.onUserUpdate}
                            />
                        } >
                            <Router.Route index element={<UsersBoardList />} />
                            <Router.Route path="teams/:projectId?" element={<UserBoardProjectsTeamsPage />} />
                        </Router.Route>

                    </Router.Route>

                {/* --- FIN DE RUTAS PROTEGIDAS --- */}

                <Router.Route path="/change-password" element={
                    currentUser
                        ? <ChangePasswordForm
                            onPasswordChanged={() => navigate('/profile')}
                            onCancel={() => navigate('/profile')}
                        />
                        : <Router.Navigate to="/auth" />
                } />

                <Router.Route path="*"
                    element={
                        <div style={{ textAlign: 'center', marginTop: '50px' }}>
                            <h2>Error 404 - Page Not Found</h2>
                            <p>The page you are looking for does not exist.</p>
                            <Router.Link to="/">Go to Homepage</Router.Link>
                        </div>} />
            </Router.Routes>
        </main>

    )
}

const rootElement = document.getElementById('app') as HTMLElement;
const appRoot = ReactDOM.createRoot(rootElement)
appRoot.render(
    <AuthProvider>
        <ProjectsManagerProvider>
            <UsersManagerProvider>
                <App />
            </UsersManagerProvider>
        </ProjectsManagerProvider>
        {/* Toaster puede ir fuera de los providers si no necesita contexto */}
        <Toaster
            className="custom-sonner"
                expand={true}
                //visibleToasts={9}
                duration={6500}
                icons={{
                    success: <CheckCircleIcon size={30} className="todo-task-move" color="var(--color-fontbase)" />,
                    info: <NotificationsActiveIcon size={30} className="todo-task-move" color="var(--color-fontbase)" />,
                    warning: <WarningIcon size={30} className="todo-task-move" color="var(--color-fontbase)" />,
                    error: <ReportIcon size={30} className="todo-task-move" color="var(--color-fontbase)" />,
                    loading: <UpdateIcon size = { 30 } className = "todo-icon" color = "var(--color-fontbase)" />,
                }}
                toastOptions={{
                    classNames: {
                        toast: 'custom-toast',
                        description: 'custom-description'
                    },
                    style: {
                        //opacity: '75%',
                        background: 'var(--background-200)',
                        color: 'var(--fontbase)',
                        //fontSize: 'var(--font-lg)',
                    },
                }}
            richColors />
    </AuthProvider>
)


//Delete a ToDoISsue when click the trash delete botton in the todo-detail page
const btnToDoIssueDelete = document.querySelector("#delete-todoIssue-btn")
if (btnToDoIssueDelete) {
    const svg = btnToDoIssueDelete.querySelector("svg")
    if (svg) {
        svg.addEventListener("click", handleDeleteToDoIssueButtonClick)
    }
}


function handleDeleteToDoIssueButtonClick(e: Event) {
    e.preventDefault()
    console.log("Button delete ToDoIssue clicked")

    //Get the button element from the event
    const deleteToDoIssueBtn = (e.target as HTMLElement).closest("#delete-todoIssue-btn")

    if (deleteToDoIssueBtn) {

        //Get the projectID
        const todoIssueIdToDelete = (deleteToDoIssueBtn as HTMLElement)?.dataset.toDoIssueId
        console.log("todoIssueId:", todoIssueIdToDelete)
        if (todoIssueIdToDelete) {
            // Look for the project that contain this ToDoIssue Id and obtain de ToDoList for remove the ToDoIssue
            const projectWithToDoIssueToDelete = getProjectByToDoIssueId(todoIssueIdToDelete);
            console.log("project", projectWithToDoIssueToDelete)
            if (projectWithToDoIssueToDelete) {


                const popupDeleteToDoIssueConfirmation = new MessagePopUp(
                    document.body,
                    "warning",
                    "Confirm Project Deletion",
                    `Are you sure you want to delete the To-Do Issue: "${projectWithToDoIssueToDelete.todoList.find((todoIssue) => todoIssue.id === todoIssueIdToDelete)?.title}" This action cannot be undone.`,
                    ["Yes,go on", "Cancel"],
                )

                // Define button callbacks
                const buttonCallbacks = {
                    "Yes,go on": () => {
                        // User confirmed, proceed with deleting the project and update todoList inside Project
                        console.log("User confirmed the deletion. Proceed with deleting the ToDoIssue.")
                        const newToDoList = deleteToDoIssue(projectWithToDoIssueToDelete.todoList, todoIssueIdToDelete)
                        console.log("This is the new todoList:", newToDoList)

                        projectWithToDoIssueToDelete.todoList = newToDoList ?? [];
                        console.log("projectWithToDoIssueToDelete:", projectWithToDoIssueToDelete)



                        // Update the ToDo board if we're on that page or the Page-details
                        const currentPage = localStorage.getItem("pageWIP");
                        if (currentPage === "todo-page") {
                            setUpToDoBoard(projectWithToDoIssueToDelete.id);
                        } else if (currentPage === "project-details") {
                            // Update the UI (re-render todolist in the ProjectDetailPage)
                            renderToDoIssueList(projectWithToDoIssueToDelete.todoList);
                        }

                        // Close the Modal and the Todo-Detail page
                        popupDeleteToDoIssueConfirmation.closeMessageModal();
                        closeToDoIssueDetailPage()

                    },
                    "Cancel": () => {
                        // User cancelled, do nothing or provide feedback
                        console.log("User cancelled the deletion.");
                        popupDeleteToDoIssueConfirmation.closeMessageModal();
                    }
                }
                popupDeleteToDoIssueConfirmation.showNotificationMessage(buttonCallbacks)
            }
        }
    }
}

