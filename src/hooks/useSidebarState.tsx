import * as React from 'react';

export const useSidebarState = () => {
    const [previousState, setPreviousState] = React.useState<boolean | null>(null);

    const storeSidebarState = React.useCallback(() => {
        const checkbox = document.getElementById('sidebar-checkbox-switch') as HTMLInputElement;
        if (checkbox) {
            setPreviousState(checkbox.checked);
            checkbox.checked = true; // collapse sidebar
        }
    }, []);

    const restoreSidebarState = React.useCallback(() => {
        const checkbox = document.getElementById('sidebar-checkbox-switch') as HTMLInputElement;
        if (checkbox && previousState !== null) {
            checkbox.checked = previousState;
            setPreviousState(null);
        }
    }, [previousState]);

    return { storeSidebarState, restoreSidebarState };
};