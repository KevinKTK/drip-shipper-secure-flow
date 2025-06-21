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
  vesselNFT: '0x942088Ca56CA4e98ac33855cA25481a09E05fBCA',
  cargoNFT: '0x1c0A2b9DcbA3D20EFc3379823208Bc67B92506B7',
  insurancePolicyNFT: '0x1CA4aF4A1a69DB30fFbb299d6865Cd87c24f2A89',
  journeyNFT: '0xe71b13b0D639BdfBe8dFF5d07d396852984f333B',
  brokerage: '0x9660AF590d7fF2cAB99174970fC0911577eE23a3',
};