import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { getTicketById, saveTicket, deleteTicket } from '@/lib/db'
import { Ticket } from '@/lib/types'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const ticket = await getTicketById(params.id)
    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    return NextResponse.json({ ticket })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const existingTicket = await getTicketById(params.id)
    if (!existingTicket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    const body = await request.json()
    const updatedTicket: Ticket = {
      ...existingTicket,
      ...body,
      id: params.id,
      updatedAt: new Date().toISOString(),
    }

    // Handle status changes
    if (body.status === 'resolved' && !updatedTicket.resolvedAt) {
      updatedTicket.resolvedAt = new Date().toISOString()
    }
    if (body.status === 'closed' && !updatedTicket.closedAt) {
      updatedTicket.closedAt = new Date().toISOString()
    }

    const savedTicket = await saveTicket(updatedTicket)
    return NextResponse.json({ ticket: savedTicket })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const deleted = await deleteTicket(params.id)
    if (!deleted) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

