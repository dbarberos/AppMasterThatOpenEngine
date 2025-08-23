import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { IUser, IProjectAssignment } from '../types';
import { IProject, Project } from '../classes/Project';
import { USER_ROLES_IN_PROJECT } from '../const';

interface Props {
    user: IUser;
    assignment: IProjectAssignment;
    project: Project;
    anchorRef: React.RefObject<HTMLElement>;
    isVisible: boolean;
}

export function UserProjectAssignmentHoverInformation({ user, assignment, project, anchorRef, isVisible }: Props) {
    const [position, setPosition] = React.useState({
        top: 0,
        left: 0,
        placement: 'bottom' as 'top' | 'bottom' 
    });

    // Obtener el nombre legible del rol
    const roleDisplayName = USER_ROLES_IN_PROJECT[assignment.roleInProject] || assignment.roleInProject;

    React.useEffect(() => {
        if (!anchorRef.current || !isVisible) return;
        const rect = anchorRef.current.getBoundingClientRect();
        setPosition({
            top: rect.bottom + window.scrollY + 8,
            left: rect.left + window.scrollX,
            placement: 'bottom' as 'top' | 'bottom',
        });
    }, [isVisible, anchorRef]);

    if (!isVisible || !anchorRef.current) return null;

    return ReactDOM.createPortal(
        <div
            className="todo-hover-banner bottom"
            style={{
                position: 'absolute',
                top: position.top,
                left: position.left,
                zIndex: 2000,
                background: 'var(--color-tododetails-bg)',
                border: `2px solid ${project.backgroundColorAcronym || '#808080'}`,
                borderRadius: 12,
                boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
                padding: '16px',
                minWidth: '220px',
                pointerEvents: 'none',
                fontSize: 'var(--font-base)',
            }}
        >
                        <div className="banner-section">
                <span className="banner-label">Project:</span>
                <span className="banner-value">{project.name}</span>
            </div>
            <div className="banner-section">
                <span className="banner-label">Role:</span>
                <span className="banner-value">{roleDisplayName}</span>
            </div>
            <div className="banner-section">
                <span className="banner-label">Permissions:</span>
                <span className="banner-value">
                    {assignment.permissions?.length
                        ? assignment.permissions.join(', ')
                        : 'None'}
                </span>
            </div>
            <div className="banner-section">
                <span className="banner-label">User:</span>
                <span className="banner-value">{user.nickName || user.email}</span>
            </div>
            <div className="banner-section">
                <span className="banner-label">Assigned since:</span>
                <span className="banner-value">
                    {assignment.assignedDate
                        ? (() => {
                            // Si es un objeto tipo Firebase Timestamp
                            if (
                                typeof assignment.assignedDate === 'object' &&
                                typeof assignment.assignedDate.seconds === 'number'
                            ) {
                                const date = new Date(assignment.assignedDate.seconds * 1000);
                                return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString();
                            }
                            // Si es un string o número
                            const date = new Date(assignment.assignedDate);
                            return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString();
                        })()
                        : 'N/A'}
                </span>
            </div>

            {/* Add more info if needed */}
        </div>,
        document.body
    );
}