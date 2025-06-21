
-- Add vessel_id column to carrier_routes table to link journeys to specific vessels
ALTER TABLE carrier_routes ADD COLUMN vessel_id uuid;

-- Add foreign key relationship between carrier_routes and orders (vessels)
ALTER TABLE carrier_routes 
ADD CONSTRAINT fk_carrier_routes_vessel_id 
FOREIGN KEY (vessel_id) 
REFERENCES orders(id) 
ON DELETE CASCADE;

-- Create index for better query performance
CREATE INDEX idx_carrier_routes_vessel_id ON carrier_routes(vessel_id);

-- Update existing carrier_routes to handle the new vessel_id column
-- (existing routes will have NULL vessel_id until manually associated)
