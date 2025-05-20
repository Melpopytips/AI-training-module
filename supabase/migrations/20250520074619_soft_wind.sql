/*
  # Add public access policy for quiz submissions

  1. Security Changes
    - Add policy to allow public access to view all quiz submissions
    - This is needed for the dashboard to display submissions without authentication
*/

CREATE POLICY "Allow public to view all submissions"
  ON quiz_submissions
  FOR SELECT
  TO public
  USING (true);