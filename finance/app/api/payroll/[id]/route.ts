import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const payroll = await prisma.payroll.update({
      where: { id: params.id },
      data: body,
    })
    return NextResponse.json(payroll)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update payroll' },
      { status: 500 }
    )
  }
}

