# Candidate Service Portal - Complete Process Workflow

## CSO Portal Process Flow

### Main Portal Sections

#### 1. Candidate Management (Part 1)
   - **Sub-Part 1: Initial Process**
   - **Sub-Part 2: Final Process**

#### 2. Reports & Analytics (Part 2)

---

## Sub-Part 1: Initial Process Workflow

### Stage 1: Total Turnups
- **Action:** Add new candidate
- **Fields Required:**
  - First Name, Last Name
  - Email, Phone
  - Position
  - Status: Selected (default)
  - Experience, Skills

### Stage 2: Selected
- **Status:** `pending`
- **Actions Available:**
  - Edit candidate details
  - Add document information
  - Upload documents

### Stage 3: Document Management
- **Document Information (Text Fields):**
  1. Aadhar Card Number (12 digits)
  2. PAN Card Number (10 characters, auto-uppercase)
  3. Bank Account Number
  4. IFSC Code (11 characters, auto-uppercase)
  5. Qualification Detail (textarea)

- **Document Uploads (Separate Sections):**
  1. **Aadhar Card Document**
     - Upload section with drag-and-drop
     - View uploaded files
     - Remove files before saving
   
  2. **PAN Card Document**
     - Upload section with drag-and-drop
     - View uploaded files
     - Remove files before saving
   
  3. **Bank Account Documents**
     - For cancelled cheque, bank statements
     - Upload section with drag-and-drop
     - View uploaded files
     - Remove files before saving
   
  4. **Qualification Documents**
     - For certificates, degrees
     - Upload section with drag-and-drop
     - View uploaded files
     - Remove files before saving
   
  5. **Other Documents**
     - For any additional documents
     - Upload section with drag-and-drop
     - View uploaded files
     - Remove files before saving

### Stage 4: Expected Date of Joining
- **Field:** Date picker
- **Location:** Above Document Details section
- **Purpose:** Track when candidate is expected to join

### Stage 5: Selected Pending
- **Status:** `interviewed`
- **Action:** Move candidate to pending review status

### Stage 6: OL Released Process

#### Prerequisites:
- ✅ Aadhar Card Document uploaded
- ✅ PAN Card Document uploaded
- ✅ Bank Account Documents uploaded
- ✅ Qualification Documents uploaded

#### OL Released Date:
- **Field Type:** Date picker (Required)
- **Options:**
  - Manual date selection
  - "Today" button for quick selection
- **Validation:** Required before OL Release button is enabled

#### OL Release Action:
- **Button:** "Mark as OL Released"
- **When Visible:** Only when all required documents are uploaded
- **What It Does:**
  1. Sets status to `accepted` (OL Released)
  2. Sets OL Released Date (uses selected date or today)
  3. Saves all candidate data
  4. Updates candidate record

#### After OL Release:
- Status changes to "OL Released"
- OL Released Date is displayed
- Candidate moves to final process stage

---

## Sub-Part 2: Final Process Workflow

### Stage 1: Join
- **Status:** `join`
- **Eligibility:** Candidates who have OL Released status
- **Action:** Update status to "Join"
- **Purpose:** Mark candidate as having joined the organization

### Stage 2: AL Released
- **Status:** `rejected` (maps to "AL Released" label)
- **Eligibility:** Candidates ready for appointment letter release
- **Action:** Update status to "AL Released"
- **Purpose:** Mark candidate as having AL released

### Stage 3: Zimyo Access

#### Eligibility Criteria:
- Candidates with status "Join" OR "AL Released"
- All documents must be complete
- OL Released date must be set

#### Zimyo Integration Features (Planned):
1. **Employee Onboarding:**
   - Automatic account creation in Zimyo
   - Employee profile setup
   - Department assignment

2. **Access Credentials:**
   - Generate login credentials
   - Send credentials to employee
   - Track access status

3. **Status Synchronization:**
   - Sync candidate status with Zimyo employee status
   - Update Zimyo when status changes
   - Handle access revocation if needed

4. **Data Management:**
   - Transfer candidate data to Zimyo
   - Maintain data consistency
   - Handle updates and changes

#### Current Implementation:
- Planning section showing:
  - Number of eligible candidates
  - Integration features to implement
  - Current status tracking

---

## Complete Status Flow Diagram

```
┌─────────────────┐
│ Total Turnups   │ (New Candidate Entry)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Selected      │ (Status: pending)
│  - Add Details  │
│  - Enter Docs   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│  Document Details & Upload       │
│  - Aadhar Card (Number + Upload)│
│  - PAN Card (Number + Upload)    │
│  - Bank Account (Number + Docs) │
│  - IFSC Code                     │
│  - Qualification (Detail + Docs)│
│  - Other Documents               │
└────────┬─────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  Expected Date of Joining        │
│  (Set Date)                      │
└────────┬─────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  Selected Pending                │ (Status: interviewed)
│  OR                              │
│  Rejected                        │ (Status: reviewing)
└────────┬─────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  All Documents Uploaded?         │
│  ✓ Aadhar                        │
│  ✓ PAN                           │
│  ✓ Bank                          │
│  ✓ Qualification                 │
└────────┬─────────────────────────┘
         │ YES
         ▼
┌─────────────────────────────────┐
│  OL Released Button Appears      │
│  - Set OL Released Date (Required)│
│  - Click "Mark as OL Released"   │
└────────┬─────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  OL Released                     │ (Status: accepted)
│  - OL Released Date Set          │
│  - Ready for Final Process       │
└────────┬─────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  Join                            │ (Status: join)
│  - Candidate Joined              │
└────────┬─────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  AL Released                     │ (Status: rejected)
│  - Appointment Letter Released   │
└────────┬─────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  Zimyo Access                    │
│  - Employee Onboarding           │
│  - Account Creation              │
│  - Access Credentials            │
└─────────────────────────────────┘
```

---

## Document Upload Process

### Step-by-Step:
1. **Enter Document Information:**
   - Fill in Aadhar Card Number
   - Fill in PAN Card Number
   - Fill in Bank Account Number
   - Fill in IFSC Code
   - Enter Qualification Detail

2. **Upload Documents:**
   - Click on each document section (Aadhar, PAN, Bank, Qualification)
   - Select file or drag and drop
   - File validation (PDF, DOC, DOCX, JPG, PNG, max 10MB)
   - File uploads to server
   - Document appears in list below upload area

3. **Verify Uploads:**
   - Check document status indicator
   - Green checkmark (✓) for uploaded
   - Gray X (✗) for missing

4. **Complete Process:**
   - All 4 required document types must have at least 1 file
   - OL Released button becomes available
   - Set OL Released Date
   - Click "Mark as OL Released"

---

## Status Labels Mapping

| Internal Status | Display Label |
|----------------|---------------|
| `pending` | Selected |
| `reviewing` | Rejected |
| `interviewed` | Selected Pending |
| `accepted` | OL Released |
| `join` | Join |
| `rejected` | AL Released |

---

## Key Features Summary

### Part 1: Initial Process
- ✅ Total Turnups tracking
- ✅ Selected status management
- ✅ Document details (Aadhar, PAN, Bank, IFSC, Qualification)
- ✅ Separate document upload sections
- ✅ Expected Date of Joining
- ✅ OL Released with date tracking
- ✅ Document validation before OL Release

### Part 2: Final Process
- ✅ Join status management
- ✅ AL Released status management
- ✅ Zimyo Access planning
- ✅ Integration roadmap

### Reports & Analytics
- ✅ Summary statistics
- ✅ Status distribution charts
- ✅ Upcoming joining dates
- ✅ Document status reports
- ✅ Recent activity tracking
- ✅ Processing time analytics

---

*This document serves as the complete reference for the CSO Portal process workflow.*

