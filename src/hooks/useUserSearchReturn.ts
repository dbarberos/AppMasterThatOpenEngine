import * as React from 'react'

import { User } from '../classes/User'
import { debounce } from '../utils'

interface UseUserSearchReturn {
    userSearchTerm: string
    setUserSearchTerm: (term: string) => void
    filteredUsers: User[]
    handleSearchChange: (value: string) => void

}

export function useUserSearch (initialUsers: User[]): UseUserSearchReturn {
    const [userSearchTerm, setUserSearchTerm] = React.useState('')
    const originalUserRef = React.useRef<User[]>(initialUsers)



    React.useEffect(() => {
        originalUserRef.current = initialUsers;
    }, [initialUsers])

    // Función debounced para actualizar el término de búsqueda
    const debouncedSetUserSearchTerm = React.useMemo(
        () => debounce((value: string) => {
            console.log('useUserSearch: Setting search term (debounced):', value);
            setUserSearchTerm(value);
        }, 250),
        [] 
    );

    // Callback para manejar el cambio desde el input de búsqueda
    const handleSearchChange = React.useCallback((value: string) => {
        debouncedSetUserSearchTerm(value);
    }, [debouncedSetUserSearchTerm]);


    const filteredUsers = React.useMemo(() => {
        console.log('Filtering projects:', {
            userSearchTerm,
            originalLength: initialUsers.length
        })

        if (!userSearchTerm.trim()) return initialUsers

        const lowerSearchTerm = userSearchTerm.toLowerCase();
        return initialUsers.filter((user) => {
            const basicMatch = (
                (user.nickName && user.nickName?.toLowerCase().includes(lowerSearchTerm)) ||
                (user.firstName && user.firstName?.toLowerCase().includes(lowerSearchTerm)) ||
                (user.lastName && user.lastName?.toLowerCase().includes(lowerSearchTerm)) ||
                user.email?.toLowerCase().includes(lowerSearchTerm) ||
                (user.organization &&user.organization?.toLowerCase().includes(lowerSearchTerm)) ||
                (user.roleInApp && user.roleInApp?.toLowerCase().includes(lowerSearchTerm)) ||
                user.status?.toLowerCase().includes(lowerSearchTerm)
            );
            const projectsMatch = Array.isArray(user.projectsAssigned) && user.projectsAssigned.some(project => (
                
                project.projectName?.toLowerCase().includes(lowerSearchTerm) ||
                project.roleInProject?.name?.toLowerCase().includes(lowerSearchTerm) ||
                false
            ));

            return basicMatch || projectsMatch;
        })

    }, [userSearchTerm, initialUsers])

    return {
        userSearchTerm,
        setUserSearchTerm,
        filteredUsers,
        handleSearchChange,

    };
};