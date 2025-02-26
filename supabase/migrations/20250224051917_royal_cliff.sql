/*
  # Fix profiles table RLS policies

  1. Changes
    - Add policy to allow inserting new profiles during registration
    - Keep existing policies for reading and updating profiles

  2. Security
    - Users can only insert their own profile with matching auth.uid
    - Maintains existing RLS for read/update operations
*/

-- Drop existing policies if they exist
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles'
    AND policyname = 'Users can read their own profile'
  ) THEN
    DROP POLICY "Users can read their own profile" ON profiles;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles'
    AND policyname = 'Users can update their own profile'
  ) THEN
    DROP POLICY "Users can update their own profile" ON profiles;
  END IF;
END $$;

-- Create comprehensive policies
CREATE POLICY "Enable insert for authentication users only" 
ON profiles FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable read access for users" 
ON profiles FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Enable update for users based on id" 
ON profiles FOR UPDATE 
TO authenticated 
USING (auth.uid() = id) 
WITH CHECK (auth.uid() = id);