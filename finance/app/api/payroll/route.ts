import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const payrolls = await prisma.payroll.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(payrolls)
  } catch (error) {
    console.error('Error fetching payrolls:', error)
    return NextResponse.json([])
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const payroll = await prisma.payroll.create({
      data: {
        employeeId: body.employeeId,
        employeeName: body.employeeName,
        month: parseInt(body.month),
        year: parseInt(body.year),
        basicSalary: parseFloat(body.basicSalary),
        allowances: parseFloat(body.allowances || 0),
        deductions: parseFloat(body.deductions || 0),
        netSalary: parseFloat(body.netSalary),
        status: body.status || 'pending',
        isDisclosed: body.isDisclosed === true,
      },
    })
    return NextResponse.json(payroll, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create payroll' },
      { status: 500 }
    )
  }
}

