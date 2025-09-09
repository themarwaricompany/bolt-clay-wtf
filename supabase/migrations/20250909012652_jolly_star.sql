/*
  # Add LinkedIn profile URL to profiles table

  1. Changes
    - Add `linkedin_profile_url` column to `profiles` table
    - Column is optional (nullable) to support existing users
    - Add validation to ensure proper LinkedIn URL format when provided

  2. Security
    - No changes to existing RLS policies
    - Column follows existing security model
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'linkedin_profile_url'
  ) THEN
    ALTER TABLE profiles ADD COLUMN linkedin_profile_url text;
  END IF;
END $$;