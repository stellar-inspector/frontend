import { create } from 'zustand';

interface ApiState {
  baseUrl: string;
  setBaseUrl: (url: string) => void;
}

export const useApiStore = create<ApiState>((set) => ({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  setBaseUrl: (url) => set({ baseUrl: url }),
}));
