import * as React from 'react';
import * as Router from 'react-router-dom';
// import { useProjectsManager } from './ProjectsManagerContext';
// import { useUsersManager } from './UsersManagerContext';
import { IProject, Project } from '../classes/Project';
import { User } from '../classes/User';
import { useUserBoardContext } from './UsersBoardPage';
import { ProjectSelector  } from '../react-components'; 
/**
 * Agrupa los usuarios por el ID del proyecto.
 * @param users - La lista completa de usuarios.
 * @returns Un objeto donde las claves son IDs de proyecto y los valores son arrays de usuarios.
 */
const groupUsersByProject = (users: User[]): { [projectId: string]: User[] } => {
    const grouped: { [projectId: string]: User[] } = {};

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
    const { projects, users, onProjectSelect } = useUserBoardContext();
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








    return (
        <>
            {/* --- HEADER SECUNDARIO --- */}
            <div className="header-user-page-content">
                <div style={{ display: "flex", flexDirection: "row", columnGap: 20, alignItems: 'center' }}>
                    <p style={{ fontSize: 'var(--font-lg)', fontWeight: 'normal', color: 'var(--color-fontbase-dark)' }}>Filter by Project: </p>
                    <ProjectSelector
                        // currentProject={projects.find(p => p.id === selectedProject) || null}
                        currentProject={currentProject}
                        projectsList={projectId ? projects : [placeholderProject, ...projects]}
                        onProjectSelect={onProjectSelect}
                    />
                </div>
            </div>

            <div className="users-list" style={{ gap: '2rem', paddingTop: '20px', }}>
                
                {/* {projectToDisplay && projectToDisplay.length === 0 && (
                    selectedProject */}
                {projectsToDisplay.length === 0 && (
                    projectId
                        ? <p>Project not found or no users assigned.</p> 
                        : <p>Select a project from the dropdown to view its team.</p>
                )}

                {/* {projectToDisplay && projectToDisplay.map((project) => ( */}
                {projectsToDisplay.map((project) => (
                    <div key={project.id} className="project-team-card" style={{
                        backgroundColor: 'var(--background-200)',
                        padding: '20px',
                        borderRadius: 'var(--br-xs)',
                        border: '1px solid var(--color-border)'
                    }}>
                        <h3 style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '10px', marginBottom: '15px' }}>
                            {project.name}
                        </h3>
                        <div className="project-team-users-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {(usersByProject[project.id!] || []).length > 0 ? (
                                usersByProject[project.id!].map(user => (
                                    <div key={user.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <img
                                            src={user.photoURL || "/assets/photo-users/default-avatar.jpg"}
                                            alt={user.nickName}
                                            style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                                            onError={(e) => { e.currentTarget.src = "/assets-photo-users/default-avatar.jpg"; }}
                                        />
                                        <div>
                                            <p style={{ fontWeight: 600 }}>{user.nickName || user.email}</p>
                                            <p style={{ fontSize: 'var(--font-sm)', color: 'var(--color-fontbase-dark)' }}>
                                                {user.roleInApp}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p style={{ color: 'var(--color-fontbase-dark)', fontStyle: 'italic' }}>No users assigned to this project.</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}

UserBoardProjectsTeamsPage.displayName = 'UserBoardProjectsTeamsPage';
