export interface Candidate {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  position: string
  status: 'pending' | 'reviewing' | 'interviewed' | 'welcome' | 'joiningProbability' | 'followup1' | 'accepted' | 'join' | 'rejected' | 'backout'
  experience: number
  skills: string[]
  resumeUrl?: string
  documents?: CandidateDocument[] | string // Array of documents or JSON string
  documentDetails?: string
  aadharCard?: string
  panCard?: string
  bankAccountNumber?: string
  ifscCode?: string
  qualificationDetail?: string
  joiningProbabilityPercent?: number
  expectedDateOfJoining?: string
  olReleasedDate?: string
  olLetterUrl?: string
  alLetterUrl?: string
  zimyoId?: string
  zimyoAccessGranted?: boolean
  zimyoAccessDate?: string
  // Compliance fields
  esicNumber?: string
  esicStatus?: boolean
  esicDate?: string
  pfNumber?: string
  pfStatus?: boolean
  pfDate?: string
  tdsNumber?: string
  tdsStatus?: boolean
  tdsDate?: string
  medicalStatus?: boolean
  medicalDate?: string
  medicalRemarks?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface CandidateDocument {
  id: string
  name: string
  type: string
  url: string
  documentType?: 'aadhar' | 'pan' | 'bank' | 'qualification' | 'olLetter' | 'deputationLetter' | 'alLetter' | 'welcomeEmail' | 'other'
  uploadedAt: string
}

export interface OfficeMember {
  id: string
  username: string
  email: string
  name: string
  role: 'admin' | 'recruiter' | 'manager'
  createdAt: string
}

export interface Employee {
  id: string
  officeId: string
  username: string
  email: string
  name: string
  department?: string
  position?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface Ticket {
  id: string
  title: string
  description: string
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: 'technical' | 'documentation' | 'process' | 'other'
  assignedTo?: string // Employee ID or Office Member ID
  createdBy: string // User ID who created the ticket
  createdByName?: string // Name of creator
  relatedCandidateId?: string // Optional link to a candidate
  attachments?: TicketAttachment[]
  comments?: TicketComment[]
  resolvedAt?: string
  closedAt?: string
  createdAt: string
  updatedAt: string
}

export interface TicketAttachment {
  id: string
  name: string
  type: string
  url: string
  uploadedAt: string
}

export interface TicketComment {
  id: string
  userId: string
  userName: string
  comment: string
  createdAt: string
}

