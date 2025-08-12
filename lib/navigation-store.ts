'use client';

import { create } from 'zustand';

interface NavigationState {
  isNavigating: boolean;
  start: () => void;
  stop: () => void;
  set: (value: boolean) => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  isNavigating: false,
  start: () => set({ isNavigating: true }),
  stop: () => set({ isNavigating: false }),
  set: (value: boolean) => set({ isNavigating: value }),
}));


