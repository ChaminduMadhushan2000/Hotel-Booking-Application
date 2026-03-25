import { create } from 'zustand'

interface UiState {
  isSidebarOpen: boolean
  isMaintenanceMode: boolean
  maintenanceMessage: string | null
}

interface UiActions {
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setMaintenanceMode: (active: boolean, message?: string) => void
}

type UiStore = UiState & UiActions

export const useUiStore = create<UiStore>((set) => ({
  isSidebarOpen: false,
  isMaintenanceMode: false,
  maintenanceMessage: null,
  toggleSidebar: (): void => {
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen }))
  },
  setSidebarOpen: (open: boolean): void => {
    set({ isSidebarOpen: open })
  },
  setMaintenanceMode: (active: boolean, message?: string): void => {
    set({
      isMaintenanceMode: active,
      maintenanceMessage: active ? (message ?? null) : null
    })
  }
}))
