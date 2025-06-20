
-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  company_name TEXT,
  wallet_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_type public.order_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  origin_port TEXT NOT NULL,
  destination_port TEXT NOT NULL,
  departure_date DATE NOT NULL,
  arrival_date DATE,
  cargo_type public.cargo_type,
  vessel_type public.vessel_type,
  weight_tons INTEGER,
  volume_cbm INTEGER,
  price_ink DECIMAL(15,2) NOT NULL,
  status public.order_status DEFAULT 'pending',
  nft_token_id TEXT,
  is_insured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order_matches table
CREATE TABLE public.order_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cargo_order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  vessel_order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  match_price_ink DECIMAL(15,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(cargo_order_id, vessel_order_id)
);

-- Create insurance_policies table
CREATE TABLE public.insurance_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  policy_name TEXT NOT NULL,
  trigger_condition TEXT NOT NULL,
  delay_threshold_hours INTEGER NOT NULL,
  payout_amount_ink DECIMAL(15,2) NOT NULL,
  premium_ink DECIMAL(15,2) NOT NULL,
  data_source TEXT DEFAULT 'PortAuthorityAPI',
  is_active BOOLEAN DEFAULT TRUE,
  nft_token_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_policies ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles table
CREATE POLICY "Users can view all profiles" 
  ON public.profiles 
  FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = id);

-- Create RLS policies for orders table
CREATE POLICY "Users can view all orders" 
  ON public.orders 
  FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Users can create their own orders" 
  ON public.orders 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own orders" 
  ON public.orders 
  FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = user_id);

-- Create RLS policies for order_matches table
CREATE POLICY "Users can view matches for their orders" 
  ON public.order_matches 
  FOR SELECT 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE (id = cargo_order_id OR id = vessel_order_id) 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create matches for their orders" 
  ON public.order_matches 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE (id = cargo_order_id OR id = vessel_order_id) 
      AND user_id = auth.uid()
    )
  );

-- Create RLS policies for insurance_policies table
CREATE POLICY "Users can view all insurance policies" 
  ON public.insurance_policies 
  FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Users can create their own insurance policies" 
  ON public.insurance_policies 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own insurance policies" 
  ON public.insurance_policies 
  FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = user_id);

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'full_name', 'Anonymous User')
  );
  RETURN new;
END;
$$;

-- Create trigger for new user profiles
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add triggers to update updated_at timestamps
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_order_matches_updated_at
  BEFORE UPDATE ON public.order_matches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_insurance_policies_updated_at
  BEFORE UPDATE ON public.insurance_policies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
