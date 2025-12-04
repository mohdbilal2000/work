import { Candidate, OfficeMember, Employee, Ticket } from './types'
import fs from 'fs/promises'
import path from 'path'
import {
  readCSV,
  writeCSV,
  appendCSV,
  updateCSVRecord,
  deleteCSVRecord,
  findCSVRecord,
} from './csv-utils'

const DB_DIR = path.join(process.cwd(), 'data')
const CANDIDATES_FILE = path.join(DB_DIR, 'candidates.csv')
const MEMBERS_FILE = path.join(DB_DIR, 'members.csv')
const EMPLOYEES_FILE = path.join(DB_DIR, 'employees.csv')
const TICKETS_FILE = path.join(DB_DIR, 'tickets.csv')

// CSV Headers
const CANDIDATE_HEADERS = [
  'id',
  'firstName',
  'lastName',
  'email',
  'phone',
  'position',
  'status',
  'experience',
  'skills',
  'resumeUrl',
  'documents',
  'documentDetails',
  'aadharCard',
  'panCard',
  'bankAccountNumber',
  'ifscCode',
  'qualificationDetail',
  'joiningProbabilityPercent',
  'expectedDateOfJoining',
  'olReleasedDate',
  'zimyoId',
  'zimyoAccessGranted',
  'zimyoAccessDate',
  'esicNumber',
  'esicStatus',
  'esicDate',
  'pfNumber',
  'pfStatus',
  'pfDate',
  'tdsNumber',
  'tdsStatus',
  'tdsDate',
  'medicalStatus',
  'medicalDate',
  'medicalRemarks',
  'notes',
  'createdAt',
  'updatedAt',
]

const MEMBER_HEADERS = [
  'id',
  'username',
  'email',
  'name',
  'role',
  'password',
  'createdAt',
]

const EMPLOYEE_HEADERS = [
  'id',
  'officeId',
  'username',
  'email',
  'name',
  'department',
  'position',
  'password',
  'isActive',
  'createdAt',
  'updatedAt',
]

const TICKET_HEADERS = [
  'id',
  'title',
  'description',
  'status',
  'priority',
  'category',
  'assignedTo',
  'createdBy',
  'createdByName',
  'relatedCandidateId',
  'attachments',
  'comments',
  'resolvedAt',
  'closedAt',
  'createdAt',
  'updatedAt',
]

// Ensure data directory exists
async function ensureDbDir() {
  try {
    await fs.access(DB_DIR)
  } catch {
    await fs.mkdir(DB_DIR, { recursive: true })
  }
}

// Initialize default admin user in CSV format
async function initializeDefaultAdmin() {
  try {
    await fs.access(MEMBERS_FILE)
    // File exists, check if it has data
    const members = await readCSV<OfficeMember & { password: string }>(MEMBERS_FILE)
    if (members.length > 0) {
      return // Already initialized
    }
  } catch {
    // File doesn't exist, create with default admin
  }

  await ensureDbDir()
  const { hashPassword } = await import('./auth')
  const defaultAdmin = {
    id: '1',
    username: 'admin',
    email: 'admin@candidateservice.com',
    name: 'Administrator',
    role: 'admin' as const,
    password: await hashPassword('admin123'),
    createdAt: new Date().toISOString(),
  }

  await writeCSV(MEMBERS_FILE, [defaultAdmin], MEMBER_HEADERS)
}

// Initialize empty candidates CSV file with headers
async function initializeCandidates() {
  try {
    await fs.access(CANDIDATES_FILE)
  } catch {
    await ensureDbDir()
    // Create file with headers only
    await writeCSV(CANDIDATES_FILE, [], CANDIDATE_HEADERS)
  }
}

// Candidate Database Functions
export async function getCandidates(): Promise<Candidate[]> {
  await initializeCandidates()
  const records = await readCSV<any>(CANDIDATES_FILE)
  
  // Parse skills from semicolon-separated string and documents from JSON string
  return records.map((record: any) => {
    let documents = []
    try {
      if (record.documents && typeof record.documents === 'string' && record.documents.trim()) {
        documents = JSON.parse(record.documents)
      } else if (Array.isArray(record.documents)) {
        documents = record.documents
      }
    } catch {
      documents = []
    }

    return {
      ...record,
      skills: record.skills ? (typeof record.skills === 'string' 
        ? record.skills.split(';').filter((s: string) => s.trim())
        : record.skills)
        : [],
      documents: documents,
      experience: Number(record.experience) || 0,
    }
  }) as Candidate[]
}

export async function getCandidateById(id: string): Promise<Candidate | null> {
  await initializeCandidates()
  const record = await findCSVRecord<any>(CANDIDATES_FILE, id)
  
  if (!record) return null

  let documents = []
  try {
    if (record.documents && typeof record.documents === 'string' && record.documents.trim()) {
      documents = JSON.parse(record.documents)
    }
  } catch {
    documents = []
  }

  return {
    ...record,
    skills: record.skills ? (typeof record.skills === 'string'
      ? record.skills.split(';').filter((s: string) => s.trim())
      : record.skills)
      : [],
    documents: documents,
    experience: Number(record.experience) || 0,
  } as Candidate
}

export async function saveCandidate(candidate: Candidate): Promise<Candidate> {
  await initializeCandidates()
  
  // Convert skills array to semicolon-separated string and documents to JSON string for CSV
  const csvRecord = {
    ...candidate,
    skills: Array.isArray(candidate.skills) 
      ? candidate.skills.join(';')
      : candidate.skills || '',
    documents: candidate.documents && Array.isArray(candidate.documents)
      ? JSON.stringify(candidate.documents)
      : candidate.documents || '',
  }

  const existing = await getCandidateById(candidate.id)
  
  if (existing) {
    // Update existing
    const updated = await updateCSVRecord<any>(
      CANDIDATES_FILE,
      candidate.id,
      {
        ...csvRecord,
        updatedAt: new Date().toISOString(),
      }
    )
    return {
      ...updated!,
      skills: candidate.skills,
    } as Candidate
  } else {
    // Create new
    await appendCSV(CANDIDATES_FILE, csvRecord, CANDIDATE_HEADERS)
    return candidate
  }
}

export async function saveCandidates(candidates: Candidate[]): Promise<void> {
  await ensureDbDir()
  
  // Convert skills arrays to semicolon-separated strings
  const csvRecords = candidates.map(candidate => ({
    ...candidate,
    skills: Array.isArray(candidate.skills)
      ? candidate.skills.join(';')
      : candidate.skills || '',
  }))

  await writeCSV(CANDIDATES_FILE, csvRecords, CANDIDATE_HEADERS)
}

export async function deleteCandidate(id: string): Promise<boolean> {
  await initializeCandidates()
  return await deleteCSVRecord<any>(CANDIDATES_FILE, id)
}

// Member Database Functions
export async function getMembers(): Promise<(OfficeMember & { password: string })[]> {
  await initializeDefaultAdmin()
  return await readCSV<OfficeMember & { password: string }>(MEMBERS_FILE)
}

export async function getMemberByUsername(username: string): Promise<(OfficeMember & { password: string }) | null> {
  const members = await getMembers()
  return members.find(m => m.username === username) || null
}

export async function getMemberById(id: string): Promise<OfficeMember | null> {
  const members = await getMembers()
  const member = members.find(m => m.id === id)
  if (!member) return null
  const { password, ...memberWithoutPassword } = member
  return memberWithoutPassword
}

export async function saveMember(member: OfficeMember & { password: string }): Promise<void> {
  await ensureDbDir()
  const members = await getMembers()
  const index = members.findIndex(m => m.id === member.id)
  
  if (index >= 0) {
    members[index] = member
  } else {
    members.push(member)
  }
  
  await writeCSV(MEMBERS_FILE, members, MEMBER_HEADERS)
}

// Initialize empty employees CSV file with headers
async function initializeEmployees() {
  try {
    await fs.access(EMPLOYEES_FILE)
    // File exists, check if it has data
    const employees = await readCSV<any>(EMPLOYEES_FILE)
    if (employees.length > 0) {
      return // Already initialized
    }
  } catch {
    // File doesn't exist, create with default employees
  }

  await ensureDbDir()
  const { hashPassword } = await import('./auth')
  
  // Create default CSO member accounts
  const defaultEmployees = [
    {
      id: '1',
      officeId: 'CSO001',
      username: 'pragya.tripathi',
      email: 'pragya.tripathi@candidateservice.com',
      name: 'Pragya Tripathi',
      department: 'Candidate Service',
      position: 'CSO Member',
      password: await hashPassword('pragya123'),
      isActive: 'true',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      officeId: 'CSO002',
      username: 'vanshika.rajput',
      email: 'vanshika.rajput@candidateservice.com',
      name: 'Vanshika Rajput',
      department: 'Candidate Service',
      position: 'CSO Member',
      password: await hashPassword('vanshika123'),
      isActive: 'true',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]

  await writeCSV(EMPLOYEES_FILE, defaultEmployees, EMPLOYEE_HEADERS)
}

// Employee Database Functions
export async function getEmployees(): Promise<(Employee & { password: string })[]> {
  await initializeEmployees()
  const records = await readCSV<any>(EMPLOYEES_FILE)
  return records.map((record: any) => ({
    ...record,
    isActive: record.isActive === 'true' || record.isActive === true,
  })) as (Employee & { password: string })[]
}

export async function getEmployeeById(id: string): Promise<Employee | null> {
  const employees = await getEmployees()
  const employee = employees.find(e => e.id === id)
  if (!employee) return null
  const { password, ...employeeWithoutPassword } = employee
  return employeeWithoutPassword
}

export async function getEmployeeByUsername(username: string): Promise<(Employee & { password: string }) | null> {
  const employees = await getEmployees()
  return employees.find(e => e.username === username) || null
}

export async function getEmployeeByOfficeId(officeId: string): Promise<(Employee & { password: string }) | null> {
  const employees = await getEmployees()
  return employees.find(e => e.officeId === officeId) || null
}

export async function saveEmployee(employee: Employee & { password: string }): Promise<Employee> {
  await initializeEmployees()
  
  const csvRecord = {
    ...employee,
    isActive: employee.isActive ? 'true' : 'false',
  }

  const existing = await getEmployeeById(employee.id)
  
  if (existing) {
    const updated = await updateCSVRecord<any>(
      EMPLOYEES_FILE,
      employee.id,
      {
        ...csvRecord,
        updatedAt: new Date().toISOString(),
      }
    )
    const { password: _, ...employeeWithoutPassword } = updated!
    return {
      ...employeeWithoutPassword,
      isActive: updated!.isActive === 'true' || updated!.isActive === true,
    } as Employee
  } else {
    await appendCSV(EMPLOYEES_FILE, csvRecord, EMPLOYEE_HEADERS)
    const { password: _, ...employeeWithoutPassword } = employee
    return employeeWithoutPassword
  }
}

export async function deleteEmployee(id: string): Promise<boolean> {
  await initializeEmployees()
  return await deleteCSVRecord<any>(EMPLOYEES_FILE, id)
}

// Initialize empty tickets CSV file with headers
async function initializeTickets() {
  try {
    await fs.access(TICKETS_FILE)
  } catch {
    await ensureDbDir()
    await writeCSV(TICKETS_FILE, [], TICKET_HEADERS)
  }
}

// Ticket Database Functions
export async function getTickets(): Promise<Ticket[]> {
  await initializeTickets()
  const records = await readCSV<any>(TICKETS_FILE)
  
  return records.map((record: any) => {
    let attachments = []
    let comments = []
    try {
      if (record.attachments && typeof record.attachments === 'string' && record.attachments.trim()) {
        attachments = JSON.parse(record.attachments)
      } else if (Array.isArray(record.attachments)) {
        attachments = record.attachments
      }
    } catch {
      attachments = []
    }
    
    try {
      if (record.comments && typeof record.comments === 'string' && record.comments.trim()) {
        comments = JSON.parse(record.comments)
      } else if (Array.isArray(record.comments)) {
        comments = record.comments
      }
    } catch {
      comments = []
    }

    return {
      ...record,
      attachments: attachments,
      comments: comments,
    }
  }) as Ticket[]
}

export async function getTicketById(id: string): Promise<Ticket | null> {
  await initializeTickets()
  const record = await findCSVRecord<any>(TICKETS_FILE, id)
  
  if (!record) return null

  let attachments = []
  let comments = []
  try {
    if (record.attachments && typeof record.attachments === 'string' && record.attachments.trim()) {
      attachments = JSON.parse(record.attachments)
    }
  } catch {
    attachments = []
  }
  
  try {
    if (record.comments && typeof record.comments === 'string' && record.comments.trim()) {
      comments = JSON.parse(record.comments)
    }
  } catch {
    comments = []
  }

  return {
    ...record,
    attachments: attachments,
    comments: comments,
  } as Ticket
}

export async function saveTicket(ticket: Ticket): Promise<Ticket> {
  await initializeTickets()
  
  const csvRecord = {
    ...ticket,
    attachments: ticket.attachments && Array.isArray(ticket.attachments)
      ? JSON.stringify(ticket.attachments)
      : ticket.attachments || '',
    comments: ticket.comments && Array.isArray(ticket.comments)
      ? JSON.stringify(ticket.comments)
      : ticket.comments || '',
  }

  const existing = await getTicketById(ticket.id)
  
  if (existing) {
    const updated = await updateCSVRecord<any>(
      TICKETS_FILE,
      ticket.id,
      {
        ...csvRecord,
        updatedAt: new Date().toISOString(),
      }
    )
    return {
      ...updated!,
      attachments: ticket.attachments,
      comments: ticket.comments,
    } as Ticket
  } else {
    await appendCSV(TICKETS_FILE, csvRecord, TICKET_HEADERS)
    return ticket
  }
}

export async function deleteTicket(id: string): Promise<boolean> {
  await initializeTickets()
  return await deleteCSVRecord<any>(TICKETS_FILE, id)
}
