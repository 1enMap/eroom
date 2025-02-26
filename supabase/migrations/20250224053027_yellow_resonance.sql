/*
  # Add storage buckets for assignments and submissions

  1. New Storage Buckets
    - `assignments` - For storing assignment PDFs
    - `submissions` - For storing submission PDFs

  2. Security
    - Enable public access for downloading files
    - Restrict uploads based on user role
*/

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('assignments', 'assignments', true),
  ('submissions', 'submissions', true);

-- Assignments bucket policies
CREATE POLICY "Teachers can upload assignment files"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'assignments' AND
    EXISTS (
      SELECT 1 FROM auth.users
      JOIN public.profiles ON profiles.id = auth.users.id
      WHERE auth.users.id = auth.uid()
      AND profiles.role = 'teacher'
    )
  );

CREATE POLICY "Anyone can download assignment files"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'assignments');

-- Submissions bucket policies
CREATE POLICY "Students can upload submission files"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'submissions' AND
    EXISTS (
      SELECT 1 FROM auth.users
      JOIN public.profiles ON profiles.id = auth.users.id
      WHERE auth.users.id = auth.uid()
      AND profiles.role = 'student'
    )
  );

CREATE POLICY "Teachers and file owners can download submission files"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'submissions' AND
    (
      -- Allow teachers to access all submissions
      EXISTS (
        SELECT 1 FROM auth.users
        JOIN public.profiles ON profiles.id = auth.users.id
        WHERE auth.users.id = auth.uid()
        AND profiles.role = 'teacher'
      )
      OR
      -- Allow students to access their own submissions
      (storage.foldername(name))[1] = auth.uid()::text
    )
  );