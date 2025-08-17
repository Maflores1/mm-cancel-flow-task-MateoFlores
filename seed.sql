-- seed.sql
-- Database schema and seed data for subscription cancellation flow
-- Updated with proper RLS policies for mock authentication

-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  monthly_price INTEGER NOT NULL, -- in cents (2500 for $25, 2900 for $29)
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending_cancellation', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cancellations table (single definition with all required fields)
CREATE TABLE IF NOT EXISTS cancellations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
  downsell_variant TEXT NOT NULL CHECK (downsell_variant IN ('A', 'B')),
  
  -- Job finding flow data
  found_job BOOLEAN,
  used_migratemate BOOLEAN,
  roles_applied TEXT,
  companies_emailed TEXT,
  companies_interviewed TEXT,
  feedback TEXT,
  
  -- Visa help data
  visa_help BOOLEAN,
  visa_type TEXT,
  
  -- Cancellation reason data
  cancellation_reason TEXT,
  reason_details TEXT,
  
  -- A/B test outcome
  accepted_downsell BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cancellations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can view own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can update own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can insert own cancellations" ON cancellations;
DROP POLICY IF EXISTS "Users can view own cancellations" ON cancellations;

-- RLS policies for mock authentication (allows access based on user_id matching)
-- Since we're using mock authentication, we'll create more permissive policies
-- In production, these would use auth.uid()

-- Allow all operations on users for testing purposes
CREATE POLICY "Allow all operations on users" ON users
  FOR ALL USING (true);

-- Allow viewing and updating subscriptions 
CREATE POLICY "Allow subscription operations" ON subscriptions
  FOR ALL USING (true);

-- Allow all operations on cancellations for testing
CREATE POLICY "Allow cancellation operations" ON cancellations
  FOR ALL USING (true);

-- Seed data
INSERT INTO users (id, email) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'user1@example.com'),
  ('550e8400-e29b-41d4-a716-446655440002', 'user2@example.com'),
  ('550e8400-e29b-41d4-a716-446655440003', 'user3@example.com')
ON CONFLICT (email) DO NOTHING;

-- Seed subscriptions with $25 and $29 plans
INSERT INTO subscriptions (id, user_id, monthly_price, status) VALUES
  ('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 2500, 'active'), -- $25.00
  ('650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 2900, 'active'), -- $29.00
  ('650e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 2500, 'active')  -- $25.00
ON CONFLICT (id) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_cancellations_user_id ON cancellations(user_id);
CREATE INDEX IF NOT EXISTS idx_cancellations_subscription_id ON cancellations(subscription_id);