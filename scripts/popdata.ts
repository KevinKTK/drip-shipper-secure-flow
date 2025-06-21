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
    network: 'sepolia',
    abi_hash: 'vessel_nft_abi_v1'
  },
  {
    contract_name: 'CargoNFT',
    contract_address: '0x1c0A2b9DcbA3D20EFc3379823208Bc67B92506B7',
    network: 'sepolia',
    abi_hash: 'cargo_nft_abi_v1'
  },
  {
    contract_name: 'InsurancePolicyNFT',
    contract_address: '0x942088Ca56CA4e98ac33855cA25481a09E05fBCA',
    network: 'sepolia',
    abi_hash: 'insurance_manager_abi_v1'
  },
  {
    contract_name: 'JourneyNFT',
    contract_address: '0xe71b13b0D639BdfBe8dFF5d07d396852984f333B',
    network: 'sepolia',
    abi_hash: 'journey_manager_abi_v1'
  },
  {
    contract_name: 'Brokerage',
    contract_address: '0x9660AF590d7fF2cAB99174970fC0911577eE23a3',
    network: 'sepolia',
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
    price_eth: 15000.00,
    status: 'pending',
    is_insured: true,
    wallet_address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    cargo_nft_contract_address: SMART_CONTRACTS.find(c => c.contract_name === 'CargoNFT')?.contract_address ?? "",
    nft_token_id: null,
    selected_insurance_policy_id: null,
    user_insurance_policy_id: null
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
    price_eth: 25000.00,
    status: 'pending',
    is_insured: false,
    wallet_address: '0x8ba1f109551bD432803012645Hac136c772c3c3',
    vessel_nft_contract_address: SMART_CONTRACTS.find(c => c.contract_name === 'VesselNFT')?.contract_address ?? "",
    nft_token_id: null,
    selected_insurance_policy_id: null,
    user_insurance_policy_id: null
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
    price_eth: 8000.00,
    status: 'active',
    is_insured: true,
    wallet_address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    cargo_nft_contract_address: SMART_CONTRACTS.find(c => c.contract_name === 'CargoNFT')?.contract_address ?? "",
    nft_token_id: null,
    selected_insurance_policy_id: null,
    user_insurance_policy_id: null
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
    price_eth: 12000.00,
    status: 'active',
    is_insured: true,
    wallet_address: '0x8ba1f109551bD432803012645Hac136c772c3c3',
    vessel_nft_contract_address: SMART_CONTRACTS.find(c => c.contract_name === 'VesselNFT')?.contract_address ?? "",
    nft_token_id: null,
    selected_insurance_policy_id: null,
    user_insurance_policy_id: null
  }
];

// Mock data for insurance policies
const MOCK_INSURANCE_TEMPLATES = [
  {
    policy_name: 'Shipper Delay Protection',
    description: 'Covers financial losses if your cargo arrival is delayed beyond the agreed threshold. Ideal for time-sensitive shipments.',
    policy_type: 'shipper',
    trigger_condition: 'arrival_delay',
    delay_threshold_hours: 24,
    payout_amount_eth: 5000.00,
    premium_eth: 500.00,
    data_source: 'PortAuthorityAPI',
    is_active: true
  },
  {
    policy_name: 'Carrier Weather Damage Coverage',
    description: 'Protects against damages to the vessel or cargo caused by severe weather events during the journey.',
    policy_type: 'carrier',
    trigger_condition: 'weather_damage',
    delay_threshold_hours: 0,
    payout_amount_eth: 10000.00,
    premium_eth: 800.00,
    data_source: 'WeatherAPI',
    is_active: true
  },
  {
    policy_name: 'Shipper Cargo Temperature Damage',
    description: 'Essential for reefer cargo. Payout is triggered if the temperature deviates from the set range for a specified duration.',
    policy_type: 'shipper',
    trigger_condition: 'temperature_fluctuation',
    delay_threshold_hours: 4,
    payout_amount_eth: 7500.00,
    premium_eth: 650.00,
    data_source: 'OnboardSensorAPI',
    is_active: true
  },
  {
    policy_name: 'Carrier Piracy Event Coverage',
    description: 'Provides financial coverage in the unfortunate event of a piracy attack, covering ransom and recovery costs.',
    policy_type: 'carrier',
    trigger_condition: 'piracy_event',
    delay_threshold_hours: null,
    payout_amount_eth: 50000.00,
    premium_eth: 2000.00,
    data_source: 'MaritimeSecurityAPI',
    is_active: true
  },
  {
    policy_name: 'Shipper Contamination Coverage',
    description: 'Protects high-value liquid or bulk cargo from contamination during transit, covering cleaning costs and value loss.',
    policy_type: 'shipper',
    trigger_condition: 'contamination_detected',
    delay_threshold_hours: null,
    payout_amount_eth: 15000.00,
    premium_eth: 950.00,
    data_source: 'IndependentSurveyorAPI',
    is_active: true
  },
  {
    policy_name: 'Shipper General Average Contribution',
    description: 'Covers the policyholder\'s legally required contribution to a general average loss, a common risk in maritime adventures.',
    policy_type: 'shipper',
    trigger_condition: 'general_average_declared',
    delay_threshold_hours: null,
    payout_amount_eth: 25000.00,
    premium_eth: 1200.00,
    data_source: 'LloydsAverageAdjustersAPI',
    is_active: true
  },
  {
    policy_name: 'Carrier Port Congestion Surcharge',
    description: 'Compensates carriers for unexpected operational costs and demurrage fees incurred due to extended waiting times at congested ports.',
    policy_type: 'carrier',
    trigger_condition: 'port_congestion_delay',
    delay_threshold_hours: 72,
    payout_amount_eth: 8000.00,
    premium_eth: 700.00,
    data_source: 'PortAuthorityAPI',
    is_active: true
  },
  {
    policy_name: 'Shipper Customs Rejection',
    description: 'Covers losses if cargo is rejected by customs authorities at the destination due to unforeseen regulatory changes or documentation issues.',
    policy_type: 'shipper',
    trigger_condition: 'customs_rejection',
    delay_threshold_hours: null,
    payout_amount_eth: 12000.00,
    premium_eth: 1100.00,
    data_source: 'CustomsAuthorityAPI',
    is_active: true
  }
];

// Mock data for user insurance policies
const MOCK_USER_INSURANCE_POLICIES = [
  {
    wallet_address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    policy_name: 'Custom Delay Policy',
    description: 'Custom user policy for delays.',
    delay_threshold_hours: 12,
    payout_amount_eth: 3000.00,
    premium_eth: 300.00,
    trigger_condition: 'arrival_delay',
    data_source: 'PortAuthorityAPI',
    is_active: true,
    policy_type: 'custom',
    cargo_damage_threshold_percentage: 10
  }
];

async function populateDatabase() {
  console.log('🚀 Starting database population...');
  console.log(`📡 Connecting to: ${supabaseUrl}`);

  try {
    // Step 1: Insert smart contracts
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

    // Step 2: Insert insurance templates
    console.log('🛡️  Inserting insurance templates...');
    const { data: templatesData, error: templatesError } = await supabase
      .from('insurance_templates')
      .insert(MOCK_INSURANCE_TEMPLATES)
      .select();
    if (templatesError) {
      throw new Error(`Error inserting insurance templates: ${JSON.stringify(templatesError)}`);
    }
    console.log(`✅ Inserted ${templatesData?.length || 0} insurance templates`);

    // Step 3: Insert user insurance policies
    console.log('🛡️  Inserting user insurance policies...');
    const { data: userPoliciesData, error: userPoliciesError } = await supabase
      .from('user_insurance_policies')
      .insert(MOCK_USER_INSURANCE_POLICIES)
      .select();
    if (userPoliciesError) {
      throw new Error(`Error inserting user insurance policies: ${JSON.stringify(userPoliciesError)}`);
    }
    console.log(`✅ Inserted ${userPoliciesData?.length || 0} user insurance policies`);

    // Step 4: Insert orders
    console.log('📦 Inserting orders...');
    // Optionally link orders to insurance templates or user policies
    // (for demo, link first order to first template, second to first user policy)
    if (templatesData && templatesData.length > 0) {
      MOCK_ORDERS[0].selected_insurance_policy_id = templatesData[0].id;
    }
    if (userPoliciesData && userPoliciesData.length > 0) {
      MOCK_ORDERS[1].user_insurance_policy_id = userPoliciesData[0].id;
    }
    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .insert(MOCK_ORDERS)
      .select();
    if (ordersError) {
      throw new Error(`Error inserting orders: ${JSON.stringify(ordersError)}`);
    }
    console.log(`✅ Inserted ${ordersData?.length || 0} orders`);

    // Step 5: Link orders to smart contract addresses (if needed)
    // ... (update logic as needed, or remove if not required by new schema) ...

    console.log('🎉 Database population completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   • Smart Contracts: ${contractsData?.length || 0} (may be limited by RLS)`);
    console.log(`   • Orders: ${ordersData?.length || 0}`);
    console.log(`   • Insurance Templates: ${templatesData?.length || 0}`);
    console.log(`   • User Insurance Policies: ${userPoliciesData?.length || 0}`);

  } catch (error) {
    console.error('❌ Error during database population:', error);
    process.exit(1);
  }
}

async function clearDatabase() {
  console.log('🧹 Starting database cleanup...');
  console.log(`📡 Connecting to: ${supabaseUrl}`);

  try {
    // Clear all data from tables in correct order (child to parent, orders before user_insurance_policies)
    const tables = [
      'insurance_policies',
      'order_matches',
      'orders',
      'user_insurance_policies',
      'smart_contracts',
      'insurance_templates'
    ];
    
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