import { NextRequest, NextResponse } from 'next/server'
import { getCandidateById, saveCandidate, deleteCandidate } from '@/lib/db'
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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = verifyAuth(request)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const candidate = await getCandidateById(params.id)

    if (!candidate) {
      return NextResponse.json(
        { error: 'Candidate not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ candidate })
  } catch (error) {
    console.error('Get candidate error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = verifyAuth(request)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    const existing = await getCandidateById(params.id)

    if (!existing) {
      return NextResponse.json(
        { error: 'Candidate not found' },
        { status: 404 }
      )
    }

    // Handle skills array conversion
    const skills = Array.isArray(data.skills) 
      ? data.skills 
      : (data.skills ? data.skills.split(',').map((s: string) => s.trim()).filter((s: string) => s) : existing.skills)

    const updatedCandidate: Candidate = {
      ...existing,
      ...data,
      id: params.id,
      skills,
      documents: data.documents || existing.documents || [],
      documentDetails: data.documentDetails !== undefined ? data.documentDetails : existing.documentDetails,
      aadharCard: data.aadharCard !== undefined ? data.aadharCard : existing.aadharCard,
      panCard: data.panCard !== undefined ? data.panCard : existing.panCard,
      bankAccountNumber: data.bankAccountNumber !== undefined ? data.bankAccountNumber : existing.bankAccountNumber,
      ifscCode: data.ifscCode !== undefined ? data.ifscCode : existing.ifscCode,
      qualificationDetail: data.qualificationDetail !== undefined ? data.qualificationDetail : existing.qualificationDetail,
      expectedDateOfJoining: data.expectedDateOfJoining !== undefined ? data.expectedDateOfJoining : existing.expectedDateOfJoining,
      olReleasedDate: data.olReleasedDate !== undefined ? data.olReleasedDate : existing.olReleasedDate,
      // Enrollment fields
      esicStatus: data.esicStatus !== undefined ? data.esicStatus : existing.esicStatus,
      esicDate: data.esicDate !== undefined ? data.esicDate : existing.esicDate,
      pfStatus: data.pfStatus !== undefined ? data.pfStatus : existing.pfStatus,
      pfDate: data.pfDate !== undefined ? data.pfDate : existing.pfDate,
      tdsStatus: data.tdsStatus !== undefined ? data.tdsStatus : existing.tdsStatus,
      tdsDate: data.tdsDate !== undefined ? data.tdsDate : existing.tdsDate,
      medicalStatus: data.medicalStatus !== undefined ? data.medicalStatus : existing.medicalStatus,
      medicalDate: data.medicalDate !== undefined ? data.medicalDate : existing.medicalDate,
      updatedAt: new Date().toISOString(),
    }

    const saved = await saveCandidate(updatedCandidate)

    return NextResponse.json({ candidate: saved })
  } catch (error) {
    console.error('Update candidate error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = verifyAuth(request)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const deleted = await deleteCandidate(params.id)

    if (!deleted) {
      return NextResponse.json(
        { error: 'Candidate not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete candidate error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

