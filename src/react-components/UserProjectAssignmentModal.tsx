import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { UserProjectAssignmentRow } from './UserProjectAssignmentRow';
import { USER_ROL_IN_APP_PERMISSIONS } from '../const';
import type { IUser, IProjectAssignment } from '../types';
import { IProject } from '../classes/Project';

interface UserProjectAssignmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    projects: IProject[]; // Lista de todos los proyectos disponibles
    existingAssignments: { [projectId: string]: IProjectAssignment }; // Asignaciones existentes del usuario
    userRoleInApp: IUser['roleInApp']; // Rol del usuario en la aplicación para permisos por defecto
    onSave: (newAssignments: { [projectId: string]: IProjectAssignment }) => void; // Función para guardar los cambios
}
export const UserProjectAssignmentModal: React.FC<UserProjectAssignmentModalProps> = ({
    isOpen,
    onClose,
    projects, // Lista de proyectos disponibles
    existingAssignments, // Asignaciones existentes del usuario
    userRoleInApp, // Rol del usuario en la aplicación para permisos por defecto
    onSave, // Función para guardar los cambios
}) => {
    // Estado para gestionar las asignaciones que se están editando en el modal.
    // Es una copia de `existingAssignments` para poder cancelar los cambios.
    const [pendingAssignments, setPendingAssignments] = React.useState<{ [projectId: string]: IProjectAssignment }>({});

    // Define el símbolo de cancelación y confirmación. 0x274C es el código Unicode para '❌'.
    const cancelSymbol = String.fromCharCode(0x274C);
    const checkmarkSymbol = String.fromCharCode(0x2713)

    React.useEffect(() => {
        // Cuando el modal se abre, inicializamos el estado interno.
        if (isOpen) {
            // Clonamos las asignaciones para no modificar el estado original directamente.
            setPendingAssignments(JSON.parse(JSON.stringify(existingAssignments || {})));
        }
    }, [isOpen, existingAssignments]);

    // Usamos un portal para renderizar el modal en el body, evitando problemas de z-index.
    const modalRoot = document.body;

    if (!isOpen) {
        return null;
    }

    const handleSelectAll = () => {
        const newAssignments = { ...pendingAssignments };
        projects.forEach((project) => {
            // Si el proyecto no está ya seleccionado, lo añade con valores por defecto.
            if (!newAssignments[project.id!]) {
                newAssignments[project.id!] = {
                    projectId: project.id!,
                    projectName: project.name,
                    roleInProject: '', // Forzar al usuario a seleccionar un rol
                    permissions: USER_ROL_IN_APP_PERMISSIONS[userRoleInApp] || [],
                    assignedDate: new Date(), // Se añade la fecha al seleccionar
                };
            }
        });
        setPendingAssignments(newAssignments);
    };

    const handleDeselectAll = () => {
        // Simplemente limpia todas las asignaciones pendientes.
        // El usuario puede cancelar si no quiere perder las asignaciones originales.
        setPendingAssignments({});
    };

    const handleProjectChange = (projectId: string, isChecked: boolean) => {
        const newAssignments = { ...pendingAssignments };
        if (isChecked) {
            const project = projects.find((p) => p.id === projectId);
            if (!project) return;

            // Si ya existía una asignación, la recupera. Si no, crea una nueva.
            newAssignments[projectId] = existingAssignments[projectId] || {
                projectId: project.id!,
                projectName: project.name,
                roleInProject: '', // Forzar al usuario a seleccionar un rol
                permissions: USER_ROL_IN_APP_PERMISSIONS[userRoleInApp] || [],
            };
        } else {
            // Al desmarcar, simplemente se elimina de las asignaciones pendientes.
            delete newAssignments[projectId];
        }
        setPendingAssignments(newAssignments);
    };

    const handleRoleChange = (projectId: string, role: string) => {
        if (!pendingAssignments[projectId]) return;
        const newAssignments = { ...pendingAssignments };
        newAssignments[projectId].roleInProject = role;
        setPendingAssignments(newAssignments);
    };

    const handlePermissionChange = (projectId: string, permission: string, isChecked: boolean) => {
        const newAssignments = { ...pendingAssignments };
        const assignment = newAssignments[projectId];

        if (!assignment) return;

        // Asegurarse de que el array de permisos exista
        if (!assignment.permissions) {
            assignment.permissions = [];
        }

        const currentPermissions = new Set(assignment.permissions);
        if (isChecked) {
            currentPermissions.add(permission);
        } else {
            currentPermissions.delete(permission);
        }
        assignment.permissions = Array.from(currentPermissions);
        setPendingAssignments(newAssignments);
    };

    const handleSave = () => {
        const finalAssignments = { ...pendingAssignments };
        // Añade la fecha de asignación solo a los proyectos que son nuevos en esta sesión.
        Object.keys(finalAssignments).forEach(projectId => {
            if (!existingAssignments[projectId]) {
                finalAssignments[projectId].assignedDate = new Date();
            } else {
                // Mantiene la fecha original si ya existía
                finalAssignments[projectId].assignedDate = existingAssignments[projectId].assignedDate;
            }
        });
        onSave(finalAssignments);
        onClose();
    };

    // La estructura de clases (modal, modal-content, etc.) es la estándar
    // y debería coincidir con la del modal de importación/exportación.
    return ReactDOM.createPortal(
        <div className="dialog-container">
            {/* Esta es la capa de fondo oscuro. Al hacer clic en ella, se cierra el modal. */}
            <div className="custom-backdrop" onClick={onClose} />
            <dialog
                id="modal-list-of-projects-json"
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',

                }}
                open>
                <div
                    className="list-of-projects-json"
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        height: 'fit-content',
                        width: '600px',
                        padding: 'var(--gap-base)',
                        boxSizing: 'border-box'
                    }}>
                    <header id="modal-header-title" style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: '0', flexShrink: 0 }}>
                        <h4 style={{ marginLeft: '25px' }}>SELECT PROJECT/S TO ASSIGN</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', rowGap: '10px' }}>
                            <button type="button" onClick={handleSelectAll} id="selectAllBtn" className="buttonB">Select all</button>
                            <button type="button" onClick={handleDeselectAll} id="deselectAllBtn" className="buttonB">Deselect all</button>
                        </div>
                    </header>
                    <div style={{ width: '100%', margin: 'var(--gap-base)', flexGrow: 1, }}>
                        <ul id="json-projects-list" style={{ listStyle: 'none', padding: 0, width: '100%', }}>
                            {projects.map((project) => (
                                <UserProjectAssignmentRow
                                    key={project.id}
                                    project={project}
                                    currentAssignment={pendingAssignments[project.id!]}
                                    onProjectChange={handleProjectChange}
                                    onRoleChange={handleRoleChange}
                                    onPermissionChange={handlePermissionChange}
                                />
                            ))}
                        </ul>
                        <div style={{ display: 'flex', flexDirection: 'row', rowGap: '10px', width: '100%', justifyContent: 'flex-end' }}>
                            <div
                                id="buttonEndRight"
                                style={{ width: 'fit-content', }}>
                                <button id="cancel-json-list-btn" type="button" className="buttonC" onClick={onClose} style={{ borderRadius: 'var(--br-circle)', aspectRatio: 1, padding: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    {cancelSymbol}
                                </button>
                                <button id="confirm-json-list" type="button" onClick={handleSave} className="buttonB" style={{ borderRadius: 'var(--br-circle)', aspectRatio: 1, padding: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    {checkmarkSymbol} 
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </dialog>
        </div>
    , modalRoot);
};

UserProjectAssignmentModal.displayName = 'UserProjectAssignmentModal';
