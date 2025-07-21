# Rooms Detailed Dashboard

## Overview
The Rooms Detailed Dashboard provides a comprehensive table view of all rooms with individual tenant information, exactly matching your current data format. This dashboard combines room and tenant data to show complete information in a single, easy-to-manage interface.

## Key Features

### 📊 Dashboard Statistics
- **Total Rooms**: Complete count of all rooms in the property
- **Monthly Rent**: Total and average rental income
- **Security Deposit**: Total security deposits collected
- **Notice Period**: Count of tenants who have given notice to leave

### 📋 Detailed Rooms Table
The table displays exactly the columns you showed:
- **Room Number**: Sorted numerically (001, 101, 102, etc.)
- **Name**: Tenant name (shows "-" for vacant rooms)
- **Mobile**: Tenant mobile number with phone icon
- **Rent**: Monthly rent amount in ₹ format
- **Sharing Type**: Room type (single, double, triple, quad)
- **Deposit**: Security deposit amount
- **Status**: Tenant status with color-coded badges (active, paid, due, adjust, departing, etc.)
- **Notice Given**: Yes/No indicator
- **Notice Date**: Date when notice was given (with calendar icon)
- **Actions**: Edit button to modify room details

### 🔍 Advanced Filtering & Search
- **Search Bar**: Search by room number, tenant name, or mobile number
- **Room Status Filter**: Filter by occupied or vacant rooms
- **Notice Status Filter**: Filter by tenants who have/haven't given notice
- **Sortable Columns**: Click column headers to sort by:
  - Room Number (numeric sorting)
  - Tenant Name (alphabetical)
  - Rent Amount (numerical)
  - Status (alphabetical)

### 🎨 Visual Enhancements
- **Color-coded Status Badges**: 
  - Green: Active/Paid tenants
  - Red: Due payments
  - Yellow: Adjustments needed
  - Orange: Departing tenants
  - Purple: On hold
  - Gray: Vacant rooms
- **Icons**: Phone, calendar, and user icons for better visual context
- **Hover Effects**: Row highlighting on hover for better navigation

### 🏠 Room Management
- **Add New Rooms**: Create rooms with complete details
- **Edit Room Details**: Modify room information, rent, and type
- **Tenant Association**: Automatically links active tenants to rooms

## Data Integration

### Smart Data Combining
The dashboard intelligently combines:
- **Room Data**: From the rooms table (room type, floor, capacity)
- **Tenant Data**: From the tenants table (name, mobile, rent, deposit, status)
- **Notice Information**: Departure tracking data (notice given, notice date)

### Status Logic
- **Occupied**: Rooms with active tenants (active, paid, due, adjust, departing, hold status)
- **Vacant**: Rooms without active tenants or with left/terminated tenants
- **Notice Tracking**: Shows tenants in departure process

## Usage

### Navigation
Access through: Main Menu → "Rooms" tab

### Quick Actions
1. **Search**: Type in the search bar to find specific rooms or tenants
2. **Filter**: Use dropdown filters to narrow down the view
3. **Sort**: Click column headers to sort data
4. **Edit**: Click the "Edit" button to modify room details
5. **Add Room**: Use the "Add Room" button to create new rooms

### Data Updates
- **Real-time**: Data updates automatically when tenants or rooms change
- **Synchronized**: Changes reflect across all related dashboards
- **Persistent**: All changes are saved to the database immediately

## Technical Features

### Performance
- **Optimized Rendering**: Efficient data processing and display
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Fast Filtering**: Client-side filtering for instant results

### Data Accuracy
- **Consistent**: Single source of truth combining rooms and tenants
- **Up-to-date**: Real-time synchronization with database
- **Validated**: Proper handling of missing or incomplete data

## Benefits

1. **Complete Overview**: See all room and tenant information in one place
2. **Efficient Management**: Quick access to edit and update information
3. **Notice Tracking**: Monitor tenants planning to leave
4. **Financial Insights**: Track rent and deposit amounts
5. **Easy Navigation**: Find specific information quickly with search and filters

This dashboard provides exactly the table format you showed, with enhanced functionality for better property management.