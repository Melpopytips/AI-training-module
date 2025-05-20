/*
  # Add analysis column to quiz_submissions table

  1. Changes
    - Add `analysis` column to store OpenAI's feedback
*/

ALTER TABLE quiz_submissions 
ADD COLUMN IF NOT EXISTS analysis text;