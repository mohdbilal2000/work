# Office Utilities Management - Implementation Plan

## Current State Analysis
- ✅ Backend API is fully functional (CRUD operations)
- ✅ Database schema is complete
- ❌ Frontend only displays data (read-only)
- ❌ "Add Utility Request" button has no functionality
- ❌ No edit/delete capabilities
- ❌ No vendor selection from existing vendors
- ❌ Limited status management

## Proposed Features

### 1. **Core CRUD Operations**
   - ✅ Add new utility request (with modal form)
   - ✅ Edit existing utility request
   - ✅ Delete utility request
   - ✅ View utility details

### 2. **Utility Request Form Fields**
   - **Utility Type** (dropdown/select):
     - Electricity
     - Water
     - Internet/Telecom
     - Cleaning Services
     - Security Services
     - Maintenance
     - Office Supplies
     - Other
   
   - **Vendor Selection** (dropdown from existing vendors)
   - **Description** (textarea)
   - **Amount** (number input)
   - **Request Date** (date picker)
   - **Due Date** (date picker)
   - **Status** (dropdown: pending, in-progress, completed, cancelled)

### 3. **Enhanced Display**
   - **Table View** with action buttons:
     - Edit button
     - Delete button
     - Mark as Paid button
     - View Details button
   
   - **Status Badges** (color-coded):
     - Pending (yellow)
     - In-Progress (blue)
     - Completed (green)
     - Cancelled (red)
     - Paid (dark green)

### 4. **Payment Tracking**
   - Mark utility as "Paid" with date
   - Display paid date in table
   - Filter by payment status
   - Payment summary/statistics

### 5. **Filtering & Search**
   - Filter by:
     - Status
     - Utility Type
     - Vendor
     - Payment Status (Paid/Unpaid)
   - Search by description
   - Sort by:
     - Date (newest/oldest)
     - Amount (high/low)
     - Status

### 6. **Dashboard/Summary Cards**
   - Total Utilities
   - Pending Requests
   - Total Amount (all utilities)
   - Unpaid Amount
   - Overdue Utilities (due date passed, not paid)

### 7. **Enhanced Features**
   - **Due Date Alerts**: Highlight utilities with approaching/passed due dates
   - **Vendor Integration**: Link to vendor details
   - **Bulk Actions**: Select multiple utilities for batch operations
   - **Export**: Export utilities data (if needed in future)

## UI/UX Improvements

### Layout Options:
1. **Option A: Table View** (Current - Enhanced)
   - Enhanced table with action buttons
   - Inline editing capabilities
   - Expandable rows for details

2. **Option B: Card/Tile View** (Similar to Vendor Management)
   - Utility cards showing key information
   - Quick actions on each card
   - Better visual hierarchy

3. **Option C: Hybrid View**
   - Summary cards at top
   - Toggle between table and card view
   - Filters sidebar

### Recommended: Option C (Hybrid View)
- Most flexible
- Better user experience
- Scalable for future features

## Implementation Steps

### Phase 1: Basic CRUD (Priority 1)
1. Create Add Utility modal/form
2. Implement form submission
3. Add Edit functionality
4. Add Delete functionality
5. Add vendor dropdown (fetch from vendors API)

### Phase 2: Enhanced Display (Priority 2)
1. Add action buttons to table
2. Improve status badges
3. Add payment tracking UI
4. Add due date display

### Phase 3: Filtering & Search (Priority 3)
1. Add filter dropdowns
2. Implement search functionality
3. Add sorting options

### Phase 4: Dashboard & Alerts (Priority 4)
1. Add summary cards
2. Implement due date alerts
3. Add payment statistics

## Technical Implementation Details

### Components Needed:
1. `AddUtilityModal.jsx` - Form for adding new utility
2. `EditUtilityModal.jsx` - Form for editing utility
3. `UtilityFilters.jsx` - Filter and search component
4. `UtilitySummaryCards.jsx` - Dashboard cards
5. Enhanced `OfficeUtilitiesPage.jsx` - Main page with all features

### State Management:
- `utilities` - List of all utilities
- `vendors` - List of vendors (for dropdown)
- `showAddModal` - Control add modal visibility
- `showEditModal` - Control edit modal visibility
- `editingUtility` - Currently editing utility
- `filters` - Current filter state
- `searchTerm` - Search input value

### API Integration:
- Use existing `utilitiesAPI` from `services/api.js`
- Fetch vendors using `vendorsAPI.getAll()` for dropdown

## Database Considerations
- Current schema is sufficient
- May need to add indexes for performance (if data grows)
- Consider adding `priority` field (low/medium/high) in future

## Success Metrics
- ✅ Users can add utility requests
- ✅ Users can edit utility details
- ✅ Users can delete utilities
- ✅ Users can track payments
- ✅ Users can filter and search utilities
- ✅ Clear visual indicators for status and due dates

