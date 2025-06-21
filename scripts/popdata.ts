#!/usr/bin/env npx tsx

import { createClient } from '@supabase/supabase-js';

// Import the Supabase client configuration
const supabaseUrl = 'https://dvnhapzqryschdxmxpds.supabase.co';
// Use the anonymous key from the client configuration
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2bmhhcHpxcnlzY2hkeG14cGRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MTMzMjAsImV4cCI6MjA2NTk4OTMyMH0.T2Qp92kaqk4_vWW3KnUbV5Clbp9npg0K9tyAR3aM1oo';

const supabase = createClient(supabaseUrl, supabaseKey);

// Smart contract addresses from the deployed contracts
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

// Mock data for orders
const MOCK_ORDERS = [
  {
    order_type: 'cargo',
    title: 'Electronics Shipment to Rotterdam',
    description: 'High-value electronics requiring temperature-controlled transport',
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
    order_type: 'vessel',
    title: 'Container Vessel Available',
    description: 'Modern container vessel with 5000 TEU capacity',
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
    order_type: 'cargo',
    title: 'Bulk Grain Transport',
    description: 'Wheat shipment from US to Europe',
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
    order_type: 'vessel',
    title: 'Bulk Carrier Available',
    description: 'Panamax bulk carrier for grain transport',
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
  }
];

// Mock data for insurance policies
const MOCK_INSURANCE_POLICIES = [
  {
    policy_name: 'Delay Protection',
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
  }
];

async function populateDatabase() {
  console.log('🚀 Starting database population...');
  console.log(`📡 Connecting to: ${supabaseUrl}`);

  try {
    // Step 1: Try to insert smart contracts (may fail due to RLS)
    console.log('📋 Inserting smart contracts...');
    const { data: contractsData, error: contractsError } = await supabase
      .from('smart_contracts')
      .upsert(SMART_CONTRACTS, { onConflict: 'contract_address' })
      .select();

    if (contractsError) {
      console.log(`⚠️  Warning: Could not insert smart contracts due to RLS: ${contractsError.message}`);
      console.log('💡 This is expected - smart contracts may already exist or require admin access');
    } else {
      console.log(`✅ Inserted ${contractsData?.length || 0} smart contracts`);
    }

    // Step 2: Insert orders
    console.log('📦 Inserting orders...');
    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .insert(MOCK_ORDERS)
      .select();

    if (ordersError) {
      throw new Error(`Error inserting orders: ${JSON.stringify(ordersError)}`);
    }

    console.log(`✅ Inserted ${ordersData?.length || 0} orders`);

    // Step 3: Insert insurance policies
    console.log('🛡️  Inserting insurance policies...');
    const { data: policiesData, error: policiesError } = await supabase
      .from('insurance_policies')
      .insert(MOCK_INSURANCE_POLICIES)
      .select();

    if (policiesError) {
      throw new Error(`Error inserting insurance policies: ${JSON.stringify(policiesError)}`);
    }

    console.log(`✅ Inserted ${policiesData?.length || 0} insurance policies`);

    // Step 4: Try to update orders with smart contract addresses
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
    } else {
      console.log('⚠️  No smart contracts found - skipping contract address linking');
    }

    console.log('🎉 Database population completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   • Smart Contracts: ${contractsData?.length || 0} (may be limited by RLS)`);
    console.log(`   • Orders: ${ordersData?.length || 0}`);
    console.log(`   • Insurance Policies: ${policiesData?.length || 0}`);

  } catch (error) {
    console.error('❌ Error during database population:', error);
    process.exit(1);
  }
}

async function clearDatabase() {
  console.log('🧹 Starting database cleanup...');
  console.log(`📡 Connecting to: ${supabaseUrl}`);

  try {
    // Clear all data from tables
    const tables = ['insurance_policies', 'order_matches', 'orders', 'smart_contracts'];
    
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

    console.log('🎉 Database cleanup completed successfully!');

  } catch (error) {
    console.error('❌ Error during database cleanup:', error);
    process.exit(1);
  }
}

// Main execution
const command = process.argv[2];

if (!command) {
  console.log('🔧 DripShipper Database Population Tool');
  console.log('=====================================\n');
  console.log('Usage:');
  console.log('  npx tsx popdata.ts populate  - Populate database with mock data');
  console.log('  npx tsx popdata.ts clear     - Clear all data from database');
  console.log('  npx tsx popdata.ts reset     - Clear data then populate');
  console.log('');
  process.exit(0);
}

switch (command) {
  case 'populate':
    populateDatabase();
    break;
  case 'clear':
    clearDatabase();
    break;
  case 'reset':
    clearDatabase().then(() => {
      console.log('\n🔄 Resetting database...');
      return populateDatabase();
    });
    break;
  default:
    console.log(`❌ Unknown command: ${command}`);
    console.log('Use: populate, clear, or reset');
    process.exit(1);
}