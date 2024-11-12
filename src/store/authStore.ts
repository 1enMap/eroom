import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'teacher' | 'student';
}

interface AuthState {
  version: number;
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: 'teacher' | 'student') => Promise<void>;
  signup: (name: string, email: string, password: string, role: 'teacher' | 'student') => Promise<void>;
  logout: () => void;
  resetStore: () => void;
}

const initialState = {
  version: 1,
  user: null,
  isAuthenticated: false,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      ...initialState,
      
      login: async (email: string, password: string, role: 'teacher' | 'student') => {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const mockUser: User = {
          id: Math.random().toString(36).substr(2, 9),
          name: email.split('@')[0],
          email,
          role,
        };
        
        set({ user: mockUser, isAuthenticated: true });
      },
      
      signup: async (name: string, email: string, password: string, role: 'teacher' | 'student') => {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const mockUser: User = {
          id: Math.random().toString(36).substr(2, 9),
          name,
          email,
          role,
        };
        
        set({ user: mockUser, isAuthenticated: true });
      },
      
      logout: () => {
        set(initialState);
      },

      resetStore: () => {
        set(initialState);
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        version: state.version,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      version: 1,
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          // Migration from version 0 to 1
          return {
            ...initialState,
            ...persistedState,
            version: 1,
          };
        }
        return persistedState as AuthState;
      },
    }
  )
);