import * as React from 'react';

//import { Project } from "../classes/Project";
//import { STORAGE_KEY, CACHE_TIMESTAMP_KEY } from '../const';

import { User } from '../classes/User';
import { UsersManager } from '../classes/UsersManager';

import { IUser } from '../types'; 
import { USERS_CACHE_KEY, SYNC_INTERVAL } from '../const';
import { useStickyState } from './useStickyState';

interface UseUsersCacheReturn {
    users: User[];
    usersManager?: UsersManager | null; 
    setUsers: (users: User[]) => void;
    isStale: boolean;
    updateCache: (users: User[]) => void;
    invalidateCache: () => void;
    hasCache: boolean;
}

export interface CachedUsersData {
    users: IUser[];
    timestamp: number;
}

// IIFE para inicializar el store
(() => {
    try {
        const cached = localStorage.getItem(USERS_CACHE_KEY);
        if (!cached) {
            console.log(`No cache found for ${USERS_CACHE_KEY}, initializing empty store`);
             // Inicializar con la estructura correcta para CachedUsersData
            localStorage.setItem(USERS_CACHE_KEY, JSON.stringify({ users: [], timestamp: 0 }));
        } else {

            const parsed: CachedUsersData = JSON.parse(cached);
            console.log(`Cache found for ${USERS_CACHE_KEY}:`, parsed.users.length, 'users, timestamp:', new Date(parsed.timestamp).toISOString());
        }
    } catch (error) {
        console.error(`Error initializing localStorage cache for ${USERS_CACHE_KEY}:`, error);
    }
})();

export const useUsersCache = (
    usersManager: UsersManager | null,
    cacheDuration: number = SYNC_INTERVAL
): UseUsersCacheReturn => {
    const [users, setUsers] = React.useState<User[]>(() => {
        try {
            const cached = localStorage.getItem(USERS_CACHE_KEY);
            if (cached) {
                const parsedData: CachedUsersData = JSON.parse(cached);
                return parsedData.users ? parsedData.users.map(uData => new User(uData, uData.id)) : [];
            }
            return [];
        } catch (error) {
            console.error(`Error reading from localStorage key ${USERS_CACHE_KEY}:`, error);
            return [];
        }
    });

    const lastFetchTimestamp = React.useRef<number>(() => {
        try {
            const cached = localStorage.getItem(USERS_CACHE_KEY);
            if (cached) {
                const parsedData: CachedUsersData = JSON.parse(cached);
                return parsedData.timestamp || 0;
            }
        } catch (error){
            // Si hay un error, se asume que no hay caché.
            console.error(`Error reading timestamp from localStorage key ${USERS_CACHE_KEY}:`, error);
        }
        return 0;
    });

    const isStale = React.useMemo(() => {
        const now = Date.now();
        return now - lastFetchTimestamp.current > cacheDuration;
    }, [cacheDuration, users]);

    const updateCache = React.useCallback((newUsers: User[]) => {
        try {
            console.log('useUsersCache: updateCache llamado con newUsers:', newUsers.map(u => ({ id: u.id, email: u.email })));

            // const plainUsersForStorage: IUser[] = newUsers.map(userInstance => ({
            //     // Mapea explícitamente a IUser para asegurar la serialización correcta
            //     ...userInstance, // Esto podría funcionar si User es suficientemente simple
            //     // Si User tiene métodos o fechas como objetos Date, necesitas un mapeo más detallado:
            //     // id: userInstance.id, email: userInstance.email, ... etc.
            //     // accountCreatedAt: userInstance.accountCreatedAt instanceof Date ? userInstance.accountCreatedAt.toISOString() : userInstance.accountCreatedAt,

            const plainUsersForStorage: IUser[] = newUsers.map(user => ({
                ...user,
                accountCreatedAt: user.accountCreatedAt instanceof Date ? user.accountCreatedAt.toISOString() : user.accountCreatedAt,
                lastLoginAt: user.lastLoginAt instanceof Date ? user.lastLoginAt.toISOString() : user.lastLoginAt,
                projectsAssigned: user.projectsAssigned?.map(pa => ({
                    ...pa,
                    assignedDate: pa.assignedDate instanceof Date ? pa.assignedDate.toISOString() : pa.assignedDate,
                }))
            }));

            const currentTimestamp = Date.now();
            const dataToStore: CachedUsersData = { users: plainUsersForStorage, timestamp: currentTimestamp };

            // Actualizar localStorage
            localStorage.setItem(USERS_CACHE_KEY, JSON.stringify(dataToStore));
            // Ya no se necesita CACHE_TIMESTAMP_KEY porque el timestamp está en dataToStore

            // Actualizar estado
            setUsers(newUsers);
            lastFetchTimestamp.current = currentTimestamp;

            console.log('Users cache updated:', {
                count: newUsers.length,
                timestamp: new Date(lastFetchTimestamp.current).toISOString()
            });

            console.log('CacheHook: Cache actualizada en localStorage y estado React.');

        } catch (error) {
            console.error('Error updating localStorage cache:', error);
        }
    }, []);

    const invalidateCache = React.useCallback(() => {
        localStorage.removeItem(USERS_CACHE_KEY);
        lastFetchTimestamp.current = 0;
        setUsers([]);
        console.log(`Cache for ${USERS_CACHE_KEY} invalidated.`);
    }, []);


    // Efecto para suscribirse a los cambios del UsersManager y sincronizar el caché.
    React.useEffect(() => {
        // No hacer nada si el manager no está listo o no existe.
        if (!usersManager) {
            return;
        }

        console.log('useUsersCache: Hook activado. Configurando suscripción a onUsersListUpdated.');

        // 1. Definir la función que se ejecutará cuando la lista de usuarios se actualice.
        const handleUsersUpdate = () => {
            console.log('useUsersCache: onUsersListUpdated disparado. Actualizando caché...');
            updateCache(usersManager.list);
        };

        // 2. Suscribirse al evento de actualización del manager.
        usersManager.onUsersListUpdated = handleUsersUpdate;

        // 3. Función de limpieza: se ejecuta cuando el componente que usa el hook se desmonta.
        return () => {
            console.log('useUsersCache: Hook desmontado. Limpiando suscripción.');
            if (usersManager) {
                usersManager.onUsersListUpdated = null;
            }
        };
    }, [usersManager, updateCache]);

    return {
        users,
        usersManager,
        setUsers,
        isStale,
        updateCache,
        invalidateCache,
        hasCache: users.length > 0
    };
};