import {SUPABASE_PUBLISHABLE_KEY} from '@/integrations/supabase/client';
import { contractAddresses } from './contract-addresses';

export async function fetchWalletSecrets() {
    // --- IMPORTANT ---
    // Replace this with your actual Supabase anon key
    const supabaseAnonKey = SUPABASE_PUBLISHABLE_KEY;
  
    const res = await fetch(
      'https://dvnhapzqryschdxmxpds.supabase.co/functions/v1/get-wallet-secrets', 
      {
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
        }
      }
    );
  
    if (!res.ok) {
      console.error(`Error fetching secrets: ${res.status} ${res.statusText}`);
      throw new Error('Failed to fetch wallet secrets');
    }
    
    return res.json();
  }

// Export contract addresses as a constant
export const CONTRACT_ADDRESSES = {
  vesselNFT: '0x1CA4aF4A1a69DB30fFbb299d6865Cd87c24f2A89',
  cargoNFT: '0x1c0A2b9DcbA3D20EFc3379823208Bc67B92506B7',
  insurancePolicyNFT: '0xA1b3bF8ADe091aFa3a2339Bc231cf76e6451DCEA',
  journeyNFT: '0x3C7CD2708Dd0bB440D8dc3F04c447e1DB923EC58',
  brokerage: '0x422cB3340c180bF41641Fc970871193843562c2f',
};