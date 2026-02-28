import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
    isLightMode: boolean;
    toggleTheme: () => void;    
}

export const useThemeStore = create<ThemeState>()(
    persist(
        (set) => ({
            isLightMode: false,
            toggleTheme: () => set((state) => ({ isLightMode: !state.isLightMode })),
        }),
        {
            name: 'theme-storage', // name of the item in storage
        }
    )
);

