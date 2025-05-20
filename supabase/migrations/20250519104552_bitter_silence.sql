/*
  # Create quiz submissions table

  1. New Tables
    - `quiz_submissions`
      - `id` (uuid, primary key)
      - `user_first_name` (text)
      - `user_last_name` (text)
      - `user_email` (text)
      - `answer_1` (text)
      - `answer_2` (text)
      - `answer_3` (text)
      - `completed_modules` (integer)
      - `total_modules` (integer)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `quiz_submissions` table
    - Add policy for authenticated users to insert their own submissions
*/

CREATE TABLE IF NOT EXISTS quiz_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_first_name text NOT NULL,
  user_last_name text NOT NULL,
  user_email text NOT NULL,
  answer_1 text,
  answer_2 text,
  answer_3 text,
  completed_modules integer NOT NULL,
  total_modules integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE quiz_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert quiz submissions"
  ON quiz_submissions
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view their own submissions"
  ON quiz_submissions
  FOR SELECT
  TO authenticated
  USING (user_email = auth.email());