import * as React from 'react';

import { Project } from "../classes/Project";


interface UseProjectsCacheReturn {
    projects: Project[];
    setProjects: (projects: Project[]) => void;
    isStale: boolean;
    updateCache: (projects: Project[]) => void;
    invalidateCache: () => void;
}

export const useProjectsCache = (cacheDuration = 5 * 60 * 1000): UseProjectsCacheReturn => {
    const [projects, setProjects] = React.useState<Project[]>([]);
    const lastFetchRef = React.useRef<number>(0);
    const originalProjectsRef = React.useRef<Project[]>([]);

    const isStale = React.useMemo(() => {
        const now = Date.now();
        return now - lastFetchRef.current > cacheDuration;
    }, [cacheDuration]);

    const updateCache = React.useCallback((newProjects: Project[]) => {
        originalProjectsRef.current = newProjects;
        setProjects(newProjects);
        lastFetchRef.current = Date.now();
        console.log('Projects cache updated:', {
            count: newProjects.length,
            timestamp: new Date(lastFetchRef.current).toISOString()
        });
    }, []);

    const invalidateCache = React.useCallback(() => {
        lastFetchRef.current = 0;
        console.log('Projects cache invalidated');
    }, []);

    return {
        projects,
        setProjects,
        isStale,
        updateCache,
        invalidateCache
    };
};