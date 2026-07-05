import { create } from "zustand"

interface UiState {
  sidebarOpen: boolean
  toggleSidebar: () => void
}

// Scaffold-only store, proving the Zustand wiring works end to end. Real
// feature stores (employees, filters, etc.) land alongside their features.
export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}))
