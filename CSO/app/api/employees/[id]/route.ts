import { NextRequest, NextResponse } from 'next/server'
import { getEmployeeById, saveEmployee, deleteEmployee } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import { Employee } from '@/lib/types'

function verifyAuth(request: NextRequest): { userId: string; role: string } | null {
  const token = request.cookies.get('token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '')
  
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

    const employee = await getEmployeeById(params.id)

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ employee })
  } catch (error) {
    console.error('Get employee error:', error)
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
    const existing = await getEmployeeById(params.id)

    if (!existing) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      )
    }

    const { getEmployees } = await import('@/lib/db')
    const employees = await getEmployees()
    const empWithPassword = employees.find(e => e.id === params.id)

    const { hashPassword } = await import('@/lib/auth')
    const updatedEmployee: Employee & { password: string } = {
      ...existing,
      ...data,
      id: params.id,
      password: data.password ? await hashPassword(data.password) : empWithPassword!.password,
      updatedAt: new Date().toISOString(),
    }

    const saved = await saveEmployee(updatedEmployee)

    return NextResponse.json({ employee: saved })
  } catch (error) {
    console.error('Update employee error:', error)
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

    const deleted = await deleteEmployee(params.id)

    if (!deleted) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete employee error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

