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
  vesselNFT: '0xC7c0f28f15a0Ae961539b9140ec9B39819b64d89',
  cargoNFT: '0x33575823BF2643957CFe501CF01F9D19dE6EF04C',
  insurancePolicyNFT: '0x2Ea59258104Ee0e646eA96DceD6C097fB2B01010',
  journeyNFT: '0xe67Ca4e487Ee085c410c333809ED61eCDcaf4F54',
  brokerage: '0xAb3FfEF2315e8a5ac8587CFFBDDb7D099E3A9b1a',
};