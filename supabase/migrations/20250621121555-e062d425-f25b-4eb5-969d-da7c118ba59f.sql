
-- Create a table for user-created insurance policies
CREATE TABLE IF NOT EXISTS public.user_insurance_policies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  wallet_address TEXT NOT NULL,
  policy_name TEXT NOT NULL,
  description TEXT,
  delay_threshold_hours INTEGER NOT NULL,
  payout_amount_eth NUMERIC(15,4) NOT NULL,
  premium_eth NUMERIC(15,4) NOT NULL,
  trigger_condition TEXT NOT NULL DEFAULT 'Shipment delay exceeds threshold',
  data_source TEXT DEFAULT 'PortAuthorityAPI',
  is_active BOOLEAN DEFAULT TRUE,
  policy_type TEXT DEFAULT 'custom',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_insurance_policies ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own policies
CREATE POLICY "Users can view their own insurance policies" 
  ON public.user_insurance_policies 
  FOR SELECT 
  TO authenticated 
  USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address' OR auth.uid()::text = user_id::text);

-- Allow users to create their own policies
CREATE POLICY "Users can create their own insurance policies" 
  ON public.user_insurance_policies 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address' OR auth.uid()::text = user_id::text);

-- Allow users to update their own policies
CREATE POLICY "Users can update their own insurance policies" 
  ON public.user_insurance_policies 
  FOR UPDATE 
  TO authenticated 
  USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address' OR auth.uid()::text = user_id::text);

-- Allow users to delete their own policies
CREATE POLICY "Users can delete their own insurance policies" 
  ON public.user_insurance_policies 
  FOR DELETE 
  TO authenticated 
  USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address' OR auth.uid()::text = user_id::text);

-- Update the orders table to allow referencing user-created policies
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS user_insurance_policy_id UUID REFERENCES public.user_insurance_policies(id);
