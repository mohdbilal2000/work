import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { amount, paymentDate } = body

    if (!amount || !paymentDate) {
      return NextResponse.json(
        { error: 'Amount and payment date are required' },
        { status: 400 }
      )
    }

    // Get receivable first
    const receivable = await prisma.receivable.findUnique({
      where: { id: params.id },
    })

    if (!receivable) {
      return NextResponse.json(
        { error: 'Receivable not found' },
        { status: 404 }
      )
    }

    const paymentAmount = parseFloat(amount)
    const newPaidAmount = receivable.paidAmount + paymentAmount

    // Validate payment amount
    if (newPaidAmount > receivable.amount) {
      return NextResponse.json(
        { error: 'Payment amount exceeds total amount' },
        { status: 400 }
      )
    }

    // Try to create payment record using raw SQL (works even if Prisma client not regenerated)
    let paymentCreated = false
    try {
      // First try Prisma model if available
      if ('payment' in prisma && typeof (prisma as any).payment !== 'undefined') {
        const payment = await (prisma as any).payment.create({
          data: {
            receivableId: params.id,
            amount: paymentAmount,
            paymentDate: new Date(paymentDate),
          },
        })
        paymentCreated = true
        console.log('Payment record created successfully:', payment.id)
      } else {
        // Fallback to raw SQL
        const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const now = new Date().toISOString()
        const paymentDateStr = new Date(paymentDate).toISOString()
        
        await prisma.$executeRaw`
          INSERT INTO Payment (id, receivableId, amount, paymentDate, transactionId, createdAt, updatedAt)
          VALUES (${paymentId}, ${params.id}, ${paymentAmount}, ${paymentDateStr}, ${transactionId}, ${now}, ${now})
        `
        paymentCreated = true
        console.log('Payment record created via raw SQL:', paymentId)
      }
    } catch (paymentError: any) {
      // If raw SQL also fails, try alternative approach
      try {
        const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const now = new Date().toISOString()
        const paymentDateStr = new Date(paymentDate).toISOString()
        
        await prisma.$executeRawUnsafe(`
          INSERT INTO Payment (id, receivableId, amount, paymentDate, transactionId, createdAt, updatedAt)
          VALUES ('${paymentId}', '${params.id}', ${paymentAmount}, '${paymentDateStr}', '${transactionId}', '${now}', '${now}')
        `)
        paymentCreated = true
        console.log('Payment record created via raw SQL (unsafe):', paymentId)
      } catch (rawError: any) {
        console.error('Error creating payment record (both methods failed):', rawError.message)
        console.error('Payment model may not be available. Please restart your dev server.')
      }
    }

    // Determine status
    let newStatus = receivable.status
    if (newPaidAmount >= receivable.amount) {
      newStatus = 'paid'
    } else if (newPaidAmount > 0) {
      newStatus = 'partial'
    }

    // Check if overdue
    const dueDate = new Date(receivable.dueDate)
    const today = new Date()
    if (newStatus !== 'paid' && dueDate < today) {
      newStatus = 'overdue'
    }

    // Update receivable
    const updatedReceivable = await prisma.receivable.update({
      where: { id: params.id },
      data: {
        paidAmount: newPaidAmount,
        status: newStatus,
      },
    })

    // Try to include payments if available
    try {
      // Try Prisma include first
      const receivableWithPayments = await prisma.receivable.findUnique({
        where: { id: params.id },
        include: {
          payments: {
            orderBy: { paymentDate: 'desc' }
          }
        }
      })
      if (receivableWithPayments) {
        return NextResponse.json(receivableWithPayments, { status: 201 })
      }
    } catch (includeError: any) {
      // If include fails, try to fetch payments manually using raw SQL
      try {
        const payments = await prisma.$queryRaw`
          SELECT * FROM Payment 
          WHERE receivableId = ${params.id}
          ORDER BY paymentDate DESC
        `.catch(() => [])
        return NextResponse.json({ ...updatedReceivable, payments: Array.isArray(payments) ? payments : [] }, { status: 201 })
      } catch (rawError: any) {
        try {
          const payments = await prisma.$queryRawUnsafe(
            `SELECT * FROM Payment WHERE receivableId = '${params.id}' ORDER BY paymentDate DESC`
          ).catch(() => [])
          return NextResponse.json({ ...updatedReceivable, payments: Array.isArray(payments) ? payments : [] }, { status: 201 })
        } catch {
          console.warn('Could not fetch payments:', rawError.message)
        }
      }
    }

    return NextResponse.json(updatedReceivable, { status: 201 })
  } catch (error: any) {
    console.error('Error creating payment:', error)
    return NextResponse.json(
      { error: 'Failed to create payment', details: error.message },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Try Prisma model first
    if ('payment' in prisma && typeof (prisma as any).payment !== 'undefined') {
      const payments = await (prisma as any).payment.findMany({
        where: { receivableId: params.id },
        orderBy: { paymentDate: 'desc' }
      })
      return NextResponse.json(payments)
    }
    
    // Fallback to raw SQL
    try {
      const payments = await prisma.$queryRaw`
        SELECT * FROM Payment 
        WHERE receivableId = ${params.id}
        ORDER BY paymentDate DESC
      `
      return NextResponse.json(Array.isArray(payments) ? payments : [])
    } catch (rawError: any) {
      // Last resort - try unsafe raw SQL
      try {
        const payments = await prisma.$queryRawUnsafe(
          `SELECT * FROM Payment WHERE receivableId = '${params.id}' ORDER BY paymentDate DESC`
        )
        return NextResponse.json(Array.isArray(payments) ? payments : [])
      } catch {
        return NextResponse.json([])
      }
    }
  } catch (error: any) {
    console.error('Error fetching payments:', error)
    return NextResponse.json([])
  }
}

