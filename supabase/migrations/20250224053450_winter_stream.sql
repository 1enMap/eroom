/*
  # Fix storage bucket policies

  1. Updates
    - Fix RLS policies for assignments bucket
    - Fix RLS policies for submissions bucket
    - Add DELETE policies for both buckets

  2. Security
    - Enable proper access control for file operations
    - Ensure teachers can manage their files
    - Ensure students can manage their submissions
*/

-- Drop existing policies if they exist
DO $$ 
BEGIN
  -- Assignments bucket policies
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Teachers can upload assignment files'
    AND tablename = 'objects'
    AND schemaname = 'storage'
  ) THEN
    DROP POLICY "Teachers can upload assignment files" ON storage.objects;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Anyone can download assignment files'
    AND tablename = 'objects'
    AND schemaname = 'storage'
  ) THEN
    DROP POLICY "Anyone can download assignment files" ON storage.objects;
  END IF;

  -- Submissions bucket policies
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Students can upload submission files'
    AND tablename = 'objects'
    AND schemaname = 'storage'
  ) THEN
    DROP POLICY "Students can upload submission files" ON storage.objects;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Teachers and file owners can download submission files'
    AND tablename = 'objects'
    AND schemaname = 'storage'
  ) THEN
    DROP POLICY "Teachers and file owners can download submission files" ON storage.objects;
  END IF;
END $$;

-- Create new policies for assignments bucket
CREATE POLICY "Teachers can upload assignment files"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'assignments' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'teacher'
    )
  );

CREATE POLICY "Anyone can download assignment files"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'assignments');

CREATE POLICY "Teachers can delete their assignment files"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'assignments' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'teacher'
    )
  );

-- Create new policies for submissions bucket
CREATE POLICY "Students can upload submission files"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'submissions' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'student'
    )
  );

CREATE POLICY "Teachers and owners can access submission files"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'submissions' AND
    (
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role = 'teacher'
      ) OR
      auth.uid()::text = SPLIT_PART(name, '/', 1)
    )
  );

CREATE POLICY "Students can delete their own submission files"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'submissions' AND
    auth.uid()::text = SPLIT_PART(name, '/', 1)
  );