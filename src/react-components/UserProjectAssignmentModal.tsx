import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { UserProjectAssignmentRow } from './UserProjectAssignmentRow';
import { MessagePopUp, type MessagePopUpProps } from './MessagePopUp';
import { USER_ROL_IN_APP_PERMISSIONS } from '../const';
import type { IUser, IProjectAssignment } from '../types';
import { IProject } from '../classes/Project';

interface UserProjectAssignmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    projects: IProject[]; // Lista de todos los proyectos disponibles
    existingAssignments: { [projectId: string]: IProjectAssignment }; // Asignaciones existentes del usuario
    userRoleInApp: IUser['roleInApp']; // Rol del usuario en la aplicación para permisos por defecto
    filterProjectId?: string; // ID del proyecto para filtrar (opcional)
    onSave: (newAssignments: { [projectId: string]: IProjectAssignment }) => void; // Función para guardar los cambios
}
export const UserProjectAssignmentModal: React.FC<UserProjectAssignmentModalProps> = ({
    isOpen,
    onClose,
    projects, // Lista de proyectos disponibles
    existingAssignments, // Asignaciones existentes del usuario
    userRoleInApp, // Rol del usuario en la aplicación para permisos por defecto
    filterProjectId, // ID del proyecto para filtrar (opcional)
    onSave, // Función para guardar los cambios
}) => {

    console.log('[Modal] Props recibidas:', { filterProjectId, projectsCount: projects.length });

        // --- Normalización robusta de existingAssignments ---
    // Si es un array, conviértelo a objeto indexado por projectId para un acceso mas rápido.
    const normalizedAssignments: { [projectId: string]: IProjectAssignment } = React.useMemo(() => {
        if (Array.isArray(existingAssignments)) {
            // return Object.fromEntries(
            //     existingAssignments
            //         .filter(a => a && a.projectId)
            //         .map(a => [a.projectId, a])
            // );

            const obj: { [projectId: string]: IProjectAssignment } = {};
            for (const assignment of existingAssignments) {
                if (assignment && assignment.projectId) {
                    obj[assignment.projectId] = assignment;
                }
            }
            return obj;

        }
        return existingAssignments || {};
    }, [existingAssignments]);

    // Estado para gestionar las asignaciones que se están editando en el modal.
    // Es una copia de `existingAssignments` para poder cancelar los cambios.
    const [pendingAssignments, setPendingAssignments] = React.useState<{ [projectId: string]: IProjectAssignment }>({});
    const [unlockedProjects, setUnlockedProjects] = React.useState<Set<string>>(new Set());

    const [showMessagePopUp, setShowMessagePopUp] = React.useState(false);
    const [messagePopUpContent, setMessagePopUpContent] = React.useState<MessagePopUpProps | null>(null);

    // Define el símbolo de cancelación y confirmación. 0x274C es el código Unicode para '❌'.
    const cancelSymbol = String.fromCharCode(0x274C);
    const checkmarkSymbol = String.fromCharCode(0x2713)

    React.useEffect(() => {
        // Cuando el modal se abre, inicializamos el estado interno.
        if (isOpen) {
            // Clonamos las asignaciones para no modificar el estado original directamente.
            setPendingAssignments(JSON.parse(JSON.stringify(normalizedAssignments)));
            setUnlockedProjects(new Set()); // Resetea los proyectos desbloqueados cada vez que se abre el modal
        }
    }, [isOpen, normalizedAssignments]);

    // Usamos un portal para renderizar el modal en el body, evitando problemas de z-index.
    const modalRoot = document.body;

    if (!isOpen) {
        return null;
    }

    const handleAllowModificationRequest = (projectId: string) => {        
        setMessagePopUpContent({
            type: 'info',
            title: 'Project Already Assigned',
            message: 'This project is already assigned to the user. Select it only if you want to modify the existing role or permissions.',
            actions: ["Understood", "Modify Assignment"],
            onActionClick: {
                "Understood": () => setShowMessagePopUp(false),
                "Modify Assignment": () => {
                    setUnlockedProjects(prev => new Set(prev).add(projectId));
                    // Asegurarse de que el proyecto esté seleccionado en las asignaciones pendientes
                    // para que se muestren los controles de rol/permisos.
                    if (!pendingAssignments[projectId]) {
                        handleProjectChange(projectId, true);
                    }
                    setShowMessagePopUp(false);
                }
            },
            onClose: () => setShowMessagePopUp(false)
        });
        setShowMessagePopUp(true);
    };

   // Filtra los proyectos a mostrar. Si filterProjectId está presente, muestra solo ese.
    const projectsToDisplay = React.useMemo(() => {
        console.log('[Modal] Calculando projectsToDisplay. filterProjectId:', filterProjectId);
        if (filterProjectId) {
            return projects.filter(p => p.id === filterProjectId);
        }
        console.log('[Modal] Filtrado desactivado. Mostrando todos los proyectos:', projects.length);
        return projects;
    }, [projects, filterProjectId]);



    const handleSelectAll = () => {
        const newAssignments = { ...pendingAssignments };
        projectsToDisplay.forEach((project) => {
        // projects.forEach((project) => {
            // Solo seleccionar si el proyecto NO está asignado y bloqueado
            const isAlreadyAssigned = !!normalizedAssignments[project.id!];
            const isModificationAllowed = unlockedProjects.has(project.id!);
            if (!isAlreadyAssigned || isModificationAllowed) {                
                newAssignments[project.id!] = {
                    projectId: project.id!,
                    projectName: project.name,
                    // roleInProject: '', // Forzar al usuario a seleccionar un rol
                    roleInProject: normalizedAssignments[project.id!]?.roleInProject || '', //Mantener rol si existe
                    permissions: userRoleInApp ? USER_ROL_IN_APP_PERMISSIONS[userRoleInApp] || [] : [],
                    assignedDate: new Date(), // Se añade la fecha al seleccionar
                };
            }
            // Si está asignado y bloqueado, no modificar
        });
        setPendingAssignments(newAssignments);
    };

    const handleDeselectAll = () => {
        const newAssignments = { ...pendingAssignments };
        // projects.forEach((project) => {
        projectsToDisplay.forEach((project) => {
            const isAlreadyAssigned = !!normalizedAssignments[project.id!];
            const isModificationAllowed = unlockedProjects.has(project.id!);
            // Solo desmarcar si el proyecto NO está asignado y bloqueado
            if (!isAlreadyAssigned || isModificationAllowed) {
                delete newAssignments[project.id!];
            }
            // Si está asignado y bloqueado, no modificar
    });
        // Revierte las asignaciones al estado original y bloquea de nuevo los proyectos modificados.
        
        setPendingAssignments(newAssignments);
        // Esto previene la eliminación accidental de asignaciones existentes.
        // setPendingAssignments(JSON.parse(JSON.stringify(existingAssignments || {})));
        // Opcional: Si quieres bloquear de nuevo los proyectos desbloqueados, puedes limpiar unlockedProjects aquí.
        setUnlockedProjects(new Set());
    };

    const handleProjectChange = (projectId: string, isChecked: boolean) => {
        const newAssignments = { ...pendingAssignments };
        if (isChecked) {
            // Si se selecciona, añade la asignación 
            const project = projects.find((p) => p.id === projectId);
            if (!project) return;

            // Obtener los permisos por defecto basados en el rol del usuario en la aplicación.
            const defaultPermissions = (userRoleInApp && USER_ROL_IN_APP_PERMISSIONS[userRoleInApp]) || [];
            console.log('[UserProjectAssignmentModal] userRoleInApp:', userRoleInApp);
            console.log('[UserProjectAssignmentModal] USER_ROL_IN_APP_PERMISSIONS:', USER_ROL_IN_APP_PERMISSIONS);
            console.log('[UserProjectAssignmentModal] defaultPermissions:', defaultPermissions);

            // Comprobar si ya existía una asignación para preservar datos como el rol.
            
            
            // Si el usuario vuelve a marcar el proyecto, SIEMPRE asigna los permisos por defecto
            newAssignments[projectId] = {
                projectId: project.id!,
                projectName: project.name,
                // Si ya existía, mantener el rol. Si no, dejarlo vacío para que se seleccione.
                roleInProject: pendingAssignments[projectId]?.roleInProject || '',
                // roleInProject: '',
                // roleInProject: existingAssignment ? existingAssignment.roleInProject : '',
                // Siempre aplicar los permisos por defecto al seleccionar/re-seleccionar.
                permissions: defaultPermissions,
                // Si ya existía, mantener la fecha de asignación. Si no, crear una nueva.
                assignedDate: pendingAssignments[projectId]?.assignedDate || new Date(),
                // assignedDate: existingAssignment ? existingAssignment.assignedDate : new Date(),
            };
        } else {
            // Si se desmarca, elimina la asignación
            delete newAssignments[projectId];

        }
        setPendingAssignments(newAssignments);
        console.log('[UserProjectAssignmentModal] pendingAssignments after change:', newAssignments);
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
        // Convertir el objeto de asignaciones pendientes a un array para una validación más sencilla.
        const assignmentsArray = Object.values(pendingAssignments);

        // 1. Validar que todos los proyectos seleccionados tengan un rol asignado.
        const assignmentsWithoutRole = assignmentsArray.filter(
            (assignment) => !assignment.roleInProject || assignment.roleInProject.trim() === ''
        );

        if (assignmentsWithoutRole.length > 0) {
            const projectNames = assignmentsWithoutRole.map(a => a.projectName).join(', ');
            setMessagePopUpContent({
                type: 'warning',
                title: 'Role Selection Required',
                message: `Please select a role for the following project(s): ${projectNames}`,
                actions: ['OK'],
                onActionClick: {
                    'OK': () => setShowMessagePopUp(false)
                },
                onClose: () => setShowMessagePopUp(false)
            });
            setShowMessagePopUp(true);
            return; // Detiene el proceso de guardado.
        }

        // 2. (Salvaguarda) Filtrar cualquier asignación que pudiera tener un projectId inválido.
        //    Esto previene el error `doc() cannot be called with an empty path`.
        const validAssignments = assignmentsArray.filter(assignment => {
            const isValid = typeof assignment.projectId === 'string' && assignment.projectId.trim() !== '';
            if (!isValid) {
                console.error("Invalid project assignment found and filtered out (missing projectId):", assignment);
            }
            return isValid;
        });

        // 3. Reconstruir el objeto de asignaciones solo con las válidas y añadir fechas a las nuevas.
        const finalAssignments: { [projectId: string]: IProjectAssignment } = {};
        validAssignments.forEach(assignment => {            
            finalAssignments[assignment.projectId] = assignment;
        });

        onSave(finalAssignments);
        onClose();
    };


    const projectAssignmentRows = React.useMemo(() => {
        // return projects.map((project) => {
        return projectsToDisplay.map((project) => {
            const isAlreadyAssigned = !!normalizedAssignments[project.id!];
            const isModificationAllowed = unlockedProjects.has(project.id!);
            console.log('Modal Row:', {
            projectId: project.id,
            isAlreadyAssigned,
            isModificationAllowed,
            unlockedProjects: Array.from(unlockedProjects),
                existingAssignments,
            
            })
                console.log('existingAssignments keys:', Object.keys(existingAssignments));
                console.log('existingAssignments:', existingAssignments);;
            return (
                <UserProjectAssignmentRow
                    key={project.id}
                    project={project}
                    currentAssignment={pendingAssignments[project.id!]}
                    isAlreadyAssigned={isAlreadyAssigned}
                    isModificationAllowed={isModificationAllowed}
                    onProjectChange={handleProjectChange}
                    onRoleChange={handleRoleChange}
                    onPermissionChange={handlePermissionChange}
                    onAllowModificationRequest={handleAllowModificationRequest}
                />
            );
        });
    }, [projectsToDisplay, normalizedAssignments, unlockedProjects, pendingAssignments, handleProjectChange, handleRoleChange, handlePermissionChange, handleAllowModificationRequest]);




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
                         {/* Ocultar título y botones si estamos en modo de edición única */}
                        {!filterProjectId && (
                            <>


                                <h4 style={{ marginLeft: '25px' }}>SELECT PROJECT/S TO ASSIGN</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', rowGap: '10px' }}>
                                    <button type="button" onClick={handleSelectAll} id="selectAllBtn" className="buttonB">Select all</button>
                                    <button type="button" onClick={handleDeselectAll} id="deselectAllBtn" className="buttonB">Deselect all</button>
                                </div>
                            </>
                        )}
                        {filterProjectId && <h4 style={{ marginLeft: '25px' }}>EDIT USER PERMISSIONS</h4>}


                    </header>
                    <div style={{ width: '100%', margin: 'var(--gap-base)', flexGrow: 1, }}>
                        <ul id="json-projects-list" style={{ listStyle: 'none', padding: 0, width: '100%', }}>
                            {/* {projects.map((project) => {
                                {projectsToDisplay.map((project) => {
                                const isAlreadyAssigned = !!existingAssignments[project.id!];
                                const isModificationAllowed = unlockedProjects.has(project.id!);
                                return (
                                    <UserProjectAssignmentRow
                                        key={project.id}
                                        project={project}
                                        currentAssignment={pendingAssignments[project.id!]}
                                        isAlreadyAssigned={isAlreadyAssigned}
                                        isModificationAllowed={isModificationAllowed}
                                        onProjectChange={handleProjectChange}
                                        onRoleChange={handleRoleChange}
                                        onPermissionChange={handlePermissionChange}
                                        onAllowModificationRequest={handleAllowModificationRequest}
                                    />
                                );
                            })} */}
                            {projectAssignmentRows}
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
            {showMessagePopUp && messagePopUpContent && <MessagePopUp {...messagePopUpContent} />}
        </div>
    , modalRoot);
};

UserProjectAssignmentModal.displayName = 'UserProjectAssignmentModal';
