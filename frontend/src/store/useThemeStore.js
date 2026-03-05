import {create} from 'zustand'
//zustand is a small, fast and scalable bearbones state-management solution. It provides a simple API to create a global state store that can be used across the application. In this case, we are using it to create a theme store that manages the current theme of the application and persists it in localStorage so that it remains consistent across sessions.

// Theme store to manage the current theme of the application and persist it in localStorage so that it remains consistent across sessions.

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem('chat-theme') || 'coffee',
  setTheme: (theme) => {
    localStorage.setItem('chat-theme', theme);
    set({theme});
  }
}))