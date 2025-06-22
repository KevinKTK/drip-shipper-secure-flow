import { createClient } from '@supabase/supabase-js';
import { CONTRACT_ADDRESSES } from './walletSecrets.ts';

// Types for database operations
export interface Profile {
  id?: string;
  full_name: string;
  company_name?: string;
  wallet_address?: string;
}

export interface Order {
  id?: string;
  user_id?: string;
  wallet_address?: string;
  order_type: 'cargo' | 'vessel';
  title: string;
  description?: string;
  origin_port: string;
  destination_port: string;
  departure_date: string;
  arrival_date?: string;
  cargo_type?: 'container' | 'dry_bulk' | 'liquid_bulk' | 'breakbulk' | 'project_cargo' | 'reefer';
  vessel_type?: 'container_ship' | 'bulk_carrier' | 'tanker' | 'ro_ro' | 'general_cargo' | 'lng_carrier' | 'lpg_carrier';
  weight_tons?: number;
  volume_cbm?: number;
  price_ink: number;
  status?: 'pending' | 'active' | 'matched' | 'completed' | 'cancelled';
  nft_token_id?: string;
  is_insured?: boolean;
  vessel_nft_contract_address?: string;
  cargo_nft_contract_address?: string;
  insurance_policy_nft_contract_address?: string;
  journey_nft_contract_address?: string;
  brokerage_contract_address?: string;
}

export interface OrderMatch {
  id?: string;
  cargo_order_id: string;
  vessel_order_id: string;
  match_price_ink: number;
  status?: string;
  journey_nft_contract_address?: string;
  brokerage_contract_address?: string;
}

export interface InsurancePolicy {
  id?: string;
  order_id: string;
  user_id?: string;
  wallet_address?: string;
  policy_name: string;
  trigger_condition: string;
  delay_threshold_hours: number;
  payout_amount_ink: number;
  premium_ink: number;
  data_source?: string;
  is_active?: boolean;
  nft_token_id?: string;
  insurance_policy_nft_contract_address?: string;
}

export interface SmartContract {
  id?: string;
  contract_name: string;
  contract_address: string;
  network?: string;
  abi_hash?: string;
  is_active?: boolean;
}

// Mock data for cargo orders
export const mockCargoOrders: Order[] = [
  {
    order_type: 'cargo',
    title: 'Electronics Container Shipment',
    description: 'High-value electronics from Shenzhen factories to European distribution centers',
    origin_port: 'Shenzhen',
    destination_port: 'Rotterdam',
    departure_date: '2025-01-15',
    arrival_date: '2025-02-20',
    cargo_type: 'container',
    weight_tons: 2500,
    volume_cbm: 2800,
    price_ink: 15000.00,
    status: 'pending',
    nft_token_id: 'NFT-CARGO-001',
    is_insured: true,
    cargo_nft_contract_address: CONTRACT_ADDRESSES.cargoNFT,
    insurance_policy_nft_contract_address: CONTRACT_ADDRESSES.insurancePolicyNFT,
    journey_nft_contract_address: CONTRACT_ADDRESSES.journeyNFT,
    brokerage_contract_address: CONTRACT_ADDRESSES.brokerage,
  },
  {
    order_type: 'cargo',
    title: 'Automotive Parts Express',
    description: 'Urgent automotive components for German manufacturers',
    origin_port: 'Shanghai',
    destination_port: 'Hamburg',
    departure_date: '2025-01-20',
    arrival_date: '2025-02-25',
    cargo_type: 'container',
    weight_tons: 1800,
    volume_cbm: 2200,
    price_ink: 12500.00,
    status: 'pending',
    nft_token_id: 'NFT-CARGO-002',
    is_insured: false,
    cargo_nft_contract_address: CONTRACT_ADDRESSES.cargoNFT,
    journey_nft_contract_address: CONTRACT_ADDRESSES.journeyNFT,
    brokerage_contract_address: CONTRACT_ADDRESSES.brokerage,
  },
  {
    order_type: 'cargo',
    title: 'Grain Bulk Export',
    description: 'Premium wheat export to Asian markets',
    origin_port: 'Long Beach',
    destination_port: 'Yokohama',
    departure_date: '2025-01-25',
    arrival_date: '2025-02-15',
    cargo_type: 'dry_bulk',
    weight_tons: 45000,
    price_ink: 28000.00,
    status: 'active',
    nft_token_id: 'NFT-CARGO-003',
    is_insured: true,
    cargo_nft_contract_address: CONTRACT_ADDRESSES.cargoNFT,
    insurance_policy_nft_contract_address: CONTRACT_ADDRESSES.insurancePolicyNFT,
    journey_nft_contract_address: CONTRACT_ADDRESSES.journeyNFT,
    brokerage_contract_address: CONTRACT_ADDRESSES.brokerage,
  },
  {
    order_type: 'cargo',
    title: 'Textile Manufacturing Goods',
    description: 'Cotton textiles and garments for US retail',
    origin_port: 'Mumbai',
    destination_port: 'Los Angeles',
    departure_date: '2025-02-01',
    arrival_date: '2025-03-10',
    cargo_type: 'container',
    weight_tons: 3200,
    volume_cbm: 3600,
    price_ink: 18000.00,
    status: 'pending',
    is_insured: false,
    cargo_nft_contract_address: CONTRACT_ADDRESSES.cargoNFT,
    journey_nft_contract_address: CONTRACT_ADDRESSES.journeyNFT,
    brokerage_contract_address: CONTRACT_ADDRESSES.brokerage,
  },
  {
    order_type: 'cargo',
    title: 'Steel Coils Transport',
    description: 'Hot-rolled steel coils for construction industry',
    origin_port: 'Genoa',
    destination_port: 'New York',
    departure_date: '2025-02-05',
    arrival_date: '2025-03-01',
    cargo_type: 'breakbulk',
    weight_tons: 8500,
    price_ink: 22000.00,
    status: 'pending',
    nft_token_id: 'NFT-CARGO-005',
    is_insured: true,
    cargo_nft_contract_address: CONTRACT_ADDRESSES.cargoNFT,
    insurance_policy_nft_contract_address: CONTRACT_ADDRESSES.insurancePolicyNFT,
    journey_nft_contract_address: CONTRACT_ADDRESSES.journeyNFT,
    brokerage_contract_address: CONTRACT_ADDRESSES.brokerage,
  },
  {
    order_type: 'cargo',
    title: 'Crude Oil Shipment',
    description: 'Light crude oil from Middle East refineries',
    origin_port: 'Dubai',
    destination_port: 'Singapore',
    departure_date: '2025-02-10',
    arrival_date: '2025-02-18',
    cargo_type: 'liquid_bulk',
    weight_tons: 75000,
    price_ink: 45000.00,
    status: 'matched',
    nft_token_id: 'NFT-CARGO-006',
    is_insured: true,
    cargo_nft_contract_address: CONTRACT_ADDRESSES.cargoNFT,
    insurance_policy_nft_contract_address: CONTRACT_ADDRESSES.insurancePolicyNFT,
    journey_nft_contract_address: CONTRACT_ADDRESSES.journeyNFT,
    brokerage_contract_address: CONTRACT_ADDRESSES.brokerage,
  },
  {
    order_type: 'cargo',
    title: 'Wind Turbine Components',
    description: 'Offshore wind farm turbine blades and nacelles',
    origin_port: 'Copenhagen',
    destination_port: 'Boston',
    departure_date: '2025-02-15',
    arrival_date: '2025-03-20',
    cargo_type: 'project_cargo',
    weight_tons: 12000,
    price_ink: 35000.00,
    status: 'pending',
    nft_token_id: 'NFT-CARGO-007',
    is_insured: false,
    cargo_nft_contract_address: CONTRACT_ADDRESSES.cargoNFT,
    journey_nft_contract_address: CONTRACT_ADDRESSES.journeyNFT,
    brokerage_contract_address: CONTRACT_ADDRESSES.brokerage,
  },
  {
    order_type: 'cargo',
    title: 'Chemical Products',
    description: 'Industrial chemicals for pharmaceutical industry',
    origin_port: 'Antwerp',
    destination_port: 'Vladivostok',
    departure_date: '2025-02-20',
    arrival_date: '2025-03-25',
    cargo_type: 'liquid_bulk',
    weight_tons: 5500,
    price_ink: 16500.00,
    status: 'pending',
    is_insured: false,
    cargo_nft_contract_address: CONTRACT_ADDRESSES.cargoNFT,
    journey_nft_contract_address: CONTRACT_ADDRESSES.journeyNFT,
    brokerage_contract_address: CONTRACT_ADDRESSES.brokerage,
  },
  {
    order_type: 'cargo',
    title: 'Luxury Vehicles',
    description: 'Premium European automobiles for Asian markets',
    origin_port: 'Bremerhaven',
    destination_port: 'Tokyo',
    departure_date: '2025-03-01',
    arrival_date: '2025-04-05',
    cargo_type: 'breakbulk',
    weight_tons: 850,
    volume_cbm: 1200,
    price_ink: 25000.00,
    status: 'pending',
    nft_token_id: 'NFT-CARGO-009',
    is_insured: true,
    cargo_nft_contract_address: CONTRACT_ADDRESSES.cargoNFT,
    insurance_policy_nft_contract_address: CONTRACT_ADDRESSES.insurancePolicyNFT,
    journey_nft_contract_address: CONTRACT_ADDRESSES.journeyNFT,
    brokerage_contract_address: CONTRACT_ADDRESSES.brokerage,
  },
  {
    order_type: 'cargo',
    title: 'Coffee Bean Export',
    description: 'Premium coffee beans from South American plantations',
    origin_port: 'Santos',
    destination_port: 'Kobe',
    departure_date: '2025-03-05',
    arrival_date: '2025-04-10',
    cargo_type: 'container',
    weight_tons: 2200,
    volume_cbm: 2500,
    price_ink: 14000.00,
    status: 'pending',
    nft_token_id: 'NFT-CARGO-010',
    is_insured: false,
    cargo_nft_contract_address: CONTRACT_ADDRESSES.cargoNFT,
    journey_nft_contract_address: CONTRACT_ADDRESSES.journeyNFT,
    brokerage_contract_address: CONTRACT_ADDRESSES.brokerage,
  },
];

// Mock data for vessel orders
export const mockVesselOrders: Order[] = [
  {
    order_type: 'vessel',
    title: 'Container Vessel - Pacific Route',
    description: '14,000 TEU container ship available for trans-Pacific routes',
    origin_port: 'Los Angeles',
    destination_port: 'Shanghai',
    departure_date: '2025-01-18',
    arrival_date: '2025-02-08',
    vessel_type: 'container_ship',
    volume_cbm: 165000,
    price_ink: 20000.00,
    status: 'pending',
    nft_token_id: 'NFT-VESSEL-001',
    is_insured: false,
    vessel_nft_contract_address: CONTRACT_ADDRESSES.vesselNFT,
    journey_nft_contract_address: CONTRACT_ADDRESSES.journeyNFT,
    brokerage_contract_address: CONTRACT_ADDRESSES.brokerage,
  },
  {
    order_type: 'vessel',
    title: 'Bulk Carrier - Capesize',
    description: 'Large bulk carrier for dry cargo, grain and ore transport',
    origin_port: 'Newcastle',
    destination_port: 'Qingdao',
    departure_date: '2025-01-22',
    arrival_date: '2025-02-12',
    vessel_type: 'bulk_carrier',
    volume_cbm: 180000,
    price_ink: 25000.00,
    status: 'active',
    nft_token_id: 'NFT-VESSEL-002',
    is_insured: true,
    vessel_nft_contract_address: CONTRACT_ADDRESSES.vesselNFT,
    insurance_policy_nft_contract_address: CONTRACT_ADDRESSES.insurancePolicyNFT,
    journey_nft_contract_address: CONTRACT_ADDRESSES.journeyNFT,
    brokerage_contract_address: CONTRACT_ADDRESSES.brokerage,
  },
  {
    order_type: 'vessel',
    title: 'Mediterranean Ferry',
    description: 'RoRo vessel for vehicles and passenger transport',
    origin_port: 'Barcelona',
    destination_port: 'Palermo',
    departure_date: '2025-01-28',
    arrival_date: '2025-01-30',
    vessel_type: 'ro_ro',
    volume_cbm: 8500,
    price_ink: 8000.00,
    status: 'pending',
    is_insured: false,
    vessel_nft_contract_address: CONTRACT_ADDRESSES.vesselNFT,
    journey_nft_contract_address: CONTRACT_ADDRESSES.journeyNFT,
    brokerage_contract_address: CONTRACT_ADDRESSES.brokerage,
  },
  {
    order_type: 'vessel',
    title: 'Product Tanker',
    description: 'Clean product tanker for refined petroleum transport',
    origin_port: 'Kuwait City',
    destination_port: 'Mumbai',
    departure_date: '2025-02-03',
    arrival_date: '2025-02-10',
    vessel_type: 'tanker',
    volume_cbm: 45000,
    price_ink: 18000.00,
    status: 'matched',
    nft_token_id: 'NFT-VESSEL-004',
    is_insured: true,
    vessel_nft_contract_address: CONTRACT_ADDRESSES.vesselNFT,
    insurance_policy_nft_contract_address: CONTRACT_ADDRESSES.insurancePolicyNFT,
    journey_nft_contract_address: CONTRACT_ADDRESSES.journeyNFT,
    brokerage_contract_address: CONTRACT_ADDRESSES.brokerage,
  },
  {
    order_type: 'vessel',
    title: 'General Cargo Vessel',
    description: 'Multi-purpose vessel for project and breakbulk cargo',
    origin_port: 'Hamburg',
    destination_port: 'Montreal',
    departure_date: '2025-02-08',
    arrival_date: '2025-02-18',
    vessel_type: 'general_cargo',
    volume_cbm: 12000,
    price_ink: 15000.00,
    status: 'pending',
    nft_token_id: 'NFT-VESSEL-005',
    is_insured: false,
    vessel_nft_contract_address: CONTRACT_ADDRESSES.vesselNFT,
    journey_nft_contract_address: CONTRACT_ADDRESSES.journeyNFT,
    brokerage_contract_address: CONTRACT_ADDRESSES.brokerage,
  },
  {
    order_type: 'vessel',
    title: 'LNG Carrier',
    description: 'Specialized vessel for liquefied natural gas transport',
    origin_port: 'Sakhalin',
    destination_port: 'Yokohama',
    departure_date: '2025-02-12',
    arrival_date: '2025-02-15',
    vessel_type: 'lng_carrier',
    volume_cbm: 140000,
    price_ink: 32000.00,
    status: 'pending',
    nft_token_id: 'NFT-VESSEL-006',
    is_insured: true,
    vessel_nft_contract_address: CONTRACT_ADDRESSES.vesselNFT,
    insurance_policy_nft_contract_address: CONTRACT_ADDRESSES.insurancePolicyNFT,
    journey_nft_contract_address: CONTRACT_ADDRESSES.journeyNFT,
    brokerage_contract_address: CONTRACT_ADDRESSES.brokerage,
  },
  {
    order_type: 'vessel',
    title: 'Feeder Container Ship',
    description: 'Regional container vessel for Asian ports',
    origin_port: 'Busan',
    destination_port: 'Manila',
    departure_date: '2025-02-15',
    arrival_date: '2025-02-18',
    vessel_type: 'container_ship',
    volume_cbm: 15000,
    price_ink: 6500.00,
    status: 'pending',
    is_insured: false,
    vessel_nft_contract_address: CONTRACT_ADDRESSES.vesselNFT,
    journey_nft_contract_address: CONTRACT_ADDRESSES.journeyNFT,
    brokerage_contract_address: CONTRACT_ADDRESSES.brokerage,
  },
  {
    order_type: 'vessel',
    title: 'Chemical Tanker',
    description: 'Specialized tanker for chemical and pharmaceutical products',
    origin_port: 'Rotterdam',
    destination_port: 'Antwerp',
    departure_date: '2025-02-18',
    arrival_date: '2025-02-19',
    vessel_type: 'tanker',
    volume_cbm: 8000,
    price_ink: 5000.00,
    status: 'pending',
    nft_token_id: 'NFT-VESSEL-008',
    is_insured: false,
    vessel_nft_contract_address: CONTRACT_ADDRESSES.vesselNFT,
    journey_nft_contract_address: CONTRACT_ADDRESSES.journeyNFT,
    brokerage_contract_address: CONTRACT_ADDRESSES.brokerage,
  },
];

// Mock data for order matches
export const mockOrderMatches: OrderMatch[] = [
  {
    cargo_order_id: '660e8400-e29b-41d4-a716-446655440006', // Crude Oil Shipment
    vessel_order_id: '770e8400-e29b-41d4-a716-446655440004', // Product Tanker
    match_price_ink: 31500.00,
    status: 'active',
    journey_nft_contract_address: CONTRACT_ADDRESSES.journeyNFT,
    brokerage_contract_address: CONTRACT_ADDRESSES.brokerage,
  },
  {
    cargo_order_id: '660e8400-e29b-41d4-a716-446655440003', // Grain Bulk Export
    vessel_order_id: '770e8400-e29b-41d4-a716-446655440002', // Bulk Carrier
    match_price_ink: 26500.00,
    status: 'pending',
    journey_nft_contract_address: CONTRACT_ADDRESSES.journeyNFT,
    brokerage_contract_address: CONTRACT_ADDRESSES.brokerage,
  },
  {
    cargo_order_id: '660e8400-e29b-41d4-a716-446655440005', // Steel Coils Transport
    vessel_order_id: '770e8400-e29b-41d4-a716-446655440005', // General Cargo Vessel
    match_price_ink: 18500.00,
    status: 'pending',
    journey_nft_contract_address: CONTRACT_ADDRESSES.journeyNFT,
    brokerage_contract_address: CONTRACT_ADDRESSES.brokerage,
  },
];

// Mock data for insurance policies
export const mockInsurancePolicies: InsurancePolicy[] = [
  {
    order_id: '660e8400-e29b-41d4-a716-446655440001', // Electronics Container Shipment
    policy_name: 'Electronics Delay Protection',
    trigger_condition: 'Arrival delay beyond scheduled time',
    delay_threshold_hours: 48,
    payout_amount_ink: 7500.00,
    premium_ink: 750.00,
    data_source: 'PortAuthorityAPI',
    is_active: true,
    nft_token_id: 'NFT-POLICY-001',
    insurance_policy_nft_contract_address: CONTRACT_ADDRESSES.insurancePolicyNFT,
  },
  {
    order_id: '660e8400-e29b-41d4-a716-446655440003', // Grain Bulk Export
    policy_name: 'Grain Export Weather Shield',
    trigger_condition: 'Weather-related departure delay',
    delay_threshold_hours: 72,
    payout_amount_ink: 14000.00,
    premium_ink: 1400.00,
    data_source: 'WeatherOracle',
    is_active: true,
    nft_token_id: 'NFT-POLICY-002',
    insurance_policy_nft_contract_address: CONTRACT_ADDRESSES.insurancePolicyNFT,
  },
  {
    order_id: '660e8400-e29b-41d4-a716-446655440005', // Steel Coils Transport
    policy_name: 'Steel Transport Guarantee',
    trigger_condition: 'Port congestion delay coverage',
    delay_threshold_hours: 96,
    payout_amount_ink: 11000.00,
    premium_ink: 1100.00,
    data_source: 'PortAuthorityAPI',
    is_active: true,
    nft_token_id: 'NFT-POLICY-003',
    insurance_policy_nft_contract_address: CONTRACT_ADDRESSES.insurancePolicyNFT,
  },
  {
    order_id: '660e8400-e29b-41d4-a716-446655440006', // Crude Oil Shipment
    policy_name: 'Crude Oil Route Protection',
    trigger_condition: 'Geopolitical route disruption',
    delay_threshold_hours: 120,
    payout_amount_ink: 22500.00,
    premium_ink: 2250.00,
    data_source: 'GeopoliticalOracle',
    is_active: true,
    nft_token_id: 'NFT-POLICY-004',
    insurance_policy_nft_contract_address: CONTRACT_ADDRESSES.insurancePolicyNFT,
  },
  {
    order_id: '660e8400-e29b-41d4-a716-446655440009', // Luxury Vehicles
    policy_name: 'Luxury Vehicle Security',
    trigger_condition: 'Theft or damage during transport',
    delay_threshold_hours: 24,
    payout_amount_ink: 12500.00,
    premium_ink: 1875.00,
    data_source: 'SecurityOracle',
    is_active: true,
    nft_token_id: 'NFT-POLICY-005',
    insurance_policy_nft_contract_address: CONTRACT_ADDRESSES.insurancePolicyNFT,
  },
  {
    order_id: '770e8400-e29b-41d4-a716-446655440002', // Bulk Carrier
    policy_name: 'Vessel Mechanical Coverage',
    trigger_condition: 'Engine failure or technical delays',
    delay_threshold_hours: 168,
    payout_amount_ink: 15000.00,
    premium_ink: 1200.00,
    data_source: 'VesselTrackingAPI',
    is_active: true,
    nft_token_id: 'NFT-POLICY-006',
    insurance_policy_nft_contract_address: CONTRACT_ADDRESSES.insurancePolicyNFT,
  },
  {
    order_id: '770e8400-e29b-41d4-a716-446655440006', // LNG Carrier
    policy_name: 'LNG Carrier Safety Policy',
    trigger_condition: 'Safety incident or emergency delays',
    delay_threshold_hours: 48,
    payout_amount_ink: 20000.00,
    premium_ink: 3200.00,
    data_source: 'SafetyMonitoringAPI',
    is_active: true,
    nft_token_id: 'NFT-POLICY-007',
    insurance_policy_nft_contract_address: CONTRACT_ADDRESSES.insurancePolicyNFT,
  },
];

// Smart contract data
export const mockSmartContracts: SmartContract[] = [
  {
    contract_name: 'VesselNFT',
    contract_address: CONTRACT_ADDRESSES.vesselNFT,
    network: 'polygon-zkevm-cardona',
    is_active: true,
  },
  {
    contract_name: 'CargoNFT',
    contract_address: CONTRACT_ADDRESSES.cargoNFT,
    network: 'polygon-zkevm-cardona',
    is_active: true,
  },
  {
    contract_name: 'InsurancePolicyNFT',
    contract_address: CONTRACT_ADDRESSES.insurancePolicyNFT,
    network: 'polygon-zkevm-cardona',
    is_active: true,
  },
  {
    contract_name: 'JourneyNFT',
    contract_address: CONTRACT_ADDRESSES.journeyNFT,
    network: 'polygon-zkevm-cardona',
    is_active: true,
  },
  {
    contract_name: 'Brokerage',
    contract_address: CONTRACT_ADDRESSES.brokerage,
    network: 'polygon-zkevm-cardona',
    is_active: true,
  },
];

// Function to populate the database
export async function populateDatabase(supabaseUrl: string, supabaseKey: string) {
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log('Starting database population...');

    // Insert smart contracts first
    console.log('Inserting smart contracts...');
    const { error: contractsError } = await supabase
      .from('smart_contracts')
      .upsert(mockSmartContracts, { onConflict: 'contract_address' });

    if (contractsError) {
      console.error('Error inserting smart contracts:', contractsError);
      return;
    }

    // Insert cargo orders
    console.log('Inserting cargo orders...');
    const { data: cargoOrders, error: cargoError } = await supabase
      .from('orders')
      .insert(mockCargoOrders)
      .select('id');

    if (cargoError) {
      console.error('Error inserting cargo orders:', cargoError);
      return;
    }

    // Insert vessel orders
    console.log('Inserting vessel orders...');
    const { data: vesselOrders, error: vesselError } = await supabase
      .from('orders')
      .insert(mockVesselOrders)
      .select('id');

    if (vesselError) {
      console.error('Error inserting vessel orders:', vesselError);
      return;
    }

    // Insert order matches
    console.log('Inserting order matches...');
    const { error: matchesError } = await supabase
      .from('order_matches')
      .insert(mockOrderMatches);

    if (matchesError) {
      console.error('Error inserting order matches:', matchesError);
      return;
    }

    // Insert insurance policies
    console.log('Inserting insurance policies...');
    const { error: policiesError } = await supabase
      .from('insurance_policies')
      .insert(mockInsurancePolicies);

    if (policiesError) {
      console.error('Error inserting insurance policies:', policiesError);
      return;
    }

    console.log('Database population completed successfully!');
    console.log(`Inserted ${cargoOrders?.length || 0} cargo orders`);
    console.log(`Inserted ${vesselOrders?.length || 0} vessel orders`);
    console.log(`Inserted ${mockOrderMatches.length} order matches`);
    console.log(`Inserted ${mockInsurancePolicies.length} insurance policies`);
    console.log(`Inserted ${mockSmartContracts.length} smart contracts`);

  } catch (error) {
    console.error('Error populating database:', error);
  }
}

// Function to clear all data (for testing)
export async function clearDatabase(supabaseUrl: string, supabaseKey: string) {
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log('Clearing database...');

    // Delete in reverse order to respect foreign key constraints
    await supabase.from('insurance_policies').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('order_matches').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('orders').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('smart_contracts').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    console.log('Database cleared successfully!');
  } catch (error) {
    console.error('Error clearing database:', error);
  }
}