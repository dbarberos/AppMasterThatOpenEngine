import * as React from 'react'

import { Project } from '../classes/Project'

interface UseProjectSearchReturn {
    searchTerm: string
    setSearchTerm: (term: string) => void
    filteredProjects: Project[]
    // updateOriginalProjects: (projects: Project[]) => void
    // setOriginalProjectsRef: (projects: Project[]) => void
}

export function useProjectSearch (projects: Project[]): UseProjectSearchReturn {
    const [searchTerm, setSearchTerm] = React.useState('')
    const originalProjectsRef = React.useRef<Project[]>(projects)

    // const setOriginalProjectsRef = (projects: Project[]) => {
    //     console.log('Setting original projects ref:', projects)
    //     originalProjectsRef.current = projects;
    // };

    React.useEffect(() => {
        originalProjectsRef.current = projects;
    }, [projects])

    
    // //Callback for updating OriginalProjectsRef at the beginning of the app
    // const updateOriginalProjects = (projects: Project[]) => {
    //     console.log('Updating original projects ref:', projects.length)
    //     originalProjectsRef.current = projects
    // }



    const filteredProjects = React.useMemo(() => {
        console.log('Filtering projects:', {
            searchTerm,
            originalLength: projects.length
        })

        if (!searchTerm.trim()) return projects

        const searchLower = searchTerm.toLowerCase();
        return projects.filter((project) => {
            return (
                project.name.toLowerCase().includes(searchLower) ||
                project.description.toLowerCase().includes(searchLower) ||
                project.acronym.toLowerCase().includes(searchLower)
            )
        })
    }, [searchTerm, projects])

    return {
        searchTerm,
        setSearchTerm,
        filteredProjects,
        // updateOriginalProjects,
        // setOriginalProjectsRef
    };
};