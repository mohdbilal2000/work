'use client'

import { Candidate, CandidateDocument } from '@/lib/types'
import { Edit, Trash2, Mail, Phone, Briefcase, File } from 'lucide-react'
import { getStatusLabel } from '@/lib/status-labels'

interface CandidateCardProps {
  candidate: Candidate
  onEdit: (candidate: Candidate) => void
  onDelete: (id: string) => void
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  reviewing: 'bg-blue-100 text-blue-800',
  interviewed: 'bg-purple-100 text-purple-800',
  welcome: 'bg-cyan-100 text-cyan-800',
  joiningProbability: 'bg-teal-100 text-teal-800',
  followup1: 'bg-orange-100 text-orange-800',
  accepted: 'bg-green-100 text-green-800',
  join: 'bg-indigo-100 text-indigo-800',
  rejected: 'bg-red-100 text-red-800',
}

export default function CandidateCard({ candidate, onEdit, onDelete }: CandidateCardProps) {
  // Parse documents if it's a string
  let documents: CandidateDocument[] = []
  if (candidate.documents) {
    if (Array.isArray(candidate.documents)) {
      documents = candidate.documents
    } else if (typeof candidate.documents === 'string') {
      try {
        const parsed = JSON.parse(candidate.documents)
        documents = Array.isArray(parsed) ? parsed : []
      } catch {
        documents = []
      }
    }
  }

  // Group documents by type
  const aadharDocs = documents.filter(doc => doc.documentType === 'aadhar')
  const panDocs = documents.filter(doc => doc.documentType === 'pan')
  const bankDocs = documents.filter(doc => doc.documentType === 'bank')
  const qualificationDocs = documents.filter(doc => doc.documentType === 'qualification')
  const otherDocs = documents.filter(doc => !doc.documentType || doc.documentType === 'other')

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {candidate.firstName} {candidate.lastName}
          </h3>
          <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
            <Briefcase className="w-4 h-4" />
            {candidate.position}
          </p>
        </div>
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            statusColors[candidate.status]
          }`}
        >
          {getStatusLabel(candidate.status)}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Mail className="w-4 h-4" />
          <span className="truncate">{candidate.email}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Phone className="w-4 h-4" />
          <span>{candidate.phone}</span>
        </div>
        {candidate.experience > 0 && (
          <p className="text-sm text-gray-600">
            Experience: {candidate.experience} years
          </p>
        )}
        {candidate.skills && candidate.skills.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {candidate.skills.slice(0, 3).map((skill, idx) => (
              <span
                key={idx}
                className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
              >
                {skill}
              </span>
            ))}
            {candidate.skills.length > 3 && (
              <span className="px-2 py-1 text-xs text-gray-500">
                +{candidate.skills.length - 3} more
              </span>
            )}
          </div>
        )}
        {candidate.joiningProbabilityPercent !== undefined && (
          <div className="mt-2 p-2 bg-teal-50 rounded-lg border border-teal-200">
            <p className="text-xs font-semibold text-teal-900">
              Joining Probability: <strong>{candidate.joiningProbabilityPercent}%</strong>
            </p>
          </div>
        )}
        {candidate.expectedDateOfJoining && (
          <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs font-semibold text-blue-900">
              Expected Date of Joining: {new Date(candidate.expectedDateOfJoining).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        )}
        {candidate.olReleasedDate && (
          <div className="mt-2 p-2 bg-green-50 rounded-lg border border-green-200">
            <p className="text-xs font-semibold text-green-900">
              OL Released: {new Date(candidate.olReleasedDate).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        )}
        {(candidate.aadharCard || candidate.panCard || candidate.bankAccountNumber || candidate.ifscCode || candidate.qualificationDetail) && (
          <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs font-semibold text-gray-900 mb-2">Document Information:</p>
            <div className="space-y-1 text-xs text-gray-700">
              {candidate.aadharCard && (
                <div><strong>Aadhar:</strong> {candidate.aadharCard}</div>
              )}
              {candidate.panCard && (
                <div><strong>PAN:</strong> {candidate.panCard}</div>
              )}
              {candidate.bankAccountNumber && (
                <div><strong>Bank Account:</strong> {candidate.bankAccountNumber}</div>
              )}
              {candidate.ifscCode && (
                <div><strong>IFSC:</strong> {candidate.ifscCode}</div>
              )}
              {candidate.qualificationDetail && (
                <div><strong>Qualification:</strong> {candidate.qualificationDetail}</div>
              )}
            </div>
          </div>
        )}
        {candidate.documentDetails && (
          <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-700">
            <strong>Additional Notes:</strong> {candidate.documentDetails}
          </div>
        )}
        {/* Enrollment Status */}
        {(candidate.esicStatus || candidate.pfStatus || candidate.tdsStatus || candidate.medicalStatus) && (
          <div className="mt-2 p-2 bg-green-50 rounded-lg border border-green-200">
            <p className="text-xs font-semibold text-green-800 mb-1">Enrolling for:</p>
            <div className="flex flex-wrap gap-1">
              {candidate.esicStatus && (
                <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">ESIC</span>
              )}
              {candidate.pfStatus && (
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">PF</span>
              )}
              {candidate.tdsStatus && (
                <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">TDS</span>
              )}
              {candidate.medicalStatus && (
                <span className="px-2 py-0.5 bg-pink-100 text-pink-700 rounded-full text-xs font-medium">Medical</span>
              )}
            </div>
          </div>
        )}
        {documents.length > 0 && (
          <div className="mt-2 p-2 bg-gray-50 rounded border border-gray-200">
            <p className="text-xs font-semibold text-gray-900 mb-2">Uploaded Documents:</p>
            <div className="space-y-1 text-xs">
              {aadharDocs.length > 0 && (
                <div>
                  <strong className="text-gray-700">Aadhar:</strong> {aadharDocs.map(doc => (
                    <a key={doc.id} href={doc.url} target="_blank" rel="noopener noreferrer" className="ml-1 text-primary-600 hover:underline">
                      {doc.name}
                    </a>
                  ))}
                </div>
              )}
              {panDocs.length > 0 && (
                <div>
                  <strong className="text-gray-700">PAN:</strong> {panDocs.map(doc => (
                    <a key={doc.id} href={doc.url} target="_blank" rel="noopener noreferrer" className="ml-1 text-primary-600 hover:underline">
                      {doc.name}
                    </a>
                  ))}
                </div>
              )}
              {bankDocs.length > 0 && (
                <div>
                  <strong className="text-gray-700">Bank:</strong> {bankDocs.map(doc => (
                    <a key={doc.id} href={doc.url} target="_blank" rel="noopener noreferrer" className="ml-1 text-primary-600 hover:underline">
                      {doc.name}
                    </a>
                  ))}
                </div>
              )}
              {qualificationDocs.length > 0 && (
                <div>
                  <strong className="text-gray-700">Qualification:</strong> {qualificationDocs.map(doc => (
                    <a key={doc.id} href={doc.url} target="_blank" rel="noopener noreferrer" className="ml-1 text-primary-600 hover:underline">
                      {doc.name}
                    </a>
                  ))}
                </div>
              )}
              {otherDocs.length > 0 && (
                <div>
                  <strong className="text-gray-700">Other:</strong> {otherDocs.map(doc => (
                    <a key={doc.id} href={doc.url} target="_blank" rel="noopener noreferrer" className="ml-1 text-primary-600 hover:underline">
                      {doc.name}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-4 border-t">
        <button
          onClick={() => onEdit(candidate)}
          className="flex-1 px-3 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 flex items-center justify-center gap-2"
        >
          <Edit className="w-4 h-4" />
          Edit
        </button>
        <button
          onClick={() => onDelete(candidate.id)}
          className="px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 flex items-center justify-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

