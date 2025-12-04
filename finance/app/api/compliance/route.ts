import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const challans = await prisma.complianceChallan.findMany({
      orderBy: { dueDate: 'asc' },
    })
    return NextResponse.json(challans)
  } catch (error) {
    console.error('Error fetching compliance challans:', error)
    return NextResponse.json([])
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const challan = await prisma.complianceChallan.create({
      data: {
        type: body.type,
        challanNumber: body.challanNumber,
        amount: parseFloat(body.amount),
        dueDate: new Date(body.dueDate),
        paidDate: body.paidDate ? new Date(body.paidDate) : null,
        status: body.status || 'pending',
        accuracy: body.accuracy !== false,
        remarks: body.remarks,
      },
    })
    return NextResponse.json(challan, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create compliance challan' },
      { status: 500 }
    )
  }
}

