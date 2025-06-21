#!/usr/bin/env npx tsx

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://dvnhapzqryschdxmxpds.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2bmhhcHpxcnlzY2hkeG14cGRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MTMzMjAsImV4cCI6MjA2NTk4OTMyMH0.T2Qp92kaqk4_vWW3KnUbV5Clbp9npg0K9tyAR3aM1oo';

const supabase = createClient(supabaseUrl, supabaseKey);

// Smart contract addresses from deployed contracts
const SMART_CONTRACTS = [
  {
    contract_name: 'VesselNFT',
    contract_address: '0x1CA4aF4A1a69DB30fFbb299d6865Cd87c24f2A89',
    network: 'ink-sepolia',
    abi_hash: 'vessel_nft_abi_v1'
  },
  {
    contract_name: 'CargoNFT',
    contract_address: '0x1c0A2b9DcbA3D20EFc3379823208Bc67B92506B7',
    network: 'ink-sepolia',
    abi_hash: 'cargo_nft_abi_v1'
  },
  {
    contract_name: 'InsuranceManager',
    contract_address: '0x942088Ca56CA4e98ac33855cA25481a09E05fBCA',
    network: 'ink-sepolia',
    abi_hash: 'insurance_manager_abi_v1'
  },
  {
    contract_name: 'JourneyManager',
    contract_address: '0xe71b13b0D639BdfBe8dFF5d07d396852984f333B',
    network: 'ink-sepolia',
    abi_hash: 'journey_manager_abi_v1'
  },
  {
    contract_name: 'Brokerage',
    contract_address: '0x9660AF590d7fF2cAB99174970fC0911577eE23a3',
    network: 'ink-sepolia',
    abi_hash: 'brokerage_abi_v1'
  }
];

// Mock data for orders - Rich dataset with various scenarios
const MOCK_ORDERS = [
  // Cargo Orders
  {
    order_type: 'cargo',
    title: 'Electronics Shipment to Rotterdam',
    description: 'High-value electronics including smartphones, laptops, and gaming consoles requiring temperature-controlled transport',
    origin_port: 'Shanghai',
    destination_port: 'Rotterdam',
    departure_date: '2024-02-15',
    arrival_date: '2024-03-01',
    cargo_type: 'container',
    weight_tons: 500,
    volume_cbm: 1200,
    price_ink: 15000.00,
    status: 'pending',
    is_insured: true,
    wallet_address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'
  },
  {
    order_type: 'cargo',
    title: 'Bulk Grain Transport - Wheat to Europe',
    description: 'Premium wheat shipment from US Midwest to European markets',
    origin_port: 'New Orleans',
    destination_port: 'Hamburg',
    departure_date: '2024-02-25',
    arrival_date: '2024-03-10',
    cargo_type: 'dry_bulk',
    weight_tons: 2000,
    volume_cbm: 3000,
    price_ink: 8000.00,
    status: 'active',
    is_insured: true,
    wallet_address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'
  },
  {
    order_type: 'cargo',
    title: 'LNG Transport to Japan',
    description: 'Liquefied Natural Gas shipment from Qatar to Japanese power plants',
    origin_port: 'Ras Laffan',
    destination_port: 'Yokohama',
    departure_date: '2024-03-01',
    arrival_date: '2024-03-20',
    cargo_type: 'liquid_bulk',
    weight_tons: 1500,
    volume_cbm: 2500,
    price_ink: 25000.00,
    status: 'matched',
    is_insured: true,
    wallet_address: '0x8ba1f109551bD432803012645Hac136c772c3c3'
  },
  {
    order_type: 'cargo',
    title: 'Heavy Machinery Project Cargo',
    description: 'Construction equipment and industrial machinery for port expansion project',
    origin_port: 'Bremen',
    destination_port: 'Mombasa',
    departure_date: '2024-03-05',
    arrival_date: '2024-04-01',
    cargo_type: 'project_cargo',
    weight_tons: 800,
    volume_cbm: 600,
    price_ink: 18000.00,
    status: 'pending',
    is_insured: false,
    wallet_address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'
  },
  {
    order_type: 'cargo',
    title: 'Refrigerated Food Products',
    description: 'Fresh fruits, vegetables, and dairy products requiring constant refrigeration',
    origin_port: 'Valencia',
    destination_port: 'Dubai',
    departure_date: '2024-03-10',
    arrival_date: '2024-03-25',
    cargo_type: 'reefer',
    weight_tons: 300,
    volume_cbm: 800,
    price_ink: 12000.00,
    status: 'active',
    is_insured: true,
    wallet_address: '0x8ba1f109551bD432803012645Hac136c772c3c3'
  },
  {
    order_type: 'cargo',
    title: 'Automotive Parts Breakbulk',
    description: 'Car parts and components for assembly plant in South America',
    origin_port: 'Antwerp',
    destination_port: 'Santos',
    departure_date: '2024-03-15',
    arrival_date: '2024-04-05',
    cargo_type: 'breakbulk',
    weight_tons: 400,
    volume_cbm: 500,
    price_ink: 9000.00,
    status: 'pending',
    is_insured: true,
    wallet_address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'
  },

  // Vessel Orders
  {
    order_type: 'vessel',
    title: 'Container Vessel Available - 5000 TEU',
    description: 'Modern container vessel with advanced navigation systems, available for charter',
    origin_port: 'Rotterdam',
    destination_port: 'Shanghai',
    departure_date: '2024-02-20',
    arrival_date: '2024-03-05',
    vessel_type: 'container_ship',
    weight_tons: 8000,
    volume_cbm: 5000,
    price_ink: 25000.00,
    status: 'pending',
    is_insured: false,
    wallet_address: '0x8ba1f109551bD432803012645Hac136c772c3c3'
  },
  {
    order_type: 'vessel',
    title: 'Bulk Carrier - Panamax Class',
    description: 'Panamax bulk carrier ideal for grain, coal, and ore transport',
    origin_port: 'Hamburg',
    destination_port: 'New Orleans',
    departure_date: '2024-03-01',
    arrival_date: '2024-03-15',
    vessel_type: 'bulk_carrier',
    weight_tons: 5000,
    volume_cbm: 4000,
    price_ink: 12000.00,
    status: 'active',
    is_insured: true,
    wallet_address: '0x8ba1f109551bD432803012645Hac136c772c3c3'
  },
  {
    order_type: 'vessel',
    title: 'LNG Carrier - 150,000 m³',
    description: 'Specialized LNG carrier with advanced safety systems and temperature control',
    origin_port: 'Yokohama',
    destination_port: 'Ras Laffan',
    departure_date: '2024-03-20',
    arrival_date: '2024-04-10',
    vessel_type: 'lng_carrier',
    weight_tons: 12000,
    volume_cbm: 150000,
    price_ink: 35000.00,
    status: 'matched',
    is_insured: true,
    wallet_address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'
  },
  {
    order_type: 'vessel',
    title: 'Oil Tanker - Aframax Class',
    description: 'Aframax oil tanker suitable for crude oil and petroleum products',
    origin_port: 'Houston',
    destination_port: 'Rotterdam',
    departure_date: '2024-03-25',
    arrival_date: '2024-04-15',
    vessel_type: 'tanker',
    weight_tons: 6000,
    volume_cbm: 80000,
    price_ink: 20000.00,
    status: 'pending',
    is_insured: true,
    wallet_address: '0x8ba1f109551bD432803012645Hac136c772c3c3'
  },
  {
    order_type: 'vessel',
    title: 'Ro-Ro Vessel for Vehicle Transport',
    description: 'Roll-on/Roll-off vessel specialized in vehicle transport with ramps',
    origin_port: 'Bremen',
    destination_port: 'Mombasa',
    departure_date: '2024-04-01',
    arrival_date: '2024-04-25',
    vessel_type: 'ro_ro',
    weight_tons: 3000,
    volume_cbm: 2000,
    price_ink: 15000.00,
    status: 'active',
    is_insured: false,
    wallet_address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'
  },
  {
    order_type: 'vessel',
    title: 'General Cargo Vessel',
    description: 'Versatile general cargo vessel suitable for various types of cargo',
    origin_port: 'Antwerp',
    destination_port: 'Santos',
    departure_date: '2024-04-05',
    arrival_date: '2024-04-30',
    vessel_type: 'general_cargo',
    weight_tons: 2500,
    volume_cbm: 3000,
    price_ink: 10000.00,
    status: 'pending',
    is_insured: true,
    wallet_address: '0x8ba1f109551bD432803012645Hac136c772c3c3'
  },
  {
    order_type: 'vessel',
    title: 'LPG Carrier - 50,000 m³',
    description: 'LPG carrier with advanced gas handling systems and safety protocols',
    origin_port: 'Dubai',
    destination_port: 'Valencia',
    departure_date: '2024-04-10',
    arrival_date: '2024-05-01',
    vessel_type: 'lpg_carrier',
    weight_tons: 4000,
    volume_cbm: 50000,
    price_ink: 18000.00,
    status: 'pending',
    is_insured: true,
    wallet_address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'
  }
];

// Mock data for insurance policies
const MOCK_INSURANCE_POLICIES = [
  {
    policy_name: 'Delay Protection Plus',
    trigger_condition: 'arrival_delay',
    delay_threshold_hours: 24,
    payout_amount_ink: 5000.00,
    premium_ink: 500.00,
    data_source: 'PortAuthorityAPI',
    is_active: true,
    wallet_address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'
  },
  {
    policy_name: 'Weather Damage Coverage',
    trigger_condition: 'weather_damage',
    delay_threshold_hours: 0,
    payout_amount_ink: 10000.00,
    premium_ink: 800.00,
    data_source: 'WeatherAPI',
    is_active: true,
    wallet_address: '0x8ba1f109551bD432803012645Hac136c772c3c3'
  },
  {
    policy_name: 'Cargo Loss Protection',
    trigger_condition: 'cargo_loss',
    delay_threshold_hours: 0,
    payout_amount_ink: 15000.00,
    premium_ink: 1200.00,
    data_source: 'MaritimeAPI',
    is_active: true,
    wallet_address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'
  },
  {
    policy_name: 'Vessel Damage Insurance',
    trigger_condition: 'vessel_damage',
    delay_threshold_hours: 0,
    payout_amount_ink: 20000.00,
    premium_ink: 1500.00,
    data_source: 'VesselTrackerAPI',
    is_active: true,
    wallet_address: '0x8ba1f109551bD432803012645Hac136c772c3c3'
  },
  {
    policy_name: 'Port Congestion Coverage',
    trigger_condition: 'port_congestion',
    delay_threshold_hours: 48,
    payout_amount_ink: 8000.00,
    premium_ink: 600.00,
    data_source: 'PortAuthorityAPI',
    is_active: true,
    wallet_address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'
  }
];

// Mock data for order matches
const MOCK_ORDER_MATCHES = [
  {
    cargo_order_id: null, // Will be set dynamically
    vessel_order_id: null, // Will be set dynamically
    match_price_ink: 18000.00,
    status: 'pending',
    journey_manager_contract_address: '0xe71b13b0D639BdfBe8dFF5d07d396852984f333B',
    brokerage_contract_address: '0x9660AF590d7fF2cAB99174970fC0911577eE23a3'
  },
  {
    cargo_order_id: null, // Will be set dynamically
    vessel_order_id: null, // Will be set dynamically
    match_price_ink: 22000.00,
    status: 'active',
    journey_manager_contract_address: '0xe71b13b0D639BdfBe8dFF5d07d396852984f333B',
    brokerage_contract_address: '0x9660AF590d7fF2cAB99174970fC0911577eE23a3'
  }
];

async function populateDataset() {
  console.log('🚀 Starting comprehensive dataset population...');
  console.log(`📡 Connecting to: ${supabaseUrl}`);

  let contractsData: any[] = [];
  let ordersData: any[] = [];
  let policiesData: any[] = [];
  let matchesData: any[] = [];

  try {
    // Step 1: Insert smart contracts
    console.log('📋 Inserting smart contracts...');
    const { data: contractsResult, error: contractsError } = await supabase
      .from('smart_contracts')
      .upsert(SMART_CONTRACTS, { onConflict: 'contract_address' })
      .select();

    if (contractsError) {
      console.log(`⚠️  Warning: Could not insert smart contracts: ${contractsError.message}`);
    } else {
      contractsData = contractsResult || [];
      console.log(`✅ Inserted ${contractsData.length} smart contracts`);
    }

    // Step 2: Insert orders
    console.log('📦 Inserting orders...');
    const { data: ordersResult, error: ordersError } = await supabase
      .from('orders')
      .insert(MOCK_ORDERS)
      .select();

    if (ordersError) {
      throw new Error(`Error inserting orders: ${JSON.stringify(ordersError)}`);
    }

    ordersData = ordersResult || [];
    console.log(`✅ Inserted ${ordersData.length} orders`);

    // Step 3: Insert insurance policies
    console.log('🛡️  Inserting insurance policies...');
    
    // Get some orders to link insurance policies to
    const { data: existingOrders } = await supabase
      .from('orders')
      .select('id')
      .limit(5);

    if (existingOrders && existingOrders.length > 0) {
      const insurancePoliciesWithOrders = MOCK_INSURANCE_POLICIES.map((policy, index) => ({
        ...policy,
        order_id: existingOrders[index % existingOrders.length].id
      }));

      const { data: policiesResult, error: policiesError } = await supabase
        .from('insurance_policies')
        .insert(insurancePoliciesWithOrders)
        .select();

      if (policiesError) {
        throw new Error(`Error inserting insurance policies: ${JSON.stringify(policiesError)}`);
      }

      policiesData = policiesResult || [];
      console.log(`✅ Inserted ${policiesData.length} insurance policies`);
    } else {
      console.log('⚠️  No orders found - skipping insurance policies');
    }

    // Step 4: Link orders with smart contract addresses
    console.log('🔗 Linking orders to smart contracts...');
    const { data: contractAddresses } = await supabase
      .from('smart_contracts')
      .select('contract_name, contract_address');

    if (contractAddresses && contractAddresses.length > 0) {
      const contractMap = contractAddresses.reduce((acc, contract) => {
        acc[contract.contract_name] = contract.contract_address;
        return acc;
      }, {} as Record<string, string>);

      // Update cargo orders with CargoNFT contract
      const { error: cargoUpdateError } = await supabase
        .from('orders')
        .update({ 
          cargo_nft_contract_address: contractMap['CargoNFT'],
          insurance_manager_contract_address: contractMap['InsuranceManager'],
          journey_manager_contract_address: contractMap['JourneyManager'],
          brokerage_contract_address: contractMap['Brokerage']
        })
        .eq('order_type', 'cargo');

      if (cargoUpdateError) {
        console.log(`⚠️  Warning updating cargo orders: ${cargoUpdateError.message}`);
      }

      // Update vessel orders with VesselNFT contract
      const { error: vesselUpdateError } = await supabase
        .from('orders')
        .update({ 
          vessel_nft_contract_address: contractMap['VesselNFT'],
          insurance_manager_contract_address: contractMap['InsuranceManager'],
          journey_manager_contract_address: contractMap['JourneyManager'],
          brokerage_contract_address: contractMap['Brokerage']
        })
        .eq('order_type', 'vessel');

      if (vesselUpdateError) {
        console.log(`⚠️  Warning updating vessel orders: ${vesselUpdateError.message}`);
      }

      // Step 5: Create order matches
      console.log('🤝 Creating order matches...');
      if (ordersData.length >= 2) {
        const cargoOrders = ordersData.filter(order => order.order_type === 'cargo');
        const vesselOrders = ordersData.filter(order => order.order_type === 'vessel');

        if (cargoOrders.length > 0 && vesselOrders.length > 0) {
          const matches = [
            {
              cargo_order_id: cargoOrders[0].id,
              vessel_order_id: vesselOrders[0].id,
              match_price_ink: 18000.00,
              status: 'pending',
              journey_manager_contract_address: contractMap['JourneyManager'],
              brokerage_contract_address: contractMap['Brokerage']
            },
            {
              cargo_order_id: cargoOrders[1]?.id,
              vessel_order_id: vesselOrders[1]?.id,
              match_price_ink: 22000.00,
              status: 'active',
              journey_manager_contract_address: contractMap['JourneyManager'],
              brokerage_contract_address: contractMap['Brokerage']
            }
          ].filter(match => match.cargo_order_id && match.vessel_order_id);

          if (matches.length > 0) {
            const { data: matchesResult, error: matchesError } = await supabase
              .from('order_matches')
              .insert(matches)
              .select();

            if (matchesError) {
              console.log(`⚠️  Warning creating order matches: ${matchesError.message}`);
            } else {
              matchesData = matchesResult || [];
              console.log(`✅ Created ${matchesData.length} order matches`);
            }
          }
        }
      }
    }

    console.log('🎉 Dataset population completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   • Smart Contracts: ${contractsData.length}`);
    console.log(`   • Orders: ${ordersData.length} (${ordersData.filter(o => o.order_type === 'cargo').length} cargo, ${ordersData.filter(o => o.order_type === 'vessel').length} vessels)`);
    console.log(`   • Insurance Policies: ${policiesData.length}`);
    console.log(`   • Order Matches: ${matchesData.length}`);

  } catch (error) {
    console.error('❌ Error during dataset population:', error);
    process.exit(1);
  }
}

async function clearDataset() {
  console.log('🧹 Starting dataset cleanup...');
  console.log(`📡 Connecting to: ${supabaseUrl}`);

  try {
    // Clear all data from tables in correct order
    const tables = ['order_matches', 'insurance_policies', 'orders', 'smart_contracts'];
    
    for (const table of tables) {
      console.log(`🗑️  Clearing ${table}...`);
      const { error } = await supabase
        .from(table)
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows

      if (error) {
        console.log(`⚠️  Warning clearing ${table}: ${error.message}`);
      } else {
        console.log(`✅ Cleared ${table}`);
      }
    }

    console.log('🎉 Dataset cleanup completed successfully!');

  } catch (error) {
    console.error('❌ Error during dataset cleanup:', error);
    process.exit(1);
  }
}

// Main execution
const command = process.argv[2];

if (!command) {
  console.log('🔧 DripShipper Dataset Population Tool');
  console.log('=====================================\n');
  console.log('Usage:');
  console.log('  npx tsx populate_dataset.ts populate  - Populate database with comprehensive mock data');
  console.log('  npx tsx populate_dataset.ts clear     - Clear all data from database');
  console.log('  npx tsx populate_dataset.ts reset     - Clear data then populate');
  console.log('');
  process.exit(0);
}

switch (command) {
  case 'populate':
    populateDataset();
    break;
  case 'clear':
    clearDataset();
    break;
  case 'reset':
    clearDataset().then(() => {
      console.log('\n🔄 Resetting dataset...');
      return populateDataset();
    });
    break;
  default:
    console.log(`❌ Unknown command: ${command}`);
    console.log('Use: populate, clear, or reset');
    process.exit(1);
} 