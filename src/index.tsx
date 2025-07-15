import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import * as Router from 'react-router-dom';

import { Sidebar, ProjectsPage, ProjectDetailsPage, ToDoBoardPage, UsersBoardPage, UserUnverifiedPage, UserFinishSignUpPage } from './react-components';
import { User as AppUserClass } from './classes/User'; // Renombrado para evitar conflicto

//import { ProjectsManagerProvider, } from './react-components/ProjectsManagerContext';
import { CheckCircleIcon, NotificationsActiveIcon, WarningIcon, ReportIcon, UpdateIcon } from './react-components/icons.tsx'
import { IProject, ProjectStatus, UserRole, BusinessUnit, Project } from "./classes/Project.ts";
import { ToDoIssue } from "./classes/ToDoIssue.ts"
import type { IToDoIssue, IUser } from './types.d.ts';
import { ProjectsManager } from "./classes/ProjectsManager.ts";
import { UsersManager } from "./classes/UsersManager.ts";
import { showModal, closeModal, toggleModal, changePageContent } from "./classes/UiManager.ts";
//import { updateAsideButtonsState } from './classes/HTMLUtilities.ts';
import "./classes/LightMode.ts";
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
import { NewUserForm } from './react-components/NewUserForm.tsx'; // Tu NewUserForm adaptado
import { ChangePasswordForm } from './Auth/react-components/ChangePasswordForm.tsx';
import { LoadingIcon } from './react-components/icons.tsx';
import { deleteToDoWithSubcollections } from './services/firebase';
import { signOut } from './services/firebase/firebaseAuth.ts'; // Para el logout
import { auth } from './services/firebase/index.ts'
import { UserRoleInAppKey } from './types.ts';
import { UserEmailVerificationSuccess } from './Auth/react-components/UserEmailVerificationSuccess.tsx'
import { ProtectedRoute } from './Auth/react-components/ProtectedRoute.tsx';


const projectsManager = new ProjectsManager();
const usersManager = new UsersManager()

const App = () => {
    const [projects, setProjects] = React.useState(projectsManager.list);

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
        <AuthProvider>
            <Router.BrowserRouter>
                <Sidebar
                    projectsManager={projectsManager}
                    usersManager={usersManager}
                    // currentUser y userProfile se obtienen dentro de Sidebar con useAuth()
                />
                {/* MainLayout contiene el área principal con las rutas */}
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
                richColors
            />
        </AuthProvider>


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


    // const handleSidebarNavigation = (path: 'profile' | 'signin' | 'change-password') => {
    //     if (path === 'profile') {
    //         navigate('/profile');
    //     } else if (path === 'signin') {
    //         if (currentUser) { // "Cambiar Cuenta"
    //             signOut().then(() => {
    //                 navigate('/auth');
    //             }).catch(console.error);
    //         } else { // Botón inicial "Sign Up / Sign In"
    //             navigate('/auth');
    //         }
    //     } else if (path === 'change-password') {
    //         navigate('/change-password');
    //     }
    // };

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
                            
                        } />
                    
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
appRoot.render(<App />)





/* CALLING THE SINGLETON PATTERN
const projectListUI = document.getElementById("project-list") as HTMLElement 
ProjectsManager.setContainer(projectListUI)
const projectManager = ProjectsManager.getInstance()
*/

/*SET iNitial view of the APP
//Set the initial view of the APP with the projects page, hidding the rest of sections
document.addEventListener('DOMContentLoaded', () => {
    changePageContent('project-page', 'block'); 
    // Set the localStorage value for pageWIP to "project-page"
    localStorage.setItem("pageWIP", "project-page");


});

*/
/* Create a new project from the button
// Create a new project from de button
const newProjectBtn = document.getElementById("new-project-btn")
if (newProjectBtn) {

    newProjectBtn.addEventListener("click", () => {
        showModal("new-project-modal")

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
        
    })
    
} else {
    console.warn("New project button was not found")
}
*/

/* Obtaining data project from the form via giving an id to the form and using FormData
//Obtaining data project from the form via giving an id to the form and using FormData
const projectForm = document.getElementById("new-project-form")
const cancelForm: Element | null = document.getElementById("cancel-project-btn");
const submitFormButton = document.getElementById("accept-project-btn")

if (projectForm && projectForm instanceof HTMLFormElement) {
    
    // projectForm.addEventListener("submit", (event) => {
    submitFormButton?.addEventListener("click", (e) => {
        e.preventDefault()
        const formData = new FormData(projectForm)
        const checkProjectID = submitFormButton?.dataset.projectId

        if (projectForm.checkValidity()) {

            // Form is valid, proceed with data processing
            if (!checkProjectID) {
                //When the form is for a new Project

                // *** Get the finishDate from the form data ***
                let finishProjectDate: Date | null = null // Allow null initially
                const finishProjectDateString = formData.get("finishDate") as string
                // Try to create a Date object, handling potential errors
                if (finishProjectDateString) {
                    finishProjectDate = new Date(finishProjectDateString)
                    // Check if the Date object is valid
                    if (isNaN(finishProjectDate.getTime())) {
                        // Handle invalid date input (e.g., show an error message)
                        console.error("Invalid date input:", finishProjectDateString);
                        finishProjectDate = null; // Reset to null if invalid
                    }
                }
                // Set to current date if no valid date was provided
                if (!finishProjectDate) {
                    finishProjectDate = new Date("2026-12-31"); // Create a new Date object for today
                }
                // Now you can safely use finishProjectDate as a Date object


                const projectDetails: IProject = {
                    name: formData.get("name") as string,
                    acronym: formData.get("acronym") as string,
                    businessUnit: BusinessUnit[formData.get("businessUnit") as keyof typeof BusinessUnit],
                    description: formData.get("description") as string,
                    status: formData.get("status") as ProjectStatus,
                    userRole: formData.get("userRole") as UserRole,
                    finishDate: finishProjectDate,
                    cost: formData.get("cost") ? parseFloat(formData.get("cost") as string) : 0,
                    

                };

                try {
                    const project = projectManager.newProject(projectDetails);
                    projectForm.reset()
                    closeModal("new-project-modal")
                } catch (err) {
                    const errorPopUp = document.querySelector(".message-popup")
                    const contentError = {
                        contentDescription: err.message,
                        contentTitle: "Error",
                        contentClass: "popup-error",
                        contentIcon: "report"
                    }
                    if (err) {
                        const text = document.querySelector("#message-popup-text p")
                        text.textContent = contentError.contentDescription
                        const title = document.querySelector("#message-popup-text h5")
                        title.textContent = contentError.contentTitle
                        const icon = document.querySelector("#message-popup-icon span")
                        icon.textContent = contentError.contentIcon
                        errorPopUp?.classList.add(contentError.contentClass)
                        toggleModal("message-popup")
                    }
                    const closePopUp: Element | null = document.querySelector(".btn-popup")
                    if (closePopUp) {
                        const closePopUpHandler = () => {
                            toggleModal("message-popup");
                            closePopUp.removeEventListener("click", closePopUpHandler);
                        }
                        closePopUp.addEventListener("click", closePopUpHandler);
                    }
                }

            } else {
                //When the form is for update an existing Project

                console.log("Button submit clicked in the edit project mode");
                e.preventDefault()

                // Get the project ID from the data attribute
                const projectFormId = (e.currentTarget as HTMLElement).closest('[data-project-id]') as HTMLElement
                console.log("Button with the ID selected");

                if (projectFormId) {
                    const projectIdNumber = projectFormId.dataset.projectId
                    if (projectIdNumber) {
                        // You now have the project ID!
                        console.log("Saving project with ID:", projectIdNumber);
                        
                        // Get all the data from the Form. The data to be updated and the others.
                        const formDataToUpdate = new FormData(projectForm)

                        // *** Get the finishDate from the form data ***
                        let finishProjectDate: Date | null = null // Allow null initially
                        const finishProjectDateString = formDataToUpdate.get("finishDate") as string
                        // Try to create a Date object, handling potential errors
                        if (finishProjectDateString) {
                            finishProjectDate = new Date(finishProjectDateString)
                            // Check if the Date object is valid
                            if (isNaN(finishProjectDate.getTime())) {
                                // Handle invalid date input (e.g., show an error message)
                                console.error("Invalid date input:", finishProjectDateString);
                                finishProjectDate = null; // Reset to null if invalid
                            }
                        }
                        const projectToUpdate = projectManager.getProject(projectIdNumber) as Project

                        const projectDetailsToUpdate: Project = {
                            name: formDataToUpdate.get("name") as string,
                            acronym: formDataToUpdate.get("acronym") as string,
                            businessUnit: BusinessUnit[formDataToUpdate.get("businessUnit") as keyof typeof BusinessUnit],
                            description: formDataToUpdate.get("description") as string,
                            status: formDataToUpdate.get("status") as ProjectStatus,
                            userRole: formDataToUpdate.get("userRole") as UserRole,
                            finishDate: finishProjectDate as Date,
                            cost: formDataToUpdate.get("cost") ? parseFloat(formDataToUpdate.get("cost") as string) : 0,
                            id: projectIdNumber as string,
                            ui: projectManager.updateProjectUi(projectToUpdate) as HTMLDivElement,
                            progress: projectToUpdate.progress as number,
                            todoList: projectToUpdate.todoList,
                        }
                        projectDetailsToUpdate.backgroundColorAcronym = Project.calculateBackgroundColorAcronym(projectDetailsToUpdate.businessUnit)
                        
                        
                        if (projectToUpdate) {
                            let changesInProject = projectManager.getChangedProjectDataForUpdate(projectToUpdate, projectDetailsToUpdate)
                            // Check if there are any changes
                            if (Object.keys(changesInProject).length > 0) {
                                // Construct the message for using later in the MessagePopUp
                                let messageContent = `The following project details will be updated in the project:<br><br>
                                <table style="width:100%; border-collapse: collapse;">
                                    <tr>
                                        <th style="border-bottom: 1px solid #ccc;">Property</th>
                                        <th style="border-bottom: 1px solid #ccc;">Changes</th>
                                    </tr>                            
                                `
                                for (const key in changesInProject) {
                                    messageContent += `
                                        <tr>
                                            <td style="border-bottom: 1px solid #ccc;"><b>${key}</b></td>
                                            <td style="border-bottom: 1px solid #ccc; line-height: 1.5; border-spacing 0 10px;">
                                                <div style="width: 95%; word-break: break-all; overflow: auto; scrollbar-width: none;">
                                                    From: <i>${changesInProject[key][0]}</i><br>
                                                    To: <i style="color: var(--popup-warning);">${changesInProject[key][1]}</i>
                                                </div
                                            </td>
                                        </tr>
                                    `
                                }
                                messageContent += `</table>`

                                // Calculate the number of rows in the messageContent table
                                const messageRowsCount = messageContent.split("<tr>").length
                                // Calculate the desired message height
                                const messageHeight = `calc(${messageRowsCount} * 3.5rem + 5rem)`


                                // Create and show the MessagePopUp and show the message above
                                const updateConfirmationPopup = new MessagePopUp(
                                    document.body,
                                    "info",
                                    "Confirm Project Update",
                                    messageContent,
                                    ["Confirm update", "Cancel"],
                                    messageHeight
                                );

                                // Define button callbacks
                                const buttonCallbacks = {
                                    "Confirm update": () => {

                                        // You don need anymore the project ID! delete from the form button
                                        projectFormId.dataset.projectId = ""

                                        // User confirmed, proceed with updating the project
                                        console.log("User confirmed the update. Proceed with saving changes.");
                                        const updatedProject = projectManager.updateProject(projectIdNumber, projectDetailsToUpdate);
                                        console.log(updatedProject);

                                        // Update the UI to reflect the changes
                                        if (updatedProject) {
                                            projectToUpdate.ui = projectManager.updateProjectUi(projectToUpdate);
                                        }
                                        //Render again the list of projects with the new data uddated
                                        projectManager.renderProjectList()


                                        projectForm.reset()
                                        changesInProject = {}
                                        
                                        updateConfirmationPopup.closeMessageModal();
                                        closeModal("new-project-modal"); // Close the edit form modal
                                        console.log("Project updated", updatedProject)
                                        console.log(projectManager.list)

                                    },
                                    "Cancel": () => {
                                        // User cancelled, do nothing or provide feedback
                                        console.log("User cancelled the update.");
                                        changesInProject = {}
                                        updateConfirmationPopup.closeMessageModal();
                                    }
                                };

                                updateConfirmationPopup.showNotificationMessage(buttonCallbacks);
                            } else {
                                // No changes detected, show a new MessagePopUp with this information
                                const noChangesPopup = new MessagePopUp(
                                    document.body,
                                    "info",
                                    "No Changes Detected",
                                    "No changes were detected in the project details. Sorry there is nothing to update.",
                                    ["Got it"]
                                );

                                // Define button callback
                                const buttonCallbacks = {
                                    "Got it": () => {
                                        noChangesPopup.closeMessageModal();
                                        console.log("No changes to update in the project.");
                                    }
                                }
                                
                                noChangesPopup.showNotificationMessage(buttonCallbacks);
                                
                            }
                        }
                    }
                } else {
                    console.log("No Element found with retrieved ID data ");
                }
            }
        } else {

            // Form is invalid, let the browser handle the error display
            projectForm.reportValidity()
        }



    })       

    if (cancelForm) {
        cancelForm.addEventListener("click", (e) => {
            e.preventDefault()
            projectForm.reset()
            // Delete the data-projectId attribute with the unique ID of the proyect in the button of "Save Changes"
            const projectDatasetAttributeIdInForm = document.getElementById("accept-project-btn")
            if (projectDatasetAttributeIdInForm) {
                projectDatasetAttributeIdInForm.dataset.projectId = ""
            }
            toggleModal("new-project-modal")
        })
    } else {
        console.log("The cancel button was not found. Check the ID!")
    }
    
}
*/
/* Export and import projects to a JSON
// Export projects to a JSON
document.addEventListener("DOMContentLoaded", () => {
    const exportProjectsBtn = document.getElementById("export-projects-JSON-btn")
    if (exportProjectsBtn) {
        exportProjectsBtn.addEventListener("click", () => {
            projectManager.exprtToJSON()
        })
    } else {
        console.log("The export button was not found. Check the ID!")
    }
})

// Import projects from a JSON
document.addEventListener("DOMContentLoaded", () => {
    const importProjectsBtn = document.getElementById("import-projects-JSON-btn")
    if (importProjectsBtn) {
        importProjectsBtn.addEventListener("click", () => {
            projectManager.imprtFromJSON()
        })
    } else {
        console.log("The import button was not found. Check the ID!")
    }
})
*/

/* Main button of project(aside) return to the projects list
//Main button of project(aside) return to the projects list
const btnMainProjects = document.querySelector("#asideBtnProjects")
btnMainProjects?.addEventListener("click", (e) => {
    e.preventDefault()
    changePageContent("project-page", "flex")
    // Set the localStorage value for pageWIP to "project-page"
    localStorage.setItem("pageWIP", "project-page");
    updateAsideButtonsState()

})
*/

/*Button for editing Project Details.
//Button for editing Project Details.
const btnEditProjectDetails = document.querySelector("#edit-project-details")
if (btnEditProjectDetails) {
    btnEditProjectDetails?.addEventListener("click", (e) => {
        console.log("Button edit project details clicked");
        e.preventDefault()

        // Get the project ID from the data attribute
        const projectCardId = (e.currentTarget as HTMLElement).closest('[data-project-id]') as HTMLElement
        console.log("Div with the ID selected");
        
        if (projectCardId) {
            const projectId = projectCardId.dataset.projectId
        
            if (projectId) {
                // You now have the project ID!
                console.log("Editing project with ID:", projectId);

                // Fetch the project data using the ID and the funtion getProject inside ProjectsManager class
                const projectToEdit = projectManager.getProject(projectId);
                if (projectToEdit) {
                    console.log("Project to edit", projectToEdit);
                    
                    // Populate the form fields with project data
                    projectManager.populateProjectDetailsForm(projectToEdit)
                    // Populate the form fields with projectToEdit data
                    // ... your existing form population logic ...
                    console.log("Form populated", document.getElementById("new-project-form"));
                    

                    showModal("new-project-modal")
                    console.log("Showed Modal Windows:", document.getElementById("new-project-modal"));
                    
                    // Set Edit Mode
                    // Update Modal Title                    
                    const modalProjectTitle = document.getElementById("modal-project-title");
                    if (modalProjectTitle) {
                        modalProjectTitle.textContent = "Update Project";
                    }

                    // Update Button Text
                    const submitButton = document.getElementById("accept-project-btn");
                    if (submitButton) {
                        submitButton.textContent = "Save Changes";
                    }
                    const discardButton = document.getElementById("cancel-project-btn");
                    if (discardButton) {
                        discardButton.textContent = "Discard Changes";
                    }

                    //Create delete-project button                    
                    
                    // Comprobar si ya existe un botón de borrar proyecto
                    const existingDeleteButton = document.getElementById("delete-project-btn");
                    if (!existingDeleteButton) {

                        //Create delete-project button

                        const parentDeleteBtn = document.getElementById("titleModalNewProject")

                        const deleteProjectButton = document.createElement("button");
                        deleteProjectButton.className = "message-btn";
                        deleteProjectButton.type = "button";
                        deleteProjectButton.setAttribute("id", "delete-project-btn");
                        deleteProjectButton.className = "todo-icon-edit";
                        deleteProjectButton.style.borderRadius = "var(--br-circle)"
                        deleteProjectButton.style.aspectRatio = "1"
                        deleteProjectButton.style.padding = "0px"
                        deleteProjectButton.style.justifyContent = "center"

                        const svgTrash = document.createElement("svg");
                        const deleteButtonIconSVG = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                        deleteButtonIconSVG.setAttribute("class", "todo-icon-edit");
                        deleteButtonIconSVG.setAttribute("role", "img");
                        deleteButtonIconSVG.setAttribute("aria-label", "trash");
                        deleteButtonIconSVG.setAttribute("width", "30px");
                        deleteButtonIconSVG.setAttribute("height", "30px");
                        deleteButtonIconSVG.setAttribute("fill", "#08090a");
                        deleteButtonIconSVG.setAttribute("id", "delete-project-btn-svg");
                        deleteProjectButton.appendChild(deleteButtonIconSVG);

                        const deleteButtonIconUse = document.createElementNS("http://www.w3.org/2000/svg", "use");
                        deleteButtonIconUse.setAttributeNS("http://www.w3.org/1999/xlink", "href", "#trash");
                        deleteButtonIconUse.setAttributeNS("http://www.w3.org/2000/svg", "xlink:href", "#trash");
                        deleteButtonIconSVG.appendChild(deleteButtonIconUse);
            
                        parentDeleteBtn?.appendChild(deleteProjectButton)


                        //    Set the data-projectId attribute with the unique ID of the proyect in the button of "Delete Project"
                        deleteProjectButton.dataset.projectId = projectId.toString()
            

                
                        // const deleteProjectBtn = document.getElementById("delete-project")
                        // if (deleteProjectBtn) {
                        //     deleteProjectBtn.style.display = 'flex'
                        
                    }

                    //Call the function for delete the project only when the btn is clicked
                    const deleteProjectBtn = document.getElementById("titleModalNewProject")

                    if (deleteProjectBtn) {
                        console.log("eventListenind os the delete Project Btn")
                        deleteProjectBtn.addEventListener("click", handleTitleClick);
                    } else {
                        console.error("Delete project button was not found")
                    }
                            
                    
                    

                    // Set the data-projectId attribute with the unique ID of the proyect in the button of "Save Changes"
                    const projectDatasetAttributeIdInForm = document.getElementById("accept-project-btn")
                    if (projectDatasetAttributeIdInForm) {
                        projectDatasetAttributeIdInForm.dataset.projectId = projectId.toString()
                    }
                } else {
                    console.error("Project not found!");
                }
            }
        } else {
            console.error("Project ID not found on the clicked element!");
        }
    })
} else {
    console.warn("Edit project button was not found")
}
*/

/*DELETE PROJECT BUTTON 

function handleTitleClick(event: Event) {
        //Event Delegation: The handleModalClick function now handles clicks on the modal.It uses targetElement.closest('#delete-project-btn-svg') to check if the click originated from the "Delete Project" button or any of its parent elements.
        //Efficiency: With event delegation, you only have one event listener attached to the modal, even if you dynamically add or remove multiple "Delete Project" buttons.

    const targetElement = event.target as HTMLElement

    // Check if the clicked element (or any of its parents) has the ID "delete-project-btn-svg"
    if (targetElement.closest('#delete-project-btn-svg')) {
        handleDeleteProjectButtonClick(event);
    }
}



function handleDeleteProjectButtonClick(e: Event) {
    e.preventDefault()
    console.log("Button delete project clicked")

    //Get the button element from the event
    const deleteProjectBtn = (e.target as HTMLElement).closest("#delete-project-btn")

    if (deleteProjectBtn) {
        // ***Check if the project's todoList is empty***

        //Get the projectID
        const projectIdToDelete = (deleteProjectBtn as HTMLElement)?.dataset.projectId
        console.log("projectId:", projectIdToDelete)
        if (projectIdToDelete) {
            const projectToDelete = projectManager.getProject(projectIdToDelete);
        
            if (projectToDelete) {
                if (projectToDelete.todoList.length > 0) {
                    // Project has To-Do issues, show confirmation popup
                    const popupDeleteProjectConfirmationWithToDoIssues = new MessagePopUp(
                        document.body,
                        "warning",
                        "The Project has pending tasks to be resolved",
                        `This project has <span style="color: var(--color-warning2)">${projectToDelete.todoList.length}</span> associated To-Do issues. Are you sure you want to delete it? This action cannot be undone`,
                        ["Delete anyway", "Cancel"]
                    )
                    //Define button callbacks
                    const buttonCallbacks = {
                        "Delete anyway": () => {
                            console.log("User confirmed deletion even with tasks")
                            projectManager.deleteProject(projectIdToDelete)
                            //Remove the delete project button from the modal
                            if (deleteProjectBtn.parentElement) {
                                deleteProjectBtn.parentElement.removeChild(deleteProjectBtn)
                            }
                            // Close the modals
                            popupDeleteProjectConfirmationWithToDoIssues.closeMessageModal();
                            closeModal("new-project-modal"); // Close the edit form modal

                            // Update the UI (re-render project list)
                            projectManager.renderProjectList()
                            console.log(projectManager.list)

                            // Open project-page
                            changePageContent("project-page", "flex")
                        },
                        "Cancel": () => {
                            // User cancelled, close the popup and do nothing
                            console.log("User cancelled the deletion.");
                            popupDeleteProjectConfirmationWithToDoIssues.closeMessageModal();
                        }
                    }
                    popupDeleteProjectConfirmationWithToDoIssues.showNotificationMessage(buttonCallbacks);
                } else {
                    // Project hasn´t got To-Do issues, proceed with the options for deletion
                    // Create and show the MessagePopUp for confirmation
                    const popupDeleteProjectConfirmation = new MessagePopUp(
                        document.body,
                        "warning",
                        "Confirm Project Deletion",
                        `Are you sure you want to delete the project: "${projectToDelete.name}" This action cannot be undone.`,
                        ["Yes,go on", "Cancel"],
                    )

                    // Define button callbacks
                    const buttonCallbacks = {
                        "Yes,go on": () => {
                            // User confirmed, proceed with deleting the project
                            console.log("User confirmed the deletion. Proceed with deleting the project.")
                            projectManager.deleteProject(projectIdToDelete)

                            //Remove the delete project button from the modal
                            if (deleteProjectBtn.parentElement) {
                                deleteProjectBtn.parentElement.removeChild(deleteProjectBtn)
                            }

                            // Close the modals
                            popupDeleteProjectConfirmation.closeMessageModal();
                            closeModal("new-project-modal"); // Close the edit form modal

                            // Update the UI (re-render project list)
                            projectManager.renderProjectList()
                            console.log(projectManager.list)

                            // Open project-page
                            changePageContent("project-page", "flex")
                        },
                        "Cancel": () => {
                            // User cancelled, do nothing or provide feedback
                            console.log("User cancelled the deletion.");
                            popupDeleteProjectConfirmation.closeMessageModal();
                        }
                    }
                    popupDeleteProjectConfirmation.showNotificationMessage(buttonCallbacks)
                }
            } else {
                console.error("Project not found for deletion!")
            }
        } else {
            console.error("Project Id not found")
        }
    } else {
        console.error("Delete project button was not found")
    }
} 
*/

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


// /* *** ELIMINADO POR ESTAR EN DESUSO UPDATEASIDEBUTTONSSTATE ******* */


// //Main button of Project Details(aside) open the Project Details
// const btnProjectDetailsAside = document.querySelector("#asideBtnProjectDetails")
// btnProjectDetailsAside?.addEventListener("click", (e) => {
//     e.preventDefault()
//     changePageContent("project-details", "flex")
//     // Set the localStorage value for pageWIP to "todo-page"
//     localStorage.setItem("pageWIP", "project-details")
//     updateAsideButtonsState()

//     //Set the funcionality of search between todoIssues
//     setupProjectDetailsSearch()


//     const storedProjectId = localStorage.getItem("selectedProjectId");
//     const projectManager = ProjectsManager.getInstance()
//     const projectsList = projectManager.list
//     const selectedProject = projectsList.find(project => project.id === storedProjectId)


//     if (storedProjectId && selectedProject) {
//         ProjectsManager.setDetailsPage(selectedProject)
//     }

// })




// /* *** ELIMINADO POR ESTAR EN DESUSO UPDATEASIDEBUTTONSSTATE ******* */

// // Call the update function updateAsideButtonsState when the page loads
// document.addEventListener('DOMContentLoaded', () => {
//     updateAsideButtonsState();
// })


// /* *** ELIMINADO POR ESTAR EN DESUSO UPDATEASIDEBUTTONSSTATE ******* */

// //Main button of To-Do Board(aside) open the To-Do Board
// const btnToDoIssueBoard = document.querySelector("#asideBtnToDoBoards")
// if (btnToDoIssueBoard) {
//     btnToDoIssueBoard?.addEventListener("click", async (e) => {
//         e.preventDefault()
//         const selectedProjectId = localStorage.getItem("selectedProjectId")
//         const counterElement = document.getElementById('todolist-search-counter-ToDoPage') as HTMLElement

//         if (selectedProjectId) {
//             changePageContent("todo-page", "block");
//             // Set the localStorage value for pageWIP to "todo-page"
//             localStorage.setItem("pageWIP", "todo-page");
//             updateAsideButtonsState()

//             await setUpToDoBoard(selectedProjectId);
//             resetSearchState(counterElement)

//         } else {
//             await setUpToDoBoard()
//             resetSearchState(counterElement)
//         }
//     })
// }


/* Diferents Buttons inside the To-Do Board for create a new ToDoIssue

// Create a new todo from 2 buttons (in Details page)
const newToDoIssueBtn1 = document.querySelector("#new-todo-issue-btn");
const newToDoIssueBtn2 = document.querySelector("#new-todo-issue-btn2");

// Handle the event for the first button
if (newToDoIssueBtn1) {
    newToDoIssueBtn1.addEventListener("click", () => {
        createNewToDoIssue(newToDoIssueBtn1);
    });
}

// Handle the event for the second button
if (newToDoIssueBtn2) {
    newToDoIssueBtn2.addEventListener("click", () => {
        createNewToDoIssue(newToDoIssueBtn2);
    });
}
*/

/*Create a new todo from the button (in Details page)
// Function in charge of the creation of a new ToDoIssue
function createNewToDoIssue(btnNewToDoIssue) {
    console.log("Button Clicked to create new To-Do Issue")
    console.log("Button Clicked")

    const checkProjectId = (btnNewToDoIssue as HTMLElement)?.dataset.projectId ?? ""
    console.log(checkProjectId)
    const toDoIssueForm = document.getElementById("new-todo-form") as HTMLFormElement

    if (toDoIssueForm && toDoIssueForm instanceof HTMLFormElement) {

        // *** RESET THE FORM BEFORE OPEN IT***
        // 1. Target specific input types
        const inputsToReset = toDoIssueForm.querySelectorAll('input[type="text"], input[type="date"], input[type="number"], textarea, select');

        // 2. Loop through and reset each element
        inputsToReset.forEach(element => {
            (element as HTMLInputElement).value = ''; // Reset to empty string

            // Additional handling for select elements:
            if (element instanceof HTMLSelectElement) {
                element.selectedIndex = 0; // Reset to the first option
            }
        })

        //3.Delete de tags stored in the form
        const tagsListToReset = document.getElementById("todo-tags-list") as HTMLElement
        while (tagsListToReset.children.length > 0) {
            tagsListToReset.removeChild(tagsListToReset.children[0])
        }

        //4.Delete de assignedUsers stored in the form
        const assignedUsersListToReset = document.querySelector("#todo-assignedUsers-list") as HTMLElement
        while (assignedUsersListToReset.children.length > 0) {
            assignedUsersListToReset.removeChild(assignedUsersListToReset.children[0])
        }

        // 5.Set Modal in case previously we updated a To-Do Issue
        // Update Modal Title
        const modalToDoIssueTitle = document.getElementById("modal-todoIssue-title");
        if (modalToDoIssueTitle) {
            modalToDoIssueTitle.textContent = "New To-Do Issue";
        }
        // Update Button Text
        const submitButton = document.getElementById("accept-todo-btn");
        if (submitButton) {
            submitButton.textContent = "Accept";
        }
        const discardButton = document.getElementById("cancel-todo-btn");
        if (discardButton) {
            discardButton.textContent = "Cancel";
        }

        // Set the data-projectId attribute with the unique ID of the proyect in the button of submit new To-Do
        const projectToDoDatasetAttributeId = document.getElementById("accept-todo-btn")
        if (checkProjectId !== undefined && projectToDoDatasetAttributeId) {
            projectToDoDatasetAttributeId.dataset.projectId = checkProjectId.toString()
        }
        //Completed the data fixed for this new ToDoIssu as create date or Origin Project (Origin User sould be amended later)
        const todoProjectElement = document.querySelector('span[id="todo-project-name"]');
        const createDateElement = document.querySelector('span[id="todo-creation-date"]');
        

        if (checkProjectId) {
            const project = projectManager.getProject(checkProjectId)
            if (project && todoProjectElement) {
                todoProjectElement.textContent = project?.name; // Mostrar nombre del proyecto
            } else {
                console.error(`Project not found with ID ${checkProjectId} or todoProjectEleemnt is null`)
            }

            const currentDate = new Date()
            if (createDateElement) {
                createDateElement.textContent = currentDate.toLocaleDateString("es-ES", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit"
                }).replace(/\//g, "-");
            } else {
                console.error("createDataElement is null")
            }

        }
    }

    showModal("new-todo-card-modal")

}

*/

/*Obtaining data from the form via giving an id to the form and using FormToDoData

//Obtaining data from the form via giving an id to the form and using FormToDoData
// const toDoIssueForm = document.getElementById("new-todo-form")
const cancelToDoForm: Element | null = document.getElementById("cancel-todo-btn");
const submitToDoFormButton = document.getElementById("accept-todo-btn")
const toDoIssueForm = document.getElementById("new-todo-form") as HTMLFormElement


if (toDoIssueForm && toDoIssueForm instanceof HTMLFormElement) {

    // const checkProjectId = submitToDoFormButton?.dataset.projectId

    submitToDoFormButton?.addEventListener("click", (e) => {
        e.preventDefault()
        console.log("submitToDoFormButton press")
        const formToDoData = new FormData(toDoIssueForm)
        console.log(formToDoData)
        const checkToDoId = (submitToDoFormButton as HTMLButtonElement)?.dataset.toDoIssueId
        const checkProjectId = (submitToDoFormButton as HTMLButtonElement)?.dataset.projectId
        // console.log(checkToDoId)
        console.log(checkProjectId)
    
        if (toDoIssueForm.checkValidity()) {
            //Form is valid, proceed with data processing

            // If checkToDoId is empty is because the user is not updating data in the form, so we are going to create a new todoIssue.
            if (!checkToDoId) {
                //When the form is for a new To-Do Issue not an update

                // *** Get the dueDate from the form data ***
                let dueDateToDoForm: Date | null = null // Allow null initially
                const dueDateToDoFormString = formToDoData.get("dueDate") as string
                // Try to create a Date object, handling potential errors
                if (dueDateToDoFormString) {
                    dueDateToDoForm = new Date(dueDateToDoFormString)
                    // Check if the Date object is valid
                    if (isNaN(dueDateToDoForm.getTime())) {
                        // Handle invalid date input (e.g., show an error message)
                        console.error("Invalid date input:", dueDateToDoFormString);
                        dueDateToDoForm = null; // Reset to null if invalid
                    }
                }
                // Set to current date if no valid date was provided
                if (!dueDateToDoForm) {
                    dueDateToDoForm = new Date("2024-12-31"); // Create a new Date object for today
                }
                console.log(dueDateToDoFormString)
                // Now you can safely use finishProjectDate as a Date object

                // Get the tags from the tagsList element
                const tagsListElement = document.getElementById('todo-tags-list');
                const tags: string[] = [];
                if (tagsListElement) {
                    const tagElements = tagsListElement.querySelectorAll('li');
                    tagElements.forEach(tagElement => {
                        tags.push(tagElement.textContent || '');
                    });
                }
                console.log(tags)
                // Get the AssignedUsers from the assignedUsersList element
                const assignedUsersListElement = document.getElementById('todo-assignedUsers-list');
                const assignedUsers: string[] = [];
                if (assignedUsersListElement) {
                    const assignedUsersElements = assignedUsersListElement.querySelectorAll('li');
                    assignedUsersElements.forEach(assignedUserElement => {
                        assignedUsers.push(assignedUserElement.textContent || '');
                    });
                }
                console.log(assignedUsers)

                // Get the current Date as the Created Date
                const currentDate = new Date();
                //Get the value of the statusColumn and assign a default value if necessary.
                const statusColumnValue = formToDoData.get("statusColumn") as string || "notassigned"


                const toDoIssueDetails: IToDoIssue = {
                    title: formToDoData.get("title") as string,
                    description: formToDoData.get("description") as string,
                    statusColumn: statusColumnValue,
                    tags: tags,
                    assignedUsers: assignedUsers,
                    dueDate: dueDateToDoForm,
                    todoProject: checkProjectId as string,
                    createdDate: currentDate,
                    todoUserOrigin: formToDoData.get("todoUserOrigin") as string,
                }

                try {
                    if (checkProjectId) {
                        const toDoListInProject = projectManager.getToDoListForProject(checkProjectId)
                        const toDoIssue = newToDoIssue(checkProjectId, toDoListInProject, toDoIssueDetails)
                        toDoIssueForm.reset()

                        closeModal("new-todo-card-modal")

                        // setUpToDoBoard(checkProjectId) //Testing updatin the todoList inside todo-apge

                        // Log the project details
                        const project = projectManager.getProject(checkProjectId);
                        console.log("Project details:", project);
                
                    }

                } catch (err) {
                    const errorPopUp = document.querySelector(".message-popup")
                    const contentError = {
                        contentDescription: err.message,
                        contentTitle: "Error",
                        contentClass: "popup-error",
                        contentIcon: "report"
                    }
                    if (err) {
                        const text = document.querySelector("#message-popup-text p")
                        if (text) {
                            text.textContent = contentError.contentDescription
                        }
                        const title = document.querySelector("#message-popup-text h5")
                        if (title) {
                            title.textContent = contentError.contentTitle
                        }
                        const icon = document.querySelector("#message-popup-icon span")
                        if (icon) {
                            icon.textContent = contentError.contentIcon
                        }
                        errorPopUp?.classList.add(contentError.contentClass)
                        toggleModal("message-popup")
                    }
                    const closePopUp: Element | null = document.querySelector(".btn-popup")
                    if (closePopUp) {
                        const closePopUpHandler = () => {
                            toggleModal("message-popup");
                            closePopUp.removeEventListener("click", closePopUpHandler);
                        }
                        closePopUp.addEventListener("click", closePopUpHandler);
                    }
                }
            }

        } else {
            // Form is invalid, let the browser handle the error display
            toDoIssueForm.reportValidity()

        }
    })

    if (cancelToDoForm) {
        cancelToDoForm.addEventListener("click", (e) => {
            e.preventDefault()
            e.stopPropagation() // Prevent event from bubbling up
            toDoIssueForm.reset()
            // Delete the data-ToDoIssueId attribute with the unique ID of the ToDoIssue in the button of "Save Changes"
            const toDoIssueDatasetAttributeIdInForm = document.getElementById("accept-todo-btn")
            if (toDoIssueDatasetAttributeIdInForm) {
                toDoIssueDatasetAttributeIdInForm.dataset.projectId = ""
            }
            console.log("Cancel ToDoIssue button was clicked")
            toggleModal("new-todo-card-modal")
        })
    } else {
        console.log("The cancel Button was not found")
    }

}
*/


// /* *** ELIMINADO POR ESTAR EN DESUSO UPDATEASIDEBUTTONSSTATE ******* */


// //Main button of Users(aside) open the Users board
// const btnUsersBoard = document.querySelector("#asideBtnUsers")
// if (btnUsersBoard) {
//     btnUsersBoard?.addEventListener("click", async (e) => {
//         e.preventDefault()
//         const selectedProjectId = localStorage.getItem("selectedProjectId")
//         console.log("Btn Users clicked")

//         changePageContent("users-page", "flex");

//         //Show the default content of href = "#/users"(users - index)
//         const defaultUsersIndex = document.querySelector("#users-index") as HTMLElement | null;
//         const teamsPage = document.querySelector("#teams-page") as HTMLElement | null;

//         if (defaultUsersIndex) {
//             defaultUsersIndex.style.display = "flex";

//             if (teamsPage) {
//                 teamsPage.style.display = "none";
//             }

//             console.log("Upload Users page")
//             // Set the localStorage value for pageWIP to "todo-page"
//             localStorage.setItem("pageWIP", "users-page");
//             updateAsideButtonsState()
//         }

//         //Set up the select project Element inside the header
//         if (selectedProjectId) {
//             await setUpUserPage(selectedProjectId)
//         } else {
//             await setUpUserPage()
//         }
//     })
// }
