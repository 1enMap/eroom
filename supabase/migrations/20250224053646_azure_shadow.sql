/*
  # Fix storage policies for assignments and submissions

  1. Changes
    - Simplify storage policies
    - Fix path handling for user-specific folders
    - Add missing DELETE policies
    - Ensure proper access control for both buckets

  2. Security
    - Teachers can manage assignment files
    - Students can manage their own submission files
    - Teachers can view all submission files
*/

-- Drop existing policies
DO $$ 
BEGIN
  -- Assignments bucket policies
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname IN (
      'Teachers can upload assignment files',
      'Anyone can download assignment files',
      'Teachers can delete their assignment files'
    )
    AND tablename = 'objects'
    AND schemaname = 'storage'
  ) THEN
    DROP POLICY IF EXISTS "Teachers can upload assignment files" ON storage.objects;
    DROP POLICY IF EXISTS "Anyone can download assignment files" ON storage.objects;
    DROP POLICY IF EXISTS "Teachers can delete their assignment files" ON storage.objects;
  END IF;

  -- Submissions bucket policies
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname IN (
      'Students can upload submission files',
      'Teachers and owners can access submission files',
      'Students can delete their own submission files'
    )
    AND tablename = 'objects'
    AND schemaname = 'storage'
  ) THEN
    DROP POLICY IF EXISTS "Students can upload submission files" ON storage.objects;
    DROP POLICY IF EXISTS "Teachers and owners can access submission files" ON storage.objects;
    DROP POLICY IF EXISTS "Students can delete their own submission files" ON storage.objects;
  END IF;
END $$;

-- Create new policies for assignments bucket
CREATE POLICY "Enable teacher assignment management"
  ON storage.objects
  FOR ALL
  TO authenticated
  USING (
    bucket_id = 'assignments' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'teacher'
    )
  )
  WITH CHECK (
    bucket_id = 'assignments' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'teacher'
    )
  );

CREATE POLICY "Enable assignment downloads"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'assignments');

-- Create new policies for submissions bucket
CREATE POLICY "Enable student submission management"
  ON storage.objects
  FOR ALL
  TO authenticated
  USING (
    bucket_id = 'submissions' AND
    auth.uid()::text = SPLIT_PART(name, '/', 1)
  )
  WITH CHECK (
    bucket_id = 'submissions' AND
    auth.uid()::text = SPLIT_PART(name, '/', 1)
  );

CREATE POLICY "Enable teacher submission access"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'submissions' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'teacher'
    )
  );