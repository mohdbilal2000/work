import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Return empty array if database connection fails
    const sales = await prisma.dailySales.findMany({
      orderBy: { date: 'desc' },
    })
    return NextResponse.json(sales)
  } catch (error) {
    console.error('Error fetching sales:', error)
    // Return empty array instead of error to prevent frontend issues
    return NextResponse.json([])
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const today = new Date()
    const saleDate = body.date ? new Date(body.date) : today
    const daysOutstanding = Math.floor(
      (today.getTime() - saleDate.getTime()) / (1000 * 60 * 60 * 24)
    )

    const sale = await prisma.dailySales.create({
      data: {
        date: saleDate,
        invoiceNumber: body.invoiceNumber,
        customerName: body.customerName,
        amount: parseFloat(body.amount),
        paymentStatus: body.paymentStatus || 'pending',
        daysOutstanding: daysOutstanding > 0 ? daysOutstanding : 0,
      },
    })
    return NextResponse.json(sale, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create sale' },
      { status: 500 }
    )
  }
}

