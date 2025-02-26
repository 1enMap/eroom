/*
  # Add Assignment Management Functions

  1. Changes
    - Add function to delete assignments with proper archiving
    - Add function to restore archived assignments
    - Ensure atomic operations for data integrity

  2. Security
    - Functions run with security definer to ensure proper access
    - Validate user permissions within functions
*/

-- Function to delete an assignment
CREATE OR REPLACE FUNCTION delete_assignment(assignment_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify the user is a teacher and owns the assignment
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'teacher'
    AND EXISTS (
      SELECT 1 FROM assignments
      WHERE id = assignment_id
      AND teacher_id = auth.uid()
    )
  ) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Delete the assignment (trigger will handle archiving)
  DELETE FROM assignments WHERE id = assignment_id;
END;
$$;

-- Function to restore an archived assignment
CREATE OR REPLACE FUNCTION restore_assignment(assignment_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_archived archived_assignments;
BEGIN
  -- Verify the user is a teacher and owns the archived assignment
  SELECT * INTO v_archived
  FROM archived_assignments
  WHERE id = assignment_id
  AND teacher_id = auth.uid();

  IF NOT FOUND OR NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'teacher'
  ) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Insert back into assignments
  INSERT INTO assignments (
    id, created_at, title, description, due_date,
    points, teacher_id, file_url, requires_pdf
  )
  VALUES (
    v_archived.id, v_archived.created_at, v_archived.title,
    v_archived.description, v_archived.due_date, v_archived.points,
    v_archived.teacher_id, v_archived.file_url, v_archived.requires_pdf
  );

  -- Remove from archived_assignments
  DELETE FROM archived_assignments WHERE id = assignment_id;
END;
$$;