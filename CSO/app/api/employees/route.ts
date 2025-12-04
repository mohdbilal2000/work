import { NextRequest, NextResponse } from 'next/server'
import { getEmployees, saveEmployee } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import { Employee } from '@/lib/types'

function verifyAuth(request: NextRequest): { userId: string; role: string } | null {
  const token = request.cookies.get('token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '')
  
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

    const employees = await getEmployees()
    // Remove passwords from response
    const employeesWithoutPasswords = employees.map(({ password, ...emp }) => ({
      ...emp,
      isActive: emp.isActive === 'true' || emp.isActive === true,
    }))

    return NextResponse.json({ employees: employeesWithoutPasswords })
  } catch (error) {
    console.error('Get employees error:', error)
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
    const { hashPassword } = await import('@/lib/auth')

    const newEmployee: Employee & { password: string } = {
      id: Date.now().toString(),
      officeId: data.officeId || `EMP${Date.now()}`,
      username: data.username || data.officeId,
      email: data.email,
      name: data.name,
      department: data.department || '',
      position: data.position || '',
      password: await hashPassword(data.password || 'password123'),
      isActive: data.isActive !== undefined ? data.isActive : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const saved = await saveEmployee(newEmployee)
    const { password: _, ...employeeWithoutPassword } = newEmployee

    return NextResponse.json({ employee: saved }, { status: 201 })
  } catch (error) {
    console.error('Create employee error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

