import * as React from 'react';
import { USER_ROLES_IN_PROJECT, USER_PERMISSIONS } from '../const';
import type { IUser, IProjectAssignment } from '../types';
import { IProject } from '../classes/Project';

interface UserProjectAssignmentRowProps {
    project: IProject;
    currentAssignment?: IProjectAssignment; // La asignación pendiente en el modal
    isAlreadyAssigned: boolean;
    isModificationAllowed: boolean;
    onProjectChange: (projectId: string, isChecked: boolean) => void;
    onRoleChange: (projectId: string, role: string) => void;
    onPermissionChange: (projectId: string, permission: string, isChecked: boolean) => void;
    onAllowModificationRequest: (projectId: string) => void;
}

export const UserProjectAssignmentRow: React.FC<UserProjectAssignmentRowProps> = ({
    project,
    currentAssignment,
    isAlreadyAssigned,
    isModificationAllowed,
    onProjectChange,
    onRoleChange,
    onPermissionChange,
    onAllowModificationRequest,
}) => {
    // Estado local para controlar si el panel está desplegado
    const [isExpanded, setIsExpanded] = React.useState(false);

    // Si el proyecto está asignado y no se permite modificar, no se despliega por defecto
    React.useEffect(() => {
        if (isAlreadyAssigned && !isModificationAllowed) {
            setIsExpanded(false);
        } else if (isModificationAllowed) {
            setIsExpanded(true);
        }
    }, [isAlreadyAssigned, isModificationAllowed]);


    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        onProjectChange(project.id!, event.target.checked);
        if (event.target.checked) setIsExpanded(true);
        else setIsExpanded(false);
    };

    const handleRoleSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
        onRoleChange(project.id!, event.target.value);
    };

    const handlePermissionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name: permissionKey, checked } = event.target;
        onPermissionChange(project.id!, permissionKey, checked);
    };

        const handleQuestionMarkClick = () => {
        onAllowModificationRequest(project.id!);
    };


// Debug logs para verificar props y estado
    console.log('UserProjectAssignmentRow:', {
        projectId: project.id,
        projectName: project.name,
        isAlreadyAssigned,
        isModificationAllowed,
        currentAssignment,
    });
    console.log('Checkbox should be disabled?', {
    projectId: project.id,
    isCheckboxDisabled: isAlreadyAssigned && !isModificationAllowed,
});

    // Constantes para lógica visual y de interacción
    const isProjectSelected = !!currentAssignment;
    const isCheckboxDisabled = isAlreadyAssigned && !isModificationAllowed;

    // Estilos condicionales
    const nameStyle: React.CSSProperties = isCheckboxDisabled
        ? { color: 'orange', fontWeight: 500 }
        : {};

    const rowClassName = [
        'project-assignment-row',
        // isProjectSelected && 'selected',
        isAlreadyAssigned && !isModificationAllowed && 'disabled-checkbox' ,
        isAlreadyAssigned && isModificationAllowed && 'overwrite-checkbox',
        isExpanded && 'expanded-row',
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <div
            // className={`project-assignment-row ${isProjectSelected ? 'selected' : ''}`}
            className={rowClassName}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', width: '100%', padding: '8px 0',
            borderBottom: '1px solid var(--color-border)',
            backgroundColor: isCheckboxDisabled 
                ? 'var(--color-bg-disabled)' 
                : (isAlreadyAssigned && isModificationAllowed)
                    ? 'var(--color-bg-warning)'
                    : 'transparent' }}
        >
            {/* Fila para el nombre del proyecto y el checkbox de selección */}
            <div className="checkbox-json" style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '8px 0', fontSize: 'var(--font-xl)' }}>
                <label className='radio' style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                        type="checkbox"
                        value={project.id}
                        checked={isProjectSelected}
                        onChange={handleCheckboxChange}
                        disabled={isCheckboxDisabled}
                    ></input>
                    {/* Aquí se usa el símbolo de verificación para indicar que el proyecto está seleccionado */}
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
                > {project.name} </span>
                 {/* Mostrar question mark para proyectos ya asignados */}
                {isCheckboxDisabled && (
                    <span
                        className="assignment-q-mark"
                        onClick={() => onAllowModificationRequest(project.id!)}
                        style={{
                            cursor: 'pointer',
                            marginLeft: '8px',
                            fontWeight: 'bold',
                            color: 'var(--color-warning1)',
                            fontSize: '1.2rem'
                        }}
                        title="This Project is already assigned. Click to modify."
                    >?</span>
                )}
            </div>
            
            {/* Contenedor para los controles (rol y permisos), visible solo si el proyecto está seleccionado */}
            {isProjectSelected && (
                <div className="controls-container"
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                         // Centra los elementos horizontalmente
                        alignItems: 'flex-end',
                        gap: '24px', // Espacio entre el selector de rol y los permisos
                        width: '100%',
                        padding: '10px 0'
                    }}
                >

                    {/* Selector de Rol */}
                    <div className="role-selector-container">
                        <select
                            onChange={handleRoleSelect}
                            value={currentAssignment?.roleInProject || ''}
                            style={{
                                padding: '8px',
                                borderRadius: 'var(--br-sm)',
                                border: '1px solid var(--color-border)',
                                background: 'var(--color-bg1)',
                                color: isCheckboxDisabled 
                                    ? 'var(--color-warning1)' 
                                    : 'var(--color-fontbase)',
                                // color: 'var(--color-fontbase)',
                                cursor: isCheckboxDisabled 
                                    ? 'none' 
                                    : 'pointer',
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

                    {/* Contenedor de Permisos */}
                    <div
                        className="permissions-container"
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 'var(--gap-lg)',
                            marginRight:'50px',
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
                                        color:  isCheckboxDisabled 
                                            ? 'var(--color-warning1)' 
                                            : 'var(--color-fontbase)',
                                        // color: 'var(--color-fontbase-dark)',
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
};

UserProjectAssignmentRow.displayName = 'UserProjectAssignmentRow';
