import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Database } from '../types/supabase';
import { toast } from 'sonner';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface AuthState {
  user: Profile | null;
  loading: boolean;
  error: Error | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, role: 'teacher' | 'student') => Promise<void>;
  signOut: () => Promise<void>;
  loadUser: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  error: null,

  signIn: async (email, password) => {
    try {
      set({ loading: true, error: null });
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      await get().loadUser();
    } catch (error) {
      set({ error: error as Error });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  signUp: async (email, password, fullName, role) => {
    try {
      set({ loading: true, error: null });
      const { data: authData, error: authError } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            full_name: fullName,
            role: role
          }
        }
      });
      if (authError) throw authError;

      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: authData.user.id,
              full_name: fullName,
              role: role
            }
          ]);
        if (profileError) throw profileError;
      }
    } catch (error) {
      set({ error: error as Error });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  signOut: async () => {
    try {
      set({ loading: true, error: null });
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ user: null });
    } catch (error) {
      set({ error: error as Error });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateProfile: async (updates) => {
    try {
      set({ loading: true, error: null });
      const { user } = get();
      if (!user) throw new Error('No user logged in');

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      set({ user: { ...user, ...updates } });
    } catch (error) {
      set({ error: error as Error });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  loadUser: async () => {
    try {
      set({ loading: true, error: null });
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
          
        if (error) {
          console.error('Error loading profile:', error);
          toast.error('Error loading user profile');
          set({ user: null, error: error });
          return;
        }

        if (!profile) {
          const metadata = user.user_metadata;
          if (metadata?.full_name && metadata?.role) {
            const { data: newProfile, error: insertError } = await supabase
              .from('profiles')
              .insert([{
                id: user.id,
                full_name: metadata.full_name,
                role: metadata.role
              }])
              .select()
              .single();

            if (insertError) {
              console.error('Error creating profile:', insertError);
              toast.error('Error creating user profile');
              set({ user: null, error: insertError });
              return;
            }

            set({ user: newProfile, error: null });
            return;
          }
        }

        set({ user: profile, error: null });
      } else {
        set({ user: null, error: null });
      }
    } catch (error) {
      console.error('Error in loadUser:', error);
      set({ user: null, error: error as Error });
    } finally {
      set({ loading: false });
    }
  }
}));