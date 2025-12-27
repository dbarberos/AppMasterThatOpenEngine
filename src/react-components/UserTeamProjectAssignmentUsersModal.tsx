import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { UserTeamProjectAssignmentRow } from './UserTeamProjectAssignmentRow';
import { MessagePopUp, type MessagePopUpProps } from './MessagePopUp';
import { IProject } from '../classes/Project';
import { User as AppUserClass } from '../classes/User';
import type { IProjectAssignment } from '../types';

interface UserTeamProjectAssignmentUsersModalProps {
    isOpen: boolean;
    onClose: () => void;
    targetProject: IProject;
    allUsers: AppUserClass[];
    currentUserRoleInApp?: string;
    onSave: (updatedAssignments: { [userId: string]: IProjectAssignment }) => void;
}

export function UserTeamProjectAssignmentUsersModal({
    isOpen,
    onClose,
    targetProject,
    allUsers,
    onSave,
}: UserTeamProjectAssignmentUsersModalProps) {

    console.log('[TeamModal] Initializing for project:', targetProject?.name);

    const existingAssignmentsMap = React.useMemo(() => {
        const map: { [userId: string]: IProjectAssignment } = {};
        if (!targetProject || !targetProject.id) return map;

        allUsers.forEach(user => {
            const assignment = user.projectsAssigned?.find(p => p.projectId === targetProject.id);
            if (assignment) {
                map[user.id] = assignment;
            }
        });
        return map;
    }, [allUsers, targetProject]);

    const [pendingAssignments, setPendingAssignments] = React.useState<{ [userId: string]: IProjectAssignment }>({});
    const [unlockedUsers, setUnlockedUsers] = React.useState<Set<string>>(new Set());

    const [showMessagePopUp, setShowMessagePopUp] = React.useState(false);
    const [messagePopUpContent, setMessagePopUpContent] = React.useState<MessagePopUpProps | null>(null);

    const cancelSymbol = String.fromCharCode(0x274C);
    const checkmarkSymbol = String.fromCharCode(0x2713);

    React.useEffect(() => {
        if (isOpen) {
            console.log('[TeamModal] Opening. Existing assignments found:', Object.keys(existingAssignmentsMap).length);
            setPendingAssignments(JSON.parse(JSON.stringify(existingAssignmentsMap)));
            setUnlockedUsers(new Set());
        }
    }, [isOpen, existingAssignmentsMap]);

    const modalRoot = document.body;
    if (!isOpen || !targetProject) return null;

    const handleAllowModificationRequest = (userId: string) => {
        setMessagePopUpContent({
            type: 'info',
            title: 'User Already in Team',
            message: 'This user is already assigned to this project. Select "Modify Assignment" to change their role or permissions.',
            actions: ["Understood", "Modify Assignment"],
            onActionClick: {
                "Understood": () => setShowMessagePopUp(false),
                "Modify Assignment": () => {
                    setUnlockedUsers(prev => new Set(prev).add(userId));
                    if (!pendingAssignments[userId]) {
                        const original = existingAssignmentsMap[userId];
                        if (original) {
                            setPendingAssignments(prev => ({ ...prev, [userId]: { ...original } }));
                        }
                    }
                    setShowMessagePopUp(false);
                }
            },
            onClose: () => setShowMessagePopUp(false)
        });
        setShowMessagePopUp(true);
    };

    const handleUserChange = (userId: string, isChecked: boolean) => {
        const newAssignments = { ...pendingAssignments };
        
        if (isChecked) {
            const user = allUsers.find(u => u.id === userId);
            if (!user) return;

            const defaultPermissions: string[] = []; 
            const previous = existingAssignmentsMap[userId];

            newAssignments[userId] = {
                projectId: targetProject.id!,
                projectName: targetProject.name,
                roleInProject: previous?.roleInProject || '',
                permissions: previous?.permissions || defaultPermissions,
                assignedDate: previous?.assignedDate || new Date(),
            };
        } else {
            delete newAssignments[userId];
        }
        setPendingAssignments(newAssignments);
    };

    const handleRoleChange = (userId: string, role: string) => {
        if (!pendingAssignments[userId]) return;
        const newAssignments = { ...pendingAssignments };
        newAssignments[userId].roleInProject = role;
        setPendingAssignments(newAssignments);
    };

    const handlePermissionChange = (userId: string, permission: string, isChecked: boolean) => {
        const newAssignments = { ...pendingAssignments };
        const assignment = newAssignments[userId];
        if (!assignment) return;

        const currentPerms = new Set(assignment.permissions || []);
        if (isChecked) currentPerms.add(permission);
        else currentPerms.delete(permission);

        assignment.permissions = Array.from(currentPerms);
        setPendingAssignments(newAssignments);
    };

    const handleSelectAll = () => {
        const newAssignments = { ...pendingAssignments };
        allUsers.forEach(user => {
            const isAlreadyAssigned = !!existingAssignmentsMap[user.id];
            const isUnlocked = unlockedUsers.has(user.id);

            if (!isAlreadyAssigned || isUnlocked) {
                newAssignments[user.id] = {
                    projectId: targetProject.id!,
                    projectName: targetProject.name,
                    roleInProject: existingAssignmentsMap[user.id]?.roleInProject || '',
                    permissions: existingAssignmentsMap[user.id]?.permissions || [],
                    assignedDate: new Date()
                };
            }
        });
        setPendingAssignments(newAssignments);
    };

    const handleDeselectAll = () => {
        const newAssignments = { ...pendingAssignments };
        allUsers.forEach(user => {
            const isAlreadyAssigned = !!existingAssignmentsMap[user.id];
            const isUnlocked = unlockedUsers.has(user.id);
            
            if (!isAlreadyAssigned || isUnlocked) {
                delete newAssignments[user.id];
            }
        });
        setPendingAssignments(newAssignments);
    };

    const handleSave = () => {
        const assignmentsArray = Object.values(pendingAssignments);
        const missingRoles = assignmentsArray.filter(a => !a.roleInProject);

        if (missingRoles.length > 0) {
             setMessagePopUpContent({
                type: 'warning',
                title: 'Role Selection Required',
                message: `Please select a role for all selected users.`,
                actions: ['OK'],
                onActionClick: { 'OK': () => setShowMessagePopUp(false) },
                onClose: () => setShowMessagePopUp(false)
            });
            setShowMessagePopUp(true);
            return;
        }

        console.log('[TeamModal] Saving assignments:', pendingAssignments);
        onSave(pendingAssignments);
        onClose();
    };

    return ReactDOM.createPortal(
        <div className="dialog-container">
            <div className="custom-backdrop" onClick={onClose} />
            <dialog
                open
                style={{
                    display: 'flex', flexDirection: 'column', justifyContent: 'center',
                    zIndex: 1000
                }}
            >
                <div className="list-of-projects-json"
                    style={{
                        display: 'flex', flexDirection: 'column', height: 'fit-content',
                        width: '700px',
                        padding: 'var(--gap-base)', boxSizing: 'border-box',
                        maxHeight: '90vh'
                    }}
                >
                    <header style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h4>MANAGE TEAM: {targetProject.name.toUpperCase()}</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', rowGap: '10px' }}>
                            <button type="button" onClick={handleSelectAll} className="buttonB">Select all</button>
                            <button type="button" onClick={handleDeselectAll} className="buttonB">Deselect all</button>
                        </div>
                    </header>

                    <div style={{ width: '100%', flexGrow: 1, overflowY: 'auto', paddingRight: '5px' }} className="scrollbar-manage">
                        <ul style={{ listStyle: 'none', padding: 0, width: '100%' }}>
                            {allUsers.map(user => {
                                const isAlreadyAssigned = !!existingAssignmentsMap[user.id];
                                const isModificationAllowed = unlockedUsers.has(user.id);
                                
                                return (
                                    <UserTeamProjectAssignmentRow
                                        key={user.id}
                                        user={user}
                                        currentAssignment={pendingAssignments[user.id]}
                                        isAlreadyAssigned={isAlreadyAssigned}
                                        isModificationAllowed={isModificationAllowed}
                                        onUserChange={handleUserChange}
                                        onRoleChange={handleRoleChange}
                                        onPermissionChange={handlePermissionChange}
                                        onAllowModificationRequest={handleAllowModificationRequest}
                                    />
                                );
                            })}
                        </ul>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'row', rowGap: '10px', width: '100%', justifyContent: 'flex-end', marginTop: '20px' }}>
                        <div style={{ width: 'fit-content', display: 'flex', gap: '15px' }}>
                            <button type="button" className="buttonC" onClick={onClose} style={{ borderRadius: 'var(--br-circle)', aspectRatio: 1, padding: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                {cancelSymbol}
                            </button>
                            <button type="button" onClick={handleSave} className="buttonB" style={{ borderRadius: 'var(--br-circle)', aspectRatio: 1, padding: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                {checkmarkSymbol}
                            </button>
                        </div>
                    </div>
                </div>
            </dialog>
            {showMessagePopUp && messagePopUpContent && <MessagePopUp {...messagePopUpContent} />}
        </div>,
        modalRoot
    );
}

UserTeamProjectAssignmentUsersModal.displayName = 'UserTeamProjectAssignmentUsersModal';
