'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Candidate } from '@/lib/types'
import { Users, UserCheck, UserX, Clock, Search, Plus, Filter, Building2 } from 'lucide-react'
import CandidateCard from './CandidateCard'
import CandidateModal from './CandidateModal'
import EmployeeManagement from './EmployeeManagement'
import { getStatusOptions } from '@/lib/status-labels'

export default function Dashboard() {
  const router = useRouter()
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showModal, setShowModal] = useState(false)
  const [showEmployeeManagement, setShowEmployeeManagement] = useState(false)
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null)
  const [member, setMember] = useState<any>(null)

  useEffect(() => {
    const storedMember = localStorage.getItem('member')
    if (!storedMember) {
      router.push('/login')
      return
    }
    setMember(JSON.parse(storedMember))
    fetchCandidates()
  }, [router])

  const fetchCandidates = async () => {
    try {
      const response = await fetch('/api/candidates')
      if (response.status === 401) {
        router.push('/login')
        return
      }
      const data = await response.json()
      setCandidates(data.candidates || [])
      setFilteredCandidates(data.candidates || [])
    } catch (error) {
      console.error('Error fetching candidates:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let filtered = candidates

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(
        c =>
          c.firstName.toLowerCase().includes(searchLower) ||
          c.lastName.toLowerCase().includes(searchLower) ||
          c.email.toLowerCase().includes(searchLower) ||
          c.position.toLowerCase().includes(searchLower)
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => c.status === statusFilter)
    }

    setFilteredCandidates(filtered)
  }, [searchTerm, statusFilter, candidates])

  const handleLogout = async () => {
    // Clear cookie
    document.cookie = 'token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    localStorage.removeItem('member')
    router.push('/login')
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this candidate?')) return

    try {
      const response = await fetch(`/api/candidates/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchCandidates()
      }
    } catch (error) {
      console.error('Error deleting candidate:', error)
    }
  }

  const handleEdit = (candidate: Candidate) => {
    setEditingCandidate(candidate)
    setShowModal(true)
  }

  const handleAdd = () => {
    setEditingCandidate(null)
    setShowModal(true)
  }

  const handleModalClose = () => {
    setShowModal(false)
    setEditingCandidate(null)
    fetchCandidates()
  }

  const stats = {
    total: candidates.length,
    pending: candidates.filter(c => c.status === 'pending').length,
    reviewing: candidates.filter(c => c.status === 'reviewing').length,
    interviewed: candidates.filter(c => c.status === 'interviewed').length,
    welcome: candidates.filter(c => c.status === 'welcome').length,
    joiningProbability: candidates.filter(c => c.status === 'joiningProbability').length,
    followup1: candidates.filter(c => c.status === 'followup1').length,
    accepted: candidates.filter(c => c.status === 'accepted').length,
    join: candidates.filter(c => c.status === 'join').length,
    rejected: candidates.filter(c => c.status === 'rejected').length,
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Candidate Service Portal</h1>
              <p className="text-sm text-gray-600">
                Welcome, {member?.name} ({member?.role})
              </p>
            </div>
            <div className="flex gap-3">
              <a
                href="/employee-login"
                target="_blank"
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-green-600 rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <Building2 className="w-4 h-4" />
                CSO Member Login
              </a>
              <button
                onClick={() => setShowEmployeeManagement(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-primary-600 rounded-lg hover:bg-primary-700 flex items-center gap-2"
              >
                <Building2 className="w-4 h-4" />
                Manage Employees
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-10 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Turnups</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Users className="w-8 h-8 text-primary-600" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Selected</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-blue-600">{stats.reviewing}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Selected Pending</p>
                <p className="text-2xl font-bold text-purple-600">{stats.interviewed}</p>
              </div>
              <UserCheck className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Welcome</p>
                <p className="text-2xl font-bold text-cyan-600">{stats.welcome}</p>
              </div>
              <UserCheck className="w-8 h-8 text-cyan-600" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Joining Probability</p>
                <p className="text-2xl font-bold text-teal-600">{stats.joiningProbability}</p>
              </div>
              <UserCheck className="w-8 h-8 text-teal-600" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Followup 1</p>
                <p className="text-2xl font-bold text-orange-600">{stats.followup1}</p>
              </div>
              <UserCheck className="w-8 h-8 text-orange-600" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">OL Released</p>
                <p className="text-2xl font-bold text-green-600">{stats.accepted}</p>
              </div>
              <UserCheck className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Join</p>
                <p className="text-2xl font-bold text-indigo-600">{stats.join}</p>
              </div>
              <UserCheck className="w-8 h-8 text-indigo-600" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">AL Released</p>
                <p className="text-2xl font-bold text-green-600">{stats.rejected}</p>
              </div>
              <UserCheck className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search candidates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">All Status</option>
                {getStatusOptions().map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Candidate
            </button>
          </div>
        </div>

        {/* Candidates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCandidates.map((candidate) => (
            <CandidateCard
              key={candidate.id}
              candidate={candidate}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>

        {filteredCandidates.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No candidates found</p>
            <button
              onClick={handleAdd}
              className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Add Your First Candidate
            </button>
          </div>
        )}
      </main>

      {showModal && (
        <CandidateModal
          candidate={editingCandidate}
          onClose={handleModalClose}
        />
      )}

      {showEmployeeManagement && (
        <EmployeeManagement
          onClose={() => setShowEmployeeManagement(false)}
        />
      )}
    </div>
  )
}

