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
  vesselNFT: '0x26aD738fB6c3Ad2242f470d0B1FB133BaF1637E7',
  cargoNFT: '0x2BeAAa463E6A270dA73EAa759fA876b3F983759e',
  insurancePolicyNFT: '0x8735D530B9E6090bb78C479F788e7D82866E3AaF',
  journeyNFT: '0xeFC759145BBCd399cDBb69AD7ACD6C5bA6108E82',
  brokerage: '0xcDfe511973a2C10220727aD1BA6552FeE5c73b33',
};