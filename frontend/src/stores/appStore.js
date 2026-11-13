import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAppStore = create(
  persist(
    (set) => ({
      darkMode: false,
      refreshSignal: 0,
      currentDate: new Date(),
      editingRecord: null,
      toggleDarkMode: () =>
        set((state) => ({ darkMode: !state.darkMode })),
      triggerRefresh: () =>
        set((state) => ({ refreshSignal: state.refreshSignal + 1 })),
      setCurrentDate: (date) => set({ currentDate: date }),
      setEditingRecord: (record) => set({ editingRecord: record }),
      clear: () =>
        set({
          refreshSignal: 0,
          currentDate: new Date(),
          editingRecord: null,
        }),
    }),
    {
      name: 'moneyNote-app',
      partialize: (state) => ({ darkMode: state.darkMode }),
    },
  ),
);
