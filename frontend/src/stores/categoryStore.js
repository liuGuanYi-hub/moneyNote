import { create } from 'zustand';
import { apiFetch } from '../services/api';

export const useCategoryStore = create((set) => ({
  expense: [],
  income: [],
  loading: false,
  loaded: false,
  loadCategories: async () => {
    set({ loading: true });
    try {
      const expense = await apiFetch('/categories?type=expense', { auth: true });
      const income = await apiFetch('/categories?type=income', { auth: true });
      set({ expense, income, loading: false, loaded: true });
    } catch (e) {
      set({ loading: false });
      throw e;
    }
  },
  clear: () => set({ expense: [], income: [], loading: false, loaded: false }),
}));
