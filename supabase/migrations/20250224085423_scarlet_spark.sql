/*
  # Add Delete All Archived Assignments Function

  1. New Functions
    - `delete_all_archived_assignments`: Permanently deletes all archived assignments for a teacher
      - Verifies user is a teacher
      - Deletes all archived assignments owned by the teacher

  2. Security
    - Function is SECURITY DEFINER to run with elevated privileges
    - Checks user role before allowing deletion
*/

CREATE OR REPLACE FUNCTION delete_all_archived_assignments()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify the user is a teacher
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'teacher'
  ) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Delete all archived assignments for the teacher
  DELETE FROM archived_assignments 
  WHERE teacher_id = auth.uid();
END;
$$;