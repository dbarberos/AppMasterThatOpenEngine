import * as React from 'react';
// import { useProjectsManager } from './ProjectsManagerContext';
// import { useUsersManager } from './UsersManagerContext';
import { IProject } from '../classes/Project';
import { User } from '../classes/User';
import { useUserBoardContext } from './UsersBoardPage';

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
    const { projects, users } = useUserBoardContext();

    // const projects = projectsManager.list;
    // const usersByProject = React.useMemo(() => groupUsersByProject(usersManager.list), [usersManager.list]);
    const usersByProject = React.useMemo(() => groupUsersByProject(users), [users]);

    return (
        <div className="users-list" style={{ gap: '2rem' }}>
            {projects.length === 0 && <p>No projects found.</p>}

            {projects.map((project) => (
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
    );
}

UserBoardProjectsTeamsPage.displayName = 'UserBoardProjectsTeamsPage';
