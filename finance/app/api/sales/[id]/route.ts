import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sale = await prisma.dailySales.findUnique({
      where: { id: params.id },
    })
    if (!sale) {
      return NextResponse.json(
        { error: 'Sale not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(sale)
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch sale', details: error.message },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    const sale = await prisma.dailySales.update({
      where: { id: params.id },
      data: {
        invoiceNumber: body.invoiceNumber,
        customerName: body.customerName,
        amount: parseFloat(body.amount),
        date: new Date(body.date),
        paymentStatus: body.paymentStatus,
        daysOutstanding: body.paymentStatus === 'paid' ? 0 : body.daysOutstanding,
      },
    })
    return NextResponse.json(sale)
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to update sale', details: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.dailySales.delete({
      where: { id: params.id },
    })
    return NextResponse.json({ message: 'Sale deleted' })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to delete sale', details: error.message },
      { status: 500 }
    )
  }
}


