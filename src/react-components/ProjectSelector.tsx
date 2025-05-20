import * as React from 'react';
import * as Router from 'react-router-dom';

import { Project } from '../classes/Project';
import { useStickyState } from '../hooks'

interface ProjectSelectorProps {
    currentProject: Project |null
    projectsList: Project[]
    onProjectSelect: (projectId: string | null) => void
}

export const ProjectSelector = ({
    currentProject,
    projectsList,
    onProjectSelect
}: ProjectSelectorProps) => {
    //const navigateTo = Router.useNavigate();   
    const [isSelectVisible, setIsSelectVisible] = React.useState(false)
    const [isFocused, setIsFocused] = React.useState(false);
    const selectRef = React.useRef<HTMLSelectElement>(null)
    const containerRef = React.useRef<HTMLDivElement>(null)

    const [activeProject, setActiveProject] = useStickyState<string | null>(
        currentProject?.id ?? null,
        'selectedProjectId'
    );

    // Asegúrar que el estado local se actualice si currentProject.id cambia desde fuera
    // y no coincide con el estado pegajoso (por ejemplo, al cargar la página por primera vez
    // con un ID diferente en la URL).
    React.useEffect(() => {
        // Si currentProject existe, usa su id. Si id es undefined o currentProject no existe, usa null.
        const projectIdToSet = currentProject?.id ?? null;

        if (projectIdToSet !== activeProject) {
            setActiveProject(projectIdToSet);
        }
    }, [currentProject?.id, activeProject, setActiveProject]);



    // Filter out current project from options
    const availableProjects = projectsList.filter(project =>
        project.id !== activeProject
    )

    const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedProjectId = e.target.value;
        const projectIdToSet = selectedProjectId === '' ? null : selectedProjectId;

        if (projectIdToSet !== activeProject) {
            setActiveProject(selectedProjectId);// Actualiza el estado local y el sticky state
            onProjectSelect(selectedProjectId); // Llama al callback del padre
            //navigateTo(`/project/${selectedProjectId}`)
            setIsSelectVisible(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLSelectElement>) => {
        if (e.key === 'Escape') {
            setIsSelectVisible(false);
            e.preventDefault();
        }
    }

    const toggleSelect = () => {
        setIsSelectVisible(true);
        // Focus the select element after it becomes visible
        setTimeout(() => selectRef.current?.focus(), 0)
    };

    // Handle click outside
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsSelectVisible(false);
            }
        };

        if (isSelectVisible) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isSelectVisible])



    return (
        <div ref={containerRef}  style={{ display: "flex", alignItems: "center", columnGap: 10, whiteSpace: "nowrap" }}>
            {!isSelectVisible ? (
                <button onClick={toggleSelect}>
                    Swap Project
                </button>
            ) : (
                <>
                    <p style={{ paddingLeft: 20 }}>Swap project:</p>
                    <select
                        ref={selectRef}
                        id="projectSelectedProjectDetailPage"
                        value={activeProject ?? ''}
                        onChange={handleProjectChange}
                        onKeyDown={handleKeyDown}
                        onBlur={() => setIsSelectVisible(false)}
                        style={{
                            padding: 10,
                            borderRadius: 5,
                            fontSize: "var(--font-lg)",
                            lineHeight: 1,
                            letterSpacing: "normal",
                            textTransform: "none",
                            display: "inline-block",
                            whiteSpace: "nowrap",
                            wordWrap: "normal",
                            cursor: 'pointer',
                        }}
                    >
                            {projectsList.map(project => (
                                <option
                                    key={project.id}
                                    value={project.id}
                                    disabled={project.id === activeProject}
                                    style={{
                                        opacity: project.id === activeProject ? 0.5 : 1,
                                        fontStyle: project.id === activeProject ? 'italic' : 'normal',
                                        color: project.id === activeProject ? 'var(--color-fontbase-dark)' : 'inherit'
                                    }}
                                >
                                    {project.name}
                                </option>
                            ))}
                    </select>
                </>
            )}
        </div>
    );
};


// Add display name for debugging purposes
ProjectSelector.displayName = 'ProjectSelector'
