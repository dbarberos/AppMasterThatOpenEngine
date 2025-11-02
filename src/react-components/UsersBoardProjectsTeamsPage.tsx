import * as React from 'react';
import * as Router from 'react-router-dom';
// import { useProjectsManager } from './ProjectsManagerContext';
// import { useUsersManager } from './UsersManagerContext';
import { IProject, Project, } from '../classes/Project';
import { User as AppUserClass} from '../classes/User';
import { useUserBoardContext} from './UsersBoardPage';
import { ProjectSelector, UserCardRow, UsersSortMenu, UserProjectTeamCardRow, type SortOption } from '../react-components'; 
import { AddIcon, EditIcon, TrashIcon } from './icons'

/**
 * Agrupa los usuarios por el ID del proyecto.
 * @param users - La lista completa de usuarios.
 * @returns Un objeto donde las claves son IDs de proyecto y los valores son arrays de usuarios.
 */
const groupUsersByProject = (users: AppUserClass[]): { [projectId: string]: AppUserClass[] } => {
    const grouped: { [projectId: string]: AppUserClass[] } = {};

    for (const user of users) {
        if (user.projectsAssigned && user.projectsAssigned.length > 0) {
            for (const assignment of user.projectsAssigned) {
                if (!grouped[assignment.projectId]) {
                    grouped[assignment.projectId] = [];
                }
                grouped[assignment.projectId].push(user);
            }
        }
    }
    return grouped;
};


export function UserBoardProjectsTeamsPage() {
    // const projectsManager = useProjectsManager();
    // const usersManager = useUsersManager();
    // const { projects, users, selectedProject, onProjectSelect } = useUserBoardContext();

    //const { projects, users, onProjectSelect } = useUserBoardContext();
    const {
        projects,
        users,
        onProjectSelect,
        onAssignProjects,
        onSortTeams: onSort, // Renombramos la prop del contexto para claridad
        onInviteUser,
        onEditUser,
        onDeleteUser,
        userProfile,
        currentUser,
    } = useUserBoardContext();


    // Estados y ref para el menú de ordenación
    const [isSortMenuOpen, setIsSortMenuOpen] = React.useState(false);
    const sortButtonRef = React.useRef<HTMLButtonElement>(null);

    const toggleSortMenu = React.useCallback(() => {
        setIsSortMenuOpen(prev => !prev);
    }, []);


    const { projectId } = Router.useParams<{ projectId: string }>();


    // const projects = projectsManager.list;
    // const usersByProject = React.useMemo(() => groupUsersByProject(usersManager.list), [usersManager.list]);
    const usersByProject = React.useMemo(() => groupUsersByProject(users), [users]);

    // // Filtra los proyectos a mostrar basándose en el proyecto seleccionado
    // const projectToDisplay = React.useMemo(() => {
    //     if (selectedProject) {
    //         const project = projects.find(p => p.id === selectedProject);
    //         return project ? [project] : [];
    //     }
    //     return null; // Si no hay selección, no muestres ningno
    // }, [projects, selectedProject]);


    // Filtra los proyectos a mostrar basándose en el projectId de la URL.
    // Si no hay projectId, muestra todos los proyectos.
    const projectsToDisplay = React.useMemo(() => {
        if (projectId) {
            const project = projects.find(p => p.id === projectId);
            return project ? [project] : [];
        }
        // // Si no hay projectId en la URL, muestra todos los proyectos que tienen usuarios asignados.
        // return projects.filter(p => usersByProject[p.id!]?.length > 0);

        // Si no hay projectId en la URL, no se muestra ningún proyecto.
        return [];


    }, [projects, projectId, usersByProject]);



    // 1. Define un proyecto "placeholder" que se mostrará cuando no haya selección.
    // Le damos un ID nulo para que al seleccionarlo (aunque no debería ser posible), se comporte como "ninguno".
    const placeholderProject: Project = {
        id: '', // Changed from null to empty string
        name: "Select a project...",
        description: "",
        status: "Pending",
        userRole: "Architect",
        finishDate: new Date(),
        cost: 0,
        progress: 0,
        acronym: "...",
        businessUnit: "Other",
        todoList: [],
    };


    // El proyecto actualmente seleccionado para el selector, basado en el ID de la URL.
    // Si no hay ID, usamos nuestro placeholder.
    const currentProject = React.useMemo(() => {
        // return projects.find(p => p.id === projectId) || null;
        return projects.find(p => p.id === projectId) || placeholderProject;
    }, [projects, projectId]);



    // Lógica de permisos para el botón de invitar
    const canManageUsers = userProfile?.roleInApp === 'admin' || userProfile?.roleInApp === 'superadmin';


    return (
        <>
            {/* --- HEADER SECUNDARIO --- */}
            <div className="header-user-page-content" style={{ justifyContent: 'space-between' }}>
                <div style={{ display: "flex", flexDirection: "row", columnGap: 20, alignItems: 'center' }}>
                    <h3                        
                        className='projectteam-title-active'
                    >
                        {currentProject.name}
                    </h3>
                    
                    <ProjectSelector
                        // currentProject={projects.find(p => p.id === selectedProject) || null}
                        currentProject={currentProject}
                        projectsList={projectId ? projects : [placeholderProject, ...projects]}
                        onProjectSelect={onProjectSelect}
                    />
                </div>

                {/* Lado Derecho: Botones de Acción */}
                <div style={{ display: "flex", flexDirection: "row", columnGap: 20 }}>
                    <button
                        ref={sortButtonRef}
                        onClick={toggleSortMenu}
                        style={{ width: "auto" }}
                    >
                        
                        <p style={{ color: "var(--color-fontbase-dark)" }}>Sort By</p>
                        <span className="material-icons-round">expand_more</span>
                    </button>

                    {canManageUsers && (
                        <button
                            // onClick={() => onInviteUser()} // La lógica se definirá después
                            id="new-user-btn"
                            style={{ whiteSpace: 'nowrap' }}
                            title="Invite a User to this Team"
                        >
                            <AddIcon size={24} className="todo-icon-plain" color="var(--color-fontbase-dark)" />
                            <p style={{ color: "var(--color-fontbase-dark)" }}>Manage this Team</p>
                        </button>
                    )}
                </div>
            </div>

            <div className="users-list" style={{ gap: '1.5rem'}}>
                
                
                {projectsToDisplay.length === 0 && (
                    projectId
                        ? <p>Project not found or no users assigned.</p>
                        : <p>Select a project from the dropdown to view its team.</p>
                )}

                {projectsToDisplay.length > 0 && (
                    <>
                        {/* Cabecera de la tabla/lista de usuarios por proyecto */ }
                        <div 
                            className="projectteam-container-header"
                            style={{ border: "none", backgroundColor: "transparent" }}
                        >
                            <div style={{ width: '5%' }} />
                            <h5 style={{ width: '20%' }}></h5>
                            {/* <h5 style={{ width: '20%' }}></h5> */}
                            <button
                                className="header-sort-button"
                                onClick={() => onSort('organization')}
                            >
                                ORGANIZATION
                            </button>
                            <button
                                    style={{ width: '20%', whiteSpace: 'nowrap' }}
                                    className="header-sort-button"
                                onClick={() => onSort('roleInApp')}
                            >
                                ROLE IN PROJECT
                            </button>
                            <h5 style={{ width: '15%' }}>PERMISSIONS</h5>
                            <h5 style={{ width: '15%', whiteSpace: 'nowrap' }}>JOIN DATE</h5>
                            <button
                                style={{ justifyContent: 'center' }}
                                className="header-sort-button" onClick={() => onSort('status')}>
                                STATUS
                            </button>                            
                            <h5 style={{ textAlign: 'center' }}>ACTIONS</h5>
                        </div>

                        <div>
                            {projectsToDisplay.map((project) => (
                                <div
                                    key={project.id}
                                    className="project-team-card"
                                    style={{
                                        
                                    }}
                                >
                                    <div className="project-team-users-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        {(usersByProject[project.id!] || []).length > 0 ? (
                                            usersByProject[project.id!].map(user => {
                                                const assignment = user.projectsAssigned?.find(a => a.projectId === project.id);
                                                if (!assignment) return null; //No debería pasar si está en este grupo
                                                return (
                                                    <UserProjectTeamCardRow
                                                        key={user.id}
                                                        user={user}
                                                        project={project}
                                                        assignment={assignment}
                                                        authRole={userProfile?.roleInApp}
                                                        onEditPermissions={onAssignProjects} //Reutilizar el handler del contexto
                                                    />
                                                )
                                            })
                                        ) : (
                                            <p style={{ color: 'var(--color-fontbase)', fontStyle: 'italic' }}>No users assigned to this project.</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {isSortMenuOpen && (
                <UsersSortMenu
                    isOpen={isSortMenuOpen}
                    onClose={() => setIsSortMenuOpen(false)}
                    onSort={onSort}
                    buttonRef={sortButtonRef}
                    sortOptions={[
                        { key: 'nickName', label: 'Nickname' },
                        { key: 'organization', label: 'Organization' },
                        { key: 'roleInProject', label: 'Role in Project' },
                        { key: 'status', label: 'Status' },
                    ] as SortOption[]}
                />
            )}
        </>
    )
}


// Add display name for debugging purposes
UserBoardProjectsTeamsPage.displayName = 'UserBoardProjectsTeamsPage';
