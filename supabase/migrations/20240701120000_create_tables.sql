-- Create custom types for the maritime shipping platform (only if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_type') THEN
        CREATE TYPE public.order_type AS ENUM ('cargo', 'vessel');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
        CREATE TYPE public.order_status AS ENUM ('pending', 'active', 'matched', 'completed', 'cancelled');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'cargo_type') THEN
        CREATE TYPE public.cargo_type AS ENUM ('container', 'dry_bulk', 'liquid_bulk', 'breakbulk', 'project_cargo', 'reefer');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vessel_type') THEN
        CREATE TYPE public.vessel_type AS ENUM ('container_ship', 'bulk_carrier', 'tanker', 'ro_ro', 'general_cargo', 'lng_carrier', 'lpg_carrier');
    END IF;
END $$;

-- Create profiles table (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  company_name TEXT,
  wallet_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table with smart contract addresses (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_address TEXT,
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
  -- Smart contract addresses
  vessel_nft_contract_address TEXT,
  cargo_nft_contract_address TEXT,
  insurance_manager_contract_address TEXT,
  journey_manager_contract_address TEXT,
  brokerage_contract_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order_matches table with smart contract addresses (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.order_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cargo_order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  vessel_order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  match_price_ink DECIMAL(15,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  -- Smart contract addresses
  journey_manager_contract_address TEXT,
  brokerage_contract_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(cargo_order_id, vessel_order_id)
);

-- Create insurance_policies table with smart contract addresses (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.insurance_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_address TEXT,
  policy_name TEXT NOT NULL,
  trigger_condition TEXT NOT NULL,
  delay_threshold_hours INTEGER NOT NULL,
  payout_amount_ink DECIMAL(15,2) NOT NULL,
  premium_ink DECIMAL(15,2) NOT NULL,
  data_source TEXT DEFAULT 'PortAuthorityAPI',
  is_active BOOLEAN DEFAULT TRUE,
  nft_token_id TEXT,
  -- Smart contract addresses
  insurance_manager_contract_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create smart_contracts table to track deployed contracts (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.smart_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_name TEXT NOT NULL,
  contract_address TEXT NOT NULL UNIQUE,
  network TEXT NOT NULL DEFAULT 'ink-sepolia',
  abi_hash TEXT,
  deployed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smart_contracts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

DROP POLICY IF EXISTS "Users can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can update their own orders" ON public.orders;

DROP POLICY IF EXISTS "Users can view matches for their orders" ON public.order_matches;
DROP POLICY IF EXISTS "Users can create matches for their orders" ON public.order_matches;

DROP POLICY IF EXISTS "Users can view all insurance policies" ON public.insurance_policies;
DROP POLICY IF EXISTS "Users can create their own insurance policies" ON public.insurance_policies;
DROP POLICY IF EXISTS "Users can update their own insurance policies" ON public.insurance_policies;

DROP POLICY IF EXISTS "Users can view all smart contracts" ON public.smart_contracts;
DROP POLICY IF EXISTS "Admin can manage smart contracts" ON public.smart_contracts;

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
  WITH CHECK (auth.uid() = user_id OR wallet_address IS NOT NULL);

CREATE POLICY "Users can update their own orders" 
  ON public.orders 
  FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = user_id OR wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- Create RLS policies for order_matches table
CREATE POLICY "Users can view matches for their orders" 
  ON public.order_matches 
  FOR SELECT 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE (id = cargo_order_id OR id = vessel_order_id) 
      AND (user_id = auth.uid() OR wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address')
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
      AND (user_id = auth.uid() OR wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address')
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
  WITH CHECK (auth.uid() = user_id OR wallet_address IS NOT NULL);

CREATE POLICY "Users can update their own insurance policies" 
  ON public.insurance_policies 
  FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = user_id OR wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- Create RLS policies for smart_contracts table
CREATE POLICY "Users can view all smart contracts" 
  ON public.smart_contracts 
  FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Admin can manage smart contracts" 
  ON public.smart_contracts 
  FOR ALL 
  TO authenticated 
  USING (auth.jwt() ->> 'role' = 'admin');

-- Create function to automatically create profile on user signup (only if it doesn't exist)
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

-- Create function to update updated_at timestamp (only if it doesn't exist)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Create trigger for new user profiles (drop and recreate to avoid conflicts)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add triggers to update updated_at timestamps (drop and recreate to avoid conflicts)
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_order_matches_updated_at ON public.order_matches;
CREATE TRIGGER update_order_matches_updated_at
  BEFORE UPDATE ON public.order_matches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_insurance_policies_updated_at ON public.insurance_policies;
CREATE TRIGGER update_insurance_policies_updated_at
  BEFORE UPDATE ON public.insurance_policies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_smart_contracts_updated_at ON public.smart_contracts;
CREATE TRIGGER update_smart_contracts_updated_at
  BEFORE UPDATE ON public.smart_contracts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column(); 