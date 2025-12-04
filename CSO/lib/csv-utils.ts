import { parse } from 'csv-parse/sync'
import { stringify } from 'csv-stringify/sync'
import fs from 'fs/promises'
import path from 'path'

/**
 * CSV Database Utility Functions
 * Handles reading and writing CSV files with proper structure
 */

export interface CSVOptions {
  headers: boolean
  skipEmptyLines: boolean
  trim: boolean
}

const defaultOptions: CSVOptions = {
  headers: true,
  skipEmptyLines: true,
  trim: true,
}

/**
 * Read CSV file and return parsed data as array of objects
 */
export async function readCSV<T extends Record<string, any>>(
  filePath: string,
  options: CSVOptions = defaultOptions
): Promise<T[]> {
  try {
    await fs.access(filePath)
    const content = await fs.readFile(filePath, 'utf-8')
    
    if (!content.trim()) {
      return []
    }

    const records = parse(content, {
      columns: options.headers,
      skip_empty_lines: options.skipEmptyLines,
      trim: options.trim,
      cast: (value, context) => {
        // Try to parse numbers and booleans
        if (context.column === 'experience' || context.column === 'id') {
          const num = Number(value)
          return isNaN(num) ? value : num
        }
        if (value === 'true') return true
        if (value === 'false') return false
        return value
      },
    }) as T[]

    return records
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return []
    }
    throw error
  }
}

/**
 * Write data array to CSV file
 */
export async function writeCSV<T extends Record<string, any>>(
  filePath: string,
  data: T[],
  headers?: string[]
): Promise<void> {
  const dir = path.dirname(filePath)
  await fs.mkdir(dir, { recursive: true })

  if (data.length === 0) {
    // Write headers only if provided
    if (headers && headers.length > 0) {
      const headerRow = headers.join(',') + '\n'
      await fs.writeFile(filePath, headerRow, 'utf-8')
    } else {
      await fs.writeFile(filePath, '', 'utf-8')
    }
    return
  }

  // Get headers from first object if not provided
  const csvHeaders = headers || Object.keys(data[0])

  const output = stringify(data, {
    header: true,
    columns: csvHeaders,
    cast: {
      boolean: (value) => value.toString(),
      number: (value) => value.toString(),
      date: (value) => value.toISOString(),
      object: (value) => {
        // Handle array fields (like skills)
        if (Array.isArray(value)) {
          return value.join(';')
        }
        return JSON.stringify(value)
      },
    },
  })

  await fs.writeFile(filePath, output, 'utf-8')
}

/**
 * Append a single record to CSV file
 */
export async function appendCSV<T extends Record<string, any>>(
  filePath: string,
  record: T,
  headers?: string[]
): Promise<void> {
  const dir = path.dirname(filePath)
  await fs.mkdir(dir, { recursive: true })

  try {
    await fs.access(filePath)
    // File exists, read existing data
    const existing = await readCSV<T>(filePath)
    existing.push(record)
    await writeCSV(filePath, existing, headers)
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      // File doesn't exist, create new with headers
      await writeCSV(filePath, [record], headers)
    } else {
      throw error
    }
  }
}

/**
 * Update a record in CSV file by ID field
 */
export async function updateCSVRecord<T extends Record<string, any>>(
  filePath: string,
  id: string,
  updates: Partial<T>,
  idField: string = 'id'
): Promise<T | null> {
  const records = await readCSV<T>(filePath)
  const index = records.findIndex((r: any) => String(r[idField]) === String(id))

  if (index === -1) {
    return null
  }

  records[index] = { ...records[index], ...updates }
  
  // Get headers from first record
  const headers = Object.keys(records[0])
  await writeCSV(filePath, records, headers)

  return records[index]
}

/**
 * Delete a record from CSV file by ID field
 */
export async function deleteCSVRecord<T extends Record<string, any>>(
  filePath: string,
  id: string,
  idField: string = 'id'
): Promise<boolean> {
  const records = await readCSV<T>(filePath)
  const initialLength = records.length
  const filtered = records.filter((r: any) => String(r[idField]) !== String(id))

  if (filtered.length === initialLength) {
    return false
  }

  if (filtered.length > 0) {
    const headers = Object.keys(filtered[0])
    await writeCSV(filePath, filtered, headers)
  } else {
    // If no records left, write empty file with headers
    const headers = records.length > 0 ? Object.keys(records[0]) : []
    await writeCSV(filePath, [], headers)
  }

  return true
}

/**
 * Find a record in CSV file by ID field
 */
export async function findCSVRecord<T extends Record<string, any>>(
  filePath: string,
  id: string,
  idField: string = 'id'
): Promise<T | null> {
  const records = await readCSV<T>(filePath)
  return records.find((r: any) => String(r[idField]) === String(id)) || null
}

