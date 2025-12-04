import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { getTickets, saveTicket } from '@/lib/db'
import { Ticket } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    // Check for both admin token and employee token
    let token = request.cookies.get('token')?.value
    if (!token) {
      token = request.cookies.get('employee_token')?.value
    }
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const tickets = await getTickets()
    return NextResponse.json({ tickets })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check for both admin token and employee token
    let token = request.cookies.get('token')?.value
    if (!token) {
      token = request.cookies.get('employee_token')?.value
    }
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, priority, category, assignedTo, relatedCandidateId } = body

    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 })
    }

    const newTicket: Ticket = {
      id: Date.now().toString(),
      title,
      description,
      status: 'open',
      priority: priority || 'medium',
      category: category || 'other',
      assignedTo: assignedTo || undefined,
      createdBy: payload.userId,
      createdByName: payload.username,
      relatedCandidateId: relatedCandidateId || undefined,
      attachments: [],
      comments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const savedTicket = await saveTicket(newTicket)
    return NextResponse.json({ ticket: savedTicket }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

