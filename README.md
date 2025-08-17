# Migrate Mate Cancellation Flow

A comprehensive subscription cancellation flow implementation with A/B testing, data persistence, and security features.

## Architecture Overview

### Core Components

- **CancellationFlow.tsx**: Main React component handling the progressive user journey
- **supabase.ts**: Database client configuration with TypeScript interfaces
- **seed.sql**: Complete database schema with Row Level Security policies

### Flow Architecture

The cancellation flow uses a state machine pattern with 12 distinct steps:

1. **Initial**: User declares if they found a job
2. **Job Found Path**: Collects success metrics and offers visa help
3. **Still Looking Path**: Shows downsell offers and collects feedback
4. **Final States**: Completion, founder message, or cancellation confirmation

## A/B Testing Implementation

### Deterministic Assignment

```typescript
// Hash-based assignment ensures consistency across sessions
const hash = userId
  .split("")
  .reduce((acc, char) => acc + char.charCodeAt(0), 0);
const variant = hash % 2 === 0 ? "A" : "B";
```

### Variants

- **Variant A**: Standard pricing offer
- **Variant B**: 50% discount offer ($25→$12.50, $29→$14.50)

### Persistence

Variant assignment is stored in `cancellations.downsell_variant` and reused on repeat visits.

## Security Implementation

### Row Level Security (RLS)

```sql
-- Permissive policies for testing environment
CREATE POLICY "Allow all operations on users" ON users FOR ALL USING (true);
CREATE POLICY "Allow all operations on subscriptions" ON subscriptions FOR ALL USING (true);
CREATE POLICY "Allow all operations on cancellations" ON cancellations FOR ALL USING (true);
```

### Input Validation

- Form validation with user-friendly error messages
- Required field validation before progression
- Character limits and format validation
- Database constraint validation at schema level

### Data Protection

- Environment variables for API credentials
- No hardcoded sensitive information
- Prepared statements via Supabase client (prevents SQL injection)

## Database Design

### Schema Strategy

**Users Table**: Basic user information with UUID primary keys
**Subscriptions Table**: Pricing and status tracking with referential integrity
**Cancellations Table**: Comprehensive data collection with optional fields

### Key Design Decisions

1. **Optional Fields**: Most cancellation data is optional to accommodate different user paths
2. **Status Tracking**: Subscriptions marked as `pending_cancellation` rather than immediate deletion
3. **Referential Integrity**: Foreign key constraints ensure data consistency
4. **Indexes**: Performance optimization for user-based queries

## Data Persistence Strategy

### Two-Phase Commit

1. **Update Subscription**: Mark as `pending_cancellation`
2. **Create Cancellation Record**: Store all collected form data

### Error Handling

- Validates subscription exists before processing
- Handles multiple active subscriptions gracefully
- Comprehensive error logging for debugging
- User-friendly error messages

### Data Completeness

Only populated form fields are saved, preventing unnecessary null values while maintaining schema flexibility.

## Setup Instructions

### Environment Setup

1. Create `.env.local` with Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### Database Setup

1. Run the complete `seed.sql` script in Supabase SQL Editor
2. Verify seed data insertion with provided queries
3. Test RLS policies are working correctly

### Development

```bash
npm install
npm run dev
```

## Technical Highlights

- **TypeScript**: Full type safety with database interfaces
- **Responsive Design**: Mobile-first approach with desktop enhancements
- **Error Boundaries**: Comprehensive error handling and logging
- **Performance**: Optimized database queries with proper indexing
- **Maintainability**: Clear separation of concerns and extensive documentation
