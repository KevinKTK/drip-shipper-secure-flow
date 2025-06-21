
-- Add penalty-related fields to the orders table
ALTER TABLE public.orders 
ADD COLUMN penalty_rate_per_day INTEGER DEFAULT 10,
ADD COLUMN max_penalty_percentage INTEGER DEFAULT 100,
ADD COLUMN expected_delivery_timestamp TIMESTAMP WITH TIME ZONE,
ADD COLUMN actual_delivery_timestamp TIMESTAMP WITH TIME ZONE,
ADD COLUMN penalty_amount_eth NUMERIC DEFAULT 0,
ADD COLUMN is_penalty_applied BOOLEAN DEFAULT FALSE;

-- Add comments for clarity
COMMENT ON COLUMN public.orders.penalty_rate_per_day IS 'Penalty percentage per 24-hour delay period (default: 10%)';
COMMENT ON COLUMN public.orders.max_penalty_percentage IS 'Maximum total penalty percentage (default: 100%)';
COMMENT ON COLUMN public.orders.expected_delivery_timestamp IS 'Expected delivery deadline for penalty calculation';
COMMENT ON COLUMN public.orders.actual_delivery_timestamp IS 'Actual delivery timestamp for penalty calculation';
COMMENT ON COLUMN public.orders.penalty_amount_eth IS 'Calculated penalty amount in ETH';
COMMENT ON COLUMN public.orders.is_penalty_applied IS 'Whether penalty has been applied to this order';
