import * as React from 'react';
import { ProjectsManager } from '../classes/ProjectsManager';

/**
 * Contexto de React para proporcionar una instancia única de ProjectsManager
 * a todos los componentes que lo necesiten, evitando la creación de múltiples
 * instancias y asegurando una única fuente de verdad para los datos de proyectos.
 */

// 1. Crear el Contexto
// El valor por defecto es `null`, pero se proveerá una instancia en el Provider.
const ProjectsManagerContext = React.createContext<ProjectsManager | null>(null);

// 2. Crear el Proveedor del Contexto (Provider)
interface ProjectsManagerProviderProps {
  children: React.ReactNode;
}

export const ProjectsManagerProvider: React.FC<ProjectsManagerProviderProps> = ({ children }) => {
  // Usamos `useState` con una función de inicialización para asegurar que
  // la instancia de ProjectsManager se cree UNA SOLA VEZ durante el ciclo de vida del componente.
  const [projectsManager] = React.useState(() => new ProjectsManager());

  return (
    <ProjectsManagerContext.Provider value={projectsManager}>
      {children}
    </ProjectsManagerContext.Provider>
  );
};

// 3. Crear un Hook personalizado para consumir el Contexto
// Este hook simplifica el acceso al ProjectsManager desde cualquier componente.
export const useProjectsManager = (): ProjectsManager => {
  const context = React.useContext(ProjectsManagerContext);
  if (context === null) {
    throw new Error('useProjectsManager must be used within a ProjectsManagerProvider');
  }
  return context;
};