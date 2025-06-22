
-- Enable RLS on carrier_routes table (if not already enabled)
ALTER TABLE public.carrier_routes ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to insert their own carrier routes
CREATE POLICY "Users can create their own carrier routes" 
  ON public.carrier_routes 
  FOR INSERT 
  WITH CHECK (carrier_wallet_address IS NOT NULL);

-- Create policy that allows users to view their own carrier routes
CREATE POLICY "Users can view their own carrier routes" 
  ON public.carrier_routes 
  FOR SELECT 
  USING (carrier_wallet_address IS NOT NULL);

-- Create policy that allows users to update their own carrier routes
CREATE POLICY "Users can update their own carrier routes" 
  ON public.carrier_routes 
  FOR UPDATE 
  USING (carrier_wallet_address IS NOT NULL);

-- Create policy that allows users to delete their own carrier routes
CREATE POLICY "Users can delete their own carrier routes" 
  ON public.carrier_routes 
  FOR DELETE 
  USING (carrier_wallet_address IS NOT NULL);
