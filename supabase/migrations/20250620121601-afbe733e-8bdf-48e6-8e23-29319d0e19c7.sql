
-- First, let's temporarily disable RLS and drop the foreign key constraint for demo purposes
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;

-- Drop the foreign key constraint temporarily for demo data
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_user_id_fkey;

-- Make user_id nullable for demo purposes
ALTER TABLE public.orders ALTER COLUMN user_id DROP NOT NULL;

-- Also make user_id nullable in insurance_policies table
ALTER TABLE public.insurance_policies ALTER COLUMN user_id DROP NOT NULL;

-- Insert cargo orders with NULL user_id for demo
INSERT INTO public.orders (id, user_id, order_type, title, description, origin_port, destination_port, departure_date, arrival_date, cargo_type, weight_tons, volume_cbm, price_ink, status, nft_token_id, is_insured) VALUES
('660e8400-e29b-41d4-a716-446655440001', NULL, 'cargo', 'Electronics Container Shipment', 'High-value electronics from Shenzhen factories to European distribution centers', 'Shenzhen', 'Rotterdam', '2025-01-15', '2025-02-20', 'container', 2500, 2800, 15000.00, 'pending', 'NFT-CARGO-001', true),
('660e8400-e29b-41d4-a716-446655440002', NULL, 'cargo', 'Automotive Parts Express', 'Urgent automotive components for German manufacturers', 'Shanghai', 'Hamburg', '2025-01-20', '2025-02-25', 'container', 1800, 2200, 12500.00, 'pending', 'NFT-CARGO-002', false),
('660e8400-e29b-41d4-a716-446655440003', NULL, 'cargo', 'Grain Bulk Export', 'Premium wheat export to Asian markets', 'Long Beach', 'Yokohama', '2025-01-25', '2025-02-15', 'dry_bulk', 45000, NULL, 28000.00, 'active', 'NFT-CARGO-003', true),
('660e8400-e29b-41d4-a716-446655440004', NULL, 'cargo', 'Textile Manufacturing Goods', 'Cotton textiles and garments for US retail', 'Mumbai', 'Los Angeles', '2025-02-01', '2025-03-10', 'container', 3200, 3600, 18000.00, 'pending', NULL, false),
('660e8400-e29b-41d4-a716-446655440005', NULL, 'cargo', 'Steel Coils Transport', 'Hot-rolled steel coils for construction industry', 'Genoa', 'New York', '2025-02-05', '2025-03-01', 'breakbulk', 8500, NULL, 22000.00, 'pending', 'NFT-CARGO-005', true),
('660e8400-e29b-41d4-a716-446655440006', NULL, 'cargo', 'Crude Oil Shipment', 'Light crude oil from Middle East refineries', 'Dubai', 'Singapore', '2025-02-10', '2025-02-18', 'liquid_bulk', 75000, NULL, 45000.00, 'matched', 'NFT-CARGO-006', true),
('660e8400-e29b-41d4-a716-446655440007', NULL, 'cargo', 'Wind Turbine Components', 'Offshore wind farm turbine blades and nacelles', 'Copenhagen', 'Boston', '2025-02-15', '2025-03-20', 'project_cargo', 12000, NULL, 35000.00, 'pending', 'NFT-CARGO-007', false),
('660e8400-e29b-41d4-a716-446655440008', NULL, 'cargo', 'Chemical Products', 'Industrial chemicals for pharmaceutical industry', 'Antwerp', 'Vladivostok', '2025-02-20', '2025-03-25', 'liquid_bulk', 5500, NULL, 16500.00, 'pending', NULL, false),
('660e8400-e29b-41d4-a716-446655440009', NULL, 'cargo', 'Luxury Vehicles', 'Premium European automobiles for Asian markets', 'Bremerhaven', 'Tokyo', '2025-03-01', '2025-04-05', 'breakbulk', 850, 1200, 25000.00, 'pending', 'NFT-CARGO-009', true),
('660e8400-e29b-41d4-a716-446655440010', NULL, 'cargo', 'Coffee Bean Export', 'Premium coffee beans from South American plantations', 'Santos', 'Kobe', '2025-03-05', '2025-04-10', 'container', 2200, 2500, 14000.00, 'pending', 'NFT-CARGO-010', false);

-- Insert vessel orders
INSERT INTO public.orders (id, user_id, order_type, title, description, origin_port, destination_port, departure_date, arrival_date, vessel_type, weight_tons, volume_cbm, price_ink, status, nft_token_id, is_insured) VALUES
('770e8400-e29b-41d4-a716-446655440001', NULL, 'vessel', 'Container Vessel - Pacific Route', '14,000 TEU container ship available for trans-Pacific routes', 'Los Angeles', 'Shanghai', '2025-01-18', '2025-02-08', 'container_ship', NULL, 165000, 20000.00, 'pending', 'NFT-VESSEL-001', false),
('770e8400-e29b-41d4-a716-446655440002', NULL, 'vessel', 'Bulk Carrier - Capesize', 'Large bulk carrier for dry cargo, grain and ore transport', 'Newcastle', 'Qingdao', '2025-01-22', '2025-02-12', 'bulk_carrier', NULL, 180000, 25000.00, 'active', 'NFT-VESSEL-002', true),
('770e8400-e29b-41d4-a716-446655440003', NULL, 'vessel', 'Mediterranean Ferry', 'RoRo vessel for vehicles and passenger transport', 'Barcelona', 'Palermo', '2025-01-28', '2025-01-30', 'ro_ro', NULL, 8500, 8000.00, 'pending', NULL, false),
('770e8400-e29b-41d4-a716-446655440004', NULL, 'vessel', 'Product Tanker', 'Clean product tanker for refined petroleum transport', 'Kuwait City', 'Mumbai', '2025-02-03', '2025-02-10', 'tanker', NULL, 45000, 18000.00, 'matched', 'NFT-VESSEL-004', true),
('770e8400-e29b-41d4-a716-446655440005', NULL, 'vessel', 'General Cargo Vessel', 'Multi-purpose vessel for project and breakbulk cargo', 'Hamburg', 'Montreal', '2025-02-08', '2025-02-18', 'general_cargo', NULL, 12000, 15000.00, 'pending', 'NFT-VESSEL-005', false),
('770e8400-e29b-41d4-a716-446655440006', NULL, 'vessel', 'LNG Carrier', 'Specialized vessel for liquefied natural gas transport', 'Sakhalin', 'Yokohama', '2025-02-12', '2025-02-15', 'lng_carrier', NULL, 140000, 32000.00, 'pending', 'NFT-VESSEL-006', true),
('770e8400-e29b-41d4-a716-446655440007', NULL, 'vessel', 'Feeder Container Ship', 'Regional container vessel for Asian ports', 'Busan', 'Manila', '2025-02-15', '2025-02-18', 'container_ship', NULL, 15000, 6500.00, 'pending', NULL, false),
('770e8400-e29b-41d4-a716-446655440008', NULL, 'vessel', 'Chemical Tanker', 'Specialized tanker for chemical and pharmaceutical products', 'Rotterdam', 'Antwerp', '2025-02-18', '2025-02-19', 'tanker', NULL, 8000, 5000.00, 'pending', 'NFT-VESSEL-008', false);

-- Insert order matches
INSERT INTO public.order_matches (cargo_order_id, vessel_order_id, match_price_ink, status) VALUES
('660e8400-e29b-41d4-a716-446655440006', '770e8400-e29b-41d4-a716-446655440004', 31500.00, 'active'),
('660e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440002', 26500.00, 'pending'),
('660e8400-e29b-41d4-a716-446655440005', '770e8400-e29b-41d4-a716-446655440005', 18500.00, 'pending');

-- Insert insurance policies
INSERT INTO public.insurance_policies (order_id, user_id, policy_name, trigger_condition, delay_threshold_hours, payout_amount_ink, premium_ink, data_source, is_active, nft_token_id) VALUES
('660e8400-e29b-41d4-a716-446655440001', NULL, 'Electronics Delay Protection', 'Arrival delay beyond scheduled time', 48, 7500.00, 750.00, 'PortAuthorityAPI', true, 'NFT-POLICY-001'),
('660e8400-e29b-41d4-a716-446655440003', NULL, 'Grain Export Weather Shield', 'Weather-related departure delay', 72, 14000.00, 1400.00, 'WeatherOracle', true, 'NFT-POLICY-002'),
('660e8400-e29b-41d4-a716-446655440005', NULL, 'Steel Transport Guarantee', 'Port congestion delay coverage', 96, 11000.00, 1100.00, 'PortAuthorityAPI', true, 'NFT-POLICY-003'),
('660e8400-e29b-41d4-a716-446655440006', NULL, 'Crude Oil Route Protection', 'Geopolitical route disruption', 120, 22500.00, 2250.00, 'GeopoliticalOracle', true, 'NFT-POLICY-004'),
('660e8400-e29b-41d4-a716-446655440009', NULL, 'Luxury Vehicle Security', 'Theft or damage during transport', 24, 12500.00, 1875.00, 'SecurityOracle', true, 'NFT-POLICY-005'),
('770e8400-e29b-41d4-a716-446655440002', NULL, 'Vessel Mechanical Coverage', 'Engine failure or technical delays', 168, 15000.00, 1200.00, 'VesselTrackingAPI', true, 'NFT-POLICY-006'),
('770e8400-e29b-41d4-a716-446655440006', NULL, 'LNG Carrier Safety Policy', 'Safety incident or emergency delays', 48, 20000.00, 3200.00, 'SafetyMonitoringAPI', true, 'NFT-POLICY-007');

-- Re-enable RLS with public access for demo
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Create policies that allow public access for demo purposes
DROP POLICY IF EXISTS "Users can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can update their own orders" ON public.orders;

CREATE POLICY "Allow public read access for demo" 
  ON public.orders 
  FOR SELECT 
  TO authenticated, anon
  USING (true);

-- Same for other tables
ALTER TABLE public.order_matches ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view matches for their orders" ON public.order_matches;
DROP POLICY IF EXISTS "Users can create matches for their orders" ON public.order_matches;

CREATE POLICY "Allow public read access for order_matches demo" 
  ON public.order_matches 
  FOR SELECT 
  TO authenticated, anon
  USING (true);

ALTER TABLE public.insurance_policies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view all insurance policies" ON public.insurance_policies;
DROP POLICY IF EXISTS "Users can create their own insurance policies" ON public.insurance_policies;
DROP POLICY IF EXISTS "Users can update their own insurance policies" ON public.insurance_policies;

CREATE POLICY "Allow public read access for insurance_policies demo" 
  ON public.insurance_policies 
  FOR SELECT 
  TO authenticated, anon
  USING (true);
