import * as React from 'react';
import { USER_ROLES_IN_PROJECT, USER_PERMISSIONS } from '../const';
import type { IUser, IProjectAssignment } from '../types';
import { User as AppUserClass } from '../classes/User';

interface UserTeamProjectAssignmentRowProps {
    user: AppUserClass | IUser;
    currentAssignment?: IProjectAssignment;
    isAlreadyAssigned: boolean;
    isModificationAllowed: boolean;
    onUserChange: (userId: string, isChecked: boolean) => void;
    onRoleChange: (userId: string, role: string) => void;
    onPermissionChange: (userId: string, permission: string, isChecked: boolean) => void;
    onAllowModificationRequest: (userId: string) => void;
}

export function UserTeamProjectAssignmentRow({
    user,
    currentAssignment,
    isAlreadyAssigned,
    isModificationAllowed,
    onUserChange,
    onRoleChange,
    onPermissionChange,
    onAllowModificationRequest,
}: UserTeamProjectAssignmentRowProps) {

    const [isExpanded, setIsExpanded] = React.useState(false);

    React.useEffect(() => {
        if (isAlreadyAssigned && !isModificationAllowed) {
            setIsExpanded(false);
        } else if (isModificationAllowed) {
            setIsExpanded(true);
        }
    }, [isAlreadyAssigned, isModificationAllowed]);

    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        console.log(`[Row] Checkbox changed for user ${user.id}: ${event.target.checked}`);
        onUserChange(user.id, event.target.checked);
        if (event.target.checked) setIsExpanded(true);
        else setIsExpanded(false);
    };

    const handleRoleSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
        console.log(`[Row] Role changed for user ${user.id}: ${event.target.value}`);
        onRoleChange(user.id, event.target.value);
    };

    const handlePermissionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name: permissionKey, checked } = event.target;
        console.log(`[Row] Permission ${permissionKey} changed for user ${user.id}: ${checked}`);
        onPermissionChange(user.id, permissionKey, checked);
    };

    const isUserSelected = !!currentAssignment;
    const isCheckboxDisabled = isAlreadyAssigned && !isModificationAllowed;

    const nameStyle: React.CSSProperties = isCheckboxDisabled
        ? { color: 'orange', fontWeight: 500 }
        : {};

    const rowClassName = [
        'project-assignment-row',
        isAlreadyAssigned && !isModificationAllowed && 'disabled-checkbox',
        isAlreadyAssigned && isModificationAllowed && 'overwrite-checkbox',
        isExpanded && 'expanded-row',
    ].filter(Boolean).join(' ');

    const displayName = (user as any).nickName || user.name || 'Unknown User';

    return (
        <div
            className={rowClassName}
            style={{
                display: 'flex', flexDirection: 'column', alignItems: 'stretch', width: '100%', padding: '8px 0',
                borderBottom: '1px solid var(--color-border)',
                backgroundColor: isCheckboxDisabled
                    ? 'var(--color-bg-disabled)'
                    : (isAlreadyAssigned && isModificationAllowed)
                        ? 'var(--color-bg-warning)'
                        : 'transparent'
            }}
        >
            <div className="checkbox-json" style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '8px 0', fontSize: 'var(--font-xl)' }}>
                <label className='radio' style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                        type="checkbox"
                        value={user.id}
                        checked={isUserSelected}
                        onChange={handleCheckboxChange}
                        disabled={isCheckboxDisabled}
                    />
                    <span className="checkmark"></span>
                </label>
                <span
                    style={{
                        ...nameStyle,
                        fontWeight: isAlreadyAssigned ? 'bold' : 'normal',
                        color: isCheckboxDisabled
                            ? 'var(--color-warning1)'
                            : 'var(--color-fontbase)'
                    }}
                > {displayName} </span>

                {isCheckboxDisabled && (
                    <span
                        className="assignment-q-mark"
                        onClick={() => onAllowModificationRequest(user.id)}
                        style={{
                            cursor: 'pointer',
                            marginLeft: '8px',
                            fontWeight: 'bold',
                            color: 'var(--color-warning1)',
                            fontSize: '1.2rem'
                        }}
                        title="User already in team. Click to modify role/permissions."
                    >?</span>
                )}
            </div>

            {isUserSelected && (
                <div className="controls-container"
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'flex-end',
                        gap: '24px',
                        width: '100%',
                        padding: '10px 0'
                    }}
                >
                    <div className="role-selector-container">
                        <select
                            onChange={handleRoleSelect}
                            value={currentAssignment?.roleInProject || ''}
                            style={{
                                padding: '8px',
                                borderRadius: 'var(--br-sm)',
                                border: '1px solid var(--color-border)',
                                background: 'var(--color-bg1)',
                                color: isCheckboxDisabled ? 'var(--color-warning1)' : 'var(--color-fontbase)',
                                cursor: isCheckboxDisabled ? 'none' : 'pointer',
                                fontSize: 'var(--font-lg)',
                            }}
                            disabled={isCheckboxDisabled}
                        >
                            <option value="" disabled>Select a role...</option>
                            {Object.entries(USER_ROLES_IN_PROJECT).map(([key, value]) => (
                                <option key={key} value={key}>{value}</option>
                            ))}
                        </select>
                    </div>

                    <div
                        className="permissions-container"
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 'var(--gap-lg)',
                            marginRight: '50px',
                        }}
                    >
                        {Object.entries(USER_PERMISSIONS).map(([key, value]) => (
                            <div
                                key={key}
                                className="permission-item"
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}>
                                <span
                                    style={{
                                        fontSize: 'var(--font-lg)',
                                        color: isCheckboxDisabled ? 'var(--color-warning1)' : 'var(--color-fontbase)',
                                        marginBottom: '4px'
                                    }}>{value}</span>
                                <label className="radio">
                                    <input
                                        type="checkbox"
                                        name={key}
                                        checked={currentAssignment?.permissions?.includes(key) || false}
                                        onChange={handlePermissionChange}
                                        disabled={isCheckboxDisabled}
                                    />
                                    <span className="checkmark"></span>
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

UserTeamProjectAssignmentRow.displayName = 'UserTeamProjectAssignmentRow';
