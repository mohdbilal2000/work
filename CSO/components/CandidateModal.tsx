'use client'

import { useState, useEffect } from 'react'
import { Candidate, CandidateDocument } from '@/lib/types'
import { X, Upload, File, Trash2, CheckCircle, Clock, UserCheck, Building2, Ticket } from 'lucide-react'
import { getStatusOptions } from '@/lib/status-labels'

const HR_API_BASE =
  process.env.NEXT_PUBLIC_HR_API_URL || 'http://localhost:3001/api'
const CSM_API_BASE =
  process.env.NEXT_PUBLIC_CSM_API_URL || 'http://localhost:5000/api'

interface CandidateModalProps {
  candidate: Candidate | null
  onClose: () => void
}

export default function CandidateModal({ candidate, onClose }: CandidateModalProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: '',
    status: 'pending' as Candidate['status'],
    experience: 0,
    skills: '',
    documentDetails: '',
    aadharCard: '',
    panCard: '',
    bankAccountNumber: '',
    ifscCode: '',
    qualificationDetail: '',
    joiningProbabilityPercent: undefined as number | undefined,
    expectedDateOfJoining: '',
    olReleasedDate: '',
    zimyoId: '',
    zimyoAccessGranted: false,
    zimyoAccessDate: '',
    // Compliance fields
    esicNumber: '',
    esicStatus: false,
    esicDate: '',
    pfNumber: '',
    pfStatus: false,
    pfDate: '',
    tdsNumber: '',
    tdsStatus: false,
    tdsDate: '',
    medicalStatus: false,
    medicalDate: '',
    medicalRemarks: '',
    notes: '',
  })
  const [aadharDocuments, setAadharDocuments] = useState<CandidateDocument[]>([])
  const [panDocuments, setPanDocuments] = useState<CandidateDocument[]>([])
  const [bankDocuments, setBankDocuments] = useState<CandidateDocument[]>([])
  const [qualificationDocuments, setQualificationDocuments] = useState<CandidateDocument[]>([])
  const [olLetterDocuments, setOlLetterDocuments] = useState<CandidateDocument[]>([])
  const [deputationLetterDocuments, setDeputationLetterDocuments] = useState<CandidateDocument[]>([])
  const [alLetterDocuments, setAlLetterDocuments] = useState<CandidateDocument[]>([])
  const [welcomeEmailDocuments, setWelcomeEmailDocuments] = useState<CandidateDocument[]>([])
  const [otherDocuments, setOtherDocuments] = useState<CandidateDocument[]>([])
  const [uploading, setUploading] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    // Get current user from localStorage (either member or employee)
    const storedMember = localStorage.getItem('member')
    const storedEmployee = localStorage.getItem('employee')
    if (storedMember) {
      setCurrentUser(JSON.parse(storedMember))
    } else if (storedEmployee) {
      setCurrentUser(JSON.parse(storedEmployee))
    }
  }, [])

  useEffect(() => {
    if (candidate) {
      setFormData({
        firstName: candidate.firstName,
        lastName: candidate.lastName,
        email: candidate.email,
        phone: candidate.phone,
        position: candidate.position,
        status: candidate.status,
        experience: candidate.experience,
        skills: candidate.skills?.join(', ') || '',
        documentDetails: candidate.documentDetails || '',
        aadharCard: candidate.aadharCard || '',
        panCard: candidate.panCard || '',
        bankAccountNumber: candidate.bankAccountNumber || '',
        ifscCode: candidate.ifscCode || '',
        qualificationDetail: candidate.qualificationDetail || '',
        joiningProbabilityPercent: candidate.joiningProbabilityPercent,
        expectedDateOfJoining: candidate.expectedDateOfJoining || '',
        olReleasedDate: candidate.olReleasedDate || '',
        zimyoId: candidate.zimyoId || '',
        zimyoAccessGranted: candidate.zimyoAccessGranted || false,
        zimyoAccessDate: candidate.zimyoAccessDate || '',
        // Compliance fields
        esicNumber: candidate.esicNumber || '',
        esicStatus: candidate.esicStatus || false,
        esicDate: candidate.esicDate || '',
        pfNumber: candidate.pfNumber || '',
        pfStatus: candidate.pfStatus || false,
        pfDate: candidate.pfDate || '',
        tdsNumber: candidate.tdsNumber || '',
        tdsStatus: candidate.tdsStatus || false,
        tdsDate: candidate.tdsDate || '',
        medicalStatus: candidate.medicalStatus || false,
        medicalDate: candidate.medicalDate || '',
        medicalRemarks: candidate.medicalRemarks || '',
        notes: candidate.notes || '',
      })
      
      // Parse documents from candidate and separate by type
      let allDocuments: CandidateDocument[] = []
      if (candidate.documents) {
        if (Array.isArray(candidate.documents)) {
          allDocuments = candidate.documents
        } else if (typeof candidate.documents === 'string') {
          try {
            const parsed = JSON.parse(candidate.documents)
            allDocuments = Array.isArray(parsed) ? parsed : []
          } catch {
            allDocuments = []
          }
        }
      }
      
      // Separate documents by type
      setAadharDocuments(allDocuments.filter(doc => doc.documentType === 'aadhar'))
      setPanDocuments(allDocuments.filter(doc => doc.documentType === 'pan'))
      setBankDocuments(allDocuments.filter(doc => doc.documentType === 'bank'))
      setQualificationDocuments(allDocuments.filter(doc => doc.documentType === 'qualification'))
      setOlLetterDocuments(allDocuments.filter(doc => doc.documentType === 'olLetter'))
      setDeputationLetterDocuments(allDocuments.filter(doc => doc.documentType === 'deputationLetter'))
      setAlLetterDocuments(allDocuments.filter(doc => doc.documentType === 'alLetter'))
      setWelcomeEmailDocuments(allDocuments.filter(doc => doc.documentType === 'welcomeEmail'))
      setOtherDocuments(allDocuments.filter(doc => !doc.documentType || doc.documentType === 'other'))
    } else {
      setAadharDocuments([])
      setPanDocuments([])
      setBankDocuments([])
      setQualificationDocuments([])
      setOlLetterDocuments([])
      setDeputationLetterDocuments([])
      setAlLetterDocuments([])
      setWelcomeEmailDocuments([])
      setOtherDocuments([])
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        position: '',
        status: 'pending' as Candidate['status'],
        experience: 0,
        skills: '',
        documentDetails: '',
        aadharCard: '',
        panCard: '',
        bankAccountNumber: '',
        ifscCode: '',
        qualificationDetail: '',
        joiningProbabilityPercent: undefined,
        expectedDateOfJoining: '',
        olReleasedDate: '',
        zimyoId: '',
        zimyoAccessGranted: false,
        zimyoAccessDate: '',
        // Compliance fields
        esicNumber: '',
        esicStatus: false,
        esicDate: '',
        pfNumber: '',
        pfStatus: false,
        pfDate: '',
        tdsNumber: '',
        tdsStatus: false,
        tdsDate: '',
        medicalStatus: false,
        medicalDate: '',
        medicalRemarks: '',
        notes: '',
      })
    }
  }, [candidate])

  useEffect(() => {
    // Get current user from localStorage (either member or employee)
    const storedMember = localStorage.getItem('member')
    const storedEmployee = localStorage.getItem('employee')
    if (storedMember) {
      setCurrentUser(JSON.parse(storedMember))
    } else if (storedEmployee) {
      setCurrentUser(JSON.parse(storedEmployee))
    }
  }, [])

  // Function to create a ticket automatically
  const createTicket = async (title: string, description: string, priority: 'low' | 'medium' | 'high' | 'urgent' = 'high') => {
    try {
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title,
          description,
          priority,
          category: 'process',
          relatedCandidateId: candidate?.id,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        return data.ticket
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || `Failed to create ticket: ${response.status}`)
      }
    } catch (error: any) {
      console.error('Error creating ticket:', error)
      throw error
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, documentType: 'aadhar' | 'pan' | 'bank' | 'qualification' | 'olLetter' | 'deputationLetter' | 'alLetter' | 'welcomeEmail' | 'other') => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(documentType)
    setError('')

    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        credentials: 'include',
        body: uploadFormData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to upload file')
      }

      const data = await response.json()
      const newDocument: CandidateDocument = {
        id: Date.now().toString(),
        name: data.name,
        type: data.type,
        url: data.url,
        documentType: documentType,
        uploadedAt: new Date().toISOString(),
      }

      // Add to appropriate document array
      switch (documentType) {
        case 'aadhar':
          setAadharDocuments([...aadharDocuments, newDocument])
          break
        case 'pan':
          setPanDocuments([...panDocuments, newDocument])
          break
        case 'bank':
          setBankDocuments([...bankDocuments, newDocument])
          break
        case 'qualification':
          setQualificationDocuments([...qualificationDocuments, newDocument])
          break
        case 'olLetter':
          setOlLetterDocuments([...olLetterDocuments, newDocument])
          break
        case 'deputationLetter':
          setDeputationLetterDocuments([...deputationLetterDocuments, newDocument])
          break
        case 'alLetter':
          setAlLetterDocuments([...alLetterDocuments, newDocument])
          break
        case 'welcomeEmail':
          setWelcomeEmailDocuments([...welcomeEmailDocuments, newDocument])
          break
        case 'other':
          setOtherDocuments([...otherDocuments, newDocument])
          break
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload file')
    } finally {
      setUploading(null)
      // Reset file input
      e.target.value = ''
    }
  }

  const handleRemoveDocument = (id: string, documentType: 'aadhar' | 'pan' | 'bank' | 'qualification' | 'olLetter' | 'deputationLetter' | 'alLetter' | 'welcomeEmail' | 'other') => {
    switch (documentType) {
      case 'aadhar':
        setAadharDocuments(aadharDocuments.filter(doc => doc.id !== id))
        break
      case 'pan':
        setPanDocuments(panDocuments.filter(doc => doc.id !== id))
        break
      case 'bank':
        setBankDocuments(bankDocuments.filter(doc => doc.id !== id))
        break
      case 'qualification':
        setQualificationDocuments(qualificationDocuments.filter(doc => doc.id !== id))
        break
      case 'olLetter':
        setOlLetterDocuments(olLetterDocuments.filter(doc => doc.id !== id))
        break
      case 'deputationLetter':
        setDeputationLetterDocuments(deputationLetterDocuments.filter(doc => doc.id !== id))
        break
      case 'alLetter':
        setAlLetterDocuments(alLetterDocuments.filter(doc => doc.id !== id))
        break
      case 'welcomeEmail':
        setWelcomeEmailDocuments(welcomeEmailDocuments.filter(doc => doc.id !== id))
        break
      case 'other':
        setOtherDocuments(otherDocuments.filter(doc => doc.id !== id))
        break
    }
  }

  // Check if all required documents are uploaded
  const areAllDocumentsUploaded = () => {
    return (
      aadharDocuments.length > 0 &&
      panDocuments.length > 0 &&
      bankDocuments.length > 0 &&
      qualificationDocuments.length > 0
    )
  }

  // Handle Mark as Join button click - Transfer to Part 2
  const handleMarkAsJoin = async () => {
    if (!candidate) return

    setLoading(true)
    setError('')

    try {
      // Combine all documents
      const allDocuments = [
        ...aadharDocuments,
        ...panDocuments,
        ...bankDocuments,
        ...qualificationDocuments,
        ...olLetterDocuments,
        ...deputationLetterDocuments,
        ...alLetterDocuments,
        ...welcomeEmailDocuments,
        ...otherDocuments,
      ]

      const payload = {
        ...formData,
        status: 'join' as Candidate['status'], // Change status to 'join' to transfer to Part 2
        skills: formData.skills.split(',').map(s => s.trim()).filter(s => s),
        experience: Number(formData.experience),
        documents: allDocuments,
      }

      const response = await fetch(`/api/candidates/${candidate.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update candidate status')
      }

      // Show success message
      alert(`Candidate has been marked as "Join" and transferred to Part 2 (Final Process section) with all data preserved.`)

      onClose()
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Handle Mark as AL Released button click
  const handleMarkAsALReleased = async () => {
    if (!candidate) return

    setLoading(true)
    setError('')

    try {
      // Combine all documents
      const allDocuments = [
        ...aadharDocuments,
        ...panDocuments,
        ...bankDocuments,
        ...qualificationDocuments,
        ...olLetterDocuments,
        ...deputationLetterDocuments,
        ...alLetterDocuments,
        ...welcomeEmailDocuments,
        ...otherDocuments,
      ]

      const payload = {
        ...formData,
        status: 'rejected' as Candidate['status'], // 'rejected' maps to 'AL Released' label
        skills: formData.skills.split(',').map(s => s.trim()).filter(s => s),
        experience: Number(formData.experience),
        documents: allDocuments,
      }

      const response = await fetch(`/api/candidates/${candidate.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update candidate status')
      }

      // Show success message
      alert(`Candidate has been marked as "AL Released". Appointment Letter has been released and candidate is ready for Zimyo access.`)

      onClose()
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Handle OL Released button click
  const handleOLReleased = async () => {
    if (!candidate) return

    // Ensure date is set (use today if not set)
    const releaseDate = formData.olReleasedDate || new Date().toISOString().split('T')[0]

    setLoading(true)
    setError('')

    try {
      // Combine all documents
      const allDocuments = [
        ...aadharDocuments,
        ...panDocuments,
        ...bankDocuments,
        ...qualificationDocuments,
        ...olLetterDocuments,
        ...deputationLetterDocuments,
        ...alLetterDocuments,
        ...welcomeEmailDocuments,
        ...otherDocuments,
      ]

      const payload = {
        ...formData,
        status: 'accepted' as Candidate['status'], // Set status to 'accepted' (OL Released)
        olReleasedDate: releaseDate, // Use provided date or today's date
        skills: formData.skills.split(',').map(s => s.trim()).filter(s => s),
        experience: Number(formData.experience),
        documents: allDocuments,
      }

      const response = await fetch(`/api/candidates/${candidate.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update candidate status')
      }

      // Show success message
      alert(`Candidate has been marked as OL Released. You can now use the "Mark as Join" button to transfer to Part 2.`)

      onClose()
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Combine all documents
      const allDocuments = [
        ...aadharDocuments,
        ...panDocuments,
        ...bankDocuments,
        ...qualificationDocuments,
        ...olLetterDocuments,
        ...deputationLetterDocuments,
        ...alLetterDocuments,
        ...welcomeEmailDocuments,
        ...otherDocuments,
      ]

      const payload = {
        ...formData,
        skills: formData.skills.split(',').map(s => s.trim()).filter(s => s),
        experience: Number(formData.experience),
        documents: allDocuments,
      }

      const url = candidate
        ? `/api/candidates/${candidate.id}`
        : '/api/candidates'
      const method = candidate ? 'PUT' : 'POST'

      // HTTP-only cookies are automatically sent with fetch requests
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save candidate')
      }

      // Auto-create ticket if status is set to "reviewing" (rejected) or if joining probability < 60%
      let ticketCreated = false
      if (formData.status === 'reviewing') {
        const ticketTitle = `Candidate Rejected/Backed Out - ${formData.firstName} ${formData.lastName}`
        const ticketDescription = `Candidate ${formData.firstName} ${formData.lastName} (ID: ${candidate?.id || 'NEW'}) has been rejected or has backed out. Status: Rejected. This requires attention and follow-up.\n\nCandidate Details:\n- Email: ${formData.email}\n- Phone: ${formData.phone}\n- Position: ${formData.position}`
        const ticket = await createTicket(ticketTitle, ticketDescription, 'high')
        if (ticket) ticketCreated = true
      } else if (formData.joiningProbabilityPercent !== undefined && formData.joiningProbabilityPercent < 60) {
        const ticketTitle = `Low Joining Probability Alert - ${formData.firstName} ${formData.lastName}`
        const ticketDescription = `Candidate ${formData.firstName} ${formData.lastName} (ID: ${candidate?.id || 'NEW'}) has a joining probability of ${formData.joiningProbabilityPercent}%, which is below the 60% threshold. This requires attention and follow-up.\n\nCandidate Details:\n- Email: ${formData.email}\n- Phone: ${formData.phone}\n- Position: ${formData.position}`
        const ticket = await createTicket(ticketTitle, ticketDescription, 'high')
        if (ticket) ticketCreated = true
      }

      if (ticketCreated) {
        alert('Candidate saved successfully! A ticket has been automatically created for this case.')
      }

      // Send enrollment data to HR Admin if any enrollment option is selected
      if (formData.esicStatus || formData.pfStatus || formData.tdsStatus || formData.medicalStatus) {
        try {
          const enrollmentData = {
            candidateId: candidate?.id || payload.id || Date.now().toString(),
            employeeName: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            phone: formData.phone,
            position: formData.position,
            esicStatus: formData.esicStatus,
            pfStatus: formData.pfStatus,
            tdsStatus: formData.tdsStatus,
            medicalStatus: formData.medicalStatus,
            panCard: formData.panCard,
            aadharCard: formData.aadharCard,
            bankAccountNumber: formData.bankAccountNumber
          }

          // Send to HR Admin (port 3001) for compliance records
          const hrResponse = await fetch(`${HR_API_BASE}/cso/enroll`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(enrollmentData),
          })

          if (hrResponse.ok) {
            const hrData = await hrResponse.json()
            console.log('HR Admin enrollment successful:', hrData)
            
            // Show what was enrolled
            const enrolled = []
            if (formData.esicStatus) enrolled.push('ESIC')
            if (formData.pfStatus) enrolled.push('PF')
            if (formData.tdsStatus) enrolled.push('TDS')
            if (formData.medicalStatus) enrolled.push('Medical Insurance')
            
            alert(`Candidate saved! HR Admin Compliance records created for: ${enrolled.join(', ')}`)
          } else {
            console.error('HR Admin enrollment failed:', await hrResponse.text())
          }
        } catch (hrError) {
          console.error('Error sending enrollment data:', hrError)
        }
      }

      onClose()
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">
            {candidate ? 'Edit Candidate' : 'Add New Candidate'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone *
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Position *
              </label>
              <input
                type="text"
                required
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as Candidate['status'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {getStatusOptions().map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Ticket Creation Option for Rejected/Backed Out Candidates */}
          {formData.status === 'reviewing' && (
            <div className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Ticket className="w-6 h-6 text-red-600" />
                  <div>
                    <p className="text-sm font-semibold text-red-900">Candidate Rejected/Backed Out</p>
                    <p className="text-xs text-red-700">
                      A ticket will be automatically created when you save. You can also create a ticket manually now.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    if (!candidate) {
                      alert('Please save the candidate first before creating a ticket.')
                      return
                    }
                    setLoading(true)
                    setError('')
                    try {
                      const ticketTitle = `Candidate Rejected/Backed Out - ${formData.firstName} ${formData.lastName}`
                      const ticketDescription = `Candidate ${formData.firstName} ${formData.lastName} (ID: ${candidate.id}) has been rejected or has backed out. Status: Rejected. This requires attention and follow-up.\n\nCandidate Details:\n- Email: ${formData.email}\n- Phone: ${formData.phone}\n- Position: ${formData.position}`
                      const ticket = await createTicket(ticketTitle, ticketDescription, 'high')
                      if (ticket) {
                        alert('Ticket created successfully!')
                      } else {
                        alert('Failed to create ticket. Please try again.')
                      }
                    } catch (err: any) {
                      setError(err.message || 'Failed to create ticket')
                    } finally {
                      setLoading(false)
                    }
                  }}
                  disabled={loading || !candidate}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-medium"
                >
                  <Ticket className="w-4 h-4" />
                  {loading ? 'Creating...' : 'Create Ticket Now'}
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Experience (years)
            </label>
            <input
              type="number"
              min="0"
              value={formData.experience}
              onChange={(e) => setFormData({ ...formData, experience: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Skills (comma-separated)
            </label>
            <input
              type="text"
              value={formData.skills}
              onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              placeholder="e.g., JavaScript, React, Node.js"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Expected Date of Joining Section */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Expected Date of Joining</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expected Date of Joining
              </label>
              <input
                type="date"
                value={formData.expectedDateOfJoining}
                onChange={(e) => setFormData({ ...formData, expectedDateOfJoining: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Select the expected date when the candidate will join</p>
            </div>
          </div>

          {/* Document Details Section */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Document Details</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Aadhar Card Number
                </label>
                <input
                  type="text"
                  value={formData.aadharCard}
                  onChange={(e) => setFormData({ ...formData, aadharCard: e.target.value })}
                  placeholder="Enter Aadhar Card Number"
                  maxLength={12}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  PAN Card Number
                </label>
                <input
                  type="text"
                  value={formData.panCard}
                  onChange={(e) => setFormData({ ...formData, panCard: e.target.value.toUpperCase() })}
                  placeholder="Enter PAN Card Number"
                  maxLength={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bank Account Number
                </label>
                <input
                  type="text"
                  value={formData.bankAccountNumber}
                  onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value })}
                  placeholder="Enter Bank Account Number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  IFSC Code
                </label>
                <input
                  type="text"
                  value={formData.ifscCode}
                  onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value.toUpperCase() })}
                  placeholder="Enter IFSC Code"
                  maxLength={11}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Qualification Detail
              </label>
              <textarea
                value={formData.qualificationDetail}
                onChange={(e) => setFormData({ ...formData, qualificationDetail: e.target.value })}
                rows={3}
                placeholder="Enter qualification details (e.g., B.Tech in Computer Science, MBA, etc.)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Document Details
              </label>
              <textarea
                value={formData.documentDetails}
                onChange={(e) => setFormData({ ...formData, documentDetails: e.target.value })}
                rows={3}
                placeholder="Enter any additional document details or notes..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Aadhar Card Upload Section */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Aadhar Card Document
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <input
                  type="file"
                  id="aadhar-upload"
                  onChange={(e) => handleFileUpload(e, 'aadhar')}
                  disabled={uploading === 'aadhar'}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  className="hidden"
                />
                <label
                  htmlFor="aadhar-upload"
                  className={`cursor-pointer flex flex-col items-center gap-2 ${
                    uploading === 'aadhar' ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <Upload className="w-6 h-6 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {uploading === 'aadhar' ? 'Uploading...' : 'Upload Aadhar Card'}
                  </span>
                  <span className="text-xs text-gray-500">PDF, DOC, DOCX, JPG, PNG (Max 10MB)</span>
                </label>
              </div>
              {aadharDocuments.length > 0 && (
                <div className="mt-3 space-y-2">
                  {aadharDocuments.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-2 bg-white rounded border">
                      <div className="flex items-center gap-2">
                        <File className="w-4 h-4 text-gray-400" />
                        <span className="text-xs text-gray-700 truncate max-w-[200px]">{doc.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 text-xs">View</a>
                        <button type="button" onClick={() => handleRemoveDocument(doc.id, 'aadhar')} className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* PAN Card Upload Section */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                PAN Card Document
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <input
                  type="file"
                  id="pan-upload"
                  onChange={(e) => handleFileUpload(e, 'pan')}
                  disabled={uploading === 'pan'}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  className="hidden"
                />
                <label
                  htmlFor="pan-upload"
                  className={`cursor-pointer flex flex-col items-center gap-2 ${
                    uploading === 'pan' ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <Upload className="w-6 h-6 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {uploading === 'pan' ? 'Uploading...' : 'Upload PAN Card'}
                  </span>
                  <span className="text-xs text-gray-500">PDF, DOC, DOCX, JPG, PNG (Max 10MB)</span>
                </label>
              </div>
              {panDocuments.length > 0 && (
                <div className="mt-3 space-y-2">
                  {panDocuments.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-2 bg-white rounded border">
                      <div className="flex items-center gap-2">
                        <File className="w-4 h-4 text-gray-400" />
                        <span className="text-xs text-gray-700 truncate max-w-[200px]">{doc.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 text-xs">View</a>
                        <button type="button" onClick={() => handleRemoveDocument(doc.id, 'pan')} className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bank Account Documents Upload Section */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Bank Account Documents (Cancelled Cheque, Bank Statement, etc.)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <input
                  type="file"
                  id="bank-upload"
                  onChange={(e) => handleFileUpload(e, 'bank')}
                  disabled={uploading === 'bank'}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  className="hidden"
                />
                <label
                  htmlFor="bank-upload"
                  className={`cursor-pointer flex flex-col items-center gap-2 ${
                    uploading === 'bank' ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <Upload className="w-6 h-6 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {uploading === 'bank' ? 'Uploading...' : 'Upload Bank Documents'}
                  </span>
                  <span className="text-xs text-gray-500">PDF, DOC, DOCX, JPG, PNG (Max 10MB)</span>
                </label>
              </div>
              {bankDocuments.length > 0 && (
                <div className="mt-3 space-y-2">
                  {bankDocuments.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-2 bg-white rounded border">
                      <div className="flex items-center gap-2">
                        <File className="w-4 h-4 text-gray-400" />
                        <span className="text-xs text-gray-700 truncate max-w-[200px]">{doc.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 text-xs">View</a>
                        <button type="button" onClick={() => handleRemoveDocument(doc.id, 'bank')} className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Qualification Documents Upload Section */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Qualification Documents (Certificates, Degrees, etc.)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <input
                  type="file"
                  id="qualification-upload"
                  onChange={(e) => handleFileUpload(e, 'qualification')}
                  disabled={uploading === 'qualification'}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  className="hidden"
                />
                <label
                  htmlFor="qualification-upload"
                  className={`cursor-pointer flex flex-col items-center gap-2 ${
                    uploading === 'qualification' ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <Upload className="w-6 h-6 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {uploading === 'qualification' ? 'Uploading...' : 'Upload Qualification Documents'}
                  </span>
                  <span className="text-xs text-gray-500">PDF, DOC, DOCX, JPG, PNG (Max 10MB)</span>
                </label>
              </div>
              {qualificationDocuments.length > 0 && (
                <div className="mt-3 space-y-2">
                  {qualificationDocuments.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-2 bg-white rounded border">
                      <div className="flex items-center gap-2">
                        <File className="w-4 h-4 text-gray-400" />
                        <span className="text-xs text-gray-700 truncate max-w-[200px]">{doc.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 text-xs">View</a>
                        <button type="button" onClick={() => handleRemoveDocument(doc.id, 'qualification')} className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Other Documents Upload Section */}
            <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Other Documents
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <input
                  type="file"
                  id="other-upload"
                  onChange={(e) => handleFileUpload(e, 'other')}
                  disabled={uploading === 'other'}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  className="hidden"
                />
                <label
                  htmlFor="other-upload"
                  className={`cursor-pointer flex flex-col items-center gap-2 ${
                    uploading === 'other' ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <Upload className="w-6 h-6 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {uploading === 'other' ? 'Uploading...' : 'Upload Other Documents'}
                  </span>
                  <span className="text-xs text-gray-500">PDF, DOC, DOCX, JPG, PNG (Max 10MB)</span>
                </label>
              </div>
              {otherDocuments.length > 0 && (
                <div className="mt-3 space-y-2">
                  {otherDocuments.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-2 bg-white rounded border">
                      <div className="flex items-center gap-2">
                        <File className="w-4 h-4 text-gray-400" />
                        <span className="text-xs text-gray-700 truncate max-w-[200px]">{doc.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 text-xs">View</a>
                        <button type="button" onClick={() => handleRemoveDocument(doc.id, 'other')} className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Part 1: Welcome and OL Released Section */}
          {candidate && (
            <div className="border-t pt-4 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Part 1: Initial Process (Welcome → OL Release)</h3>
              
              {/* Welcome Step - Show if status is before welcome (pending, reviewing, interviewed) */}
              {(formData.status === 'pending' || formData.status === 'reviewing' || formData.status === 'interviewed') && (
                <div className="mb-4 p-4 bg-cyan-50 border-2 border-cyan-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <UserCheck className="w-6 h-6 text-cyan-600" />
                      <div>
                        <p className="text-sm font-semibold text-cyan-900">Step 1: Welcome</p>
                        <p className="text-xs text-cyan-700">
                          Mark candidate as "Welcome" after document completion
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        setLoading(true)
                        setError('')
                        try {
                          const allDocuments = [
                            ...aadharDocuments,
                            ...panDocuments,
                            ...bankDocuments,
                            ...qualificationDocuments,
                            ...olLetterDocuments,
                            ...deputationLetterDocuments,
                            ...alLetterDocuments,
                            ...otherDocuments,
                          ]
                          const payload = {
                            ...formData,
                            status: 'welcome' as Candidate['status'],
                            skills: formData.skills.split(',').map(s => s.trim()).filter(s => s),
                            experience: Number(formData.experience),
                            documents: allDocuments,
                          }
                          const response = await fetch(`/api/candidates/${candidate.id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            credentials: 'include',
                            body: JSON.stringify(payload),
                          })
                          if (!response.ok) {
                            const data = await response.json()
                            throw new Error(data.error || 'Failed to update status')
                          }
                          setFormData({ ...formData, status: 'welcome' })
                          alert('Candidate marked as Welcome successfully!')
                        } catch (err: any) {
                          setError(err.message || 'An error occurred')
                        } finally {
                          setLoading(false)
                        }
                      }}
                      disabled={loading}
                      className="px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-md"
                    >
                      <UserCheck className="w-5 h-5" />
                      {loading ? 'Processing...' : 'Mark as Welcome'}
                    </button>
                  </div>
                </div>
              )}

              {/* Show Welcome Status */}
              {formData.status === 'welcome' && (
                <div className="mb-4 p-4 bg-cyan-50 border-2 border-cyan-200 rounded-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle className="w-6 h-6 text-cyan-600" />
                    <div>
                      <p className="text-sm font-semibold text-cyan-900">✓ Welcome Completed</p>
                      <p className="text-xs text-cyan-700">
                        Candidate has been welcomed. Upload welcome email and proceed to OL Release.
                      </p>
                    </div>
                  </div>
                  
                  {/* Welcome Email Upload Section */}
                  <div className="mt-4 p-4 bg-white rounded-lg border border-cyan-200">
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Upload Welcome Email
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      <input
                        type="file"
                        id="welcomeEmail-upload"
                        onChange={(e) => handleFileUpload(e, 'welcomeEmail')}
                        disabled={uploading === 'welcomeEmail'}
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.eml,.msg"
                        className="hidden"
                      />
                      <label
                        htmlFor="welcomeEmail-upload"
                        className={`cursor-pointer flex flex-col items-center gap-2 ${
                          uploading === 'welcomeEmail' ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        <Upload className="w-6 h-6 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {uploading === 'welcomeEmail' ? 'Uploading...' : 'Upload Welcome Email'}
                        </span>
                        <span className="text-xs text-gray-500">PDF, DOC, DOCX, JPG, PNG, EML, MSG (Max 10MB)</span>
                      </label>
                    </div>
                    {welcomeEmailDocuments.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {welcomeEmailDocuments.map((doc) => (
                          <div key={doc.id} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                            <div className="flex items-center gap-2">
                              <File className="w-4 h-4 text-gray-400" />
                              <span className="text-xs text-gray-700 truncate max-w-[200px]">{doc.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 text-xs">View</a>
                              <button type="button" onClick={() => handleRemoveDocument(doc.id, 'welcomeEmail')} className="text-red-600 hover:text-red-700">
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* OL Released Section - Show after Welcome */}
              {formData.status === 'welcome' && (
                <div className="mb-4 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      OL Released Date <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="date"
                        required
                        value={formData.olReleasedDate}
                        onChange={(e) => setFormData({ ...formData, olReleasedDate: e.target.value })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, olReleasedDate: new Date().toISOString().split('T')[0] })}
                        className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 border border-gray-300"
                      >
                        Today
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Set the OL Released date manually or click "Today" to set today's date</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                      <div>
                        <p className="text-sm font-semibold text-green-900">Step 2: Mark as OL Released</p>
                        <p className="text-xs text-green-700">
                          {formData.olReleasedDate 
                            ? `Click the button to mark as OL Released on ${new Date(formData.olReleasedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
                            : 'Set the OL Released date above and click the button to mark as OL Released'}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleOLReleased}
                      disabled={loading || !formData.olReleasedDate}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-md"
                    >
                      <CheckCircle className="w-5 h-5" />
                      {loading ? 'Processing...' : 'Mark as OL Released'}
                    </button>
                  </div>
                </div>
              )}

              {/* Show OL Released Status */}
              {(formData.status === 'accepted' || formData.status === 'join' || formData.status === 'rejected') && formData.olReleasedDate && (
                <div className="mb-4 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="text-sm font-semibold text-green-900">✓ OL Released</p>
                      <p className="text-xs text-green-700">
                        Date: {new Date(formData.olReleasedDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      {formData.status === 'accepted' && (
                        <p className="text-xs text-green-700 mt-1">
                          OL has been released. Candidate is ready for Part 2 (Final Process).
                        </p>
                      )}
                      {formData.status === 'join' && (
                        <p className="text-xs text-blue-700 mt-1">
                          ✓ Candidate has been transferred to Part 2 (Join section)
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Followup 1 Section - Show after OL Released (Part 1) */}
              {formData.status === 'accepted' && formData.olReleasedDate && (
                <div className="mb-4 p-4 bg-orange-50 border-2 border-orange-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <UserCheck className="w-6 h-6 text-orange-600" />
                      <div>
                        <p className="text-sm font-semibold text-orange-900">Step 3: Mark as Followup 1</p>
                        <p className="text-xs text-orange-700">
                          OL has been released. Proceed to Followup 1.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        setLoading(true)
                        setError('')
                        try {
                          const allDocuments = [
                            ...aadharDocuments,
                            ...panDocuments,
                            ...bankDocuments,
                            ...qualificationDocuments,
                            ...olLetterDocuments,
                            ...deputationLetterDocuments,
                            ...alLetterDocuments,
                            ...welcomeEmailDocuments,
                            ...otherDocuments,
                          ]
                          const payload = {
                            ...formData,
                            status: 'followup1' as Candidate['status'],
                            skills: formData.skills.split(',').map(s => s.trim()).filter(s => s),
                            experience: Number(formData.experience),
                            documents: allDocuments,
                          }
                          const response = await fetch(`/api/candidates/${candidate.id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            credentials: 'include',
                            body: JSON.stringify(payload),
                          })
                          if (!response.ok) {
                            const data = await response.json()
                            throw new Error(data.error || 'Failed to update status')
                          }
                          setFormData({ ...formData, status: 'followup1' })
                          alert('Candidate marked as Followup 1 successfully!')
                        } catch (err: any) {
                          setError(err.message || 'An error occurred')
                        } finally {
                          setLoading(false)
                        }
                      }}
                      disabled={loading}
                      className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-md"
                    >
                      <UserCheck className="w-5 h-5" />
                      {loading ? 'Processing...' : 'Mark as Followup 1'}
                    </button>
                  </div>
                </div>
              )}

              {/* Show Joining Probability Status - After Followup 1 */}
              {formData.status === 'joiningProbability' && (
                <div className="mb-4 p-4 bg-teal-50 border-2 border-teal-200 rounded-lg">
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-teal-900 mb-2">
                      Joining Probability (%)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.joiningProbabilityPercent || ''}
                        onChange={(e) => setFormData({ ...formData, joiningProbabilityPercent: e.target.value ? Number(e.target.value) : undefined })}
                        placeholder="Enter percentage (0-100)"
                        className="w-32 px-3 py-2 border border-teal-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                      <span className="text-sm font-medium text-teal-700">%</span>
                      <button
                        type="button"
                        onClick={async () => {
                          if (formData.joiningProbabilityPercent === undefined || formData.joiningProbabilityPercent < 0 || formData.joiningProbabilityPercent > 100) {
                            alert('Please enter a valid percentage between 0 and 100')
                            return
                          }
                          setLoading(true)
                          setError('')
                          try {
                            const allDocuments = [
                              ...aadharDocuments,
                              ...panDocuments,
                              ...bankDocuments,
                              ...qualificationDocuments,
                              ...olLetterDocuments,
                              ...deputationLetterDocuments,
                              ...alLetterDocuments,
                              ...welcomeEmailDocuments,
                              ...otherDocuments,
                            ]
                            const payload = {
                              ...formData,
                              joiningProbabilityPercent: Number(formData.joiningProbabilityPercent),
                              skills: formData.skills.split(',').map(s => s.trim()).filter(s => s),
                              experience: Number(formData.experience),
                              documents: allDocuments,
                            }
                            const response = await fetch(`/api/candidates/${candidate.id}`, {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              credentials: 'include',
                              body: JSON.stringify(payload),
                            })
                            if (!response.ok) {
                              const data = await response.json()
                              throw new Error(data.error || 'Failed to save joining probability')
                            }
                            
                            // Auto-create ticket if joining probability < 60%
                            if (formData.joiningProbabilityPercent < 60) {
                              const ticketTitle = `Low Joining Probability Alert - ${formData.firstName} ${formData.lastName}`
                              const ticketDescription = `Candidate ${formData.firstName} ${formData.lastName} (ID: ${candidate.id}) has a joining probability of ${formData.joiningProbabilityPercent}%, which is below the 60% threshold. This requires attention and follow-up.`
                              await createTicket(ticketTitle, ticketDescription, 'high')
                            }
                            
                            alert('Joining probability saved successfully!' + (formData.joiningProbabilityPercent < 60 ? ' A ticket has been automatically created for this low probability case.' : ''))
                          } catch (err: any) {
                            setError(err.message || 'An error occurred')
                          } finally {
                            setLoading(false)
                          }
                        }}
                        disabled={loading || formData.joiningProbabilityPercent === undefined}
                        className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                      >
                        {loading ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                    {formData.joiningProbabilityPercent !== undefined && (
                      <div className="mt-2">
                        <p className={`text-xs font-medium ${formData.joiningProbabilityPercent >= 60 ? 'text-teal-700' : 'text-red-700'}`}>
                          Current Joining Probability: <strong>{formData.joiningProbabilityPercent}%</strong>
                        </p>
                        {formData.joiningProbabilityPercent < 60 && (
                          <div className="mt-2">
                            <p className="text-xs text-red-600 mb-2 font-semibold">
                              ⚠️ Joining probability is below 60%. Candidate cannot proceed to the next step.
                            </p>
                            <button
                              type="button"
                              onClick={async () => {
                                if (!candidate) {
                                  alert('Please save the candidate first before creating a ticket.')
                                  return
                                }
                                setLoading(true)
                                setError('')
                                try {
                                  const ticketTitle = `Low Joining Probability Alert - ${formData.firstName} ${formData.lastName}`
                                  const ticketDescription = `Candidate ${formData.firstName} ${formData.lastName} (ID: ${candidate.id}) has a joining probability of ${formData.joiningProbabilityPercent}%, which is below the 60% threshold. This requires attention and follow-up.\n\nCandidate Details:\n- Email: ${formData.email}\n- Phone: ${formData.phone}\n- Position: ${formData.position}\n- Joining Probability: ${formData.joiningProbabilityPercent}%`
                                  await createTicket(ticketTitle, ticketDescription, 'high')
                                  alert('Ticket created successfully! A ticket has been raised for this low joining probability case.')
                                } catch (err: any) {
                                  const errorMessage = err.message || 'Failed to create ticket. Please try again.'
                                  setError(errorMessage)
                                  alert(errorMessage)
                                } finally {
                                  setLoading(false)
                                }
                              }}
                              disabled={loading || !candidate}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-medium"
                            >
                              <Ticket className="w-4 h-4" />
                              {loading ? 'Creating Ticket...' : 'Raise Ticket'}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-teal-200">
                    <div className="flex items-center gap-3">
                      {formData.joiningProbabilityPercent !== undefined && formData.joiningProbabilityPercent >= 60 ? (
                        <CheckCircle className="w-6 h-6 text-teal-600" />
                      ) : (
                        <Clock className="w-6 h-6 text-orange-600" />
                      )}
                      <div>
                        <p className="text-sm font-semibold text-teal-900">
                          {formData.joiningProbabilityPercent !== undefined 
                            ? formData.joiningProbabilityPercent >= 60
                              ? `✓ Joining Probability (${formData.joiningProbabilityPercent}%) Completed`
                              : `Joining Probability (${formData.joiningProbabilityPercent}%) - Below Threshold`
                            : 'Joining Probability Assessment'}
                        </p>
                        <p className={`text-xs ${formData.joiningProbabilityPercent !== undefined && formData.joiningProbabilityPercent >= 60 ? 'text-teal-700' : 'text-orange-700'}`}>
                          {formData.joiningProbabilityPercent !== undefined 
                            ? formData.joiningProbabilityPercent >= 60
                              ? `Joining probability assessed at ${formData.joiningProbabilityPercent}%. You can proceed to Join (transfer to Part 2).`
                              : `Joining probability is ${formData.joiningProbabilityPercent}%, which is below the required 60% threshold. Candidate cannot proceed further. Please reassess or keep the candidate at this stage.`
                            : 'Please enter joining probability percentage above (minimum 60% required to proceed).'}
                        </p>
                        {formData.joiningProbabilityPercent !== undefined && formData.joiningProbabilityPercent < 60 && (
                          <div className="mt-3">
                            <button
                              type="button"
                              onClick={async () => {
                                if (!candidate) {
                                  alert('Please save the candidate first before creating a ticket.')
                                  return
                                }
                                setLoading(true)
                                setError('')
                                try {
                                  const ticketTitle = `Low Joining Probability Alert - ${formData.firstName} ${formData.lastName}`
                                  const ticketDescription = `Candidate ${formData.firstName} ${formData.lastName} (ID: ${candidate.id}) has a joining probability of ${formData.joiningProbabilityPercent}%, which is below the 60% threshold. This requires attention and follow-up.\n\nCandidate Details:\n- Email: ${formData.email}\n- Phone: ${formData.phone}\n- Position: ${formData.position}\n- Joining Probability: ${formData.joiningProbabilityPercent}%`
                                  await createTicket(ticketTitle, ticketDescription, 'high')
                                  alert('Ticket created successfully! A ticket has been raised for this low joining probability case.')
                                } catch (err: any) {
                                  const errorMessage = err.message || 'Failed to create ticket. Please try again.'
                                  setError(errorMessage)
                                  alert(errorMessage)
                                } finally {
                                  setLoading(false)
                                }
                              }}
                              disabled={loading || !candidate}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-medium"
                            >
                              <Ticket className="w-4 h-4" />
                              {loading ? 'Creating Ticket...' : 'Raise Ticket'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleMarkAsJoin}
                      disabled={loading || formData.joiningProbabilityPercent === undefined || formData.joiningProbabilityPercent < 60}
                      className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-md"
                    >
                      <UserCheck className="w-5 h-5" />
                      {loading ? 'Processing...' : 'Mark as Join (Transfer to Part 2)'}
                    </button>
                  </div>
                </div>
              )}

              {/* Show Followup 1 Status */}
              {formData.status === 'followup1' && (
                <div className="mb-4 p-4 bg-orange-50 border-2 border-orange-200 rounded-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle className="w-6 h-6 text-orange-600" />
                    <div>
                      <p className="text-sm font-semibold text-orange-900">✓ Followup 1 Completed</p>
                      <p className="text-xs text-orange-700">
                        Followup 1 completed. Proceed to assess joining probability.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Joining Probability Section - Show after Followup 1 */}
              {formData.status === 'followup1' && (
                <div className="mb-4 p-4 bg-teal-50 border-2 border-teal-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <UserCheck className="w-6 h-6 text-teal-600" />
                      <div>
                        <p className="text-sm font-semibold text-teal-900">Step 4: Mark as Joining Probability</p>
                        <p className="text-xs text-teal-700">
                          Followup 1 completed. Proceed to assess joining probability.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        setLoading(true)
                        setError('')
                        try {
                          const allDocuments = [
                            ...aadharDocuments,
                            ...panDocuments,
                            ...bankDocuments,
                            ...qualificationDocuments,
                            ...olLetterDocuments,
                            ...deputationLetterDocuments,
                            ...alLetterDocuments,
                            ...welcomeEmailDocuments,
                            ...otherDocuments,
                          ]
                          const payload = {
                            ...formData,
                            status: 'joiningProbability' as Candidate['status'],
                            skills: formData.skills.split(',').map(s => s.trim()).filter(s => s),
                            experience: Number(formData.experience),
                            documents: allDocuments,
                          }
                          const response = await fetch(`/api/candidates/${candidate.id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            credentials: 'include',
                            body: JSON.stringify(payload),
                          })
                          if (!response.ok) {
                            const data = await response.json()
                            throw new Error(data.error || 'Failed to update status')
                          }
                          setFormData({ ...formData, status: 'joiningProbability' })
                          alert('Candidate marked as Joining Probability successfully!')
                        } catch (err: any) {
                          setError(err.message || 'An error occurred')
                        } finally {
                          setLoading(false)
                        }
                      }}
                      disabled={loading}
                      className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-md"
                    >
                      <UserCheck className="w-5 h-5" />
                      {loading ? 'Processing...' : 'Mark as Joining Probability'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* OL Letter Upload Section */}
          {candidate && (
            <div className="mt-6 border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">OL Letter Upload</h3>
              
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Upload OL Letter (Offer Letter)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <input
                    type="file"
                    id="olLetter-upload"
                    onChange={(e) => handleFileUpload(e, 'olLetter')}
                    disabled={uploading === 'olLetter'}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    className="hidden"
                  />
                  <label
                    htmlFor="olLetter-upload"
                    className={`cursor-pointer flex flex-col items-center gap-2 ${
                      uploading === 'olLetter' ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <Upload className="w-6 h-6 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {uploading === 'olLetter' ? 'Uploading...' : 'Upload OL Letter'}
                    </span>
                    <span className="text-xs text-gray-500">PDF, DOC, DOCX, JPG, PNG (Max 10MB)</span>
                  </label>
                </div>
                {olLetterDocuments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {olLetterDocuments.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-2 bg-white rounded border">
                        <div className="flex items-center gap-2">
                          <File className="w-4 h-4 text-gray-400" />
                          <span className="text-xs text-gray-700 truncate max-w-[200px]">{doc.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 text-xs">View</a>
                          <button type="button" onClick={() => handleRemoveDocument(doc.id, 'olLetter')} className="text-red-600 hover:text-red-700">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}


          {/* Document Status Indicator */}
          {candidate && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs font-medium text-blue-900 mb-2">Document Upload Status:</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className={`flex items-center gap-2 ${aadharDocuments.length > 0 ? 'text-green-700' : 'text-gray-500'}`}>
                  <CheckCircle className={`w-4 h-4 ${aadharDocuments.length > 0 ? 'text-green-600' : 'text-gray-400'}`} />
                  Aadhar Card {aadharDocuments.length > 0 ? '✓' : '✗'}
                </div>
                <div className={`flex items-center gap-2 ${panDocuments.length > 0 ? 'text-green-700' : 'text-gray-500'}`}>
                  <CheckCircle className={`w-4 h-4 ${panDocuments.length > 0 ? 'text-green-600' : 'text-gray-400'}`} />
                  PAN Card {panDocuments.length > 0 ? '✓' : '✗'}
                </div>
                <div className={`flex items-center gap-2 ${bankDocuments.length > 0 ? 'text-green-700' : 'text-gray-500'}`}>
                  <CheckCircle className={`w-4 h-4 ${bankDocuments.length > 0 ? 'text-green-600' : 'text-gray-400'}`} />
                  Bank Documents {bankDocuments.length > 0 ? '✓' : '✗'}
                </div>
                <div className={`flex items-center gap-2 ${qualificationDocuments.length > 0 ? 'text-green-700' : 'text-gray-500'}`}>
                  <CheckCircle className={`w-4 h-4 ${qualificationDocuments.length > 0 ? 'text-green-600' : 'text-gray-400'}`} />
                  Qualification {qualificationDocuments.length > 0 ? '✓' : '✗'}
                </div>
              </div>
            </div>
          )}


          {/* Deputation Letter Upload Section */}
          {candidate && formData.olReleasedDate && (
            <div className="mt-6 border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Deputation Letter Upload</h3>
              
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Upload Deputation Letter
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <input
                    type="file"
                    id="deputationLetter-upload"
                    onChange={(e) => handleFileUpload(e, 'deputationLetter')}
                    disabled={uploading === 'deputationLetter'}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    className="hidden"
                  />
                  <label
                    htmlFor="deputationLetter-upload"
                    className={`cursor-pointer flex flex-col items-center gap-2 ${
                      uploading === 'deputationLetter' ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <Upload className="w-6 h-6 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {uploading === 'deputationLetter' ? 'Uploading...' : 'Upload Deputation Letter'}
                    </span>
                    <span className="text-xs text-gray-500">PDF, DOC, DOCX, JPG, PNG (Max 10MB)</span>
                  </label>
                </div>
                {deputationLetterDocuments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {deputationLetterDocuments.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-2 bg-white rounded border">
                        <div className="flex items-center gap-2">
                          <File className="w-4 h-4 text-gray-400" />
                          <span className="text-xs text-gray-700 truncate max-w-[200px]">{doc.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 text-xs">View</a>
                          <button type="button" onClick={() => handleRemoveDocument(doc.id, 'deputationLetter')} className="text-red-600 hover:text-red-700">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* AL Letter Upload Section */}
          {candidate && formData.olReleasedDate && (
            <div className="mt-6 border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">AL Letter Upload</h3>
              
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Upload AL Letter (Appointment Letter)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <input
                    type="file"
                    id="alLetter-upload"
                    onChange={(e) => handleFileUpload(e, 'alLetter')}
                    disabled={uploading === 'alLetter'}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    className="hidden"
                  />
                  <label
                    htmlFor="alLetter-upload"
                    className={`cursor-pointer flex flex-col items-center gap-2 ${
                      uploading === 'alLetter' ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <Upload className="w-6 h-6 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {uploading === 'alLetter' ? 'Uploading...' : 'Upload AL Letter'}
                    </span>
                    <span className="text-xs text-gray-500">PDF, DOC, DOCX, JPG, PNG (Max 10MB)</span>
                  </label>
                </div>
                {alLetterDocuments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {alLetterDocuments.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-2 bg-white rounded border">
                        <div className="flex items-center gap-2">
                          <File className="w-4 h-4 text-gray-400" />
                          <span className="text-xs text-gray-700 truncate max-w-[200px]">{doc.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 text-xs">View</a>
                          <button type="button" onClick={() => handleRemoveDocument(doc.id, 'alLetter')} className="text-red-600 hover:text-red-700">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* AL Released Button Section */}
              {formData.status !== 'rejected' && (
                <div className="mb-4 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                      <div>
                        <p className="text-sm font-semibold text-green-900">Mark as AL Released</p>
                        <p className="text-xs text-green-700">
                          {alLetterDocuments.length > 0 
                            ? 'AL Letter uploaded. Click the button to mark as AL Released.'
                            : 'Upload AL Letter above and click the button to mark as AL Released (upload is optional)'}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleMarkAsALReleased}
                      disabled={loading}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-md"
                    >
                      <CheckCircle className="w-5 h-5" />
                      {loading ? 'Processing...' : 'Mark as AL Released'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Part 2: Final Process Section (Join → AL Release → Zimyo) */}
          {candidate && (formData.status === 'join' || formData.status === 'rejected') && (
            <div className="border-t pt-4 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Part 2: Final Process (Join → AL Release → Zimyo)</h3>
              
              {/* Show Join Status if already joined */}
              {formData.status === 'join' && (
                <div className="mb-4 p-4 bg-indigo-50 border-2 border-indigo-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-6 h-6 text-indigo-600" />
                      <div>
                        <p className="text-sm font-semibold text-indigo-900">✓ Candidate Joined</p>
                        <p className="text-xs text-indigo-700">
                          Candidate has been transferred to Part 2. Proceed to AL Release.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleMarkAsALReleased}
                      disabled={loading}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-md"
                    >
                      <CheckCircle className="w-5 h-5" />
                      {loading ? 'Processing...' : 'Mark as AL Released'}
                    </button>
                  </div>
                </div>
              )}

              {/* Show AL Released Status if already AL Released */}
              {formData.status === 'rejected' && (
                <div className="mb-4 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                  <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <p className="text-sm font-semibold text-green-900">✓ AL Released</p>
                  <p className="text-xs text-green-700">
                    Appointment Letter has been released. Candidate is ready for Zimyo access.
                  </p>
                </div>
              </div>
              
              {/* Zimyo ID Section */}
              <div className="mt-4 pt-4 border-t border-green-200">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Zimyo ID
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.zimyoId}
                    onChange={(e) => setFormData({ ...formData, zimyoId: e.target.value })}
                    placeholder="Enter Zimyo ID"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      setLoading(true)
                      setError('')
                      try {
                        const allDocuments = [
                          ...aadharDocuments,
                          ...panDocuments,
                          ...bankDocuments,
                          ...qualificationDocuments,
                          ...olLetterDocuments,
                          ...deputationLetterDocuments,
                          ...alLetterDocuments,
                          ...welcomeEmailDocuments,
                          ...otherDocuments,
                        ]
                        const payload = {
                          ...formData,
                          skills: formData.skills.split(',').map(s => s.trim()).filter(s => s),
                          experience: Number(formData.experience),
                          documents: allDocuments,
                        }
                        const response = await fetch(`/api/candidates/${candidate.id}`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          credentials: 'include',
                          body: JSON.stringify(payload),
                        })
                        if (!response.ok) {
                          const data = await response.json()
                          throw new Error(data.error || 'Failed to save Zimyo ID')
                        }
                        alert('Zimyo ID saved successfully!')
                      } catch (err: any) {
                        setError(err.message || 'Failed to save Zimyo ID')
                      } finally {
                        setLoading(false)
                      }
                    }}
                    disabled={loading}
                    className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {loading ? 'Saving...' : 'Save'}
                  </button>
                </div>
                {formData.zimyoId && (
                  <p className="text-xs text-green-700 mt-2">
                    ✓ Zimyo ID: <strong>{formData.zimyoId}</strong>
                  </p>
                )}
              </div>
            </div>
              )}

              {/* Zimyo Access Section */}
              {formData.status === 'rejected' && (
                <div className="mb-4 p-4 bg-purple-50 border-2 border-purple-200 rounded-lg">
                  {formData.zimyoAccessGranted ? (
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-purple-600" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-purple-900">✓ Zimyo Access Granted</p>
                    {formData.zimyoAccessDate && (
                      <p className="text-xs text-purple-700 mt-1">
                        Access granted on: {new Date(formData.zimyoAccessDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    )}
                    {formData.zimyoId && (
                      <p className="text-xs text-purple-700 mt-1">
                        Zimyo ID: <strong>{formData.zimyoId}</strong>
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <Building2 className="w-6 h-6 text-purple-600" />
                    <div>
                      <p className="text-sm font-semibold text-purple-900">Zimyo Access</p>
                      <p className="text-xs text-purple-700">
                        Grant Zimyo access to this candidate after AL is released
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      setLoading(true)
                      setError('')
                      try {
                        const allDocuments = [
                          ...aadharDocuments,
                          ...panDocuments,
                          ...bankDocuments,
                          ...qualificationDocuments,
                          ...olLetterDocuments,
                          ...deputationLetterDocuments,
                          ...alLetterDocuments,
                          ...welcomeEmailDocuments,
                          ...otherDocuments,
                        ]
                        const payload = {
                          ...formData,
                          zimyoAccessGranted: true,
                          zimyoAccessDate: new Date().toISOString(),
                          skills: formData.skills.split(',').map(s => s.trim()).filter(s => s),
                          experience: Number(formData.experience),
                          documents: allDocuments,
                        }
                        const response = await fetch(`/api/candidates/${candidate.id}`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          credentials: 'include',
                          body: JSON.stringify(payload),
                        })
                        if (!response.ok) {
                          const data = await response.json()
                          throw new Error(data.error || 'Failed to grant Zimyo access')
                        }
                        
                        // Transfer to CSM Induction when Zimyo access is granted
                        try {
                          const inductionData = {
                            candidateId: candidate?.id || Date.now().toString(),
                            employeeName: `${formData.firstName} ${formData.lastName}`,
                            email: formData.email,
                            phone: formData.phone,
                            position: formData.position,
                            esicStatus: formData.esicStatus,
                            pfStatus: formData.pfStatus,
                            tdsStatus: formData.tdsStatus,
                            medicalStatus: formData.medicalStatus
                          }

                          const csmResponse = await fetch(`${CSM_API_BASE}/induction/cso-enroll`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(inductionData),
                          })

                          if (csmResponse.ok) {
                            console.log('CSM Induction record created successfully')
                          }
                        } catch (csmError) {
                          console.error('Error sending to CSM Induction:', csmError)
                        }
                        
                        setFormData({ ...formData, zimyoAccessGranted: true, zimyoAccessDate: new Date().toISOString() })
                        alert('Zimyo access granted successfully! Candidate transferred to CSM Induction.')
                      } catch (err: any) {
                        setError(err.message || 'Failed to grant Zimyo access')
                      } finally {
                        setLoading(false)
                      }
                    }}
                    disabled={loading}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-md"
                  >
                    <CheckCircle className="w-5 h-5" />
                    {loading ? 'Processing...' : 'Grant Zimyo Access'}
                  </button>
                </div>
              )}
                </div>
              )}

              {/* Enrollment Section - ESIC, PF, TDS, Medical */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Enrollment Options
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {/* ESIC */}
                  <label className={`flex flex-col items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.esicStatus ? 'bg-green-50 border-green-400 shadow-md' : 'bg-orange-50 border-orange-200 hover:border-orange-300'}`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all ${formData.esicStatus ? 'bg-green-500' : 'bg-orange-500'}`}>
                      {formData.esicStatus ? (
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="text-white text-lg font-bold">E</span>
              )}
            </div>
                    <span className="font-semibold text-gray-800 mb-1">ESIC</span>
                    <span className={`text-xs ${formData.esicStatus ? 'text-green-600' : 'text-gray-500'}`}>
                      {formData.esicStatus ? '✓ Enrolled' : 'Not Enrolled'}
                    </span>
                    <input
                      type="checkbox"
                      checked={formData.esicStatus}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        esicStatus: e.target.checked,
                        esicDate: e.target.checked ? new Date().toISOString() : ''
                      })}
                      className="sr-only"
                    />
                  </label>

                  {/* PF */}
                  <label className={`flex flex-col items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.pfStatus ? 'bg-green-50 border-green-400 shadow-md' : 'bg-blue-50 border-blue-200 hover:border-blue-300'}`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all ${formData.pfStatus ? 'bg-green-500' : 'bg-blue-500'}`}>
                      {formData.pfStatus ? (
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="text-white text-lg font-bold">PF</span>
                      )}
                    </div>
                    <span className="font-semibold text-gray-800 mb-1">PF</span>
                    <span className={`text-xs ${formData.pfStatus ? 'text-green-600' : 'text-gray-500'}`}>
                      {formData.pfStatus ? '✓ Enrolled' : 'Not Enrolled'}
                    </span>
                    <input
                      type="checkbox"
                      checked={formData.pfStatus}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        pfStatus: e.target.checked,
                        pfDate: e.target.checked ? new Date().toISOString() : ''
                      })}
                      className="sr-only"
                    />
                  </label>

                  {/* TDS */}
                  <label className={`flex flex-col items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.tdsStatus ? 'bg-green-50 border-green-400 shadow-md' : 'bg-yellow-50 border-yellow-200 hover:border-yellow-300'}`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all ${formData.tdsStatus ? 'bg-green-500' : 'bg-yellow-500'}`}>
                      {formData.tdsStatus ? (
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="text-white text-lg font-bold">T</span>
                      )}
                    </div>
                    <span className="font-semibold text-gray-800 mb-1">TDS</span>
                    <span className={`text-xs ${formData.tdsStatus ? 'text-green-600' : 'text-gray-500'}`}>
                      {formData.tdsStatus ? '✓ Enrolled' : 'Not Enrolled'}
                    </span>
                    <input
                      type="checkbox"
                      checked={formData.tdsStatus}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        tdsStatus: e.target.checked,
                        tdsDate: e.target.checked ? new Date().toISOString() : ''
                      })}
                      className="sr-only"
                    />
                  </label>

                  {/* Medical */}
                  <label className={`flex flex-col items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.medicalStatus ? 'bg-green-50 border-green-400 shadow-md' : 'bg-pink-50 border-pink-200 hover:border-pink-300'}`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all ${formData.medicalStatus ? 'bg-green-500' : 'bg-pink-500'}`}>
                      {formData.medicalStatus ? (
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="text-white text-lg font-bold">M</span>
                      )}
                    </div>
                    <span className="font-semibold text-gray-800 mb-1">Medical</span>
                    <span className={`text-xs ${formData.medicalStatus ? 'text-green-600' : 'text-gray-500'}`}>
                      {formData.medicalStatus ? '✓ Enrolled' : 'Not Enrolled'}
                    </span>
                    <input
                      type="checkbox"
                      checked={formData.medicalStatus}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        medicalStatus: e.target.checked,
                        medicalDate: e.target.checked ? new Date().toISOString() : ''
                      })}
                      className="sr-only"
                    />
                  </label>
                </div>

                {/* Enrollment Summary */}
                {(formData.esicStatus || formData.pfStatus || formData.tdsStatus || formData.medicalStatus) && (
                  <div className="mt-4 p-4 bg-green-50 border-2 border-green-200 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-semibold text-green-800">Candidate is enrolling for:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.esicStatus && (
                        <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium flex items-center gap-1">
                          <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                          ESIC
                        </span>
                      )}
                      {formData.pfStatus && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium flex items-center gap-1">
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          PF
                        </span>
                      )}
                      {formData.tdsStatus && (
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium flex items-center gap-1">
                          <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                          TDS
                        </span>
                      )}
                      {formData.medicalStatus && (
                        <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm font-medium flex items-center gap-1">
                          <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
                          Medical Insurance
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : candidate ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

