-- WARNING: Development-only RLS relaxation. DO NOT USE IN PRODUCTION!
-- This migration allows public inserts and updates for mock data population.

-- smart_contracts: allow public insert, update, delete
CREATE POLICY IF NOT EXISTS "dev insert all smart_contracts"
  ON public.smart_contracts
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "dev update all smart_contracts"
  ON public.smart_contracts
  FOR UPDATE
  TO public
  USING (true);

CREATE POLICY IF NOT EXISTS "dev delete all smart_contracts"
  ON public.smart_contracts
  FOR DELETE
  TO public
  USING (true);

-- orders: allow public insert, update, delete
CREATE POLICY IF NOT EXISTS "dev insert all orders"
  ON public.orders
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "dev update all orders"
  ON public.orders
  FOR UPDATE
  TO public
  USING (true);

CREATE POLICY IF NOT EXISTS "dev delete all orders"
  ON public.orders
  FOR DELETE
  TO public
  USING (true);

-- insurance_policies: allow public insert, update, delete
CREATE POLICY IF NOT EXISTS "dev insert all insurance_policies"
  ON public.insurance_policies
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "dev update all insurance_policies"
  ON public.insurance_policies
  FOR UPDATE
  TO public
  USING (true);

CREATE POLICY IF NOT EXISTS "dev delete all insurance_policies"
  ON public.insurance_policies
  FOR DELETE
  TO public
  USING (true);

-- order_matches: allow public insert, update, delete
CREATE POLICY IF NOT EXISTS "dev insert all order_matches"
  ON public.order_matches
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "dev update all order_matches"
  ON public.order_matches
  FOR UPDATE
  TO public
  USING (true);

CREATE POLICY IF NOT EXISTS "dev delete all order_matches"
  ON public.order_matches
  FOR DELETE
  TO public
  USING (true); 