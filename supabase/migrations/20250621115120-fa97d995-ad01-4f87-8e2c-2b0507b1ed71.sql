
-- Add arrival_date column to carrier_routes table if it doesn't exist
ALTER TABLE public.carrier_routes 
ADD COLUMN IF NOT EXISTS arrival_date date;
