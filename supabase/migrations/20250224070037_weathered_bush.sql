/*
  # Fix Assignment Archiving

  1. Changes
    - Add trigger to handle assignment archiving
    - Ensure assignments are properly moved to archived_assignments table
    - Clean up related data when archiving

  2. Security
    - Maintain existing RLS policies
    - Ensure data integrity during archiving process
*/

-- Create trigger function to handle assignment archiving
CREATE OR REPLACE FUNCTION handle_assignment_archive()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert the assignment into archived_assignments
  INSERT INTO archived_assignments (
    id, created_at, title, description, due_date, points,
    teacher_id, file_url, requires_pdf, archived_by
  )
  VALUES (
    OLD.id, OLD.created_at, OLD.title, OLD.description, OLD.due_date,
    OLD.points, OLD.teacher_id, OLD.file_url, OLD.requires_pdf, auth.uid()
  );

  -- Delete related submissions
  DELETE FROM submissions WHERE assignment_id = OLD.id;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS assignment_archive_trigger ON assignments;

-- Create trigger
CREATE TRIGGER assignment_archive_trigger
  BEFORE DELETE ON assignments
  FOR EACH ROW
  EXECUTE FUNCTION handle_assignment_archive();