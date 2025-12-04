# Candidate Service Portal - Office Member Portal

A modern web application for office members to manage candidates in the candidate service department.

## Features

- 🔐 **Authentication System**: Secure login for office members
- 📊 **Dashboard**: Overview with statistics and candidate management
- 👥 **Candidate Management**: Full CRUD operations (Create, Read, Update, Delete)
- 🔍 **Search & Filter**: Search candidates by name, email, or position, and filter by status
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile devices
- 🎨 **Modern UI**: Clean and intuitive interface built with Tailwind CSS

## Tech Stack

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **JWT**: Token-based authentication
- **bcryptjs**: Password hashing
- **CSV Database**: Well-structured CSV file-based database with csv-parse and csv-stringify

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Default Login Credentials

- **Username**: `admin`
- **Password**: `admin123`

## Project Structure

```
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   └── candidates/   # Candidate CRUD endpoints
│   ├── dashboard/        # Dashboard page
│   ├── login/            # Login page
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page (redirects to login)
├── components/           # React components
│   ├── Dashboard.tsx     # Main dashboard component
│   ├── CandidateCard.tsx # Candidate card display
│   └── CandidateModal.tsx # Add/Edit candidate modal
├── lib/                  # Utility functions
│   ├── auth.ts          # Authentication utilities
│   ├── db.ts            # Database operations (CSV-based)
│   ├── csv-utils.ts     # CSV reading/writing utilities
│   ├── csv-export.ts    # CSV export/import functions
│   └── types.ts         # TypeScript types
└── data/                # CSV database files (created at runtime)
    ├── candidates.csv   # Candidates database
    └── members.csv      # Office members database
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with username and password
- `GET /api/auth/me` - Get current user info

### Candidates
- `GET /api/candidates` - Get all candidates (supports ?search= and ?status= query params)
- `POST /api/candidates` - Create a new candidate
- `GET /api/candidates/[id]` - Get a specific candidate
- `PUT /api/candidates/[id]` - Update a candidate
- `DELETE /api/candidates/[id]` - Delete a candidate

## Candidate Statuses

- **Pending**: Newly submitted candidates
- **Reviewing**: Candidates under review
- **Interviewed**: Candidates who have been interviewed
- **Accepted**: Candidates who have been accepted
- **Rejected**: Candidates who have been rejected

## Development

### Build for Production

```bash
npm run build
npm start
```

### Environment Variables

For production, set the following environment variable:
- `JWT_SECRET`: Secret key for JWT token signing (defaults to a development key)

## Database Structure

The application uses CSV files for data storage, located in the `data/` directory:

### Candidates CSV (`data/candidates.csv`)
Columns:
- `id` - Unique identifier
- `firstName` - Candidate's first name
- `lastName` - Candidate's last name
- `email` - Email address
- `phone` - Phone number
- `position` - Applied position
- `status` - Status (pending, reviewing, interviewed, accepted, rejected)
- `experience` - Years of experience
- `skills` - Semicolon-separated list of skills
- `resumeUrl` - URL to resume (optional)
- `notes` - Additional notes (optional)
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

### Members CSV (`data/members.csv`)
Columns:
- `id` - Unique identifier
- `username` - Login username
- `email` - Email address
- `name` - Full name
- `role` - Role (admin, recruiter, manager)
- `password` - Hashed password
- `createdAt` - Creation timestamp

### CSV Utilities

The application includes utilities for CSV operations:
- **Automatic parsing**: Skills arrays are stored as semicolon-separated strings
- **Type conversion**: Numbers and booleans are automatically parsed
- **Export/Import**: Functions available in `lib/csv-export.ts` for data migration

## CSO Portal Process Documentation

For detailed process workflows and documentation, see:

- **[CSO Portal Process Documentation](docs/CSO_PORTAL_PROCESS.md)** - Complete process documentation
- **[Process Workflow Guide](docs/PROCESS_WORKFLOW.md)** - Step-by-step workflow with diagrams

### Quick Process Overview

**Part 1: Candidate Management**
- **Sub-Part 1: Initial Process** (Turnup → OL Release)
  - Total Turnups → Selected → Document Details & Upload → Expected Date of Joining → OL Released
- **Sub-Part 2: Final Process** (Join → AL Release → Zimyo)
  - Join → AL Released → Zimyo Access

**Part 2: Reports & Analytics**
- Summary statistics, status distribution, upcoming joining dates, document status reports

### CSO Member Login

- **Pragya Tripathi**: Office ID `CSO001`, Password `pragya123`
- **Vanshika Rajput**: Office ID `CSO002`, Password `vanshika123`

## Future Enhancements

- Database migration to PostgreSQL/MongoDB
- File upload for resumes
- Email notifications
- Advanced reporting and analytics
- Role-based permissions
- Candidate interview scheduling
- CSV import/export UI
- Zimyo API integration for employee onboarding

## License

MIT

