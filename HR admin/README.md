# HR Admin Portal

A modern HR Admin Portal for managing ESIC/PF compliance, vendor management, and office utilities.

## Features

- **Dashboard**: Real-time statistics and overview of HR metrics
- **ESIC/PF Compliance**: Manage employee compliance records, contributions, and filings
- **Vendor Management**: Register and manage vendors, contracts, and performance
- **Office Utilities**: Track utility requests, payments, and maintenance schedules

## Tech Stack

### Frontend
- React 18
- Vite
- CSS3

### Backend
- Node.js with Express
- SQLite Database
- RESTful API

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the backend server (in one terminal):
```bash
npm run server
```

3. Start the frontend development server (in another terminal):
```bash
npm run dev
```

Or run both servers simultaneously:
```bash
npm run dev:all
```

4. Open your browser and navigate to `http://localhost:5173`

The backend API will be running on `http://localhost:3001`

## Project Structure

```
├── src/
│   ├── components/
│   │   ├── Sidebar.jsx              # Navigation sidebar
│   │   ├── MainContent.jsx          # Main content area
│   │   └── pages/
│   │       ├── DashboardPage.jsx
│   │       ├── ESICPFCompliancePage.jsx
│   │       ├── VendorManagementPage.jsx
│   │       └── OfficeUtilitiesPage.jsx
│   ├── services/
│   │   └── api.js                    # API service layer
│   ├── App.jsx                       # Main app component
│   └── main.jsx                      # Entry point
├── server/
│   ├── index.js                      # Express server
│   ├── database.js                   # Database setup and schema
│   └── routes/
│       ├── esicpf.js                 # ESIC/PF API routes
│       ├── vendors.js                # Vendor API routes
│       ├── utilities.js              # Utilities API routes
│       └── dashboard.js               # Dashboard API routes
└── hr_admin.db                       # SQLite database (created automatically)
```

## Database Schema

The application uses SQLite with the following tables:

- **esicpf_compliance**: Employee ESIC/PF compliance records
- **vendors**: Vendor information and contracts
- **office_utilities**: Utility requests and payments
- **dashboard_stats**: Dashboard statistics cache

## API Endpoints

### ESIC/PF Compliance
- `GET /api/esicpf` - Get all compliance records
- `GET /api/esicpf/:id` - Get single record
- `POST /api/esicpf` - Create new record
- `PUT /api/esicpf/:id` - Update record
- `DELETE /api/esicpf/:id` - Delete record

### Vendors
- `GET /api/vendors` - Get all vendors
- `GET /api/vendors/:id` - Get single vendor
- `POST /api/vendors` - Create new vendor
- `PUT /api/vendors/:id` - Update vendor
- `DELETE /api/vendors/:id` - Delete vendor

### Office Utilities
- `GET /api/utilities` - Get all utilities
- `GET /api/utilities/:id` - Get single utility
- `POST /api/utilities` - Create new utility request
- `PUT /api/utilities/:id` - Update utility
- `DELETE /api/utilities/:id` - Delete utility

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

## Build for Production

```bash
npm run build
```

The database file (`hr_admin.db`) will be created automatically in the `server/` directory on first run.

