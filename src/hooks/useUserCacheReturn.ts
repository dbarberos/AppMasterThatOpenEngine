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
    loading: boolean; // <-- Añadir el estado de carga
}

export interface CachedUsersData {
    users: IUser[];
    timestamp: number;
}

// IIFE para inicializar el store y/o migrar el store del caché al cargar el módulo.
(() => {
    try {
        const cached = localStorage.getItem(USERS_CACHE_KEY);
        if (!cached) {
            console.log(`No cache found for ${USERS_CACHE_KEY}, initializing empty store`);
             // Inicializar con la estructura correcta para CachedUsersData
            localStorage.setItem(USERS_CACHE_KEY, JSON.stringify({ users: [], timestamp: 0 }));
        } else {
            const parsed = JSON.parse(cached);
            // Comprobación de robustez: si el caché existe pero está en el formato antiguo (un array)
            // o es un objeto sin la propiedad 'users', lo migramos al nuevo formato.
            if (Array.isArray(parsed) || !parsed.users) {
                console.warn(`Old cache format detected for ${USERS_CACHE_KEY}. Migrating...`);
                const usersToStore = Array.isArray(parsed) ? parsed : [];
                const migratedData: CachedUsersData = { users: usersToStore, timestamp: Date.now() };
                localStorage.setItem(USERS_CACHE_KEY, JSON.stringify(migratedData));
                console.log('Cache migrated to new format.');
            } else {
                const data = parsed as CachedUsersData;
                console.log(`Cache found for ${USERS_CACHE_KEY}:`, data.users.length, 'users, timestamp:', new Date(data.timestamp).toISOString());
            }
        }
    } catch (error) {
        console.error(`Error initializing localStorage cache for ${USERS_CACHE_KEY}:`, error);
    }
})();

export const useUsersCache = (
    usersManager: UsersManager | null,
    cacheDuration: number = SYNC_INTERVAL
): UseUsersCacheReturn => {
    // El estado de carga se determina síncronamente al inicio.
    // - Si NO hay caché o el caché está vacío, `loading` es `true`.
    // - Si SÍ hay usuarios en el caché, `loading` es `false` desde el primer render.
    const [loading, setLoading] = React.useState(() => {
        try {
            const cached = localStorage.getItem(USERS_CACHE_KEY);
            if (!cached) return true;
            const parsed = JSON.parse(cached) as CachedUsersData;
            return !(parsed.users && parsed.users.length > 0);
        } catch {
            return true;
        }
    });
    const [users, setUsers] = React.useState<User[]>(() => {
        try {
            const cached = localStorage.getItem(USERS_CACHE_KEY);
            if (cached) {
                const parsedData: CachedUsersData = JSON.parse(cached);
                // Asegurarse de que parsedData.users es un array antes de mapear
                return parsedData.users
                    ? parsedData.users.map(uData => new User(uData, uData.id))
                    : [];
            }
            return [];
        } catch (error) {
            console.error(`Error reading from localStorage key ${USERS_CACHE_KEY}:`, error);
            return [];
        }
    });

    const lastFetchTimestamp = React.useRef<number>(
        (() => {
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
        })()
    );

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
                accountCreatedAt: user.accountCreatedAt instanceof Date 
                    ? user.accountCreatedAt.toISOString() 
                    : user.accountCreatedAt,
                lastLoginAt: user.lastLoginAt instanceof Date 
                    ? user.lastLoginAt.toISOString() 
                    : user.lastLoginAt,
                projectsAssigned: user.projectsAssigned?.map(pa => pa.assignedDate instanceof Date 
                    ? { ...pa, assignedDate: pa.assignedDate.toISOString() } 
                    : pa)
            }));
            
            const currentTimestamp = Date.now();
            const dataToCache: CachedUsersData = {
                users: plainUsersForStorage,
                timestamp: currentTimestamp
            };

            localStorage.setItem(USERS_CACHE_KEY, JSON.stringify(dataToCache));

            // Actualizar estado  y timestamp
            setUsers(newUsers);
            lastFetchTimestamp.current = currentTimestamp;
            setLoading(false); // <-- La carga ha terminado, ya sea desde caché o desde el manager.

            console.log('Users cache updated:', {
                count: newUsers.length,
                timestamp: new Date(lastFetchTimestamp.current).toISOString()
            });

            console.log('CacheHook: Cache actualizada en localStorage y estado React.');

        } catch (error) {
            console.error('Error updating localStorage cache:', error);
        }
    }, []); // setUsers es estable, no necesita ser dependencia.

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

        // Función que se ejecutará cuando la lista de usuarios se actualice.
        const handleUsersUpdate = () => {
            console.log('useUsersCache: onUsersListUpdated disparado. Actualizando caché...');
            // Comprobamos que el manager realmente tenga la lista para evitar actualizaciones innecesarias
            if (usersManager.list) {
                updateCache(usersManager.list);
            }
        };

        // Sincronización Inmediata: Si el manager ya tiene datos cuando el hook se monta,
        // actualizamos el caché inmediatamente. Esto soluciona la condición de carrera.
        if (usersManager.list.length > 0) {
            console.log('useUsersCache: Manager ya tiene datos. Sincronizando caché inmediatamente.');
            handleUsersUpdate();
        }

        // 1. Definir la función que se ejecutará cuando la lista de usuarios se actualice.
        // const handleUsersUpdate = () => {
        //     console.log('useUsersCache: onUsersListUpdated disparado. Actualizando caché...');
        //     updateCache(usersManager.list);
        // };

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
        hasCache: users.length > 0,
        loading // <-- Devolver el estado de carga
    };
};