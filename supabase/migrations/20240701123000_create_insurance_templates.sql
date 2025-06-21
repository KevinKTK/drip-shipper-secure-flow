-- Create custom types for insurance policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'insurance_policy_type') THEN
        CREATE TYPE public.insurance_policy_type AS ENUM ('shipper', 'carrier');
    END IF;
END $$;

-- Create insurance_templates table to store reusable policy definitions
CREATE TABLE IF NOT EXISTS public.insurance_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_name TEXT NOT NULL,
  description TEXT,
  policy_type public.insurance_policy_type NOT NULL,
  trigger_condition TEXT NOT NULL,
  delay_threshold_hours INTEGER,
  payout_amount_ink DECIMAL(15,2) NOT NULL,
  premium_ink DECIMAL(15,2) NOT NULL,
  data_source TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.insurance_templates ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view all templates
CREATE POLICY "Users can view all insurance templates" 
  ON public.insurance_templates 
  FOR SELECT 
  TO authenticated 
  USING (true);

-- Allow admin to manage templates
CREATE POLICY "Admin can manage insurance templates" 
  ON public.insurance_templates 
  FOR ALL 
  TO authenticated 
  USING (auth.jwt() ->> 'role' = 'admin'); 