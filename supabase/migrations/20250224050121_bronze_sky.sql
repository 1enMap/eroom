/*
  # Initial Schema Setup for E-Room Assignment System

  1. New Tables
    - profiles: User profiles with roles
    - assignments: Assignment details and metadata
    - submissions: Student submissions and grades

  2. Security
    - Enable RLS on all tables
    - Add policies for role-based access
    - Secure data isolation between users

  3. Indexes
    - Added for frequently queried columns
    - Optimized for common access patterns
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  full_name text NOT NULL,
  role text NOT NULL CHECK (role IN ('teacher', 'student')),
  avatar_url text,
  CONSTRAINT valid_role CHECK (role IN ('teacher', 'student'))
);

-- Create assignments table
CREATE TABLE IF NOT EXISTS assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  title text NOT NULL,
  description text NOT NULL,
  due_date timestamptz NOT NULL,
  points integer NOT NULL CHECK (points > 0),
  teacher_id uuid NOT NULL REFERENCES profiles(id),
  file_url text
);

-- Create submissions table
CREATE TABLE IF NOT EXISTS submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  assignment_id uuid NOT NULL REFERENCES assignments(id),
  student_id uuid NOT NULL REFERENCES profiles(id),
  content text NOT NULL,
  file_url text,
  grade integer CHECK (grade >= 0 AND grade <= 100),
  feedback text,
  UNIQUE(assignment_id, student_id)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read their own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Assignments policies
CREATE POLICY "Teachers can create assignments"
  ON assignments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'teacher'
    )
  );

CREATE POLICY "Teachers can update their own assignments"
  ON assignments
  FOR UPDATE
  TO authenticated
  USING (
    teacher_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'teacher'
    )
  );

CREATE POLICY "Everyone can view assignments"
  ON assignments
  FOR SELECT
  TO authenticated
  USING (true);

-- Submissions policies
CREATE POLICY "Students can create submissions"
  ON submissions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'student'
    )
  );

CREATE POLICY "Students can view their own submissions"
  ON submissions
  FOR SELECT
  TO authenticated
  USING (
    student_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM assignments
      WHERE assignments.id = submissions.assignment_id
      AND assignments.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can grade submissions"
  ON submissions
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM assignments
      WHERE assignments.id = submissions.assignment_id
      AND assignments.teacher_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_assignments_teacher_id ON assignments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_submissions_assignment_id ON submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student_id ON submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);