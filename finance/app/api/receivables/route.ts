import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Try to fetch with payments included
    const receivables = await prisma.receivable.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        payments: {
          orderBy: { paymentDate: 'desc' }
        }
      }
    })
    return NextResponse.json(receivables)
  } catch (error: any) {
    console.error('Error fetching receivables with payments:', error.message)
    // If payments relation doesn't exist yet, try without it
    try {
      const receivables = await prisma.receivable.findMany({
        orderBy: { createdAt: 'desc' },
      })
      // Try to manually fetch payments for each receivable using raw SQL
      const receivablesWithPayments = await Promise.all(
        receivables.map(async (receivable) => {
          try {
            // Try Prisma model first
            if ('payment' in prisma && typeof (prisma as any).payment !== 'undefined') {
              const payments = await (prisma as any).payment.findMany({
                where: { receivableId: receivable.id },
                orderBy: { paymentDate: 'desc' }
              }).catch(() => [])
              return { ...receivable, payments }
            } else {
              // Fallback to raw SQL
              const payments = await prisma.$queryRaw`
                SELECT * FROM Payment 
                WHERE receivableId = ${receivable.id}
                ORDER BY paymentDate DESC
              `.catch(() => [])
              return { ...receivable, payments: Array.isArray(payments) ? payments : [] }
            }
          } catch (err: any) {
            // Last resort - try raw SQL unsafe
            try {
              const payments = await prisma.$queryRawUnsafe(
                `SELECT * FROM Payment WHERE receivableId = '${receivable.id}' ORDER BY paymentDate DESC`
              ).catch(() => [])
              return { ...receivable, payments: Array.isArray(payments) ? payments : [] }
            } catch {
              return { ...receivable, payments: [] }
            }
          }
        })
      )
      return NextResponse.json(receivablesWithPayments)
    } catch (fallbackError: any) {
      console.error('Fallback error:', fallbackError.message)
      // Last resort - return receivables without payments
      try {
        const receivables = await prisma.receivable.findMany({
          orderBy: { createdAt: 'desc' },
        })
        return NextResponse.json(receivables.map(r => ({ ...r, payments: [] })))
      } catch {
        return NextResponse.json([], { status: 500 })
      }
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const receivable = await prisma.receivable.create({
      data: {
        invoiceNumber: body.invoiceNumber,
        customerName: body.customerName,
        amount: parseFloat(body.amount),
        dueDate: new Date(body.dueDate),
        status: body.status || 'pending',
        paidAmount: parseFloat(body.paidAmount || 0),
      },
    })
    return NextResponse.json(receivable, { status: 201 })
  } catch (error: any) {
    console.error('Error creating receivable:', error)
    return NextResponse.json(
      { error: 'Failed to create receivable', details: error.message },
      { status: 500 }
    )
  }
}

