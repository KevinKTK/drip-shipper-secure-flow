
-- Add price field to carrier_routes table to track when journeys are priced for marketplace
ALTER TABLE public.carrier_routes 
ADD COLUMN price_eth numeric DEFAULT NULL;

-- Add a comment to clarify the pricing workflow
COMMENT ON COLUMN public.carrier_routes.price_eth IS 'Price set by carrier to make journey available on marketplace. NULL means journey is not yet priced for marketplace.';
