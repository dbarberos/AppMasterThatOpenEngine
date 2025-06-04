import * as React from 'react';
import * as Router from 'react-router-dom';
//import { db } from '../firebase-config'; // Asegúrate que esta ruta sea correcta
import { firestoreDB as db } from '../services/firebase'; 
import { collection, getDocs, doc, setDoc, onSnapshot } from 'firebase/firestore';
import { User } from '../classes/User'; // Necesitarás definir esta clase/interfaz
//import { IProjectAssignment, } from '../types'; // Y esta
import { IProjectAssignment, IUser } from '../types'; 
import { ProjectsManager } from '../classes/ProjectsManager';
import { LoadingIcon, NewUserForm, UsersBoardList, ProjectSelector, SearchUserBox, MessagePopUp, type MessagePopUpProps, CounterBox, } from '../react-components'; // Asumiendo que estos componentes existen o se crearán
import { MainUsersIndex, SearchIcon, AddIcon, }  from './icons';
import { Project } from '../classes/Project';
import { useUserSearch } from '../hooks';


// Importa tus componentes hijos aquí (los crearemos conceptualmente abajo)
// import UsersBoardList from './UserList';
// import NewUserForm from './NewUserModal';
// import UserProjectAssignmentsForm from './UserProjectAssignmentsModal';
// import UsersBoardProjectView from './ProjectUserView'; // Para la Parte 2

interface Props {
    projectsManager: ProjectsManager,
    onUserCreate: (newUserCreate: User) => void
    onUserUpdate: (updatedUser: User) => void
}


export function UsersBoardPage({
    projectsManager,
    onUserCreate,
    onUserUpdate,
}: Props) {
    const [viewMode, setViewMode] = React.useState<'allUsers' | 'projectUsers'>('allUsers');
    const [users, setUsers] = React.useState<User[]>([]);
    const [projects, setProjects] = React.useState<Project[]>([]); // Deberías tener una lista de tus proyectos
    const [selectedProject, setSelectedProject] = React.useState<string | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    // Estado para el modal de nuevo usuario
    const [isNewUserFormOpen, setIsNewUserFormOpen] = React.useState(false);

    // Estado para el modal de asignación de proyectos (ejemplo)
    const [isAssignFormOpen, setIsAssignFormOpen] = React.useState(false);
    const [currentUserForAssignment, setCurrentUserForAssignment] = React.useState<User | null>(null);

    const [showMessagePopUp, setShowMessagePopUp] = React.useState(false)
    const [messagePopUpContent, setMessagePopUpContent] = React.useState<MessagePopUpProps | null>(null)

    // Estado para el término de búsqueda global
    //const [userSearchTerm, setUserSearchTerm] = React.useState('');

    const {
        userSearchTerm, // Término de búsqueda actual
        setUserSearchTerm,
        filteredUsers, // Lista de usuarios filtrada 
        handleSearchChange: handleUserSearchChange // Función para actualizar el término de búsqueda
    } = useUserSearch(users)
    

    // ***************. useCallback para funciones  *******************
    const handleOpenNewUserModal = React.useCallback(() => {
        setIsNewUserFormOpen(true);
    }, []);

    const handleCloseNewUserModal = React.useCallback(() => {
        setIsNewUserFormOpen(false);
    }, []);

    const handleCreateUser = React.useCallback(async (userData: Omit<User, 'id' | 'projectsAssigned'>) => {
        try {
            // Esta función será llamada por NewUserForm después de crear el usuario en Firebase Auth y Firestore

        // Aquí integrarías Firebase Authentication para crear el usuario
        // y luego guardarías userData en Firestore con el UID obtenido.
        // Por ahora, simularemos la creación en Firestore.
        // const newUserRef = doc(collection(db, "users")); // Firestore genera ID
        // await setDoc(newUserRef, { ...userData, accountCreatedAt: new Date() });
            console.log("User data to create:", userData);
            // setIsNewUserModalOpen(false); // Cierra el modal después de crear
        // La lista se actualizará automáticamente gracias a onSnapshot
        // Si necesitas pasar el usuario creado al componente padre (App.tsx), puedes usar `onUserCreate(createdUser)`.
            setIsNewUserFormOpen(false);
        } catch (error) {
            console.error('Error creating user:', error);
            setError('Failed to create user');
        }
    }, []);




    const handleUpdateUser = React.useCallback((updatedUser: User) => {
        console.log("User updated (callback in UsersBoardPage):", updatedUser);
        // `users` state se actualizará automáticamente por `onSnapshot`.
            // Si necesitas pasar el usuario actualizado al componente padre (App.tsx), puedes usar `onUserUpdate(updatedUser)`.

    
    }, []);
   


    // Funciones para abrir/cerrar modal de asignación y manejar la asignación
    const handleOpenAssignModal = React.useCallback((user: User) => {
        setCurrentUserForAssignment(user);
        setIsAssignFormOpen(true);
    }, []);
    
    const handleAssignProjectsToUser = async (userId: string, assignments: IProjectAssignment[]) => {
        // Lógica para escribir en la subcolección 'projectsAssigned' de Firestore
        console.log(`Assigning projects to user ${userId}:`, assignments);
        // assignments.forEach(async (assignment) => {
        //   const assignmentRef = doc(db, `users/${userId}/projectsAssigned/${assignment.projectId}`);
        //   await setDoc(assignmentRef, assignment, { merge: true });
        // });
        setIsAssignFormOpen(false);
    };


    const handleProjectSelectionForView = (projectId: string | null) => {
        setSelectedProject(projectId);
        setViewMode(projectId ? 'projectUsers' : 'allUsers');
    };
    
    
    const handleUserSearch = React.useCallback((value: string) => {
        setUserSearchTerm(value)
    }, [setUserSearchTerm])



    // **************. useEffect para side effects **********************

    // Cargar todos los usuarios
    React.useEffect(() => {
        setIsLoading(true);
        const usersCollectionRef = collection(db, 'users');
        
        // Usar onSnapshot para actualizaciones en tiempo real
        const unsubscribe = onSnapshot(usersCollectionRef, (snapshot) => {
            const usersData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as User)).map(userData => new User(userData)); // Convertir a instancias de User

            setUsers(usersData);
            setIsLoading(false);
        }, (err) => {
            console.error("Error fetching users: ", err);
            setError("Failed to load users.");
            setIsLoading(false);
        });

        // Cargar proyectos (necesitarás esto para la asignación)
        // const projectsCollectionRef = collection(db, 'projects');
        // getDocs(projectsCollectionRef).then(snapshot => {
        //     setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        // });
        // Obtener proyectos del manager
        setProjects(projectsManager.list);

        return () => unsubscribe(); // Limpiar el listener al desmontar
    }, [projectsManager]);











    // **********************. useMemo para cálculos pesados ***********************

    
    // --- Lógica de Búsqueda y Filtrado ---


    // Calcular la lista filtrada usando useMemo
    const usersListFiltered = React.useMemo(() => {

        return filteredUsers.map((user) => (
            <Router.Link
                to={`/userBoard/${user.id}`}
                key={user.id}
                onClick={() => handleUserLinkClick(user.id!)}
            >
                 {/* UserCardRow will be used inside UsersBoardList */}
    //             <div>User: {user.nickName || user.email}</div>
            </Router.Link>
        ))
    }, [filteredUsers])
   // This useMemo might not be needed if UsersBoardList handles the direct rendering of UserCardRow 




    
    if (isLoading) return <LoadingIcon />;
    if (error) return <p>Error: {error}</p>;





    const onNewUserClick = () => {
        setIsNewUserFormOpen(true);
    };

    const handleCloseUserForm = () => {
        setIsNewUserFormOpen(false);
        
    };

    const handleDeleteUser = (userId: string) => {
        console.log("Delete user ID:", userId);
        // Logic to delete a user
    };


    const handleOpenEditUserModal = () => {
        console.log("Open edit user modal");
        // Logic to open the edit user modal
    }




        return (
            <section className="page" id="users-page" data-page="">
                <header className="header-users" style={{ height: 120 }}>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            rowGap: 25,
                        
                        }}>
                        <h2 style={{ display: "flex", alignItems: "center", columnGap: 20 }}>
                            Users Board
                            <MainUsersIndex size={24}
                                className="todo-icon-edit"
                                color="var(--color-fontbase)"
                            />
                        
                            {/* Selector de Proyecto (para Parte 2) */}
                            <div style={{ display: "flex", alignItems: "center", columnGap: 10 }}>
                                <ProjectSelector
                                    currentProject={projects.find(p => p.id === selectedProject) || null}
                                    projectsList={projects}
                                    onProjectSelect={handleProjectSelectionForView}
                                />
                            </div>
                        </h2>
                        <ul
                            id="users-sliding-nav1"
                            style={{
                                display: "flex",
                                columnGap: 25,
                                transform: "translateY(15px)",
                                zIndex: 100,
                                alignItems: "center"
                            }}
                        >
                            <li className="users-slide1" />
                            <li className="users-slide2" />
                            <li>
                                <a href="#/users" className="tab-buttons">
                                    <span className="material-icons-round">people_alt</span>
                                    Users
                                </a>
                            </li>
                            <li>
                                <a href="#/teams" className="tab-buttons" style={{ width: 175 }}>
                                    <span className="material-icons-round">diversity_3</span>
                                    Users by Proyects
                                </a>
                            </li>
                        </ul>
                        {/* <div style="display: flex; column-gap: 25px; transform: translateY(35px); z-index:100;" >
                                <button class="tab-button">
                                    <span class="material-icons-round">people_alt</span>
                                    Users
                                </button>
                                <button class="tab-button" style="width: 200px;">
                                    <span class="material-icons-round">diversity_3</span>
                                    Projects Teams
                                </button>
                            </div> */}
                    </div>

                    {/* Seccion de busqueda del header (ej: Nuevo Usuario) */}
                    <div>
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "row-reverse",
                                columnGap: 20,
                                alignItems: "center"
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    alignContent: "space-between"
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        columnGap: 10,
                                        justifyContent: "flex-end"
                                    }}>
                                    <div style={{ display: "flex", alignItems: "center", columnGap: 15, justifyContent: 'flex-end' }}>
                                        <SearchIcon size={24} className="todo-icon-plain" color="var(--color-fontbase)" />
                                        <SearchUserBox onChange={handleUserSearchChange} />
                                    </div>
                                    {/* <input
                                        type="search"
                                        id="search-user"
                                        placeholder="Search by name, email or phone number"
                                        style={{ width: 350 }}
                                    />
                                    <span className="material-icons-round">search</span> */}
                                </div>
                            </div>
                            {/* <div style={{ display: "flex", flexDirection: "end", columnGap: 10 }}>
                                <button
                                    className="btn-secondary"
                                    style={{ borderRadius: 10, width: "auto", border: 0 }}
                                >
                                    <span className="material-icons-round">filter_alt</span>
                                </button>
                            </div> */}
                        </div>
                    </div>
                </header>

                {/* OPCIONES DEL TABULADOR DE USUARIOS USUARIOS TOTALES Y EQUIPOS/PROYECTOS */}
                <div
                    className="users-page-content"
                    style={{ height: "calc(130px + 100vh)", position: "relative" 

                    }}
                >

                    <div className="header-user-page-content">
                        <div style={{ display: "flex", flexDirection: "row", columnGap: 20 }}>
                            <button
                                style={{ borderRadius: 10, width: "auto" }}
                                className="btn-secondary"
                            >
                                <span className="material-icons-round">swap_vert</span>
                                <p>Sort By</p>
                                <span className="material-icons-round">expand_more</span>
                            </button>
                            <button onClick={onNewUserClick} id="new-user-btn" style={{ whiteSpace: 'nowrap' }}>
                                <AddIcon size={24} className="todo-icon-plain" color="var(--color-fontbase-dark)" />
                                <p style={{color:"var(--color-fontbase-dark)"}}>Add New User</p>
                            </button>
                        </div>
                    </div>
                    {viewMode === 'allUsers' && (
                        <UsersBoardList
                            users={filteredUsers}
                            onAssignProjects={handleOpenAssignModal}
                            onEditUser={handleOpenEditUserModal} // Necesitarás un modal de edición
                            onDeleteUser={handleDeleteUser} 
                        />
                        //<p>Vista de Todos los Usuarios (UserList irá aquí)</p>
                    )}
                    {viewMode === 'projectUsers' && selectedProject && (
                        // <UsersBoardProjectView projectId={selectedProject} />
                        //<p>Vista de Usuarios por Proyecto {selectedProject} (ProjectUserView irá aquí)</p>
                        <div>
                            <h3>Users in Project: {projects.find(p => p.id === selectedProject)?.name || 'Unknown Project'}</h3>
                            {/* Aquí iría el componente UsersBoardProjectView, que filtraría los usuarios
                            basándose en el selectedProject y sus asignaciones.
                            Por ahora, un placeholder: */}
                            <p>Displaying users assigned to project ID: {selectedProject}. (UsersBoardProjectView component will go here)</p>
                            {/* Ejemplo de cómo podrías filtrar y mostrar:
                        <UsersBoardList users={filteredUsers.filter(u => u.projectsAssigned?.some(pa => pa.projectId === selectedProject))} onAssignProjects={handleOpenAssignModal} />
                        */}
                        </div>

                    )}
                    {viewMode === 'projectUsers' && !selectedProject && projects.length > 0 && (
                        <p>Please select a project from the dropdown to see assigned users.</p>
                    )}
                    {viewMode === 'projectUsers' && !selectedProject && projects.length === 0 && (
                        <p>No projects available to display users by project.</p>
                    )}
                
                </div>



                <div className="users-page-content" id="users-index" style={{ display: "" }}>
                    <div className="header-user-page-content">
                        <div style={{ display: "flex", flexDirection: "row", columnGap: 10 }}>
                            <button
                                style={{ borderRadius: 10, width: "auto" }}
                                className="btn-secondary"
                            >
                                <span className="material-icons-round">swap_vert</span>
                                <p>Sort By</p>
                                <span className="material-icons-round">expand_more</span>
                            </button>
                            <button style={{ borderRadius: 10 }}>
                                <span className="material-icons-round">add</span>
                                <p>Add New User</p>
                            </button>
                        </div>
                    </div>
                    <div
                        className="user-container-header"
                        style={{ border: "none", backgroundColor: "transparent" }}
                    >
                        <div>
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "left",
                                    columnGap: 10
                                }}
                            >
                                {/* <label for=""></label> */}
                                <input
                                    name="bulk-checkbox"
                                    type="checkbox"
                                    defaultValue="all-selected"
                                    className="checkbox"
                                    style={{ width: 17, height: 17 }}
                                />
                                <div>
                                    <button
                                        style={{ borderRadius: 10, width: "auto" }}
                                        className="btn-secondary"
                                    >
                                        Bulk Actions
                                        <label>
                                            <span className="material-icons-round">expand_more</span>
                                            {/* <select name="" id="" style="appearance: none;">
                                                    <option value="Asign proyect">Asign proyect</option>
                                                    <option value="Remove all projects">Remove all projects</option>
                                                    <option value="Remove all roles">Remove all roles</option>
                                                    <option value="Email Validation Accounts">Email Validation Accounts</option>
                                                    <option value="Disable account">Disable account</option>
                                                    <option value="Delete users">Delete users</option>
                                                </select> */}
                                        </label>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <h5 />
                        <h5>EMAIL</h5>
                        <h5>PHONE</h5>
                        <h5>ORGANIZATION / ROL</h5>
                        <h5>STATUS</h5>
                        <h5 className="users-edit">ACTIONS</h5>
                    </div>
                    <div className="users-list">
                        <div>
                            <div className="user-container">
                                <div className="users-checkbox">
                                    {/* <label for=""></label> */}
                                    <input
                                        name="bulk-checkbox"
                                        type="checkbox"
                                        className="checkbox"
                                        defaultValue="all-selected"
                                    />
                                </div>
                                <div className="users-name">
                                    <div className="users-photo">
                                        <img
                                            src="./assets/photo-users/SELECTED/OFFICE1.jpg"
                                            alt="PROJECT MANAGER"
                                        />
                                    </div>
                                    <div>Chris</div>
                                </div>
                                <p>christina@site.com</p>
                                <div>
                                    <p>666 666 66 66</p>
                                    <p
                                        style={{
                                            fontSize: "var(--font-base)",
                                            color: "var(--color-grey)"
                                        }}
                                    >
                                        Spain +34
                                    </p>
                                </div>
                                <div>
                                    <p>BDP</p>
                                    <p
                                        style={{
                                            fontSize: "var(--font-base)",
                                            color: "var(--color-grey)"
                                        }}
                                    >
                                        Project Manager
                                    </p>
                                </div>
                                <div className="users-status">
                                    <p>Active</p>
                                </div>
                                <div className="users-edit">
                                    <button className="btn-secondary">
                                        <label>
                                            <span className="material-icons-round">more_horiz</span>
                                            {/* <select name="" id="" style="appearance: none;">
                                                    <option value="Asign proyect">Asign proyect</option>
                                                    <option value="Remove all projects">Remove all projects</option>
                                                    <option value="Remove all project roles">Remove all roles</option>
                                                    <option value="Email Validation Accounts">Email Validation Accounts</option>
                                                    <option value="Disable account">Disable account</option>
                                                    <option value="Delete users">Delete users</option>
                                                </select> */}
                                        </label>
                                    </button>
                                </div>
                                <div className="user-details1">
                                    <div className="user-data">
                                        <p>FULL NAME:</p>
                                        <p>Christina Bersh </p>
                                    </div>
                                    <div className="user-data">
                                        <p>ADDRESS:</p>
                                        <p>Trump tower. New York </p>
                                    </div>
                                    <div className="user-data">
                                        <p>ACCOUNT CREATED ON:</p>
                                        <p>30/05/2024 </p>
                                    </div>
                                    <div className="user-data">
                                        <p>CREATED BY:</p>
                                        <p>Christina Bersh </p>
                                    </div>
                                    <div className="user-data">
                                        <p>LAST LOGIN:</p>
                                        <p>30/05/2024 </p>
                                    </div>
                                </div>
                                <div className="user-details2">
                                    <div className="user-data" style={{ justifyContent: "flex-start" }}>
                                        <div>
                                            <p>PROYECTS TEAMS:</p>
                                        </div>
                                        <div>
                                            <p
                                                style={{
                                                    fontSize: "var(--font-xl)",
                                                    backgroundColor: "#ca8134",
                                                    padding: 10,
                                                    borderRadius: "var(--br-circle)",
                                                    aspectRatio: 1,
                                                    color: "var(--background)"
                                                }}
                                            >
                                                HC
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="user-container">
                                <div className="users-checkbox">
                                    {/* <label for=""></label> */}
                                    <input
                                        name="bulk-checkbox"
                                        type="checkbox"
                                        className="checkbox"
                                        defaultValue="all-selected"
                                    />
                                </div>
                                <div className="users-name">
                                    <div className="users-photo">
                                        <img
                                            src="./assets/photo-users/SELECTED/constructor.jpg"
                                            alt="PROJECT MANAGER"
                                        />
                                    </div>
                                    <div>D Harrison</div>
                                </div>
                                <p>david@site.com</p>
                                <div>
                                    <p>666 666 66 66</p>
                                    <p
                                        style={{
                                            fontSize: "var(--font-base)",
                                            color: "var(--color-grey)"
                                        }}
                                    >
                                        Spain +34
                                    </p>
                                </div>
                                <div>
                                    <p>Dragados</p>
                                    <p
                                        style={{
                                            fontSize: "var(--font-base)",
                                            color: "var(--color-grey)"
                                        }}
                                    >
                                        BIM Manager
                                    </p>
                                </div>
                                <div className="users-status">
                                    <p>Active</p>
                                </div>
                                <div className="users-edit">
                                    <button className="btn-secondary">
                                        <label>
                                            <span className="material-icons-round">more_horiz</span>
                                            {/* <select name="" id="" style="appearance: none;">
                                                    <option value="Asign proyect">Asign proyect</option>
                                                    <option value="Remove all projects">Remove all projects</option>
                                                    <option value="Remove all project roles">Remove all roles</option>
                                                    <option value="Email Validation Accounts">Email Validation Accounts</option>
                                                    <option value="Disable account">Disable account</option>
                                                    <option value="Delete users">Delete users</option>
                                                </select> */}
                                        </label>
                                    </button>
                                </div>
                                <div className="user-details1">
                                    <div className="user-data">
                                        <p>FULL NAME:</p>
                                        <p>David Harrison </p>
                                    </div>
                                    <div className="user-data">
                                        <p>ADDRESS:</p>
                                        <p>Trump tower. New York </p>
                                    </div>
                                    <div className="user-data">
                                        <p>ACCOUNT CREATED ON:</p>
                                        <p>30/05/2024 </p>
                                    </div>
                                    <div className="user-data">
                                        <p>CREATED BY:</p>
                                        <p>Christina Bersh </p>
                                    </div>
                                    <div className="user-data">
                                        <p>LAST LOGIN:</p>
                                        <p>30/05/2024 </p>
                                    </div>
                                </div>
                                <div className="user-details2">
                                    <div className="user-data" style={{ justifyContent: "flex-start" }}>
                                        <div>
                                            <p>PROYECTS TEAMS:</p>
                                        </div>
                                        <div>
                                            <p
                                                style={{
                                                    fontSize: "var(--font-xl)",
                                                    backgroundColor: "#ca8134",
                                                    padding: 10,
                                                    borderRadius: "var(--br-circle)",
                                                    aspectRatio: 1,
                                                    color: "var(--background)"
                                                }}
                                            >
                                                HC
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="user-container">
                                <div className="users-checkbox">
                                    {/* <label for=""></label> */}
                                    <input
                                        name="bulk-checkbox"
                                        type="checkbox"
                                        className="checkbox"
                                        defaultValue="all-selected"
                                    />
                                </div>
                                <div className="users-name">
                                    <div className="users-photo">
                                        <img
                                            src="./assets/photo-users/SELECTED/EDIF1.jpg"
                                            alt="PROJECT MANAGER"
                                        />
                                    </div>
                                    <div>Anne</div>
                                </div>
                                <p>anne@site.com</p>
                                <div>
                                    <p>666 666 66 66</p>
                                    <p
                                        style={{
                                            fontSize: "var(--font-base)",
                                            color: "var(--color-grey)"
                                        }}
                                    >
                                        Spain +34
                                    </p>
                                </div>
                                <div>
                                    <p>FCC</p>
                                    <p
                                        style={{
                                            fontSize: "var(--font-base)",
                                            color: "var(--color-grey)"
                                        }}
                                    >
                                        Site Manager
                                    </p>
                                </div>
                                <div className="users-status">
                                    <p>Active</p>
                                </div>
                                <div className="users-edit">
                                    <button className="btn-secondary">
                                        <label>
                                            <span className="material-icons-round">more_horiz</span>
                                            {/* <select name="" id="" style="appearance: none;">
                                                    <option value="Asign proyect">Asign proyect</option>
                                                    <option value="Remove all projects">Remove all projects</option>
                                                    <option value="Remove all project roles">Remove all roles</option>
                                                    <option value="Email Validation Accounts">Email Validation Accounts</option>
                                                    <option value="Disable account">Disable account</option>
                                                    <option value="Delete users">Delete users</option>
                                                </select> */}
                                        </label>
                                    </button>
                                </div>
                                <div className="user-details1">
                                    <div className="user-data">
                                        <p>FULL NAME:</p>
                                        <p>Anne Richard</p>
                                    </div>
                                    <div className="user-data">
                                        <p>ADDRESS:</p>
                                        <p>Trump tower. New York </p>
                                    </div>
                                    <div className="user-data">
                                        <p>ACCOUNT CREATED ON:</p>
                                        <p>30/05/2024 </p>
                                    </div>
                                    <div className="user-data">
                                        <p>CREATED BY:</p>
                                        <p>Christina Bersh </p>
                                    </div>
                                    <div className="user-data">
                                        <p>LAST LOGIN:</p>
                                        <p>30/05/2024 </p>
                                    </div>
                                </div>
                                <div className="user-details2">
                                    <div className="user-data" style={{ justifyContent: "flex-start" }}>
                                        <div>
                                            <p>PROYECTS TEAMS:</p>
                                        </div>
                                        <div>
                                            <p
                                                style={{
                                                    fontSize: "var(--font-xl)",
                                                    backgroundColor: "#ca8134",
                                                    padding: 10,
                                                    borderRadius: "var(--br-circle)",
                                                    aspectRatio: 1,
                                                    color: "var(--background)"
                                                }}
                                            >
                                                HC
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="user-container">
                                <div className="users-checkbox">
                                    {/* <label for=""></label> */}
                                    <input
                                        name="bulk-checkbox"
                                        type="checkbox"
                                        className="checkbox"
                                        defaultValue="all-selected"
                                    />
                                </div>
                                <div className="users-name">
                                    <div className="users-photo">
                                        <img
                                            src="./assets/photo-users/SELECTED/OFFICE6.jpg"
                                            alt="PROJECT MANAGER"
                                        />
                                    </div>
                                    <div>Mrs Samia</div>
                                </div>
                                <p>samia@site.com</p>
                                <div>
                                    <p>666 666 66 66</p>
                                    <p
                                        style={{
                                            fontSize: "var(--font-base)",
                                            color: "var(--color-grey)"
                                        }}
                                    >
                                        Spain +34
                                    </p>
                                </div>
                                <div>
                                    <p>Acciona</p>
                                    <p
                                        style={{
                                            fontSize: "var(--font-base)",
                                            color: "var(--color-grey)"
                                        }}
                                    >
                                        Document Controller
                                    </p>
                                </div>
                                <div className="users-status">
                                    <p>Active</p>
                                </div>
                                <div className="users-edit">
                                    <button className="btn-secondary">
                                        <label>
                                            <span className="material-icons-round">more_horiz</span>
                                            {/* <select name="" id="" style="appearance: none;">
                                                    <option value="Asign proyect">Asign proyect</option>
                                                    <option value="Remove all projects">Remove all projects</option>
                                                    <option value="Remove all project roles">Remove all roles</option>
                                                    <option value="Email Validation Accounts">Email Validation Accounts</option>
                                                    <option value="Disable account">Disable account</option>
                                                    <option value="Delete users">Delete users</option>
                                                </select> */}
                                        </label>
                                    </button>
                                </div>
                                <div className="user-details1">
                                    <div className="user-data">
                                        <p>FULL NAME:</p>
                                        <p>Samia Kartoon</p>
                                    </div>
                                    <div className="user-data">
                                        <p>ADDRESS:</p>
                                        <p>Trump tower. New York </p>
                                    </div>
                                    <div className="user-data">
                                        <p>ACCOUNT CREATED ON:</p>
                                        <p>30/05/2024 </p>
                                    </div>
                                    <div className="user-data">
                                        <p>CREATED BY:</p>
                                        <p>Christina Bersh </p>
                                    </div>
                                    <div className="user-data">
                                        <p>LAST LOGIN:</p>
                                        <p>30/05/2024 </p>
                                    </div>
                                </div>
                                <div className="user-details2">
                                    <div className="user-data" style={{ justifyContent: "flex-start" }}>
                                        <div>
                                            <p>PROYECTS TEAMS:</p>
                                        </div>
                                        <div>
                                            <p />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="user-container">
                                <div className="users-checkbox">
                                    <input
                                        name="bulk-checkbox"
                                        type="checkbox"
                                        className="checkbox"
                                        defaultValue="all-selected"
                                    />
                                </div>
                                <div className="users-name">
                                    <div className="users-photo">
                                        <img
                                            src="./assets/photo-users/SELECTED/OBRAS2.jpg"
                                            alt="PROJECT MANAGER"
                                        />
                                    </div>
                                    <div>Mr Clerk</div>
                                </div>
                                <p>andy@site.com</p>
                                <div>
                                    <p>666 666 66 66</p>
                                    <p
                                        style={{
                                            fontSize: "var(--font-base)",
                                            color: "var(--color-grey)"
                                        }}
                                    >
                                        Spain +34
                                    </p>
                                </div>
                                <div>
                                    <p>Ferrovial</p>
                                    <p
                                        style={{
                                            fontSize: "var(--font-base)",
                                            color: "var(--color-grey)"
                                        }}
                                    >
                                        MEP Engineer
                                    </p>
                                </div>
                                <div className="users-status">
                                    <p>Active</p>
                                </div>
                                <div className="users-edit">
                                    <button className="btn-secondary">
                                        <label>
                                            <span className="material-icons-round">more_horiz</span>
                                            {/* <select name="" id="" style="appearance: none;">
                                                    <option value="Asign proyect">Asign proyect</option>
                                                    <option value="Remove all projects">Remove all projects</option>
                                                    <option value="Remove all project roles">Remove all roles</option>
                                                    <option value="Email Validation Accounts">Email Validation Accounts</option>
                                                    <option value="Disable account">Disable account</option>
                                                    <option value="Delete users">Delete users</option>
                                                </select> */}
                                        </label>
                                    </button>
                                </div>
                                <div className="user-details1">
                                    <div className="user-data">
                                        <p>FULL NAME:</p>
                                        <p>Andy Clerk</p>
                                    </div>
                                    <div className="user-data">
                                        <p>ADDRESS:</p>
                                        <p>Trump tower. New York </p>
                                    </div>
                                    <div className="user-data">
                                        <p>ACCOUNT CREATED ON:</p>
                                        <p>30/05/2024 </p>
                                    </div>
                                    <div className="user-data">
                                        <p>CREATED BY:</p>
                                        <p>Christina Bersh </p>
                                    </div>
                                    <div className="user-data">
                                        <p>LAST LOGIN:</p>
                                        <p>30/05/2024 </p>
                                    </div>
                                </div>
                                <div className="user-details2">
                                    <div className="user-data" style={{ justifyContent: "flex-start" }}>
                                        <div>
                                            <p>PROYECTS TEAMS:</p>
                                        </div>
                                        <div>
                                            <p />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="user-container">
                                <div className="users-checkbox">
                                    <input
                                        name="bulk-checkbox"
                                        type="checkbox"
                                        className="checkbox"
                                        defaultValue="all-selected"
                                    />
                                </div>
                                <div className="users-name">
                                    <div className="users-photo">
                                        <img
                                            src="./assets/photo-users/SELECTED/Architect.jpg"
                                            alt="PROJECT MANAGER"
                                        />
                                    </div>
                                    <div>Sir Halligan</div>
                                </div>
                                <p>brian@site.com</p>
                                <div>
                                    <p>666 666 66 66</p>
                                    <p
                                        style={{
                                            fontSize: "var(--font-base)",
                                            color: "var(--color-grey)"
                                        }}
                                    >
                                        Spain +34
                                    </p>
                                </div>
                                <div>
                                    <p>Sacyr</p>
                                    <p
                                        style={{
                                            fontSize: "var(--font-base)",
                                            color: "var(--color-grey)"
                                        }}
                                    >
                                        Architect
                                    </p>
                                </div>
                                <div className="users-status">
                                    <p>Active</p>
                                </div>
                                <div className="users-edit">
                                    <button className="btn-secondary">
                                        <label>
                                            <span className="material-icons-round">more_horiz</span>
                                            {/* <select name="" id="" style="appearance: none;">
                                                    <option value="Asign proyect">Asign proyect</option>
                                                    <option value="Remove all projects">Remove all projects</option>
                                                    <option value="Remove all project roles">Remove all roles</option>
                                                    <option value="Email Validation Accounts">Email Validation Accounts</option>
                                                    <option value="Disable account">Disable account</option>
                                                    <option value="Delete users">Delete users</option>
                                                </select> */}
                                        </label>
                                    </button>
                                </div>
                                <div className="user-details1">
                                    <div className="user-data">
                                        <p>FULL NAME:</p>
                                        <p>Brian Halligan</p>
                                    </div>
                                    <div className="user-data">
                                        <p>ADDRESS:</p>
                                        <p>Trump tower. New York </p>
                                    </div>
                                    <div className="user-data">
                                        <p>ACCOUNT CREATED ON:</p>
                                        <p>30/05/2024 </p>
                                    </div>
                                    <div className="user-data">
                                        <p>CREATED BY:</p>
                                        <p>Christina Bersh </p>
                                    </div>
                                    <div className="user-data">
                                        <p>LAST LOGIN:</p>
                                        <p>30/05/2024 </p>
                                    </div>
                                </div>
                                <div className="user-details2">
                                    <div className="user-data" style={{ justifyContent: "flex-start" }}>
                                        <div>
                                            <p>PROYECTS TEAMS:</p>
                                        </div>
                                        <div>
                                            <p />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="user-container">
                                <div className="users-checkbox">
                                    {/* <label for=""></label> */}
                                    <input
                                        name="bulk-checkbox"
                                        type="checkbox"
                                        className="checkbox"
                                        defaultValue="all-selected"
                                    />
                                </div>
                                <div className="users-name">
                                    <div className="users-photo">
                                        <img
                                            src="./assets/photo-users/SELECTED/OFFICE4.jpg"
                                            alt="PROJECT MANAGER"
                                        />
                                    </div>
                                    <div>Bart</div>
                                </div>
                                <p>barto@site.com</p>
                                <div>
                                    <p>666 666 66 66</p>
                                    <p
                                        style={{
                                            fontSize: "var(--font-base)",
                                            color: "var(--color-grey)"
                                        }}
                                    >
                                        Spain +34
                                    </p>
                                </div>
                                <div>
                                    <p>OHLA</p>
                                    <p
                                        style={{
                                            fontSize: "var(--font-base)",
                                            color: "var(--color-grey)"
                                        }}
                                    >
                                        Building Surveyor
                                    </p>
                                </div>
                                <div className="users-status">
                                    <p>Active</p>
                                </div>
                                <div className="users-edit">
                                    <button className="btn-secondary">
                                        <label>
                                            <span className="material-icons-round">more_horiz</span>
                                            {/* <select name="" id="" style="appearance: none;">
                                                    <option value="Asign proyect">Asign proyect</option>
                                                    <option value="Remove all projects">Remove all projects</option>
                                                    <option value="Remove all project roles">Remove all roles</option>
                                                    <option value="Email Validation Accounts">Email Validation Accounts</option>
                                                    <option value="Disable account">Disable account</option>
                                                    <option value="Delete users">Delete users</option>
                                                </select> */}
                                        </label>
                                    </button>
                                </div>
                                <div className="user-details1">
                                    <div className="user-data">
                                        <p>FULL NAME:</p>
                                        <p>Bartolome Simpson</p>
                                    </div>
                                    <div className="user-data">
                                        <p>ADDRESS:</p>
                                        <p>Trump tower. New York </p>
                                    </div>
                                    <div className="user-data">
                                        <p>ACCOUNT CREATED ON:</p>
                                        <p>30/05/2024 </p>
                                    </div>
                                    <div className="user-data">
                                        <p>CREATED BY:</p>
                                        <p>Christina Bersh </p>
                                    </div>
                                    <div className="user-data">
                                        <p>LAST LOGIN:</p>
                                        <p>30/05/2024 </p>
                                    </div>
                                </div>
                                <div className="user-details2">
                                    <div className="user-data" style={{ justifyContent: "flex-start" }}>
                                        <div>
                                            <p>PROYECTS TEAMS:</p>
                                        </div>
                                        <div>
                                            <p />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="user-container">
                                <div className="users-checkbox">
                                    {/* <label for=""></label> */}
                                    <input
                                        name="bulk-checkbox"
                                        type="checkbox"
                                        className="checkbox"
                                        defaultValue="all-selected"
                                    />
                                </div>
                                <div className="users-name">
                                    <div className="users-photo">
                                        <img
                                            src="./assets/photo-users/SELECTED/INGENIERA2.jpg"
                                            alt="PROJECT MANAGER"
                                        />
                                    </div>
                                    <div>Cami</div>
                                </div>
                                <p>cwelt@site.com</p>
                                <div>
                                    <p>666 666 66 66</p>
                                    <p
                                        style={{
                                            fontSize: "var(--font-base)",
                                            color: "var(--color-grey)"
                                        }}
                                    >
                                        Spain +34
                                    </p>
                                </div>
                                <div>
                                    <p>ARUP</p>
                                    <p
                                        style={{
                                            fontSize: "var(--font-base)",
                                            color: "var(--color-grey)"
                                        }}
                                    >
                                        Structural Engineer
                                    </p>
                                </div>
                                <div className="users-status">
                                    <p>Active</p>
                                </div>
                                <div className="users-edit">
                                    <button className="btn-secondary">
                                        <label>
                                            <span className="material-icons-round">more_horiz</span>
                                            {/* <select name="" id="" style="appearance: none;">
                                                    <option value="Asign proyect">Asign proyect</option>
                                                    <option value="Remove all projects">Remove all projects</option>
                                                    <option value="Remove all project roles">Remove all roles</option>
                                                    <option value="Email Validation Accounts">Email Validation Accounts</option>
                                                    <option value="Disable account">Disable account</option>
                                                    <option value="Delete users">Delete users</option>
                                                </select> */}
                                        </label>
                                    </button>
                                </div>
                                <div className="user-details1">
                                    <div className="user-data">
                                        <p>FULL NAME:</p>
                                        <p>Camila Welters</p>
                                    </div>
                                    <div className="user-data">
                                        <p>ADDRESS:</p>
                                        <p>Trump tower. New York </p>
                                    </div>
                                    <div className="user-data">
                                        <p>ACCOUNT CREATED ON:</p>
                                        <p>30/05/2024 </p>
                                    </div>
                                    <div className="user-data">
                                        <p>CREATED BY:</p>
                                        <p>Christina Bersh </p>
                                    </div>
                                    <div className="user-data">
                                        <p>LAST LOGIN:</p>
                                        <p>30/05/2024 </p>
                                    </div>
                                </div>
                                <div className="user-details2">
                                    <div className="user-data" style={{ justifyContent: "flex-start" }}>
                                        <div>
                                            <p>PROYECTS TEAMS:</p>
                                        </div>
                                        <div>
                                            <p />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="user-container">
                                <div className="users-checkbox">
                                    {/* <label for=""></label> */}
                                    <input
                                        name="bulk-checkbox"
                                        type="checkbox"
                                        className="checkbox"
                                        defaultValue="all-selected"
                                    />
                                </div>
                                <div className="users-name">
                                    <div className="users-photo">
                                        <img
                                            src="./assets/photo-users/SELECTED/OBRA5.jpg"
                                            alt="PROJECT MANAGER"
                                        />
                                    </div>
                                    <div>Oliver</div>
                                </div>
                                <p>oliver@site.com</p>
                                <div>
                                    <p>666 666 66 66</p>
                                    <p
                                        style={{
                                            fontSize: "var(--font-base)",
                                            color: "var(--color-grey)"
                                        }}
                                    >
                                        Spain +34
                                    </p>
                                </div>
                                <div>
                                    <p>AECOM</p>
                                    <p
                                        style={{
                                            fontSize: "var(--font-base)",
                                            color: "var(--color-grey)"
                                        }}
                                    >
                                        BIM Coordinator
                                    </p>
                                </div>
                                <div className="users-status">
                                    <p>Activer</p>
                                </div>
                                <div className="users-edit">
                                    <button className="btn-secondary">
                                        <label>
                                            <span className="material-icons-round">more_horiz</span>
                                            {/* <select name="" id="" style="appearance: none;">
                                                    <option value="Asign proyect">Asign proyect</option>
                                                    <option value="Remove all projects">Remove all projects</option>
                                                    <option value="Remove all project roles">Remove all roles</option>
                                                    <option value="Email Validation Accounts">Email Validation Accounts</option>
                                                    <option value="Disable account">Disable account</option>
                                                    <option value="Delete users">Delete users</option>
                                                </select> */}
                                        </label>
                                    </button>
                                </div>
                                <div className="user-details1">
                                    <div className="user-data">
                                        <p>FULL NAME:</p>
                                        <p>Oliver Schevich</p>
                                    </div>
                                    <div className="user-data">
                                        <p>ADDRESS:</p>
                                        <p>Trump tower. New York </p>
                                    </div>
                                    <div className="user-data">
                                        <p>ACCOUNT CREATED ON:</p>
                                        <p>30/05/2024 </p>
                                    </div>
                                    <div className="user-data">
                                        <p>CREATED BY:</p>
                                        <p>Christina Bersh </p>
                                    </div>
                                    <div className="user-data">
                                        <p>LAST LOGIN:</p>
                                        <p>30/05/2024 </p>
                                    </div>
                                </div>
                                <div className="user-details2">
                                    <div className="user-data" style={{ justifyContent: "flex-start" }}>
                                        <div>
                                            <p>PROYECTS TEAMS:</p>
                                        </div>
                                        <div>
                                            <p />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="user-container">
                                <div className="users-checkbox">
                                    {/* <label for=""></label> */}
                                    <input
                                        name="bulk-checkbox"
                                        type="checkbox"
                                        className="checkbox"
                                        defaultValue="all-selected"
                                    />
                                </div>
                                <div className="users-name">
                                    <div className="users-photo">
                                        <img
                                            src="./assets/photo-users/SELECTED/COMPANY2.jpg"
                                            alt="PROJECT MANAGER"
                                        />
                                    </div>
                                    <div>JW</div>
                                </div>
                                <p>myhairisred@site.com</p>
                                <div>
                                    <p>666 666 66 66</p>
                                    <p
                                        style={{
                                            fontSize: "var(--font-base)",
                                            color: "var(--color-grey)"
                                        }}
                                    >
                                        Spain +34
                                    </p>
                                </div>
                                <div>
                                    <p>dBASE</p>
                                    <p
                                        style={{
                                            fontSize: "var(--font-base)",
                                            color: "var(--color-grey)"
                                        }}
                                    >
                                        Full Stack Soft. developer
                                    </p>
                                </div>
                                <div className="users-status">
                                    <p>Active</p>
                                </div>
                                <div className="users-edit">
                                    <button className="btn-secondary">
                                        <label>
                                            <span className="material-icons-round">more_horiz</span>
                                            {/* <select name="" id="" style="appearance: none;">
                                                    <option value="Asign proyect">Asign proyect</option>
                                                    <option value="Remove all projects">Remove all projects</option>
                                                    <option value="Remove all project roles">Remove all roles</option>
                                                    <option value="Email Validation Accounts">Email Validation Accounts</option>
                                                    <option value="Disable account">Disable account</option>
                                                    <option value="Delete users">Delete users</option>
                                                </select> */}
                                        </label>
                                    </button>
                                </div>
                                <div className="user-details1">
                                    <div className="user-data">
                                        <p>FULL NAME:</p>
                                        <p>Jessica Williams</p>
                                    </div>
                                    <div className="user-data">
                                        <p>ADDRESS:</p>
                                        <p>Trump tower. New York </p>
                                    </div>
                                    <div className="user-data">
                                        <p>ACCOUNT CREATED ON:</p>
                                        <p>30/05/2024 </p>
                                    </div>
                                    <div className="user-data">
                                        <p>CREATED BY:</p>
                                        <p>Christina Bersh </p>
                                    </div>
                                    <div className="user-data">
                                        <p>LAST LOGIN:</p>
                                        <p>30/05/2024 </p>
                                    </div>
                                </div>
                                <div className="user-details2">
                                    <div className="user-data" style={{ justifyContent: "flex-start" }}>
                                        <div>
                                            <p>PROYECTS TEAMS:</p>
                                        </div>
                                        <div>
                                            <p />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="users-page-content" id="teams-page" style={{ display: "none" }}
                >
                    <div className="header-user-page-content">
                        <div style={{ display: "flex", flexDirection: "row", columnGap: 10 }}>
                            <button
                                style={{ borderRadius: 10, width: "auto" }}
                                className="btn-secondary"
                            >
                                <span className="material-icons-round">swap_vert</span>
                                <p>Sort By</p>
                                <span className="material-icons-round">expand_more</span>
                            </button>
                            <button style={{ borderRadius: 10 }}>
                                <span className="material-icons-round">add</span>
                                <p>Add New User To Team</p>
                            </button>
                        </div>
                    </div>
                    <div
                        className="user-container-header"
                        style={{ border: "none", backgroundColor: "transparent" }}
                    >
                        <div>
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "left",
                                    columnGap: 10
                                }}
                            >
                                {/* <label for=""></label> */}
                                <input
                                    name="bulk-checkbox"
                                    type="checkbox"
                                    defaultValue="all-selected"
                                    className="checkbox"
                                    style={{ width: 17, height: 17 }}
                                />
                                <div>
                                    <button
                                        style={{ borderRadius: 10, width: "auto" }}
                                        className="btn-secondary"
                                    >
                                        Bulk Actions
                                        <label>
                                            <span className="material-icons-round">expand_more</span>
                                            {/* <select name="" id="" style="appearance: none;">
                                                            <option value="Remove from the Team">Remove from</option>
                                                            <option value="Email Validation Team Project">Email Validation Team</option>
                                                            <option value="Disable for de team">Disable team</option>
                                                            <option value="Delete users">Delete users</option>
                                                            
                                                        </select> */}
                                        </label>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <h5 />
                        <h5>DATA</h5>
                        <h5 />
                        <h5>PERMISSIONS</h5>
                        <h5 />
                        <h5 className="users-edit">ACTIONS</h5>
                    </div>
                    <div className="users-list">
                        <div>
                            <div className="user-team-container">
                                <div className="users-checkbox" style={{ marginTop: "-75px" }}>
                                    {/* <label for=""></label> */}
                                    <input
                                        name="bulk-checkbox"
                                        type="checkbox"
                                        className="checkbox"
                                        defaultValue="all-selected"
                                    />
                                </div>
                                <div className="users-name" style={{ marginTop: "-75px" }}>
                                    <div className="users-photo">
                                        <img
                                            src="./assets/photo-users/SELECTED/OFFICE1.jpg"
                                            alt="PROJECT MANAGER"
                                        />
                                    </div>
                                    <div>Chris</div>
                                </div>
                                <div className="users-edit">
                                    <button className="btn-secondary">
                                        <label>
                                            <span className="material-icons-round">more_horiz</span>
                                            {/* <select name="" id="" style="appearance: none;">
                                                                    <option value="Remove from the Team">Remove from</option>
                                                                    <option value="Email Validation Team Project">Email Validation Team</option>
                                                                    <option value="Disable for de team">Disable team</option>
                                                                    <option value="Delete users">Delete users</option>
                                                                </select> */}
                                        </label>
                                    </button>
                                </div>
                                <div className="team-data">
                                    <div className="user-data">
                                        <p>EMAIL:</p>
                                        <p>christina@site.com </p>
                                    </div>
                                    <div className="user-data">
                                        <p>PHONE:</p>
                                        <p>666 666 66 66</p>
                                    </div>
                                    <div className="user-data">
                                        <p>ORGANIZATION:</p>
                                        <p>BDP</p>
                                    </div>
                                    <div className="user-data">
                                        <p>ROLE:</p>
                                        <p>Project Manager </p>
                                    </div>
                                </div>
                                <div className="team-permissions">
                                    <div
                                        className="user-data"
                                        style={{ justifyContent: "flex-start" }}
                                    ></div>
                                    <div
                                        className="user-data"
                                        style={{ justifyContent: "flex-start", alignItems: "center" }}
                                    >
                                        <div style={{ width: 75 }}>
                                            <p>TO-DO LIST:</p>
                                        </div>
                                        <div style={{ display: "flex", columnGap: "var(--gap-base)" }}>
                                            <span
                                                style={{ fontSize: "2em" }}
                                                className="material-icons-round"
                                            >
                                                add
                                            </span>
                                            <span
                                                style={{ fontSize: "2em" }}
                                                className="material-icons-round"
                                            >
                                                visibility
                                            </span>
                                            <span
                                                style={{ fontSize: "2em" }}
                                                className="material-icons-round"
                                            >
                                                drive_file_rename_outline
                                            </span>
                                            <span
                                                style={{ fontSize: "2em" }}
                                                className="material-icons-round"
                                            >
                                                delete_outline
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="user-team-container">
                                <div className="users-checkbox" style={{ marginTop: "-75px" }}>
                                    <input
                                        name="bulk-checkbox"
                                        type="checkbox"
                                        className="checkbox"
                                        defaultValue="all-selected"
                                    />
                                </div>
                                <div className="users-name" style={{ marginTop: "-75px" }}>
                                    <div className="users-photo">
                                        <img
                                            src="./assets/photo-users/SELECTED/constructor.jpg"
                                            alt="PROJECT MANAGER"
                                        />
                                    </div>
                                    <div>D Harrison</div>
                                </div>
                                <div className="users-edit">
                                    <button className="btn-secondary">
                                        <label>
                                            <span className="material-icons-round">more_horiz</span>
                                            {/* <select name="" id="" style="appearance: none;">
                                                                    <option value="Remove from the Team">Remove from</option>
                                                                    <option value="Email Validation Team Project">Email Validation Team</option>
                                                                    <option value="Disable for de team">Disable team</option>
                                                                    <option value="Delete users">Delete users</option>
                                                                </select> */}
                                        </label>
                                    </button>
                                </div>
                                <div className="team-data">
                                    <div className="user-data">
                                        <p>EMAIL:</p>
                                        <p>david@site.com </p>
                                    </div>
                                    <div className="user-data">
                                        <p>PHONE:</p>
                                        <p>666 666 66 66</p>
                                    </div>
                                    <div className="user-data">
                                        <p>ORGANIZATION:</p>
                                        <p>Dragados</p>
                                    </div>
                                    <div className="user-data">
                                        <p>ROLE:</p>
                                        <p>BIM ManagerProject Manager </p>
                                    </div>
                                </div>
                                <div className="team-permissions">
                                    <div
                                        className="user-data"
                                        style={{ justifyContent: "flex-start" }}
                                    ></div>
                                    <div
                                        className="user-data"
                                        style={{ justifyContent: "flex-start", alignItems: "center" }}
                                    >
                                        <div style={{ width: 75 }}>
                                            <p>TO-DO LIST:</p>
                                        </div>
                                        <div style={{ display: "flex", columnGap: "var(--gap-base)" }}>
                                            <span
                                                style={{ fontSize: "2em" }}
                                                className="material-icons-round"
                                            >
                                                add
                                            </span>
                                            <span
                                                style={{ fontSize: "2em" }}
                                                className="material-icons-round"
                                            >
                                                visibility
                                            </span>
                                            <span
                                                style={{ fontSize: "2em" }}
                                                className="material-icons-round"
                                            >
                                                drive_file_rename_outline
                                            </span>
                                            <span
                                                style={{ fontSize: "2em" }}
                                                className="material-icons-round"
                                            >
                                                delete_outline
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="user-team-container">
                                <div className="users-checkbox" style={{ marginTop: "-75px" }}>
                                    <input
                                        name="bulk-checkbox"
                                        type="checkbox"
                                        className="checkbox"
                                        defaultValue="all-selected"
                                    />
                                </div>
                                <div className="users-name" style={{ marginTop: "-75px" }}>
                                    <div className="users-photo">
                                        <img
                                            src="./assets/photo-users/SELECTED/EDIF1.jpg"
                                            alt="PROJECT MANAGER"
                                        />
                                    </div>
                                    <div>Anne</div>
                                </div>
                                <div className="users-edit">
                                    <button className="btn-secondary">
                                        <label>
                                            <span className="material-icons-round">more_horiz</span>
                                            {/* <select name="" id="" style="appearance: none;">
                                                                        <option value="Remove from the Team">Remove from</option>
                                                                        <option value="Email Validation Team Project">Email Validation Team</option>
                                                                        <option value="Disable for de team">Disable team</option>
                                                                        <option value="Delete users">Delete users</option>
                                                                    </select> */}
                                        </label>
                                    </button>
                                </div>
                                <div className="team-data">
                                    <div className="user-data">
                                        <p>EMAIL:</p>
                                        <p>christina@site.com </p>
                                    </div>
                                    <div className="user-data">
                                        <p>PHONE:</p>
                                        <p>666 666 66 66</p>
                                    </div>
                                    <div className="user-data">
                                        <p>ORGANIZATION:</p>
                                        <p>FCC</p>
                                    </div>
                                    <div className="user-data">
                                        <p>ROLE:</p>
                                        <p>Site Manager </p>
                                    </div>
                                </div>
                                <div className="team-permissions">
                                    <div
                                        className="user-data"
                                        style={{ justifyContent: "flex-start" }}
                                    ></div>
                                    <div
                                        className="user-data"
                                        style={{ justifyContent: "flex-start", alignItems: "center" }}
                                    >
                                        <div style={{ width: 75 }}>
                                            <p>TO-DO LIST:</p>
                                        </div>
                                        <div style={{ display: "flex", columnGap: "var(--gap-base)" }}>
                                            <span
                                                style={{ fontSize: "2em" }}
                                                className="material-icons-round"
                                            >
                                                add
                                            </span>
                                            <span
                                                style={{ fontSize: "2em" }}
                                                className="material-icons-round"
                                            >
                                                visibility
                                            </span>
                                            <span
                                                style={{ fontSize: "2em" }}
                                                className="material-icons-round"
                                            >
                                                drive_file_rename_outline
                                            </span>
                                            <span
                                                style={{ fontSize: "2em" }}
                                                className="material-icons-round"
                                            >
                                                delete_outline
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>




                {isNewUserFormOpen && (
                    <NewUserForm
                        onClose={handleCloseNewUserModal}
                        projectsManager={projectsManager}
                        onAssignProjects={handleOpenAssignModal} // Pasas la función para que NewUserForm pueda invocarla si es necesario
                        onCreateUser={handleCreateUser} // Callback para cuando un usuario es creado
                        onUpdateUser={handleUpdateUser} // Callback para cuando un usuario es actualizado
                    />
                )}
                {/* {isAssignFormOpen && currentUserForAssignment && (
                <UserProjectAssignmentsModal
                    isOpen={isAssignFormOpen}
                    onClose={() => setIsAssignFormOpen(false)}
                    user={currentUserForAssignment}
                    projects={projects} // Pasar la lista de todos los proyectos
                    onSubmitAssignments={handleAssignProjectsToUser}
                />
            )} */ }
                
                {isLoading ? (
                                <LoadingIcon />
                            ) : (
                                <div id="project-list">
                                    {filteredUsers.length > 0 ? usersListFiltered  : <p>No projects found</p>}
                                </div>
                )}
                {/* Render the NewUserForm conditionally */}
                {isNewUserFormOpen &&
                    <NewUserForm
                        onClose={handleCloseNewUserModal}
                        projectsManager={projectsManager}
                        onAssignProjects={handleOpenAssignModal}
                        onCreateUser={handleCreateUser}
                        onUpdateUser={handleUpdateUser}
                    />}
    {showMessagePopUp && messagePopUpContent && (<MessagePopUp {...messagePopUpContent} />)}

            </section>
        )
    }


// Add display name for debugging purposes
UsersBoardPage.displayName = 'UsersBoardPage'


