# CSV Database Schema Documentation

## Overview

The Candidate Service Portal uses CSV files as its database. This provides a simple, portable, and human-readable data storage solution that can be easily backed up, versioned, and migrated to other database systems.

## File Locations

All CSV database files are stored in the `data/` directory:
- `data/candidates.csv` - Stores all candidate records
- `data/members.csv` - Stores all office member accounts

## Candidates Schema

**File**: `data/candidates.csv`

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| id | string | Yes | Unique identifier for the candidate |
| firstName | string | Yes | Candidate's first name |
| lastName | string | Yes | Candidate's last name |
| email | string | Yes | Email address (must be unique) |
| phone | string | Yes | Phone number |
| position | string | Yes | Job position applied for |
| status | enum | Yes | One of: `pending`, `reviewing`, `interviewed`, `accepted`, `rejected` |
| experience | number | No | Years of professional experience (default: 0) |
| skills | string | No | Semicolon-separated list of skills (e.g., "JavaScript;React;Node.js") |
| resumeUrl | string | No | URL to candidate's resume |
| notes | string | No | Additional notes about the candidate |
| createdAt | ISO string | Yes | Timestamp when record was created |
| updatedAt | ISO string | Yes | Timestamp when record was last updated |

### Example CSV Row

```csv
id,firstName,lastName,email,phone,position,status,experience,skills,resumeUrl,notes,createdAt,updatedAt
1,John,Doe,john.doe@email.com,+1234567890,Software Engineer,pending,5,JavaScript;React;Node.js,,,2024-01-15T10:30:00.000Z,2024-01-15T10:30:00.000Z
```

## Members Schema

**File**: `data/members.csv`

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| id | string | Yes | Unique identifier for the member |
| username | string | Yes | Login username (must be unique) |
| email | string | Yes | Email address |
| name | string | Yes | Full name of the member |
| role | enum | Yes | One of: `admin`, `recruiter`, `manager` |
| password | string | Yes | Bcrypt hashed password |
| createdAt | ISO string | Yes | Timestamp when account was created |

### Example CSV Row

```csv
id,username,email,name,role,password,createdAt
1,admin,admin@candidateservice.com,Administrator,admin,$2a$10$hashedpassword...,2024-01-01T00:00:00.000Z
```

## Data Formatting Rules

### Skills Array
- Skills are stored as semicolon-separated strings in CSV
- Example: `"JavaScript;React;TypeScript"`
- Empty skills: `""`
- The application automatically converts between array and string formats

### Dates
- All timestamps use ISO 8601 format: `YYYY-MM-DDTHH:mm:ss.sssZ`
- Example: `2024-01-15T10:30:00.000Z`

### Numbers
- Experience is stored as a number (can be 0 or positive integer)
- Automatically parsed from CSV strings

### Status Values
- Candidates: `pending`, `reviewing`, `interviewed`, `accepted`, `rejected`
- Members: `admin`, `recruiter`, `manager`

## CSV Utilities

The application provides utility functions in `lib/csv-utils.ts`:

- `readCSV<T>()` - Read and parse CSV file into array of objects
- `writeCSV<T>()` - Write array of objects to CSV file
- `appendCSV<T>()` - Append a single record to CSV file
- `updateCSVRecord<T>()` - Update a record by ID
- `deleteCSVRecord<T>()` - Delete a record by ID
- `findCSVRecord<T>()` - Find a record by ID

## Export/Import

The application includes export/import utilities in `lib/csv-export.ts`:

- `exportCandidatesToCSV()` - Export all candidates to a CSV file
- `importCandidatesFromCSV()` - Import candidates from a CSV file

## Migration Notes

### From JSON to CSV
If you have existing JSON data, you can convert it using the import functions or by manually creating CSV files with the proper headers.

### To SQL Database
The CSV structure maps easily to SQL tables:
- Each CSV file becomes a table
- Each column becomes a table column
- The `id` field serves as the primary key

## Backup Recommendations

1. **Regular Backups**: Copy the `data/` directory regularly
2. **Version Control**: Consider committing CSV files to git (or exclude them if they contain sensitive data)
3. **Export**: Use the export function to create timestamped backups

## Security Considerations

- **Passwords**: Always stored as bcrypt hashes, never in plain text
- **File Permissions**: Ensure CSV files have appropriate read/write permissions
- **Data Validation**: All data is validated before being written to CSV files
- **CSV Injection**: The application sanitizes data to prevent CSV injection attacks

