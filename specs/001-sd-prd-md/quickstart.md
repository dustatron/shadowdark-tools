# Quickstart Guide: Shadowdark Magic Item Web App

**Feature**: Shadowdark Magic Item Web App
**Date**: 2025-01-23
**Purpose**: Validate implementation against user scenarios

## Overview

This quickstart guide provides step-by-step scenarios to validate the complete user experience from anonymous browsing to authenticated list management and roll table creation.

## Prerequisites

- Web browser (desktop or mobile)
- Internet connection
- Email address for account creation (optional for browsing)

## Scenario 1: Anonymous Browsing & Search

**Objective**: Verify public access to magic item catalog

### Steps:

1. **Open the application**
   - Navigate to the deployed URL
   - Verify homepage loads without authentication prompt
   - Confirm responsive design on current device

2. **Browse magic items**
   - View the magic item catalog
   - Scroll through items to see variety
   - Verify each item displays: name, type, rarity, description

3. **Test search functionality**
   - Enter "ring" in search box
   - Verify fuzzy search returns relevant results
   - Try partial matches like "prot" (should find "protection" items)
   - Test search across different fields (name, description, type)

4. **Test filtering**
   - Filter by item type (e.g., "weapon")
   - Filter by rarity (e.g., "rare")
   - Combine search and filters
   - Clear filters and verify all items return

5. **Attempt authenticated action**
   - Click "Add to Favorites" on any item
   - Verify redirect to login/signup page
   - Confirm no error occurs, just authentication prompt

**Expected Results**:
- ✅ Catalog loads quickly (< 3 seconds)
- ✅ Search responds instantly (< 200ms)
- ✅ All magic items are displayed with complete information
- ✅ Fuzzy search finds relevant items across all fields
- ✅ Filters work correctly and can be combined
- ✅ Authentication prompts appear for protected actions
- ✅ No errors or broken functionality

## Scenario 2: User Registration & Authentication

**Objective**: Verify account creation and login flow

### Steps:

1. **Create account**
   - Click "Sign Up" or registration link
   - Enter valid email and password
   - Complete registration process
   - Verify email if required by implementation

2. **First login**
   - Enter credentials and log in
   - Verify redirect to authenticated homepage
   - Confirm user interface shows authenticated state
   - Check that "favorites" list is auto-created

3. **Logout and re-login**
   - Log out from application
   - Verify return to public state
   - Log back in with same credentials
   - Confirm persistent session and data

**Expected Results**:
- ✅ Registration completes without errors
- ✅ Email validation works if implemented
- ✅ Login succeeds and shows authenticated UI
- ✅ Favorites list is automatically created
- ✅ Session persists across browser refresh
- ✅ Logout returns to public state

## Scenario 3: Favorites Management

**Objective**: Verify basic favoriting functionality

### Steps:

1. **Add favorites**
   - Browse magic items while logged in
   - Click "Add to Favorites" on 3-5 different items
   - Verify immediate visual feedback (toast, icon change)
   - Navigate to favorites list

2. **View favorites**
   - Access favorites from navigation/menu
   - Verify all favorited items appear
   - Confirm items display complete information
   - Test sorting/organization of favorites

3. **Remove favorites**
   - Remove one item from favorites
   - Verify confirmation dialog or immediate removal
   - Confirm item no longer appears in favorites
   - Verify original item page no longer shows "favorited" state

**Expected Results**:
- ✅ Favoriting is instant with visual feedback
- ✅ Favorites list accurately reflects user actions
- ✅ Remove functionality works correctly
- ✅ UI consistently shows favorite state across pages

## Scenario 4: Custom List Creation & Management

**Objective**: Verify list creation, editing, and item management

### Steps:

1. **Create custom list**
   - Navigate to list management area
   - Click "Create New List"
   - Enter name: "Campaign Weapons"
   - Add optional description
   - Save the list

2. **Add items to list**
   - Browse magic items
   - Add 5-10 weapon-type items to "Campaign Weapons" list
   - Verify items appear in list immediately
   - Test adding same item to multiple lists

3. **Manage list contents**
   - View the "Campaign Weapons" list
   - Remove 2 items from the list
   - Verify removed items no longer appear
   - Add 3 more items through list interface

4. **Edit list properties**
   - Edit list name to "Combat Magic Items"
   - Update description
   - Save changes and verify updates persist

5. **Test list limits**
   - Create lists until approaching the 100 list limit
   - Verify appropriate warning when nearing limit
   - Attempt to create 101st list
   - Confirm error message: "Max allowed is 100"

**Expected Results**:
- ✅ List creation works smoothly
- ✅ Items can be added/removed from lists
- ✅ Same item can belong to multiple lists
- ✅ List editing updates correctly
- ✅ List limit is enforced with clear error message

## Scenario 5: Roll Table Generation

**Objective**: Verify roll table creation from lists with different die sizes

### Steps:

1. **Create basic roll table**
   - Open "Combat Magic Items" list (from Scenario 4)
   - Click "Create Roll Table"
   - Select d20 die size
   - Name table: "Combat Items d20"
   - Generate table

2. **Verify table structure**
   - Confirm table shows 20 rows (1-20)
   - Verify list items populate first rows
   - Check that blank rows appear if list < 20 items
   - Verify each row shows roll number and item details

3. **Test auto-fill functionality**
   - For blank rows, test "Auto-fill with random items"
   - Verify random items from full catalog fill blanks
   - Confirm no duplicate items if "unique items" option exists

4. **Test manual row editing**
   - Click on a blank row
   - Search for and select a specific magic item
   - Verify row updates with selected item
   - Test removing item to make row blank again

5. **Test different die sizes**
   - Create new table with d6 (should work with any list)
   - Create table with d100 (will require auto-fill)
   - Test custom die size (e.g., d37)
   - Verify edge case: die size larger than available items

6. **Save roll table**
   - Save the d20 table to profile
   - Navigate away and return
   - Verify table persists with all data

**Expected Results**:
- ✅ Roll tables generate correctly for all die sizes
- ✅ Auto-fill works for blank rows
- ✅ Manual row editing functions properly
- ✅ Edge cases (large die sizes) are handled gracefully
- ✅ Tables persist when saved to profile

## Scenario 6: Sharing & Collaboration

**Objective**: Verify roll table sharing functionality

### Steps:

1. **Generate share link**
   - Open saved roll table from Scenario 5
   - Click "Share Table" or similar action
   - Copy the generated share link
   - Verify link format is user-friendly

2. **Test shared access (different browser/incognito)**
   - Open share link in incognito/private window
   - Verify table loads without login requirement
   - Confirm all table data displays correctly
   - Verify table is read-only for anonymous users

3. **Test duplication feature**
   - While viewing shared table (logged out)
   - Create account or log in
   - Click "Duplicate to My Account" or similar
   - Verify table copies to user's profile
   - Confirm copied table can be edited

4. **Test share link persistence**
   - Original creator modifies the shared table
   - Reload share link in other browser
   - Verify changes are reflected in shared view
   - Test that deleted tables return 404 for share links

**Expected Results**:
- ✅ Share links generate correctly
- ✅ Shared tables load without authentication
- ✅ Anonymous users see read-only view
- ✅ Duplication feature works for authenticated users
- ✅ Share links stay current with table changes

## Scenario 7: Mobile Responsiveness

**Objective**: Verify mobile-first responsive design

### Steps:

1. **Test on mobile device or browser dev tools**
   - Resize browser to mobile width (375px)
   - Navigate through all major sections
   - Test all interactions with touch/tap

2. **Verify touch targets**
   - Confirm buttons are minimum 44px
   - Test dropdown menus work on touch
   - Verify form inputs are accessible
   - Check that hover states work appropriately

3. **Test key mobile interactions**
   - Search functionality on mobile keyboard
   - List scrolling and item selection
   - Roll table viewing and interaction
   - Navigation menu on mobile

4. **Verify responsive layout**
   - Tables should be scrollable or stack appropriately
   - Text should remain readable without horizontal scroll
   - Images and icons should scale appropriately
   - Navigation should adapt to mobile patterns

**Expected Results**:
- ✅ All functionality works on mobile devices
- ✅ Touch targets meet 44px minimum
- ✅ No horizontal scrolling required
- ✅ Text remains readable at mobile sizes
- ✅ Performance remains good on mobile

## Scenario 8: Performance & Accessibility

**Objective**: Verify performance targets and accessibility compliance

### Steps:

1. **Performance testing**
   - Run Lighthouse audit on main pages
   - Verify Performance score ≥ 90
   - Check Core Web Vitals are within thresholds
   - Test search response time (should be < 200ms)

2. **Accessibility testing**
   - Run Lighthouse accessibility audit
   - Verify Accessibility score ≥ 95
   - Test keyboard navigation throughout app
   - Verify screen reader compatibility

3. **SEO testing**
   - Run Lighthouse SEO audit
   - Verify SEO score ≥ 90
   - Check meta tags and structured data
   - Verify public pages are crawlable

**Expected Results**:
- ✅ Lighthouse Performance ≥ 90
- ✅ Lighthouse Accessibility ≥ 95
- ✅ Lighthouse SEO ≥ 90
- ✅ Keyboard navigation works throughout
- ✅ Screen readers can access all content

## Edge Cases & Error Handling

### Test Edge Cases:

1. **Network issues**
   - Test behavior with slow/unreliable connection
   - Verify appropriate loading states
   - Test offline functionality if applicable

2. **Data edge cases**
   - Empty lists creating roll tables
   - Very large lists (100+ items)
   - Special characters in names/descriptions
   - Long item descriptions

3. **User limits**
   - Reaching 100 list limit
   - Very large roll tables (d10,000)
   - Rapid successive actions

4. **Error scenarios**
   - Invalid share tokens
   - Deleted shared content
   - Session expiration
   - Server errors

**Expected Results**:
- ✅ Graceful handling of all edge cases
- ✅ Clear error messages for users
- ✅ No application crashes or broken states
- ✅ Appropriate loading and error states

## Success Criteria

The implementation is considered successful when:

- [ ] All scenarios complete without errors
- [ ] Performance targets are met (90/95/90 Lighthouse scores)
- [ ] Mobile responsiveness works across devices
- [ ] Authentication flow is smooth and secure
- [ ] All user stories from specification are validated
- [ ] Edge cases are handled gracefully
- [ ] Error messages are helpful and clear

## Post-Launch Validation

After deployment, repeat key scenarios with real users to ensure:
- Actual performance meets targets in production
- User experience is intuitive and enjoyable
- No unexpected issues arise with real usage patterns
- Accessibility works with actual assistive technologies