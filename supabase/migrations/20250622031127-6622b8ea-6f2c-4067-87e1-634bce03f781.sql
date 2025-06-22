
-- Add the missing journey_nft_contract_address column to carrier_routes table
ALTER TABLE public.carrier_routes 
ADD COLUMN journey_nft_contract_address text;

-- Also add nft_transaction_hash column if it doesn't exist
ALTER TABLE public.carrier_routes 
ADD COLUMN nft_transaction_hash text;
