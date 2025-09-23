import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UIState {
  // Navigation and layout
  isSidebarOpen: boolean;
  isMobileMenuOpen: boolean;

  // Theme
  theme: 'light' | 'dark' | 'system';

  // View preferences
  itemsPerPage: number;
  viewMode: 'grid' | 'list';

  // Search and filter panel
  isFilterPanelOpen: boolean;

  // Modal states
  isShareModalOpen: boolean;
  isAddToListModalOpen: boolean;
  isCreateListModalOpen: boolean;

  // Loading states
  isLoading: boolean;
  loadingMessage?: string;

  // Toast notifications
  toasts: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    description?: string;
    duration?: number;
  }>;

  // Actions
  setSidebarOpen: (open: boolean) => void;
  setMobileMenuOpen: (open: boolean) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setItemsPerPage: (count: number) => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  setFilterPanelOpen: (open: boolean) => void;
  setShareModalOpen: (open: boolean) => void;
  setAddToListModalOpen: (open: boolean) => void;
  setCreateListModalOpen: (open: boolean) => void;
  setLoading: (loading: boolean, message?: string) => void;
  addToast: (toast: Omit<UIState['toasts'][0], 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  toggleSidebar: () => void;
  toggleMobileMenu: () => void;
  toggleFilterPanel: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      // Initial state
      isSidebarOpen: false,
      isMobileMenuOpen: false,
      theme: 'system',
      itemsPerPage: 20,
      viewMode: 'grid',
      isFilterPanelOpen: false,
      isShareModalOpen: false,
      isAddToListModalOpen: false,
      isCreateListModalOpen: false,
      isLoading: false,
      loadingMessage: undefined,
      toasts: [],

      // Actions
      setSidebarOpen: (open) => set({ isSidebarOpen: open }),
      setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
      setTheme: (theme) => set({ theme }),
      setItemsPerPage: (count) => set({ itemsPerPage: count }),
      setViewMode: (mode) => set({ viewMode: mode }),
      setFilterPanelOpen: (open) => set({ isFilterPanelOpen: open }),
      setShareModalOpen: (open) => set({ isShareModalOpen: open }),
      setAddToListModalOpen: (open) => set({ isAddToListModalOpen: open }),
      setCreateListModalOpen: (open) => set({ isCreateListModalOpen: open }),
      setLoading: (loading, message) => set({ isLoading: loading, loadingMessage: message }),

      addToast: (toast) => {
        const id = Math.random().toString(36).substr(2, 9);
        const newToast = { ...toast, id };
        set((state) => ({
          toasts: [...state.toasts, newToast]
        }));

        // Auto-remove toast after duration (default 5 seconds)
        const duration = toast.duration ?? 5000;
        if (duration > 0) {
          setTimeout(() => {
            get().removeToast(id);
          }, duration);
        }
      },

      removeToast: (id) => set((state) => ({
        toasts: state.toasts.filter((toast) => toast.id !== id)
      })),

      clearToasts: () => set({ toasts: [] }),

      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
      toggleFilterPanel: () => set((state) => ({ isFilterPanelOpen: !state.isFilterPanelOpen })),
    }),
    {
      name: 'shadowdark-ui-store',
      // Only persist UI preferences, not modal states or loading states
      partialize: (state) => ({
        theme: state.theme,
        itemsPerPage: state.itemsPerPage,
        viewMode: state.viewMode,
        isSidebarOpen: state.isSidebarOpen,
        isFilterPanelOpen: state.isFilterPanelOpen,
      }),
    }
  )
);

// Convenience hooks for common UI patterns
export const useToast = () => {
  const { addToast, removeToast, clearToasts, toasts } = useUIStore();

  const showSuccess = (title: string, description?: string) => {
    addToast({ type: 'success', title, description });
  };

  const showError = (title: string, description?: string) => {
    addToast({ type: 'error', title, description });
  };

  const showWarning = (title: string, description?: string) => {
    addToast({ type: 'warning', title, description });
  };

  const showInfo = (title: string, description?: string) => {
    addToast({ type: 'info', title, description });
  };

  return {
    toasts,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeToast,
    clearToasts,
  };
};

export const useModals = () => {
  const {
    isShareModalOpen,
    isAddToListModalOpen,
    isCreateListModalOpen,
    setShareModalOpen,
    setAddToListModalOpen,
    setCreateListModalOpen,
  } = useUIStore();

  return {
    isShareModalOpen,
    isAddToListModalOpen,
    isCreateListModalOpen,
    openShareModal: () => setShareModalOpen(true),
    closeShareModal: () => setShareModalOpen(false),
    openAddToListModal: () => setAddToListModalOpen(true),
    closeAddToListModal: () => setAddToListModalOpen(false),
    openCreateListModal: () => setCreateListModalOpen(true),
    closeCreateListModal: () => setCreateListModalOpen(false),
  };
};

export const useLoading = () => {
  const { isLoading, loadingMessage, setLoading } = useUIStore();

  const startLoading = (message?: string) => setLoading(true, message);
  const stopLoading = () => setLoading(false);

  return {
    isLoading,
    loadingMessage,
    startLoading,
    stopLoading,
  };
};