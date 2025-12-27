import * as React from 'react';
import { UsersManager } from '../classes/UsersManager';

/**
 * Contexto de React para proporcionar una instancia única de UsersManager
 * a todos los componentes que lo necesiten, evitando la creación de múltiples
 * instancias y asegurando una única fuente de verdad para los datos de usuarios.
 */

// 1. Crear el Contexto
// El valor por defecto es `null`, pero se proveerá una instancia en el Provider.
const UsersManagerContext = React.createContext<UsersManager | null>(null);

// 2. Crear el Proveedor del Contexto (Provider)
interface UsersManagerProviderProps {
    children: React.ReactNode;
}

export const UsersManagerProvider: React.FC<UsersManagerProviderProps> = ({ children }) => {
    // Usamos `useState` con una función de inicialización para asegurar que
    // la instancia de UsersManager se cree UNA SOLA VEZ durante el ciclo de vida del componente.
    const [usersManager] = React.useState(() => new UsersManager());

    return (
        <UsersManagerContext.Provider value={usersManager}>
            {children}
        </UsersManagerContext.Provider>
    );
};

// 3. Crear un Hook personalizado para consumir el Contexto
// Este hook simplifica el acceso al UsersManager desde cualquier componente.
export const useUsersManager = (): UsersManager => {
    const context = React.useContext(UsersManagerContext);
    if (!context) {
        throw new Error('useUsersManager must be used within a UsersManagerProvider');
    }
    return context;
};



// Este archivo es fundamental. Crea una única instancia de UsersManager y la hace accesible a toda tu aplicación a través de un Contexto de React. Esto evita que cada componente cree su propia instancia y asegura que todos compartan la misma fuente de datos.