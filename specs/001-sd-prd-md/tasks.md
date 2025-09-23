# Tasks: Shadowdark Magic Item Web App

**Input**: Design documents from `/Users/dmccord/Projects/vibeCode/shadowdark-tools/specs/001-sd-prd-md/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/api-spec.yaml, quickstart.md

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → ✅ Extracted: Next.js 15 App Router, TypeScript, Supabase, shadcn/ui stack
2. Load optional design documents:
   → ✅ data-model.md: 5 entities (Users, Lists, ListItems, RollTables, Favorites)
   → ✅ contracts/api-spec.yaml: 8 endpoint groups, 15 total endpoints
   → ✅ research.md: Technical decisions for search, state management, auth
   → ✅ quickstart.md: 8 user scenarios for integration testing
3. Generate tasks by category:
   → Setup: Project init, dependencies, database, configuration
   → Tests: Contract tests, integration tests for user scenarios
   → Core: Database setup, TypeScript types, API endpoints, components
   → Integration: Authentication, search, state management
   → Polish: Unit tests, performance optimization, accessibility
4. Apply task rules:
   → Different files = marked [P] for parallel execution
   → Same file = sequential (no [P])
   → Tests before implementation (TDD approach)
5. Number tasks sequentially (T001-T040)
6. Generate dependency graph and parallel execution examples
7. Validate task completeness:
   → ✅ All 15 API endpoints have contract tests
   → ✅ All 5 entities have model creation tasks
   → ✅ All 8 user scenarios have integration tests
8. Return: SUCCESS (40 tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
Next.js App Router structure (web application):
- `app/` - Next.js App Router pages and API routes
- `components/` - Reusable UI components (shadcn/ui)
- `lib/` - Utility functions, Supabase clients, types
- `types/` - TypeScript type definitions
- `supabase/` - Database migrations and seeds
- `tests/` - All test files organized by type

## Phase 3.1: Setup & Infrastructure

- [x] T001 Initialize Next.js 15 project with TypeScript and required dependencies
- [ ] T002 [P] Configure ESLint, Prettier, and TypeScript strict mode per constitutional requirements
- [ ] T003 [P] Setup Tailwind CSS with shadcn/ui component system and theme configuration
- [ ] T004 [P] Initialize Supabase project and configure local development environment
- [ ] T005 Create database schema with migrations from data-model.md in supabase/migrations/
- [ ] T006 [P] Setup Supabase TypeScript code generation and configure build scripts
- [ ] T007 [P] Configure Jest and React Testing Library for component testing
- [ ] T008 [P] Setup Playwright for end-to-end testing with authentication flows

## Phase 3.2: TypeScript Types & Data Layer (TDD) ⚠️ MUST COMPLETE BEFORE 3.3

**CRITICAL: These types and tests MUST be written and MUST FAIL before ANY implementation**

- [ ] T009 [P] Generate TypeScript types from Supabase schema in types/database.ts
- [ ] T010 [P] Create magic item type definitions in types/magic-items.ts
- [ ] T011 [P] Create roll table data types in types/tables.ts
- [ ] T012 [P] Create API response types in types/api.ts
- [ ] T013 [P] Contract test GET /api/magic-items in tests/contract/magic-items-get.test.ts
- [ ] T014 [P] Contract test GET /api/magic-items/{id} in tests/contract/magic-items-by-id.test.ts
- [ ] T015 [P] Contract test GET /api/lists in tests/contract/lists-get.test.ts
- [ ] T016 [P] Contract test POST /api/lists in tests/contract/lists-post.test.ts
- [ ] T017 [P] Contract test PUT /api/lists/{id} in tests/contract/lists-put.test.ts
- [ ] T018 [P] Contract test DELETE /api/lists/{id} in tests/contract/lists-delete.test.ts
- [ ] T019 [P] Contract test POST /api/lists/{id}/items in tests/contract/list-items-post.test.ts
- [ ] T020 [P] Contract test DELETE /api/lists/{id}/items in tests/contract/list-items-delete.test.ts
- [ ] T021 [P] Contract test GET /api/favorites in tests/contract/favorites-get.test.ts
- [ ] T022 [P] Contract test POST /api/favorites in tests/contract/favorites-post.test.ts
- [ ] T023 [P] Contract test DELETE /api/favorites in tests/contract/favorites-delete.test.ts
- [ ] T024 [P] Contract test GET /api/roll-tables in tests/contract/roll-tables-get.test.ts
- [ ] T025 [P] Contract test POST /api/roll-tables in tests/contract/roll-tables-post.test.ts
- [ ] T026 [P] Contract test PUT /api/roll-tables/{id} in tests/contract/roll-tables-put.test.ts
- [ ] T027 [P] Contract test DELETE /api/roll-tables/{id} in tests/contract/roll-tables-delete.test.ts
- [ ] T028 [P] Contract test GET /api/roll-tables/shared/{token} in tests/contract/shared-tables.test.ts

## Phase 3.3: Core Implementation (ONLY after tests are failing)

### Authentication & Database Foundation
- [ ] T029 Create Supabase client configurations in lib/supabase/client.ts and lib/supabase/server.ts
- [ ] T030 Implement authentication middleware in middleware.ts for protected routes
- [ ] T031 [P] Create magic items service with JSON data loading in lib/services/magic-items.ts
- [ ] T032 [P] Create database service layer for lists in lib/services/lists.ts
- [ ] T033 [P] Create database service layer for favorites in lib/services/favorites.ts
- [ ] T034 [P] Create database service layer for roll tables in lib/services/roll-tables.ts

### API Endpoints Implementation
- [ ] T035 Implement GET /api/magic-items with search and filtering in app/api/magic-items/route.ts
- [ ] T036 Implement GET /api/magic-items/[id] in app/api/magic-items/[id]/route.ts
- [ ] T037 Implement lists CRUD endpoints in app/api/lists/route.ts and app/api/lists/[id]/route.ts
- [ ] T038 Implement list items endpoints in app/api/lists/[id]/items/route.ts
- [ ] T039 Implement favorites endpoints in app/api/favorites/route.ts
- [ ] T040 Implement roll tables CRUD endpoints in app/api/roll-tables/route.ts and app/api/roll-tables/[id]/route.ts

## Phase 3.4: Frontend Components & Pages

### Core UI Components (shadcn/ui based)
- [ ] T041 [P] Create MagicItemCard component in components/magic-item/magic-item-card.tsx
- [ ] T042 [P] Create SearchBar component with fuzzy search in components/search/search-bar.tsx
- [ ] T043 [P] Create FilterControls component in components/filters/filter-controls.tsx
- [ ] T044 [P] Create ListCard component in components/lists/list-card.tsx
- [ ] T045 [P] Create ListItemManager component in components/lists/list-item-manager.tsx
- [ ] T046 [P] Create RollTableDisplay component in components/tables/roll-table-display.tsx
- [ ] T047 [P] Create RollTableGenerator component in components/tables/roll-table-generator.tsx
- [ ] T048 [P] Create AuthButton component in components/auth/auth-button.tsx

### Page Implementation
- [ ] T049 Create homepage with magic item browsing in app/page.tsx
- [ ] T050 Create magic item detail page in app/items/[id]/page.tsx
- [ ] T051 Create user lists page in app/lists/page.tsx
- [ ] T052 Create individual list view in app/lists/[id]/page.tsx
- [ ] T053 Create roll table creation page in app/tables/create/page.tsx
- [ ] T054 Create roll table view page in app/tables/[id]/page.tsx
- [ ] T055 Create shared roll table page in app/shared/[token]/page.tsx
- [ ] T056 Create authentication pages in app/(auth)/login/page.tsx and app/(auth)/register/page.tsx

## Phase 3.5: State Management & Advanced Features

- [ ] T057 [P] Create Zustand store for UI state in lib/stores/ui-store.ts
- [ ] T058 [P] Create Zustand store for search state in lib/stores/search-store.ts
- [ ] T059 [P] Implement fuzzy search with Fuse.js in lib/utils/search.ts
- [ ] T060 [P] Create roll table generation algorithms in lib/utils/roll-table-generator.ts
- [ ] T061 [P] Implement share token generation and validation in lib/utils/sharing.ts
- [ ] T062 Create responsive navigation layout in components/layout/navigation.tsx
- [ ] T063 Implement theme switching with next-themes in components/layout/theme-toggle.tsx

## Phase 3.6: Integration Testing

**Integration tests based on quickstart.md scenarios**

- [ ] T064 [P] Integration test: Anonymous browsing and search in tests/integration/anonymous-browsing.test.ts
- [ ] T065 [P] Integration test: User registration and authentication in tests/integration/user-auth.test.ts
- [ ] T066 [P] Integration test: Favorites management in tests/integration/favorites.test.ts
- [ ] T067 [P] Integration test: Custom list creation and management in tests/integration/list-management.test.ts
- [ ] T068 [P] Integration test: Roll table generation in tests/integration/roll-tables.test.ts
- [ ] T069 [P] Integration test: Sharing and collaboration in tests/integration/sharing.test.ts
- [ ] T070 [P] Integration test: Mobile responsiveness in tests/integration/mobile-responsive.test.ts
- [ ] T071 [P] Integration test: Performance and accessibility in tests/integration/performance-a11y.test.ts

## Phase 3.7: Polish & Optimization

- [ ] T072 [P] Add loading states and error boundaries in components/ui/loading-states.tsx
- [ ] T073 [P] Implement toast notifications system in components/ui/toast-provider.tsx
- [ ] T074 [P] Add confirmation dialogs for destructive actions in components/ui/confirm-dialog.tsx
- [ ] T075 [P] Optimize magic items JSON loading and caching in lib/utils/data-loader.ts
- [ ] T076 [P] Add comprehensive error handling in lib/utils/error-handler.ts
- [ ] T077 [P] Implement accessibility improvements (ARIA labels, keyboard navigation)
- [ ] T078 [P] Add unit tests for utility functions in tests/unit/utils.test.ts
- [ ] T079 [P] Add unit tests for components in tests/unit/components.test.ts
- [ ] T080 [P] Performance optimization and Lighthouse score validation

## Dependencies

**Critical Dependencies:**
- Setup (T001-T008) must complete before all other phases
- Types and Contract Tests (T009-T028) must complete and FAIL before Core Implementation
- Core Implementation (T029-T040) blocks Frontend Components
- API endpoints (T035-T040) block corresponding integration tests

**Parallel Groups:**
```
Setup Phase: T002, T003, T004, T006, T007, T008 can run in parallel
Types Phase: T009-T028 can all run in parallel (different files)
Services Phase: T031, T032, T033, T034 can run in parallel
Components Phase: T041-T048 can run in parallel
Integration Tests: T064-T071 can run in parallel
Polish Phase: T072-T080 can run in parallel
```

## Parallel Execution Examples

```bash
# Launch Type Definition Tasks (Phase 3.2)
Task: "Generate TypeScript types from Supabase schema in types/database.ts"
Task: "Create magic item type definitions in types/magic-items.ts"
Task: "Create roll table data types in types/tables.ts"
Task: "Create API response types in types/api.ts"

# Launch Contract Test Tasks (Phase 3.2)
Task: "Contract test GET /api/magic-items in tests/contract/magic-items-get.test.ts"
Task: "Contract test POST /api/lists in tests/contract/lists-post.test.ts"
Task: "Contract test GET /api/favorites in tests/contract/favorites-get.test.ts"
Task: "Contract test POST /api/roll-tables in tests/contract/roll-tables-post.test.ts"

# Launch Component Development (Phase 3.4)
Task: "Create MagicItemCard component in components/magic-item/magic-item-card.tsx"
Task: "Create SearchBar component with fuzzy search in components/search/search-bar.tsx"
Task: "Create ListCard component in components/lists/list-card.tsx"
Task: "Create RollTableDisplay component in components/tables/roll-table-display.tsx"
```

## Validation Checklist

**GATE: Checked during execution**

- [x] All 15 API endpoints have corresponding contract tests
- [x] All 5 database entities have model creation tasks
- [x] All 8 user scenarios from quickstart.md have integration tests
- [x] TDD approach enforced (tests before implementation)
- [x] Parallel tasks are truly independent (different files)
- [x] Each task specifies exact file path
- [x] Constitutional requirements addressed (TypeScript, mobile-first, accessibility)
- [x] Performance targets included (Lighthouse scores, search response time)

## Notes

- **[P] tasks** = different files, no dependencies, can run in parallel
- **Verify tests fail** before implementing features (TDD approach)
- **Mobile-first** responsive design required for all components
- **Accessibility** compliance (WCAG 2.1 AA) must be validated
- **Performance targets**: Lighthouse scores ≥90/95/90
- **Constitutional compliance** verified for each major component