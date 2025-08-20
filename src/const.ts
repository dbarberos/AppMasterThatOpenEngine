

export const TODO_STATUSCOLUMN = {
    backlog: "Task Ready",
    wip: "In Progress",
    qa: "In Review",
    completed: "Done",
    notassigned: "Not Assigned"
} as const


export const TODO_STATUS_MAP_TEXT = {
    backlog: TODO_STATUSCOLUMN.backlog,
    wip: TODO_STATUSCOLUMN.wip,
    qa: TODO_STATUSCOLUMN.qa,
    completed: TODO_STATUSCOLUMN.completed,
    notassigned: TODO_STATUSCOLUMN.notassigned
} as const;

export const STORAGE_KEY = 'projectsCache';
export const CACHE_TIMESTAMP_KEY = 'projectsCacheTimestamp';
export const USERS_CACHE_KEY = 'usersCache';
export const USERS_CACHE_TIMESTAMP_KEY = 'usersCacheTimestamp';

export const SYNC_INTERVAL = 5 * 60 * 1000;


export const USER_STATUS = {    
    active: "Active",
    pending: "PendingValidation",
    disable: "Disable",
} as const

/**
 * Define los roles generales que un usuario puede tener en la aplicación.
 * Las claves se usan internamente y en la base de datos.
 * Los valores son los que se muestran al usuario.
 */
export const USER_ROL_IN_APP = {
    superadmin: "Super Admin",
    admin: "Admin",
    user: "User",
    viewer: "Viewer",
    unverified: "Unverified",
} as const


/**
 * Define todos los permisos posibles que se pueden asignar en un proyecto.
 * Las claves se usan internamente.
 * Los valores son los que se muestran al usuario.
 */
export const USER_PERMISSIONS = {
    canCreate: "Create",
    canRead: "Read",
    canUpdate: "Update",
    canDelete: "Delete",
};



/**
 * Mapea cada ROL DE APLICACIÓN a un conjunto de PERMISOS por defecto.
 * Esto se usa al asignar un usuario a un nuevo proyecto para preseleccionar
 * sus permisos, que luego pueden ser modificados.
 */
export const USER_ROL_IN_APP_PERMISSIONS = {
    superadmin: [
        "canCreate", 
        "canRead", 
        "canUpdate", 
        "canDelete"
    ],
    admin: [
        "canCreate", 
        "canRead", 
        "canUpdate", 
        "canDelete"
    ],
    user: [
        "canCreate", 
        "canRead", 
        "canUpdate"
    ],
    viewer: [
        "canRead"
    ],
    unverified: []
};


export const USER_ROLES_IN_PROJECT = {
    cli: "Client",
    pma: "Project Manager",
    sma: "Site Manager",
    ssu: "Site Supervisor",
    cma: "Construction Manager",
    gco: "General Contractor",
    eng: "Engineer",
    ark: "Architect",
    qsu: "Quantity Surveyor",
    sur: "Surveyor",
    cos: "Consultant",
    hys: "HSE Manager",
    sbc: "Subcontractor",
    spp: "Supplier",
    
} as const;