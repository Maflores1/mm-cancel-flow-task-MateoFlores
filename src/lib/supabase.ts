// src/lib/supabase.ts
/**
 * Supabase client configuration for Migrate Mate cancellation flow
 * 
 * This file sets up the Supabase client with proper environment variable handling
 * and TypeScript interfaces for type safety throughout the application.
 * 
 * Security: Uses environment variables to prevent credential exposure in code
 * Testing: Configured for mock authentication during development
 */

import { createClient } from '@supabase/supabase-js'

// Load credentials from .env.local file
// Required environment variables:
// NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
// NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Validate that environment variables are loaded
// This prevents runtime errors if .env.local is missing or incomplete
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env.local file contains:\n' +
    'NEXT_PUBLIC_SUPABASE_URL=your_url_here\n' +
    'NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here'
  )
}

// Create and export the Supabase client
// Auth settings are disabled since we're using mock authentication for this assessment
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,  // Disable automatic token refresh
    persistSession: false,    // Don't persist auth sessions
    detectSessionInUrl: false // Don't detect auth sessions from URL
  }
})

/**
 * TypeScript interfaces for database tables
 * These provide type safety and better developer experience
 */

export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  monthly_price: number; // Stored in cents (2500 = $25.00)
  status: 'active' | 'pending_cancellation' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface Cancellation {
  id: string;
  user_id: string;
  subscription_id: string;
  downsell_variant: 'A' | 'B'; // A/B test variant assignment
  
  // Job finding flow data (collected when user found a job)
  found_job?: boolean;
  used_migratemate?: boolean;
  roles_applied?: string;
  companies_emailed?: string;
  companies_interviewed?: string;
  feedback?: string;
  
  // Visa help data (collected for visa assistance)
  visa_help?: boolean;
  visa_type?: string;
  
  // Cancellation reason data (collected when user didn't find job)
  cancellation_reason?: string;
  reason_details?: string;
  
  // A/B test outcome tracking
  accepted_downsell: boolean;
  created_at: string;
}