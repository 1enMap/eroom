/*
  # Add Delete Archived Assignment Function

  1. New Functions
    - `delete_archived_assignment`: Permanently deletes an archived assignment
      - Verifies user is a teacher and owns the assignment
      - Deletes the assignment from archived_assignments table

  2. Security
    - Function is SECURITY DEFINER to run with elevated privileges
    - Checks user role and ownership before allowing deletion
*/

-- Function to permanently delete an archived assignment
CREATE OR REPLACE FUNCTION delete_archived_assignment(assignment_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify the user is a teacher and owns the archived assignment
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'teacher'
    AND EXISTS (
      SELECT 1 FROM archived_assignments
      WHERE id = assignment_id
      AND teacher_id = auth.uid()
    )
  ) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Delete the archived assignment
  DELETE FROM archived_assignments WHERE id = assignment_id;
END;
$$;