import * as React from 'react'

import { Project } from '../classes/Project'

interface UseProjectSearchReturn {
    searchTerm: string
    setSearchTerm: (term: string) => void
    filteredProjects: Project[]
    updateOriginalProjects: (projects: Project[]) => void
    setOriginalProjectsRef: (projects: Project[]) => void
}

export function useProjectSearch (projects: Project[]): UseProjectSearchReturn {
    const [searchTerm, setSearchTerm] = React.useState('')
    const originalProjectsRef = React.useRef<Project[]>([])

    const setOriginalProjectsRef = (projects: Project[]) => {
        console.log('Setting original projects ref:', projects)
        originalProjectsRef.current = projects;
    };

    
    //Callback for updating OriginalProjectsRef at the beginning of the app
    const updateOriginalProjects = (projects: Project[]) => {
        console.log('Updating original projects ref:', projects.length)
        originalProjectsRef.current = projects
    }


    // React.useEffect(() => {
    //     console.log('Projects updated in useProjectSearch:', {
    //         projectsLength: initialProjects.length,
    //         originalRefLength: originalProjectsRef.current.length
    //     })
    //     originalProjectsRef.current = initialProjects
    // }, [initialProjects])

    const filteredProjects = React.useMemo(() => {
        console.log('Filtering projects:', {
            searchTerm,
            originalLength: originalProjectsRef.current.length
        })

        if (!searchTerm.trim()) return originalProjectsRef.current

        const searchLower = searchTerm.toLowerCase();
        return originalProjectsRef.current.filter((project) => {
            return (
                project.name.toLowerCase().includes(searchLower) ||
                project.description.toLowerCase().includes(searchLower) ||
                project.acronym.toLowerCase().includes(searchLower)
            )
        })
    }, [searchTerm, originalProjectsRef.current])

    return {
        searchTerm,
        setSearchTerm,
        filteredProjects,
        updateOriginalProjects,
        setOriginalProjectsRef
    };
};