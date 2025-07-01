import * as React from 'react';

import { ProjectsManager } from '../classes/ProjectsManager';
import { Project } from "../classes/Project";
import { STORAGE_KEY, CACHE_TIMESTAMP_KEY } from '../const';

interface UseProjectsCacheReturn {
    projects: Project[];
    projectsManager?: ProjectsManager | null;
    setProjects: (projects: Project[]) => void;
    isStale: boolean;
    updateCache: (projects: Project[]) => void;
    invalidateCache: () => void;
    hasCache: boolean;
}

// IIFE para inicializar el store

(() => {
    try {
        const cached = localStorage.getItem(STORAGE_KEY);
        if (!cached) {
            console.log('No cache found, initializing empty store');
            localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
            localStorage.setItem(CACHE_TIMESTAMP_KEY, '0');
        } else {
            console.log('Cache found:', JSON.parse(cached).length, 'projects');
        }
    } catch (error) {
        console.error('Error initializing localStorage cache:', error);
    }
})();





export const useProjectsCache = (
    projectsManager: ProjectsManager | null,
    cacheDuration: number = 5 * 60 * 1000,
): UseProjectsCacheReturn => {

    // Iniciate state with localStorage´s data
    const [projects, setProjects] = React.useState<Project[]>(() => {
        try {
            const cached = localStorage.getItem(STORAGE_KEY);
            return cached ? JSON.parse(cached) : [];
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return [];
        }
    });
    
    const lastFetchRef = React.useRef<number>(
        Number(localStorage.getItem(CACHE_TIMESTAMP_KEY)) || 0
    )

    const [hasCache, setHasCache] = React.useState(() => {
        const cached = localStorage.getItem(STORAGE_KEY);
        return cached !== null && JSON.parse(cached).length > 0;
    })

    const [error, setError] = React.useState<string | null>(null);
    //const originalProjectsRef = React.useRef<Project[]>([]);

    const isStale = React.useMemo(() => {
        const now = Date.now();
        return now - lastFetchRef.current > cacheDuration;
    }, [cacheDuration, hasCache]);

    const updateCache = React.useCallback((newProjects: Project[]) => {
        try {
            // *** Log CLAVE para ver qué llega a la caché de React ***
            console.log('CacheHook: updateCache llamado con newProjects:', newProjects.map(p => ({ id: p.id, name: p.name, todoCount: p.todoList?.length ?? 'undefined' })));


            // Actualizar localStorage
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newProjects))
            localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString())
            // Actualizar estado
            setProjects(newProjects);
            setHasCache(true);
            lastFetchRef.current = Date.now();

            console.log('Projects cache updated:', {
                count: newProjects.length,
                timestamp: new Date(lastFetchRef.current).toISOString()
            });


            console.log('CacheHook: Cache actualizada en localStorage y estado React.');
        } catch (error) {
            setError('Failed to update cache');
            console.error('Error updating localStorage cache:', error);
        }
    }, []);


    const invalidateCache = React.useCallback(() => {        
        localStorage.removeItem(STORAGE_KEY)
        localStorage.setItem(CACHE_TIMESTAMP_KEY, '0')
        setHasCache(false)
        lastFetchRef.current = 0
        setProjects([])
    }, []);


     // Efecto para suscribirse a los cambios del ProjectsManager
     React.useEffect(() => {
        // No hacer nada si el manager no está listo o no existe.
        if (!projectsManager) {
            return;
        }

        console.log('useProjectsCache: Hook activado. Configurando suscripción a onProjectsListUpdated.');

        // 1. Definir la función que se ejecutará cuando la lista de proyectos se actualice.
        // Esta función llamará a `updateCache` con la lista más reciente del manager.
        const handleProjectsUpdate = () => {
            console.log('useProjectsCache: onProjectsListUpdated disparado. Actualizando caché...');
            updateCache(projectsManager.list);
        };

        // 2. Suscribirse al evento de actualización del manager.
        projectsManager.onProjectsListUpdated = handleProjectsUpdate;

        // 3. Función de limpieza: se ejecuta cuando el componente que usa el hook se desmonta.
        // Es crucial para evitar memory leaks.
        return () => {
            console.log('useProjectsCache: Hook desmontado. Limpiando suscripción.');
            if (projectsManager) {
                projectsManager.onProjectsListUpdated = null;
            }
        };
    }, [projectsManager, updateCache]);

    return {
        projects,
        setProjects,
        isStale,
        updateCache,
        invalidateCache,
        hasCache
    };
};