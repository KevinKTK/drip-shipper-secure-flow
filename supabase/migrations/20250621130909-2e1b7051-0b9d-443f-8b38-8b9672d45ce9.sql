
-- Add cargo damage threshold column to user_insurance_policies table
ALTER TABLE public.user_insurance_policies 
ADD COLUMN IF NOT EXISTS cargo_damage_threshold_percentage INTEGER;

-- Update the policy_type column to use the proper enum type
ALTER TABLE public.user_insurance_policies 
ALTER COLUMN policy_type TYPE TEXT;

-- Add a check constraint to ensure policy_type is either 'shipper' or 'carrier'
ALTER TABLE public.user_insurance_policies 
ADD CONSTRAINT check_policy_type 
CHECK (policy_type IN ('shipper', 'carrier', 'custom'));
