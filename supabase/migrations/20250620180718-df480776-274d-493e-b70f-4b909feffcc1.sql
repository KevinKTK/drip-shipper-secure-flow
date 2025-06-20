
-- Add RLS policies for the orders table to allow INSERT, UPDATE, and DELETE operations
-- Since the existing SELECT policy allows all authenticated users to view orders,
-- we'll maintain consistency by allowing authenticated users to create, update, and delete their own orders

-- Policy to allow authenticated users to insert their own orders
CREATE POLICY "Users can insert their own orders" 
  ON public.orders 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id);

-- Policy to allow authenticated users to update their own orders  
CREATE POLICY "Users can update their own orders" 
  ON public.orders 
  FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = user_id);

-- Policy to allow authenticated users to delete their own orders
CREATE POLICY "Users can delete their own orders" 
  ON public.orders 
  FOR DELETE 
  TO authenticated 
  USING (auth.uid() = user_id);
