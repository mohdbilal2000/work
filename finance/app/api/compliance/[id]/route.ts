import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const challan = await prisma.complianceChallan.update({
      where: { id: params.id },
      data: body,
    })
    return NextResponse.json(challan)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update compliance challan' },
      { status: 500 }
    )
  }
}

