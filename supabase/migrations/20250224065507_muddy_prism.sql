/*
  # Add assignment archiving system
  
  1. New Tables
    - `archived_assignments`: Stores deleted assignments
      - Inherits structure from assignments table
      - Adds archive_date and archived_by columns
  
  2. Functions
    - `archive_assignment`: Moves assignment to archive instead of deletion
  
  3. Triggers
    - Before delete trigger to move assignments to archive
*/

-- Create archived assignments table
CREATE TABLE IF NOT EXISTS archived_assignments (
  id uuid PRIMARY KEY,
  created_at timestamptz NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  due_date timestamptz NOT NULL,
  points integer NOT NULL,
  teacher_id uuid NOT NULL REFERENCES profiles(id),
  file_url text,
  requires_pdf boolean NOT NULL DEFAULT false,
  archived_at timestamptz DEFAULT now(),
  archived_by uuid REFERENCES profiles(id)
);

-- Enable RLS on archived assignments
ALTER TABLE archived_assignments ENABLE ROW LEVEL SECURITY;

-- Create policy for teachers to view their archived assignments
CREATE POLICY "Teachers can view their archived assignments"
  ON archived_assignments
  FOR SELECT
  TO authenticated
  USING (
    teacher_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'teacher'
    )
  );

-- Function to archive an assignment
CREATE OR REPLACE FUNCTION archive_assignment()
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
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;