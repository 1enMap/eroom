export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          created_at: string
          full_name: string
          role: 'teacher' | 'student'
          avatar_url: string | null
        }
        Insert: {
          id: string
          created_at?: string
          full_name: string
          role: 'teacher' | 'student'
          avatar_url?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          full_name?: string
          role?: 'teacher' | 'student'
          avatar_url?: string | null
        }
      }
      assignments: {
        Row: {
          id: string
          created_at: string
          title: string
          description: string
          due_date: string
          points: number
          teacher_id: string
          file_url: string | null
          requires_pdf: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          description: string
          due_date: string
          points: number
          teacher_id: string
          file_url?: string | null
          requires_pdf?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          description?: string
          due_date?: string
          points?: number
          teacher_id?: string
          file_url?: string | null
          requires_pdf?: boolean
        }
      }
      submissions: {
        Row: {
          id: string
          created_at: string
          assignment_id: string
          student_id: string
          content: string
          file_url: string | null
          grade: number | null
          feedback: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          assignment_id: string
          student_id: string
          content: string
          file_url?: string | null
          grade?: number | null
          feedback?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          assignment_id?: string
          student_id?: string
          content?: string
          file_url?: string | null
          grade?: number | null
          feedback?: string | null
        }
      }
    }
  }
}