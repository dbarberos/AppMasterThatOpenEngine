import * as React from 'react';
import * as Router from 'react-router-dom';

import { Project } from '../classes/Project';


interface ProjectSelectorProps {
    currentProject: Project
    projectsList: Project[]
}

export const ProjectSelector = ({
    currentProject,
    projectsList
}: ProjectSelectorProps) => {
    const navigateTo = Router.useNavigate();   
    const [isSelectVisible, setIsSelectVisible] = React.useState(false)
    const [isFocused, setIsFocused] = React.useState(false);
    const selectRef = React.useRef<HTMLSelectElement>(null)
    const containerRef = React.useRef<HTMLDivElement>(null)


    // Filter out current project from options
    const availableProjects = projectsList.filter(project =>
        project.id !== currentProject.id
    )

    const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedProjectId = e.target.value;
        if (selectedProjectId !== currentProject.id) {
            navigateTo(`/project/${selectedProjectId}`)
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
        <div ref={containerRef}  style={{ display: "flex", alignItems: "center", columnGap: 10 }}>
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
                        value={currentProject.id}
                        onChange={handleProjectChange}
                        onKeyDown={(e) => {
                            if (e.key === 'Escape') {
                                setIsSelectVisible(false);
                                e.preventDefault();
                            }
                        }}
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
                                    disabled={project.id === currentProject.id}
                                    style={{
                                        opacity: project.id === currentProject.id ? 0.5 : 1,
                                        fontStyle: project.id === currentProject.id ? 'italic' : 'normal',
                                        color: project.id === currentProject.id ? 'var(--color-fontbase-dark)' : 'inherit'
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