

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

export const SYNC_INTERVAL = 5 * 60 * 1000;


export const USER_STATUS = {
    active: "Active",
    pending: "PendingValidation",
    disable: "Disable"
} as const


export const USER_ROL_IN_APP = {
    admin: "admin",
    editor: "editor",
    viewer: "viewer",

} as const

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