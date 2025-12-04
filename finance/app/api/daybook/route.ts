import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const entries = await prisma.dayBook.findMany({
      orderBy: { date: 'desc' },
    })
    return NextResponse.json(entries)
  } catch (error) {
    console.error('Error fetching day book entries:', error)
    return NextResponse.json([])
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const entry = await prisma.dayBook.create({
      data: {
        date: new Date(body.date),
        type: body.type,
        category: body.category,
        description: body.description,
        amount: parseFloat(body.amount),
        source: body.source || 'manual',
        reference: body.reference,
      },
    })
    return NextResponse.json(entry, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create day book entry' },
      { status: 500 }
    )
  }
}

