-- WARNING: Development-only RLS disable. DO NOT USE IN PRODUCTION!
-- This migration temporarily disables RLS on all tables for mock data population.

-- Disable RLS on all tables for development
ALTER TABLE public.smart_contracts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_policies DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_matches DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY; 