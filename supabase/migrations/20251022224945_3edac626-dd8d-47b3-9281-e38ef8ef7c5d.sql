-- Add onboarding fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS expertise text CHECK (expertise IN ('optique', 'juridique', 'medical', 'evenementiel')),
ADD COLUMN IF NOT EXISTS delivery_objects text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS delivery_other_note text,
ADD COLUMN IF NOT EXISTS onboarding_step text;

-- Create index for onboarding_step queries
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_step ON public.profiles(onboarding_step);