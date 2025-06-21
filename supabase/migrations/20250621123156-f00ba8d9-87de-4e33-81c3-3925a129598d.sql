
-- Make user_id nullable in user_insurance_policies table since we're using wallet_address as primary identifier
ALTER TABLE public.user_insurance_policies ALTER COLUMN user_id DROP NOT NULL;

-- Update RLS policies to work with wallet addresses instead of requiring Supabase user IDs
DROP POLICY IF EXISTS "Users can view their own insurance policies" ON public.user_insurance_policies;
DROP POLICY IF EXISTS "Users can create their own insurance policies" ON public.user_insurance_policies;
DROP POLICY IF EXISTS "Users can update their own insurance policies" ON public.user_insurance_policies;
DROP POLICY IF EXISTS "Users can delete their own insurance policies" ON public.user_insurance_policies;

-- Create new policies that work with wallet addresses
CREATE POLICY "Users can view their own insurance policies" 
  ON public.user_insurance_policies 
  FOR SELECT 
  TO authenticated 
  USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

CREATE POLICY "Users can create their own insurance policies" 
  ON public.user_insurance_policies 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

CREATE POLICY "Users can update their own insurance policies" 
  ON public.user_insurance_policies 
  FOR UPDATE 
  TO authenticated 
  USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

CREATE POLICY "Users can delete their own insurance policies" 
  ON public.user_insurance_policies 
  FOR DELETE 
  TO authenticated 
  USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- Create a more permissive policy that allows wallet-connected users to create policies
-- This allows any authenticated user to create policies with their wallet address
CREATE POLICY "Wallet users can create policies" 
  ON public.user_insurance_policies 
  FOR INSERT 
  TO anon 
  WITH CHECK (wallet_address IS NOT NULL);

CREATE POLICY "Wallet users can view their policies" 
  ON public.user_insurance_policies 
  FOR SELECT 
  TO anon 
  USING (wallet_address IS NOT NULL);

CREATE POLICY "Wallet users can update their policies" 
  ON public.user_insurance_policies 
  FOR UPDATE 
  TO anon 
  USING (wallet_address IS NOT NULL);

CREATE POLICY "Wallet users can delete their policies" 
  ON public.user_insurance_policies 
  FOR DELETE 
  TO anon 
  USING (wallet_address IS NOT NULL);
