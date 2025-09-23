
# Implementation Plan: Shadowdark Magic Item Web App

**Branch**: `001-sd-prd-md` | **Date**: 2025-01-23 | **Spec**: [spec.md](/Users/dmccord/Projects/vibeCode/shadowdark-tools/specs/001-sd-prd-md/spec.md)
**Input**: Feature specification from `/Users/dmccord/Projects/vibeCode/shadowdark-tools/specs/001-sd-prd-md/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, `GEMINI.md` for Gemini CLI, `QWEN.md` for Qwen Code or `AGENTS.md` for opencode).
7. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary
A responsive web application for browsing, searching, favoriting, and organizing Shadowdark RPG magic items. Users can create custom lists and roll tables with shareable links. Built with Next.js App Router, Supabase for auth/data, shadcn/ui components, and TypeScript throughout.

## Technical Context
**Language/Version**: TypeScript 5.x with strict mode, React 19, Next.js 15 (App Router)
**Primary Dependencies**: Next.js, Supabase (@supabase/supabase-js, @supabase/ssr), shadcn/ui, Tailwind CSS, Radix UI, next-themes, Zustand
**Storage**: Supabase PostgreSQL with Row Level Security, JSON source for magic items data
**Testing**: Jest/React Testing Library for components, Playwright for E2E, Supabase CLI for database testing
**Target Platform**: Web browsers (desktop/mobile), deployed on Vercel
**Project Type**: web - Next.js single application with integrated frontend/backend
**Performance Goals**: Lighthouse scores ≥90/95/90 (Performance/Accessibility/SEO), <3s initial load, <200ms search response
**Constraints**: Mobile-first responsive design, WCAG 2.1 AA compliance, 100 lists max per user, 10k max die size
**Scale/Scope**: 1000+ magic items, up to 10k concurrent users, unlimited anonymous browsing, authenticated user features

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Component-First Development**: ✅ PASS - All UI features will be built as reusable shadcn/ui components with TypeScript interfaces
**Mobile-First Responsive Design**: ✅ PASS - Tailwind CSS responsive utilities, 44px+ touch targets, mobile-first approach
**TypeScript-First Development**: ✅ PASS - Strict TypeScript throughout, comprehensive type definitions for Supabase schemas
**Supabase Integration Standards**: ✅ PASS - Generated types from database schema, RLS enabled, SSR support via supabase-ssr
**Performance & Accessibility**: ✅ PASS - Target Lighthouse scores met, Next.js Image optimization, WCAG 2.1 AA compliance

## Project Structure

### Documentation (this feature)
```
specs/[###-feature]/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
# Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure]
```

**Structure Decision**: Next.js App Router structure (web application)
```
app/
├── (auth)/
│   ├── login/
│   └── register/
├── browse/
├── lists/
├── tables/
├── shared/
├── api/
│   ├── lists/
│   ├── tables/
│   └── items/
├── globals.css
├── layout.tsx
└── page.tsx

components/
├── ui/              # shadcn/ui components
├── magic-item/      # item display components
├── lists/           # list management
├── tables/          # roll table components
└── layout/          # navigation, headers

lib/
├── supabase/        # client/server configs
├── types/           # TypeScript definitions
├── utils/           # utility functions
└── stores/          # Zustand state management

types/
├── database.ts      # Generated Supabase types
├── magic-items.ts   # Magic item interfaces
└── tables.ts        # Roll table types
```

## Phase 0: Outline & Research
1. **Extract unknowns from Technical Context** above:
   - For each NEEDS CLARIFICATION → research task
   - For each dependency → best practices task
   - For each integration → patterns task

2. **Generate and dispatch research agents**:
   ```
   For each unknown in Technical Context:
     Task: "Research {unknown} for {feature context}"
   For each technology choice:
     Task: "Find best practices for {tech} in {domain}"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all NEEDS CLARIFICATION resolved

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

1. **Extract entities from feature spec** → `data-model.md`:
   - Entity name, fields, relationships
   - Validation rules from requirements
   - State transitions if applicable

2. **Generate API contracts** from functional requirements:
   - For each user action → endpoint
   - Use standard REST/GraphQL patterns
   - Output OpenAPI/GraphQL schema to `/contracts/`

3. **Generate contract tests** from contracts:
   - One test file per endpoint
   - Assert request/response schemas
   - Tests must fail (no implementation yet)

4. **Extract test scenarios** from user stories:
   - Each story → integration test scenario
   - Quickstart test = story validation steps

5. **Update agent file incrementally** (O(1) operation):
   - Run `.specify/scripts/bash/update-agent-context.sh claude`
     **IMPORTANT**: Execute it exactly as specified above. Do not add or remove any arguments.
   - If exists: Add only NEW tech from current plan
   - Preserve manual additions between markers
   - Update recent changes (keep last 3)
   - Keep under 150 lines for token efficiency
   - Output to repository root

**Output**: data-model.md, /contracts/*, failing tests, quickstart.md, agent-specific file

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Load `.specify/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- Database setup tasks from data-model.md schema
- API endpoint tasks from contracts/api-spec.yaml [P]
- Component tasks for shadcn/ui integration [P]
- Type definition tasks from Supabase schema generation [P]
- Integration test tasks from quickstart scenarios
- Authentication flow implementation tasks
- Search and filtering functionality tasks
- Roll table generation algorithm tasks
- Responsive design and accessibility tasks

**Ordering Strategy**:
- TDD order: Tests before implementation
- Infrastructure first: Database, types, auth setup
- API layer: Backend endpoints and contracts
- Frontend: Components, pages, state management
- Integration: E2E tests and performance validation
- Mark [P] for parallel execution (independent files/components)

**Estimated Output**: 35-40 numbered, ordered tasks in tasks.md

**Key Task Categories**:
1. **Setup** (5 tasks): Database, TypeScript config, dependencies
2. **Backend** (12 tasks): API endpoints, auth, data services
3. **Frontend Components** (15 tasks): UI components, pages, state
4. **Integration** (8 tasks): E2E tests, performance, accessibility

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |


## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [x] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented

**Generated Artifacts**:
- [x] research.md - Technical decisions and rationale
- [x] data-model.md - Database schema and TypeScript types
- [x] contracts/api-spec.yaml - OpenAPI specification
- [x] quickstart.md - User acceptance test scenarios
- [x] CLAUDE.md - Updated agent context

---
*Based on Constitution v1.0.0 - See `.specify/memory/constitution.md`*

## Ready for /tasks Command

The implementation plan is complete and ready for task generation. All constitutional requirements are met, technical decisions are documented, and design artifacts provide a solid foundation for implementation.
