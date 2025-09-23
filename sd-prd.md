```markdown
# Product Requirements Document (PRD): Shadowdark Magic Item Web App

## Title
Shadowdark Magic Item Web App

## Change History
- **2025-09-23:** Initial PRD draft.

## Overview
A web app for browsing, searching, favoriting, and organizing Shadowdark RPG magic items. Users can create custom magic item lists and roll tables, save and share tables, and manage their collection. The app is built with Next.js (App Router), Supabase (backend/auth), Shadcn + Tailwind (UI), and Zustand (state management).

## Purpose & Scope
- **Purpose:** Provide a fast, user-friendly way for Shadowdark RPG players and GMs to manage and randomize magic items using searchable lists and roll tables.
- **Scope:** Covers public browsing/search, authenticated favoriting, custom list and roll table creation, sharing, and management features.

## User Personas
- **Player:** Wants to browse and search for magic items, create lists for their character, and randomize item selection.
- **Game Master (GM):** Needs to quickly generate random magic items for encounters, organize items by campaign, and share roll tables with players.

## User Stories & Scenarios
- As a user, I can browse all Shadowdark magic items without logging in.
- As a user, I can perform fuzzy search across all item fields.
- As a logged-in user, I can favorite items and create custom lists.
- As a logged-in user, I can create, rename, delete, and edit lists.
- As a logged-in user, I can create roll tables from lists, select die size (standard or custom), and manually fill blank rows.
- As a logged-in user, I can save roll tables to my profile, edit them, and share via direct link.
- As a recipient, I can view shared roll tables, duplicate them to my profile, and edit them.
- As a user, I receive clear feedback (toasts, error messages) for actions like deletion, reaching limits, or validation errors.

## Functional Requirements

### Browsing & Search
- Display all magic items from the provided JSON source.
- Fuzzy search across all item fields (name, description, effects, etc.).
- No login required for browsing/search.

### Favoriting & Lists
- Favoriting items requires login (Supabase auth).
- Unlimited favorites per user.
- Users can create up to 100 custom lists.
- Lists can be renamed and deleted (with confirmation dialog).
- Items can belong to multiple lists.
- Error message "Max allow is 100" shown if limit exceeded.

### Roll Tables
- Roll table view for any list.
- Table format: left column = roll number, right column = item details.
- Standard die sizes: d4, d6, d8, d10, d12, d20, d100.
- User can select any die size (including custom, min=1, max=10,000).
- If die size > list length, blank rows are shown; each blank row can be filled manually with any magic item via search.
- Option to auto-fill blank rows with random items from the full pool.
- Option to generate a new table with a selected die size and auto-fill all rows with random items.
- Validation/warning if die size exceeds available items.

### Table & List Management
- Save roll tables to user profile (login required).
- Temporary tables for anonymous users (not saved).
- Users can edit saved roll tables: add/remove/reorder items, change die size.
- Users can delete saved tables/lists (confirmation required).
- Toast notification after deletion: "Table has been removed."

### Sharing
- Roll tables can be shared via direct link.
- Shared tables are view-only for recipients but can be duplicated and edited in their own profile.
- No public/discoverable tables; sharing is only via direct link.

## Nonfunctional Requirements

- Responsive UI for desktop and mobile.
- Fast search and list operations.
- Secure authentication and data storage (Supabase).
- Accessible UI components (Shadcn + Tailwind).

## UI/UX Considerations

- Simple, clear navigation: browse, search, lists, roll tables.
- Fuzzy search input with instant results.
- List management UI: create, rename, delete, add/remove items.
- Roll table UI: die size selector, blank row handling, manual and auto-fill options.
- Confirmation dialogs for destructive actions.
- Toast notifications for success/error feedback.
- Error and validation messages displayed near relevant UI elements.

## Technical Requirements

- **Frontend:** Next.js (App Router), Shadcn UI, Tailwind CSS, Zustand.
- **Backend:** Supabase (database, auth, storage).
- **Data Source:** Magic items JSON (from GitHub).
- **Authentication:** Supabase (email/password, OAuth).
- **State Management:** Zustand for client-side lists/tables.

## Constraints & Limitations

- Max 100 lists/tables per user.
- Die size: min 1, max 10,000.
- No public/discoverable tables, only direct link sharing.
- Temporary tables for anonymous users.
- Validation required for excessive die sizes vs available items.

## Out-of-Scope

- No user-to-user messaging or comments.
- No campaign management or advanced GM tools.
- No weighted roll tables or custom dice expressions.
- No public search/discovery of shared tables.

## Success Metrics

- Users can browse/search items without login.
- Authenticated users can create/manage lists and roll tables.
- Roll tables can be shared, duplicated, and edited.
- App maintains performance and reliability with large lists/tables.

## Open Issues / TBD

- Final UI design mockups.
- Exact behavior for auto-fill (e.g., allow duplicates or unique items only).
- Analytics/usage tracking (if needed).

```
