import * as React from 'react';

//import { Project } from "../classes/Project";
//import { STORAGE_KEY, CACHE_TIMESTAMP_KEY } from '../const';

import { User } from '../classes/User';
//import { UsersManager } from '../classes/UsersManager';

import { IUser, UserProfile } from '../types'; 
import { USERS_CACHE_KEY, USERS_CACHE_TIMESTAMP_KEY, SYNC_INTERVAL  }  from '../const'
import { useStickyState } from './useStickyState';

interface UseUsersCacheReturn {
    users: User[];
    setUsers: (users: User[]) => void;
    isStale: boolean;
    updateCache: (users: User[]) => void;
    invalidateCache: () => void;
    hasCache: boolean;
}



export interface CachedUsersData {
    users: IUser[]; // Almacenar como IUser (datos planos) en localStorage
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
            // Log basado en la estructura
            const parsed: CachedUsersData = JSON.parse(cached);
            console.log(`Cache found for ${USERS_CACHE_KEY}:`, parsed.users.length, 'users, timestamp:', new Date(parsed.timestamp).toISOString());
        }
    } catch (error) {
        console.error(`Error initializing localStorage cache for ${USERS_CACHE_KEY}:`, error);
    }
})();


const initialCachedData: CachedUsersData = { users: [], timestamp: 0 };

export const useUsersCache = (cacheDuration: number = SYNC_INTERVAL): UseUsersCacheReturn => {

    const [cachedStorageData, setCachedStorageData] = useStickyState<CachedUsersData | null>(
        initialCachedData,
        USERS_CACHE_KEY // <--- ¡CLAVE CORRECTA PARA USUARIOS!
    );

    // Iniciate state with localStorage´s data
    const [users, setUsers] = React.useState<User[]>(() => {
        try {
            const cached = localStorage.getItem(USERS_CACHE_KEY); // Usar la clave correcta
            if (cached) {
                const parsedData: CachedUsersData = JSON.parse(cached);
                // Asumimos que User constructor puede tomar IUser
                return parsedData.users ? parsedData.users.map(uData => new User(uData)) : [];
            }
            return [];
        } catch (error) {
            console.error(`Error reading from localStorage key ${USERS_CACHE_KEY}:`, error);
            return [];
        }
    });
    
    const lastFetchRef = React.useRef<number>(() => {
        try {
            const cached = localStorage.getItem(USERS_CACHE_KEY); // Usar la clave correcta
            if (cached) {
                const parsedData: CachedUsersData = JSON.parse(cached);
                return parsedData.timestamp || 0;
            }
            return 0;
        } catch (error) {
            console.error(`Error reading timestamp from localStorage key ${USERS_CACHE_KEY}:`, error);
            return 0;
        }
    })

    const [hasCache, setHasCache] = React.useState(() => {
        try {
            const cached = localStorage.getItem(USERS_CACHE_KEY); // Usar la clave correcta
            if (cached) {
                const parsedData: CachedUsersData = JSON.parse(cached);
                return parsedData.users ? parsedData.users.length > 0 : false;
            }
            return false;
        } catch (error) {
            console.error(`Error checking cache for ${USERS_CACHE_KEY}:`, error);
            return false;
        }
    })

    //const [error, setError] = React.useState<string | null>(null);
    

    const isStale = React.useMemo(() => {
        const now = Date.now();
        return now - lastFetchRef.current > cacheDuration;
    }, [cacheDuration, users]);

    const updateCache = React.useCallback((newUsers: User[]) => {
        try {
            // *** Log CLAVE para ver qué llega a la caché de React ***
            console.log('CacheHook: updateCache llamado con newUsers:', newUsers.map(p => ({ id: p.id, nickname: p.nickName, assignedProjectsCount: p.projectsAssigned?.length ?? 'undefined' })));

            const plainUsersForStorage: IUser[] = newUsers.map(userInstance => ({
                // Mapea explícitamente a IUser para asegurar la serialización correcta
                ...userInstance, // Esto podría funcionar si User es suficientemente simple
                // Si User tiene métodos o fechas como objetos Date, necesitas un mapeo más detallado:
                // id: userInstance.id, email: userInstance.email, ... etc.
                // accountCreatedAt: userInstance.accountCreatedAt instanceof Date ? userInstance.accountCreatedAt.toISOString() : userInstance.accountCreatedAt,
            }));


            const currentTimestamp = Date.now();
            const dataToStore: CachedUsersData = { users: plainUsersForStorage, timestamp: currentTimestamp };

            // Actualizar localStorage
            localStorage.setItem(USERS_CACHE_KEY, JSON.stringify(dataToStore));
            // Ya no se necesita CACHE_TIMESTAMP_KEY porque el timestamp está en dataToStore

            // Actualizar estado
            setUsers(newUsers);
            setHasCache(true);
            lastFetchRef.current = currentTimestamp;

            console.log('Users cache updated:', {
                count: newUsers.length,
                timestamp: new Date(lastFetchRef.current).toISOString()
            });


            console.log('CacheHook: Cache actualizada en localStorage y estado React.');
        } catch (error) {
            //setError('Failed to update cache');
            console.error('Error updating localStorage cache:', error);
        }
    }, []);


    const invalidateCache = React.useCallback(() => {        
        localStorage.removeItem(USERS_CACHE_KEY); // Usar la clave correcta
        // Ya no se necesita CACHE_TIMESTAMP_KEY
        setHasCache(false)
        lastFetchRef.current = 0
        setUsers([])
        console.log(`Cache for ${USERS_CACHE_KEY} invalidated.`);
    }, []);

    React.useEffect(() => {
        const cached = localStorage.getItem(USERS_CACHE_KEY);
        if (cached) {
            try {
                const parsedData: CachedUsersData = JSON.parse(cached);
                const users = parsedData.users.map(u => new User({
                    ...u,
                    accountCreatedAt: new Date(u.accountCreatedAt),
                    lastLoginAt: new Date(u.lastLoginAt),
                }));            
                setUsers(users);
                setHasCache(true);
                lastFetchRef.current = parsedData.timestamp;
            } catch (error) {
                console.error('Error parsing users cache:', error);
                invalidateCache();
            }
        }
    }, []);




    return {
        users,
        setUsers,
        isStale,
        updateCache,
        invalidateCache,
        hasCache
    };
};