/*
  # Add requires_pdf column to assignments table

  1. Changes
    - Add `requires_pdf` boolean column to assignments table with default value of false
    - Make the column NOT NULL to ensure data consistency
*/

ALTER TABLE assignments
ADD COLUMN IF NOT EXISTS requires_pdf boolean NOT NULL DEFAULT false;