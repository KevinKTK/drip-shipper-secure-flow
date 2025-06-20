
-- Update the orders table to use wallet_address instead of user_id
ALTER TABLE public.orders 
ADD COLUMN wallet_address TEXT;

-- Update RLS policies to use wallet address instead of auth.uid()
DROP POLICY IF EXISTS "Users can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Users can insert their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can update their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can delete their own orders" ON public.orders;

-- Create new RLS policies based on wallet address
CREATE POLICY "Users can view all orders" 
  ON public.orders 
  FOR SELECT 
  TO public
  USING (true);

CREATE POLICY "Users can insert orders with their wallet address" 
  ON public.orders 
  FOR INSERT 
  TO public
  WITH CHECK (wallet_address IS NOT NULL);

CREATE POLICY "Users can update their own orders by wallet address" 
  ON public.orders 
  FOR UPDATE 
  TO public
  USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

CREATE POLICY "Users can delete their own orders by wallet address" 
  ON public.orders 
  FOR DELETE 
  TO public
  USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- Make the user_id column nullable since we're transitioning to wallet_address
ALTER TABLE public.orders ALTER COLUMN user_id DROP NOT NULL;
