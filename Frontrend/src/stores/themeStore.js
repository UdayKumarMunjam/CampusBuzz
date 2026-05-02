import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useThemeStore = create(
  persist(
    (set) => ({
      isDarkMode: true,

      toggleTheme: () =>
        set((state) => {
          const newIsDarkMode = !state.isDarkMode;

          if (typeof document !== "undefined") {
            document.documentElement.classList.toggle("dark", newIsDarkMode);
          }

          return { isDarkMode: newIsDarkMode };
        }),

      setTheme: (isDark) =>
        set(() => {
          if (typeof document !== "undefined") {
            document.documentElement.classList.toggle("dark", isDark);
          }

          return { isDarkMode: isDark };
        }),
    }),
    {
      name: "theme-storage",

      //  Apply theme automatically when app loads
      onRehydrateStorage: () => (state) => {
        if (state && typeof document !== "undefined") {
          document.documentElement.classList.toggle(
            "dark",
            state.isDarkMode
          );
        }
      },
    }
  )
);