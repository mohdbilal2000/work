import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
// @ts-ignore - xlsx types may not be available
import * as XLSX from 'xlsx'

export const config = {
  api: {
    bodyParser: false,
  },
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'array' })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const data = XLSX.utils.sheet_to_json(worksheet)

    const entries = []
    for (const row of data as any[]) {
      // Adjust these field mappings based on your Vyapar export format
      try {
        const entry = await prisma.dayBook.create({
          data: {
            date: new Date(row.Date || row.date || new Date()),
            type: (row.Type?.toLowerCase() || row.type?.toLowerCase() || 'income') as string,
            category: (row.Category || row.category || 'General') as string,
            description: (row.Description || row.description || row.Narration || row.narration || '') as string,
            amount: parseFloat(row.Amount || row.amount || '0'),
            source: 'vyapar',
            reference: (row.Reference || row.reference || row.Invoice || row.invoice || null) as string | null,
          },
        })
        entries.push(entry)
      } catch (err) {
        console.error('Error creating entry:', err, row)
        // Continue with next entry
      }
    }

    return NextResponse.json({
      message: 'File uploaded successfully',
      entries: entries.length,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to process file. Please check the file format.' },
      { status: 500 }
    )
  }
}

