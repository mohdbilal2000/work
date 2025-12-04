import { NextRequest, NextResponse } from 'next/server'
import { comparePassword, generateToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { officeId, password } = await request.json()

    if (!officeId || !password) {
      return NextResponse.json(
        { error: 'Office ID and password are required' },
        { status: 400 }
      )
    }

    const { getEmployeeByOfficeId } = await import('@/lib/db')
    const employee = await getEmployeeByOfficeId(officeId)
    if (!employee) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    if (!employee.isActive) {
      return NextResponse.json(
        { error: 'Account is inactive' },
        { status: 403 }
      )
    }

    const isValidPassword = await comparePassword(password, employee.password)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const token = generateToken({
      userId: employee.id,
      username: employee.username,
      role: 'employee',
    })

    const { password: _, ...employeeWithoutPassword } = employee

    const response = NextResponse.json({
      token,
      employee: employeeWithoutPassword,
    })

    // Set HTTP-only cookie for better security
    response.cookies.set('employee_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Employee login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

