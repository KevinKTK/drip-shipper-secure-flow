
-- Create insurance templates table for pre-defined policies
CREATE TABLE public.insurance_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_type TEXT NOT NULL CHECK (policy_type IN ('shipper', 'carrier')),
  policy_name TEXT NOT NULL,
  description TEXT NOT NULL,
  premium_ink DECIMAL(15,2) NOT NULL,
  payout_amount_ink DECIMAL(15,2) NOT NULL,
  trigger_condition TEXT NOT NULL,
  delay_threshold_hours INTEGER,
  data_source TEXT DEFAULT 'PortAuthorityAPI',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create carrier routes table for journey logging
CREATE TABLE public.carrier_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  carrier_wallet_address TEXT,
  origin_port TEXT NOT NULL,
  destination_port TEXT NOT NULL,
  departure_date DATE NOT NULL,
  available_capacity_kg INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add insurance policy reference to orders table
ALTER TABLE public.orders ADD COLUMN selected_insurance_policy_id UUID REFERENCES public.insurance_templates(id);

-- Enable RLS on new tables
ALTER TABLE public.insurance_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carrier_routes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for insurance_templates (public read access for demo)
CREATE POLICY "Allow public read access for insurance_templates demo" 
  ON public.insurance_templates 
  FOR SELECT 
  TO authenticated, anon
  USING (true);

-- Create RLS policies for carrier_routes (public access for demo)
CREATE POLICY "Allow public read access for carrier_routes demo" 
  ON public.carrier_routes 
  FOR SELECT 
  TO authenticated, anon
  USING (true);

CREATE POLICY "Allow public insert access for carrier_routes demo" 
  ON public.carrier_routes 
  FOR INSERT 
  TO authenticated, anon
  WITH CHECK (true);

-- Insert sample insurance templates
INSERT INTO public.insurance_templates (policy_type, policy_name, description, premium_ink, payout_amount_ink, trigger_condition, delay_threshold_hours) VALUES
('shipper', 'On-Time Guarantee - Silver', 'Automated payout if delivery is delayed more than 72 hours', 50.00, 500.00, 'Arrival delay beyond scheduled time', 72),
('shipper', 'On-Time Guarantee - Gold', 'Premium protection with payout for delays over 48 hours', 100.00, 1000.00, 'Arrival delay beyond scheduled time', 48),
('shipper', 'Weather Protection Pro', 'Coverage for weather-related delays and disruptions', 75.00, 750.00, 'Weather-related departure delay', 96),
('shipper', 'Cargo Security Shield', 'Protection against theft, damage, and loss during transport', 150.00, 2500.00, 'Theft or damage during transport', 24),
('carrier', 'Vessel Mechanical Coverage', 'Engine failure and technical delay protection', 120.00, 1500.00, 'Engine failure or technical delays', 168),
('carrier', 'Route Disruption Shield', 'Coverage for geopolitical and port congestion delays', 200.00, 3000.00, 'Geopolitical route disruption', 120),
('carrier', 'Fuel Price Protection', 'Hedging against unexpected fuel cost increases', 80.00, 1200.00, 'Fuel price spike above threshold', 0),
('carrier', 'Cargo Integrity Cover', 'Protection for carrier liability on damaged goods', 250.00, 5000.00, 'Cargo damage liability claims', 48);

-- Add update triggers for new tables
CREATE TRIGGER update_insurance_templates_updated_at
  BEFORE UPDATE ON public.insurance_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_carrier_routes_updated_at
  BEFORE UPDATE ON public.carrier_routes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
