import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const receivable = await prisma.receivable.findUnique({
      where: { id: params.id },
      include: {
        payments: {
          orderBy: { paymentDate: 'desc' }
        }
      }
    })
    if (!receivable) {
      return NextResponse.json(
        { error: 'Receivable not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(receivable)
  } catch (error: any) {
    console.error('Error fetching receivable:', error)
    // Try without payments if relation doesn't exist
    try {
      const receivable = await prisma.receivable.findUnique({
        where: { id: params.id },
      })
      if (!receivable) {
        return NextResponse.json(
          { error: 'Receivable not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(receivable)
    } catch (fallbackError: any) {
      return NextResponse.json(
        { error: 'Failed to fetch receivable', details: fallbackError.message },
        { status: 500 }
      )
    }
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    // Update receivable first
    const receivable = await prisma.receivable.update({
      where: { id: params.id },
      data: {
        invoiceNumber: body.invoiceNumber,
        customerName: body.customerName,
        amount: parseFloat(body.amount),
        dueDate: new Date(body.dueDate),
        status: body.status,
        paidAmount: parseFloat(body.paidAmount || 0),
      },
    })
    
    // If paymentAmount and paymentDate are provided, create a payment record
    if (body.paymentAmount && body.paymentDate && parseFloat(body.paymentAmount) > 0) {
      try {
        // Check if Payment model exists by trying to create
        await prisma.payment.create({
          data: {
            receivableId: params.id,
            amount: parseFloat(body.paymentAmount),
            paymentDate: new Date(body.paymentDate),
          },
        })
        console.log('Payment record created successfully')
      } catch (paymentError: any) {
        console.error('Error creating payment record:', paymentError)
        // If Payment model doesn't exist, log but don't fail the request
        if (paymentError.message?.includes('model') || paymentError.message?.includes('Payment')) {
          console.warn('Payment model may not be available in Prisma client. Please restart the dev server.')
        }
      }
    }
    
    // Always try to fetch with payments included
    try {
      const receivableWithPayments = await prisma.receivable.findUnique({
        where: { id: params.id },
        include: {
          payments: {
            orderBy: { paymentDate: 'desc' }
          }
        }
      })
      return NextResponse.json(receivableWithPayments || receivable)
    } catch (includeError: any) {
      // If include fails, return receivable without payments
      console.warn('Could not include payments:', includeError.message)
      return NextResponse.json(receivable)
    }
  } catch (error: any) {
    console.error('Error updating receivable:', error)
    return NextResponse.json(
      { error: 'Failed to update receivable', details: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.receivable.delete({
      where: { id: params.id },
    })
    return NextResponse.json({ message: 'Receivable deleted' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete receivable' },
      { status: 500 }
    )
  }
}

