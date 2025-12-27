import * as React from 'react';
import { User } from '../classes/User';
import { IProjectAssignment } from '../types';
import { IProject  } from '../classes/Project';
import { EditIcon } from './icons';
import { USER_ROLES_IN_PROJECT } from '../const';

interface UserProjectTeamCardRowProps {
    user: User;
    project: IProject;
    assignment: IProjectAssignment;
    authRole?: string;
    onEditPermissions: (user: User) => void;
}

export const UserProjectTeamCardRow: React.FC<UserProjectTeamCardRowProps> = ({
    user,
    project,
    assignment,
    authRole,
    onEditPermissions,
}) => {
    // Lógica de permisos: solo admins y superadmins pueden editar permisos.
    const canEditPermissions = authRole === 'admin' || authRole === 'superadmin';

    const roleDisplayName = USER_ROLES_IN_PROJECT[assignment.roleInProject] || assignment.roleInProject;

    const assignedDate = React.useMemo(() => {
        if (!assignment.assignedDate) return 'N/A';
        // Maneja Timestamps de Firebase o strings de fecha
        const dateSource = (assignment.assignedDate as any).seconds 
            ? new Date((assignment.assignedDate as any).seconds * 1000)
            : new Date(assignment.assignedDate);
        return isNaN(dateSource.getTime()) ? 'Invalid Date' : dateSource.toLocaleDateString();
    }, [assignment.assignedDate]);

    const handleEditClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (canEditPermissions) {
            onEditPermissions(user);
        }
    };

    return (
        <div className="user-container user-team-container" style={{  }}>
            {/* Checkbox (si se necesitara para acciones en masa en el futuro) */}
            <div className="users-checkbox" onClick={(e) => e.stopPropagation()}>
                <label className="radio">
                    <input
                        name={`bulk-checkbox-${project.id}`}
                        type="checkbox"
                        value={user.id}
                    />
                    <span className="checkmark"></span>
                </label>
            </div>

            {/* Nickname y Avatar */}
            <div className="users-name">
                <div className="users-photo">
                    <img
                        src={user.photoURL || "/assets/photo-users/default-avatar.jpg"}
                        //Usa photoURL o un default
                        alt={user.nickName || "User"}
                        onError={(e) => {
                            // Previene bucles de error si el avatar por defecto también falla
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "/assets/photo-users/default-avatar.jpg";
                        }}
                    />
                </div>
                <div>
                    {user.nickName || 'N/A'}
                </div>
            </div>

            {/* Organization */}
            <div>{user.organization || 'N/A'}</div>

            {/* Role in Project */}
            <div>{roleDisplayName}</div>

            {/* Permissions */}
            <div style={{ textTransform: 'capitalize', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {assignment.permissions?.join(', ') || 'None'}
            </div>

            {/* Join Date */}
            <div>{assignedDate}</div>

            {/* Status */}
            <div
                style={{ textAlign: 'center' }}
            >
                <p
                    className={`user-status-badge status-${user.status?.toLowerCase()}`}
                >
                    {user.status || 'N/A'}
                </p>
            </div>

            {/* Actions */}
            <div
                style={{ position: 'relative', textAlign: 'center' }}
                className="users-edit" onClick={(e) => e.stopPropagation()}
            >
                {canEditPermissions && (
                    <button
                        onClick={handleEditClick}
                        title="Edit User Permissions for this Project"
                        className="btn-secondary"
                        style={{ padding: '5px' }}
                    >
                        <EditIcon size={20} color="var(--color-fontbase)" className='todo-icon-plain' />
                    </button>
                )}
            </div>
        </div>
    );
};

UserProjectTeamCardRow.displayName = 'ProjectTeamUserRow';

