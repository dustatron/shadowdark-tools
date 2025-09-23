<!--
Sync Impact Report:
Version change: Template → 1.0.0
Modified principles:
- Added Component-First Development
- Added Mobile-First Responsive Design
- Added TypeScript-First Development
- Added Supabase Integration Standards
- Added Performance & Accessibility
Added sections:
- Quality Standards
- Development Workflow
Removed sections: None
Templates requiring updates:
✅ plan-template.md (checked and aligned)
✅ spec-template.md (checked and aligned)
✅ tasks-template.md (checked and aligned)
Follow-up TODOs: None
-->

# Shadowdark Tools Constitution

## Core Principles

### I. Component-First Development
Every UI feature starts as a reusable, self-contained component. Components MUST be built with shadcn/ui patterns, follow single responsibility principle, and include TypeScript interfaces for all props. Components MUST support both light and dark themes via next-themes, include responsive breakpoints (mobile-first), and be independently testable. No organizational-only components allowed.

**Rationale**: Ensures code reusability, maintainability, and consistent design patterns across the application while supporting the required mobile and desktop experience.

### II. Mobile-First Responsive Design
All UI components and layouts MUST be designed mobile-first using Tailwind CSS responsive utilities. Breakpoints follow Tailwind's system: sm (640px), md (768px), lg (1024px), xl (1280px), 2xl (1536px). Touch targets MUST be minimum 44px, navigation patterns MUST work on touch devices, and content MUST be accessible without horizontal scrolling on mobile viewports.

**Rationale**: Ensures optimal user experience across all device types, with mobile being the primary consideration for accessibility and usability.

### III. TypeScript-First Development (NON-NEGOTIABLE)
All code MUST be written in TypeScript with strict mode enabled. No `any` types allowed except for controlled third-party integrations. Type definitions MUST be comprehensive for all data models, API responses, component props, and Supabase database schemas. TDD mandatory: Types defined → Tests written → Implementation follows.

**Rationale**: Prevents runtime errors, improves developer experience, and ensures type safety across the full stack including database operations.

### IV. Supabase Integration Standards
Database operations MUST use Supabase TypeScript client with generated types from database schema. Row Level Security (RLS) MUST be enabled for all tables. Real-time subscriptions MUST handle connection states and cleanup properly. Authentication flows MUST support SSR/SSG with supabase-ssr package and handle session management across client/server boundaries.

**Rationale**: Ensures secure, performant, and maintainable database operations while leveraging Supabase's full feature set appropriately.

### V. Performance & Accessibility
All pages MUST achieve Lighthouse scores: Performance ≥90, Accessibility ≥95, SEO ≥90. Images MUST use Next.js Image component with proper sizing and optimization. Components MUST follow WCAG 2.1 AA standards with proper ARIA labels, semantic HTML, and keyboard navigation support. Core Web Vitals MUST be monitored and maintained within Google's thresholds.

**Rationale**: Ensures optimal user experience for all users, including those with disabilities, while maintaining fast load times and search engine visibility.

## Quality Standards

TypeScript configuration MUST enforce strict mode with no implicit any, unused locals/parameters detection, and exact optional property types. ESLint MUST include Next.js, React, TypeScript, and accessibility rules with zero tolerance for warnings in CI/CD. Prettier MUST enforce consistent code formatting. All database schemas MUST be version controlled and deployable via Supabase migrations.

## Development Workflow

Pull requests MUST include type checking, linting, build verification, and accessibility testing. Components MUST be documented with Storybook stories showing all prop variations and responsive states. Database changes MUST include corresponding TypeScript type updates and migration scripts. Performance regressions MUST be caught via automated Lighthouse CI checks.

## Governance

Constitution supersedes all other development practices and coding standards. All code reviews MUST verify compliance with these principles, particularly mobile responsiveness, accessibility standards, and TypeScript usage. Complexity MUST be justified against these principles. Amendments require documentation, team approval, and migration plan for existing code.

**Version**: 1.0.0 | **Ratified**: 2025-01-23 | **Last Amended**: 2025-01-23