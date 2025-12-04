import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const cashflows = await prisma.cashFlow.findMany({
      orderBy: { date: 'desc' },
    })
    return NextResponse.json(cashflows)
  } catch (error) {
    console.error('Error fetching cash flow:', error)
    return NextResponse.json([])
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Calculate balance based on previous entries
    const previousEntries = await prisma.cashFlow.findMany({
      orderBy: { date: 'desc' },
      take: 1,
    })
    
    const previousBalance = previousEntries.length > 0 
      ? previousEntries[0].balance 
      : 0
    
    const amount = parseFloat(body.amount)
    const newBalance = body.type === 'inflow' 
      ? previousBalance + amount 
      : previousBalance - amount

    const cashflow = await prisma.cashFlow.create({
      data: {
        date: new Date(body.date),
        type: body.type,
        category: body.category,
        description: body.description,
        amount: amount,
        balance: newBalance,
      },
    })
    return NextResponse.json(cashflow, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create cash flow entry' },
      { status: 500 }
    )
  }
}

