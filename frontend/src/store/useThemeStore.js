import { create } from "zustand";
export const useThemeStore = create((set) => ({
    theme : localStorage.getItem("videoChat-theme") || "coffee",
    setTheme : (theme) => {
        localStorage.setItem("videoChat-theme", theme);
        set({theme});
    },
}));