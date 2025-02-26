/*
  # Fix Assignment Submissions

  1. Changes
    - Add function to handle assignment submissions
    - Add policies for submission management
    - Add validation for submission requirements

  2. Security
    - Ensure proper access control for submissions
    - Validate submission requirements
*/

-- Function to submit an assignment
CREATE OR REPLACE FUNCTION submit_assignment(
  p_assignment_id uuid,
  p_content text,
  p_file_url text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_assignment assignments;
  v_submission_id uuid;
BEGIN
  -- Verify the user is a student
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'student'
  ) THEN
    RAISE EXCEPTION 'Only students can submit assignments';
  END IF;

  -- Get assignment details
  SELECT * INTO v_assignment
  FROM assignments
  WHERE id = p_assignment_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Assignment not found';
  END IF;

  -- Check if assignment is past due
  IF v_assignment.due_date < NOW() THEN
    RAISE EXCEPTION 'Assignment is past due';
  END IF;

  -- Check PDF requirement
  IF v_assignment.requires_pdf AND p_file_url IS NULL THEN
    RAISE EXCEPTION 'This assignment requires a PDF submission';
  END IF;

  -- Check if already submitted
  IF EXISTS (
    SELECT 1 FROM submissions
    WHERE assignment_id = p_assignment_id
    AND student_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'You have already submitted this assignment';
  END IF;

  -- Create submission
  INSERT INTO submissions (
    assignment_id,
    student_id,
    content,
    file_url
  )
  VALUES (
    p_assignment_id,
    auth.uid(),
    p_content,
    p_file_url
  )
  RETURNING id INTO v_submission_id;

  RETURN v_submission_id;
END;
$$;