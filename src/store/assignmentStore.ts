import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Database } from '../types/supabase';
import { deleteFile } from '../lib/storage';

type Assignment = Database['public']['Tables']['assignments']['Row'];
type ArchivedAssignment = Assignment & {
  archived_at: string;
  archived_by: string;
};

interface Submission {
  id: string;
  created_at: string;
  assignment_id: string;
  student_id: string;
  content: string;
  file_url: string | null;
  grade: number | null;
  feedback: string | null;
  assignment: Assignment;
  student: {
    id: string;
    full_name: string;
  };
}

interface AssignmentState {
  assignments: Assignment[];
  archivedAssignments: ArchivedAssignment[];
  submissions: Submission[];
  loading: boolean;
  error: Error | null;
  createAssignment: (data: Omit<Assignment, 'id' | 'created_at'>) => Promise<void>;
  deleteAssignment: (id: string) => Promise<void>;
  deleteArchivedAssignment: (id: string) => Promise<void>;
  deleteAllArchivedAssignments: () => Promise<void>;
  fetchAssignments: () => Promise<void>;
  fetchArchivedAssignments: () => Promise<void>;
  fetchSubmissions: () => Promise<void>;
  restoreAssignment: (id: string) => Promise<void>;
}

export const useAssignmentStore = create<AssignmentState>((set, get) => ({
  assignments: [],
  archivedAssignments: [],
  submissions: [],
  loading: false,
  error: null,

  createAssignment: async (data) => {
    try {
      set({ loading: true, error: null });
      const { data: newAssignment, error } = await supabase
        .from('assignments')
        .insert([data])
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        assignments: [newAssignment, ...state.assignments],
        error: null
      }));
    } catch (error) {
      set({ error: error as Error });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deleteAssignment: async (id) => {
    try {
      set({ loading: true, error: null });
      
      // Get the assignment to check if it has a file
      const assignment = get().assignments.find(a => a.id === id);
      
      // Delete from database first
      const { error } = await supabase
        .rpc('delete_assignment', { assignment_id: id });

      if (error) throw error;

      // If assignment had a file, delete it from storage
      if (assignment?.file_url) {
        const filePath = new URL(assignment.file_url).pathname.split('/').pop();
        if (filePath) {
          await deleteFile(filePath, 'assignments');
        }
      }

      // Update local state
      set((state) => ({
        assignments: state.assignments.filter((a) => a.id !== id),
        error: null
      }));

      // Refresh archived assignments
      await get().fetchArchivedAssignments();
    } catch (error) {
      set({ error: error as Error });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deleteArchivedAssignment: async (id) => {
    try {
      set({ loading: true, error: null });
      
      const { error } = await supabase
        .rpc('delete_archived_assignment', { assignment_id: id });

      if (error) throw error;

      set((state) => ({
        archivedAssignments: state.archivedAssignments.filter((a) => a.id !== id),
        error: null
      }));
    } catch (error) {
      set({ error: error as Error });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deleteAllArchivedAssignments: async () => {
    try {
      set({ loading: true, error: null });
      
      const { error } = await supabase
        .rpc('delete_all_archived_assignments');

      if (error) throw error;

      set((state) => ({
        archivedAssignments: [],
        error: null
      }));
    } catch (error) {
      set({ error: error as Error });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  fetchAssignments: async () => {
    try {
      set({ loading: true, error: null });
      
      const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      set({ assignments: data || [], error: null });
    } catch (error) {
      set({ error: error as Error });
    } finally {
      set({ loading: false });
    }
  },

  fetchArchivedAssignments: async () => {
    try {
      set({ loading: true, error: null });
      
      const { data, error } = await supabase
        .from('archived_assignments')
        .select('*')
        .order('archived_at', { ascending: false });

      if (error) throw error;

      set({ archivedAssignments: data || [], error: null });
    } catch (error) {
      set({ error: error as Error });
    } finally {
      set({ loading: false });
    }
  },

  fetchSubmissions: async () => {
    try {
      set({ loading: true, error: null });
      
      const { data, error } = await supabase
        .from('submissions')
        .select(`
          *,
          assignment:assignments(*),
          student:profiles(id, full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      set({ submissions: data || [], error: null });
    } catch (error) {
      set({ error: error as Error });
    } finally {
      set({ loading: false });
    }
  },

  restoreAssignment: async (id) => {
    try {
      set({ loading: true, error: null });
      
      const { error } = await supabase
        .rpc('restore_assignment', { assignment_id: id });

      if (error) throw error;

      // Refresh both lists
      await get().fetchAssignments();
      await get().fetchArchivedAssignments();
    } catch (error) {
      set({ error: error as Error });
      throw error;
    } finally {
      set({ loading: false });
    }
  }
}));