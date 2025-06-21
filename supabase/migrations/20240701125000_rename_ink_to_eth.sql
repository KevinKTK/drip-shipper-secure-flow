-- Renaming columns from _ink to _eth
ALTER TABLE public.orders RENAME COLUMN price_ink TO price_eth;
ALTER TABLE public.order_matches RENAME COLUMN match_price_ink TO match_price_eth;
ALTER TABLE public.insurance_policies RENAME COLUMN payout_amount_ink TO payout_amount_eth;
ALTER TABLE public.insurance_policies RENAME COLUMN premium_ink TO premium_eth;
ALTER TABLE public.insurance_templates RENAME COLUMN payout_amount_ink TO payout_amount_eth;
ALTER TABLE public.insurance_templates RENAME COLUMN premium_ink TO premium_eth;
-- Update network value in smart_contracts table
UPDATE public.smart_contracts SET network = 'sepolia' WHERE network = 'ink-sepolia'; 