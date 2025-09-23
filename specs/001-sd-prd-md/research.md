# Research: Shadowdark Magic Item Web App

**Feature**: Shadowdark Magic Item Web App
**Date**: 2025-01-23
**Status**: Complete

## Research Tasks

### 1. Next.js 15 App Router Best Practices

**Decision**: Use Next.js 15 App Router with TypeScript and new React 19 features
**Rationale**:
- App Router provides better SSR/SSG support required for Supabase authentication
- TypeScript integration is mature and aligns with constitutional requirements
- React 19 Server Components improve performance for static content like magic item browsing
- Built-in API routes eliminate need for separate backend

**Alternatives considered**:
- Next.js Pages Router: Older pattern, less optimal for SSR auth flows
- Separate backend (Express/Fastify): Adds complexity, violates constitutional simplicity principles
- Other frameworks (Remix, SvelteKit): Less ecosystem support for Supabase integration

### 2. Supabase Integration Patterns for Next.js

**Decision**: Use @supabase/ssr package with separate client/server instances
**Rationale**:
- Handles SSR/client hydration correctly for authentication state
- Enables Row Level Security enforcement on server-side operations
- Supports both middleware and API route authentication
- TypeScript code generation for database schemas

**Alternatives considered**:
- Single Supabase client: Doesn't handle SSR authentication properly
- Manual auth state management: Complex, error-prone, reinvents Supabase features
- Alternative BaaS (Firebase, AWS Amplify): Less optimal TypeScript integration

### 3. State Management for Lists and Tables

**Decision**: Zustand for client-side state, React Query for server state
**Rationale**:
- Zustand provides simple, TypeScript-friendly global state management
- React Query handles Supabase data fetching, caching, and optimistic updates
- Avoids Redux complexity while maintaining predictable state updates
- Integrates well with Supabase real-time subscriptions

**Alternatives considered**:
- Redux Toolkit: Overly complex for application scope
- Context + useReducer: Becomes unwieldy with complex state interactions
- SWR instead of React Query: Less feature-complete for mutations

### 4. Fuzzy Search Implementation

**Decision**: Client-side fuzzy search using Fuse.js with JSON data preloading
**Rationale**:
- Magic item dataset is finite and can be preloaded for instant search
- Fuse.js provides configurable fuzzy matching across multiple fields
- Client-side search eliminates server round-trips for better UX
- Can fall back to server-side search for authenticated features if needed

**Alternatives considered**:
- Supabase full-text search: Requires complex SQL queries, less flexible
- Algolia/Elasticsearch: Overkill for static dataset, adds external dependency
- Simple string.includes(): Too basic, poor user experience

### 5. Roll Table Generation Algorithm

**Decision**: Weighted random selection with duplicate handling options
**Rationale**:
- Supports both "allow duplicates" and "unique items only" modes
- Handles edge cases where die size exceeds available items
- Provides consistent randomization using crypto.getRandomValues()
- Allows manual override of any table row for customization

**Alternatives considered**:
- Simple random selection: Doesn't handle duplicates or edge cases well
- Pre-generated tables: Inflexible, doesn't support custom die sizes
- Server-side generation: Unnecessary network calls for deterministic operations

### 6. Responsive Design Strategy

**Decision**: Mobile-first Tailwind CSS with shadcn/ui component system
**Rationale**:
- Tailwind's utility-first approach aligns with constitutional mobile-first requirements
- shadcn/ui provides accessible, pre-built components with proper touch targets
- Built-in dark mode support via next-themes
- Consistent design system across all components

**Alternatives considered**:
- CSS Modules: Less responsive utility support, more custom CSS required
- Emotion/Styled Components: Adds runtime CSS-in-JS overhead
- Custom CSS framework: Reinvents accessible component patterns

### 7. Data Architecture for Magic Items

**Decision**: Hybrid approach - JSON source of truth with Supabase for user data
**Rationale**:
- Magic items are static reference data, optimal as JSON for performance
- User-generated content (lists, tables, favorites) requires relational database
- Enables offline browsing while maintaining data consistency
- Simplifies deployment and reduces database load

**Alternatives considered**:
- All data in Supabase: Unnecessary for static reference data
- All data in JSON: Can't support user authentication and personalization
- External API for magic items: Adds dependency and latency

## Implementation Decisions Summary

| Component | Technology | Justification |
|-----------|------------|---------------|
| Framework | Next.js 15 App Router | SSR auth support, TypeScript integration |
| Database | Supabase PostgreSQL | Built-in auth, RLS, TypeScript generation |
| State | Zustand + React Query | Simple global state + server state management |
| Search | Fuse.js (client-side) | Instant fuzzy search for static data |
| UI | shadcn/ui + Tailwind | Mobile-first responsive, accessible components |
| Data | JSON + Supabase hybrid | Optimal for static reference + user data |

## Technical Risks & Mitigations

1. **Risk**: Large JSON payload affecting initial load performance
   **Mitigation**: Implement progressive loading, consider CDN for static assets

2. **Risk**: Complex state synchronization between Zustand and Supabase
   **Mitigation**: Use React Query as single source of truth for server state

3. **Risk**: Search performance degradation with large datasets
   **Mitigation**: Implement search result pagination and debounced input

4. **Risk**: Roll table generation edge cases (empty lists, large die sizes)
   **Mitigation**: Comprehensive validation and user feedback for edge cases

## Next Steps

All technical decisions align with constitutional requirements:
- ✅ TypeScript-first development
- ✅ Component-first architecture with shadcn/ui
- ✅ Mobile-first responsive design
- ✅ Supabase integration with RLS
- ✅ Performance and accessibility targets

Ready to proceed to Phase 1: Design & Contracts.