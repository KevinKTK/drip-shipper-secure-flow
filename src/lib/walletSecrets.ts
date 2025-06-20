import {SUPABASE_PUBLISHABLE_KEY} from '@/integrations/supabase/client';
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