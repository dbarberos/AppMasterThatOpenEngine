import React, { createContext, useContext } from 'react';
import { ProjectsManager } from '../classes/ProjectsManager';

const ProjectsManagerContext = createContext<ProjectsManager | null>(null);

export const ProjectsManagerProvider = ({ children }: { children: React.ReactNode }) => {
  const projectsManager = new ProjectsManager();
  return (
    <ProjectsManagerContext.Provider value={projectsManager}>
      {children}
    </ProjectsManagerContext.Provider>
  );
};

export const useProjectsManager = () => {
  const context = useContext(ProjectsManagerContext);
  if (context === null) {
    throw new Error('useProjectsManager must be used within a ProjectsManagerProvider');
  }
  return context;
};