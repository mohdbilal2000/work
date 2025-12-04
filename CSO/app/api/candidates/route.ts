import { NextRequest, NextResponse } from 'next/server'
import { getCandidates, saveCandidate } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import { Candidate } from '@/lib/types'

function verifyAuth(request: NextRequest): { userId: string; role: string } | null {
  // Check for office member token first
  let token = request.cookies.get('token')?.value || 
              request.headers.get('authorization')?.replace('Bearer ', '')
  
  // If no office member token, check for employee token
  if (!token) {
    token = request.cookies.get('employee_token')?.value ||
            request.headers.get('authorization')?.replace('Bearer ', '')
  }
  
  if (!token) return null
  
  const payload = verifyToken(token)
  return payload
}

export async function GET(request: NextRequest) {
  try {
    const auth = verifyAuth(request)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const candidates = await getCandidates()
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search')
    const status = searchParams.get('status')

    let filtered = candidates

    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(
        c =>
          c.firstName.toLowerCase().includes(searchLower) ||
          c.lastName.toLowerCase().includes(searchLower) ||
          c.email.toLowerCase().includes(searchLower) ||
          c.position.toLowerCase().includes(searchLower)
      )
    }

    if (status) {
      filtered = filtered.filter(c => c.status === status)
    }

    return NextResponse.json({ candidates: filtered })
  } catch (error) {
    console.error('Get candidates error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = verifyAuth(request)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()

    const newCandidate: Candidate = {
      id: Date.now().toString(),
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      position: data.position,
      status: data.status || 'pending',
      experience: data.experience || 0,
      skills: Array.isArray(data.skills) ? data.skills : (data.skills ? data.skills.split(',').map((s: string) => s.trim()).filter((s: string) => s) : []),
      resumeUrl: data.resumeUrl,
      documents: data.documents || [],
      documentDetails: data.documentDetails || '',
      aadharCard: data.aadharCard || '',
      panCard: data.panCard || '',
      bankAccountNumber: data.bankAccountNumber || '',
      ifscCode: data.ifscCode || '',
      qualificationDetail: data.qualificationDetail || '',
      expectedDateOfJoining: data.expectedDateOfJoining || '',
      olReleasedDate: data.olReleasedDate || '',
      // Enrollment fields
      esicStatus: data.esicStatus || false,
      esicDate: data.esicDate || '',
      pfStatus: data.pfStatus || false,
      pfDate: data.pfDate || '',
      tdsStatus: data.tdsStatus || false,
      tdsDate: data.tdsDate || '',
      medicalStatus: data.medicalStatus || false,
      medicalDate: data.medicalDate || '',
      notes: data.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const savedCandidate = await saveCandidate(newCandidate)

    return NextResponse.json({ candidate: savedCandidate }, { status: 201 })
  } catch (error) {
    console.error('Create candidate error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

