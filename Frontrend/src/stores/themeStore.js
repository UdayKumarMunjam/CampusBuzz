import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useThemeStore = create(
  persist(
    (set) => ({
      isDarkMode: true,
      toggleTheme: () =>
        set((state) => {
          const newIsDarkMode = !state.isDarkMode;
          if (newIsDarkMode) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
          return { isDarkMode: newIsDarkMode };
        }),
      setTheme: (isDark) =>
        set(() => {
          if (isDark) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
          return { isDarkMode: isDark };
        }),
    }),
    {
      name: 'theme-storage',
    }
  )
);