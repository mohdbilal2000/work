# CSO Portal Process Documentation

## Overview
The CSO (Candidate Service Officer) Portal is divided into two main sections with sub-processes for managing candidates through their complete lifecycle.

---

## Main Portal Structure

### Part 1: Candidate Management
This section handles the initial candidate processing workflow.

### Part 2: Reports & Analytics
This section provides comprehensive reports and analytics on candidate data.

---

## Part 1: Candidate Management - Sub-Processes

### Sub-Part 1: Initial Process (Turnup → OL Release)

#### Process Flow:
1. **Total Turnups**
   - All candidates entered into the system
   - Initial entry point for new candidates

2. **Selected**
   - Candidates who have been selected for further processing
   - Status: `pending`

3. **Rejected**
   - Candidates who have been rejected during initial screening
   - Status: `reviewing`

4. **Selected Pending**
   - Candidates selected but pending further review/interview
   - Status: `interviewed`

5. **Document Details & Upload**
   - **Document Information Fields:**
     - Aadhar Card Number
     - PAN Card Number
     - Bank Account Number
     - IFSC Code
     - Qualification Detail
   - **Document Upload Sections:**
     - Aadhar Card Document (separate upload)
     - PAN Card Document (separate upload)
     - Bank Account Documents (Cancelled Cheque, Bank Statement, etc.)
     - Qualification Documents (Certificates, Degrees, etc.)
     - Other Documents

6. **Expected Date of Joining**
   - Field to set when candidate is expected to join
   - Displayed above Document Details section

7. **OL Released**
   - Status: `accepted`
   - **Requirements:**
     - All required documents must be uploaded:
       - Aadhar Card Document
       - PAN Card Document
     - Bank Account Documents
     - Qualification Documents
   - **OL Released Date:**
     - Automatically set when "Mark as OL Released" button is clicked
     - Can be manually set using date picker
     - Required field (marked with red asterisk)
     - "Today" button available for quick date selection

#### Key Features:
- Document validation: Button appears only when all required documents are uploaded
- Document status indicator showing which documents are uploaded/missing
- OL Released date tracking
- Search and filter functionality
- Add/Edit/Delete candidate operations

---

### Sub-Part 2: Final Process (Join → AL Release → Zimyo)

#### Process Flow:
1. **Join**
   - Status: `join`
   - Candidates who have joined the organization
   - Eligible for Zimyo access

2. **AL Released**
   - Status: `rejected`
   - Candidates with AL (Appointment Letter) released
   - Also eligible for Zimyo access

3. **Zimyo Access Management**
   - **Eligibility:**
     - Candidates with status "Join" or "AL Released"
   - **Integration Planning:**
     - Employee onboarding in Zimyo system
     - Automatic account creation
     - Access credentials management
     - Status synchronization

#### Key Features:
- Filtered view showing only Join and AL Released candidates
- Zimyo access planning section
- Statistics for final process stages

---

## Part 2: Reports & Analytics

### Features:
1. **Summary Cards:**
   - Total Candidates
   - OL Released (with percentage)
   - Pending Actions
   - Join Status

2. **Status Distribution Chart:**
   - Visual progress bars for each status
   - Percentage calculations
   - Color-coded by status type

3. **Upcoming Joining Dates:**
   - List of next 5 candidates with expected joining dates
   - Days remaining calculation
   - Sorted by date

4. **Document Status Report:**
   - With All Documents count
   - Missing Documents count
   - OL Released count
   - Ready for OL Release count

5. **Recent Activity Summary:**
   - Candidates Added Today
   - OL Released Today
   - Updated This Week
   - Average Processing Time (days from creation to OL release)

---

## Candidate Status Flow

```
Total Turnups
    ↓
Selected (pending)
    ↓
Selected Pending (interviewed) OR Rejected (reviewing)
    ↓
[Document Upload Required]
    ↓
OL Released (accepted) - OL Released Date Set
    ↓
Join (join)
    ↓
AL Released (rejected)
    ↓
Zimyo Access
```

---

## Document Requirements

### Required Documents for OL Release:
1. **Aadhar Card Document** - Upload required
2. **PAN Card Document** - Upload required
3. **Bank Account Documents** - Upload required
4. **Qualification Documents** - Upload required

### Document Information Fields:
- Aadhar Card Number (12 digits)
- PAN Card Number (10 characters)
- Bank Account Number
- IFSC Code (11 characters)
- Qualification Detail (text)

---

## Key Dates Tracked

1. **Expected Date of Joining**
   - Set during candidate creation/editing
   - Displayed in candidate cards
   - Used in reports for upcoming joining dates

2. **OL Released Date**
   - Required field
   - Automatically set to today when button is clicked
   - Can be manually set using date picker
   - Displayed in candidate cards and forms

3. **Created At**
   - Automatic timestamp when candidate is created

4. **Updated At**
   - Automatic timestamp when candidate is updated

---

## CSO Member Access

### Default CSO Members:
1. **Pragya Tripathi**
   - Office ID: `CSO001`
   - Password: `pragya123`

2. **Vanshika Rajput**
   - Office ID: `CSO002`
   - Password: `vanshika123`

### Login Process:
- Access via "CSO Member Login" on homepage
- Login using Office ID and Password
- HTTP-only cookie authentication (`employee_token`)
- Personalized portal with employee information

---

## Database Structure

### CSV Files:
- `candidates.csv` - All candidate data
- `members.csv` - Office member accounts
- `employees.csv` - CSO member accounts

### Candidate Fields:
- Basic Information: firstName, lastName, email, phone, position
- Status: pending, reviewing, interviewed, accepted, join, rejected
- Documents: documents (JSON array), documentDetails
- Document Info: aadharCard, panCard, bankAccountNumber, ifscCode, qualificationDetail
- Dates: expectedDateOfJoining, olReleasedDate, createdAt, updatedAt
- Other: experience, skills, notes

---

## API Endpoints

### Candidate Management:
- `GET /api/candidates` - List all candidates
- `POST /api/candidates` - Create new candidate
- `GET /api/candidates/[id]` - Get candidate by ID
- `PUT /api/candidates/[id]` - Update candidate
- `DELETE /api/candidates/[id]` - Delete candidate

### Authentication:
- `POST /api/employees/login` - CSO member login
- `POST /api/auth/login` - Office member login

### File Upload:
- `POST /api/upload` - Upload documents

---

## Process Workflow Summary

### Initial Process (Part 1):
1. Candidate enters system (Total Turnups)
2. Status: Selected
3. Document details entered (Aadhar, PAN, Bank, Qualification)
4. Documents uploaded (separate sections for each type)
5. Expected Date of Joining set
6. When all documents uploaded → OL Released button appears
7. OL Released Date set (required)
8. Status changes to OL Released

### Final Process (Part 2):
1. Status: Join
2. Status: AL Released
3. Zimyo Access integration (planned)

---

## Notes

- All document uploads are validated (PDF, DOC, DOCX, JPG, PNG, max 10MB)
- Documents are stored in `public/uploads/documents/`
- OL Released date is required before marking as OL Released
- Status changes are tracked with timestamps
- All operations require authentication (HTTP-only cookies)

---

## Future Enhancements (Zimyo Integration)

1. **API Integration:**
   - Connect to Zimyo API for employee onboarding
   - Automatic account creation
   - Credential management

2. **Synchronization:**
   - Status sync between systems
   - Data consistency checks

3. **Access Management:**
   - Track Zimyo access status
   - Manage credentials
   - Access revocation if needed

---

*Last Updated: [Current Date]*
*Version: 1.0*

