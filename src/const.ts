

export const TODO_STATUSCOLUMN = {
    backlog: "Task Ready",
    wip: "In Progress",
    qa: "In Review",
    completed: "Done",
    notassigned: "Not Assigned"
} as const


export const STORAGE_KEY = 'projectsCache';
export const CACHE_TIMESTAMP_KEY = 'projectsCacheTimestamp';

export const SYNC_INTERVAL = 5 * 60 * 1000;