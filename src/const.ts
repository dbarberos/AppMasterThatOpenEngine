

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