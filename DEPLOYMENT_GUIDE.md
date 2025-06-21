# DripShipper Deployment Guide

This guide explains how to deploy the smart contracts and populate the database with the new structure that includes smart contract addresses.

## Prerequisites

1. Node.js and npm/yarn installed
2. Supabase CLI installed
3. Access to your Supabase project
4. Wallet with INK tokens for contract deployment

## Step 1: Deploy Smart Contracts

First, deploy your smart contracts to the Ink Sepolia testnet. The contracts should be deployed in this order:

1. **VesselNFT** - For vessel tokenization
2. **CargoNFT** - For cargo tokenization
3. **InsuranceManager** - For insurance policy management
4. **JourneyManager** - For journey tracking
5. **Brokerage** - For order matching and brokerage

After deployment, update the contract addresses in `src/lib/contract-addresses.ts`:

```typescript
export const contractAddresses = {
  vesselNFT: "YOUR_DEPLOYED_VESSEL_NFT_ADDRESS",
  cargoNFT: "YOUR_DEPLOYED_CARGO_NFT_ADDRESS",
  insuranceManager: "YOUR_DEPLOYED_INSURANCE_MANAGER_ADDRESS",
  journeyManager: "YOUR_DEPLOYED_JOURNEY_MANAGER_ADDRESS",
  brokerage: "YOUR_DEPLOYED_BROKERAGE_ADDRESS",
} as const;
```

## Step 2: Database Setup

### Option A: Fresh Database Setup

1. **Reset the database** (if needed):

   ```bash
   # Run the drop tables script
   psql -h YOUR_SUPABASE_HOST -U postgres -d postgres -f supabase/migrations/drop_all_tables.sql
   ```

2. **Create tables with contract addresses**:
   ```bash
   # Run the create tables script
   psql -h YOUR_SUPABASE_HOST -U postgres -d postgres -f supabase/migrations/create_tables_with_contracts.sql
   ```

### Option B: Update Existing Database

If you have an existing database, you can run the migration that adds contract address columns:

```bash
# Apply the latest migration
supabase db push
```

## Step 3: Populate Database with Mock Data

Use the TypeScript utility to populate the database with mock data that includes smart contract addresses:

```typescript
import { populateDatabase } from "./src/lib/populateDatabase";

// Replace with your Supabase credentials
const supabaseUrl = "YOUR_SUPABASE_URL";
const supabaseKey = "YOUR_SUPABASE_ANON_KEY";

// Populate the database
await populateDatabase(supabaseUrl, supabaseKey);
```

You can run this in a Node.js script or in your application's initialization code.

## Step 4: Verify Setup

1. **Check smart contracts table**:

   ```sql
   SELECT * FROM smart_contracts;
   ```

2. **Check orders with contract addresses**:

   ```sql
   SELECT id, title, cargo_nft_contract_address, vessel_nft_contract_address
   FROM orders
   WHERE cargo_nft_contract_address IS NOT NULL
   OR vessel_nft_contract_address IS NOT NULL;
   ```

3. **Check insurance policies**:
   ```sql
   SELECT policy_name, insurance_manager_contract_address
   FROM insurance_policies;
   ```

## Database Schema Overview

### New Tables and Columns

1. **smart_contracts** - Tracks deployed contract addresses

   - `contract_name` - Name of the contract
   - `contract_address` - Deployed address
   - `network` - Network (ink-sepolia)
   - `is_active` - Whether contract is active

2. **orders** - Enhanced with contract addresses

   - `vessel_nft_contract_address` - VesselNFT contract address
   - `cargo_nft_contract_address` - CargoNFT contract address
   - `insurance_manager_contract_address` - InsuranceManager contract address
   - `journey_manager_contract_address` - JourneyManager contract address
   - `brokerage_contract_address` - Brokerage contract address

3. **order_matches** - Enhanced with contract addresses

   - `journey_manager_contract_address` - JourneyManager contract address
   - `brokerage_contract_address` - Brokerage contract address

4. **insurance_policies** - Enhanced with contract addresses
   - `insurance_manager_contract_address` - InsuranceManager contract address

### Row Level Security (RLS)

The database includes comprehensive RLS policies that:

- Allow users to view all orders and matches
- Restrict updates to user's own data
- Support both user_id and wallet_address authentication
- Allow public read access for demo purposes

## Troubleshooting

### Common Issues

1. **Contract addresses not found**: Ensure contracts are deployed and addresses are correctly updated in `contract-addresses.ts`

2. **RLS policy errors**: Check that your Supabase JWT includes the necessary claims

3. **Foreign key constraint errors**: Ensure data is inserted in the correct order (smart_contracts → orders → order_matches/insurance_policies)

### Reset Database

To completely reset the database:

```typescript
import { clearDatabase } from "./src/lib/populateDatabase";

await clearDatabase(supabaseUrl, supabaseKey);
```

Then re-run the population script.

## Next Steps

After deployment and database setup:

1. Test the application with the new contract addresses
2. Verify that NFT minting works with the deployed contracts
3. Test insurance policy creation and management
4. Verify order matching functionality
5. Test journey tracking features

## Files Created/Modified

1. `supabase/migrations/create_tables_with_contracts.sql` - Complete database schema with contract addresses
2. `supabase/migrations/drop_all_tables.sql` - Database reset script
3. `src/lib/populateDatabase.ts` - TypeScript utility for database population
4. `src/lib/contract-addresses.ts` - Contract address configuration (update with your deployed addresses)
