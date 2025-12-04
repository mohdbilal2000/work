import { getCandidates } from './db'
import { writeCSV } from './csv-utils'
import path from 'path'
import fs from 'fs/promises'

/**
 * Export candidates to a CSV file
 * Useful for backups or data migration
 */
export async function exportCandidatesToCSV(outputPath?: string): Promise<string> {
  const candidates = await getCandidates()
  const exportPath = outputPath || path.join(process.cwd(), 'exports', `candidates_${Date.now()}.csv`)
  
  const dir = path.dirname(exportPath)
  await fs.mkdir(dir, { recursive: true })

  const headers = [
    'id',
    'firstName',
    'lastName',
    'email',
    'phone',
    'position',
    'status',
    'experience',
    'skills',
    'resumeUrl',
    'notes',
    'createdAt',
    'updatedAt',
  ]

  // Convert skills array to semicolon-separated string
  const csvData = candidates.map(candidate => ({
    ...candidate,
    skills: Array.isArray(candidate.skills) 
      ? candidate.skills.join(';')
      : candidate.skills || '',
  }))

  await writeCSV(exportPath, csvData, headers)
  
  return exportPath
}

/**
 * Import candidates from a CSV file
 */
export async function importCandidatesFromCSV(filePath: string): Promise<number> {
  const { readCSV } = await import('./csv-utils')
  const { saveCandidate } = await import('./db')
  
  const records = await readCSV<any>(filePath)
  let imported = 0

  for (const record of records) {
    try {
      // Parse skills from semicolon-separated string
      const skills = record.skills 
        ? (typeof record.skills === 'string'
            ? record.skills.split(';').filter((s: string) => s.trim())
            : record.skills)
        : []

      const candidate = {
        id: record.id || Date.now().toString() + Math.random().toString(36).substr(2, 9),
        firstName: record.firstName,
        lastName: record.lastName,
        email: record.email,
        phone: record.phone,
        position: record.position,
        status: record.status || 'pending',
        experience: Number(record.experience) || 0,
        skills,
        resumeUrl: record.resumeUrl || '',
        notes: record.notes || '',
        createdAt: record.createdAt || new Date().toISOString(),
        updatedAt: record.updatedAt || new Date().toISOString(),
      }

      await saveCandidate(candidate)
      imported++
    } catch (error) {
      console.error(`Error importing candidate ${record.id || 'unknown'}:`, error)
    }
  }

  return imported
}

