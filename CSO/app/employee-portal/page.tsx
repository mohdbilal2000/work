'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, LogOut, Building2, Mail, Briefcase, Search, Plus, Filter, Users, UserCheck, Clock, FileText, BarChart3, Calendar, TrendingUp, Ticket, AlertCircle, CheckCircle } from 'lucide-react'
import { Candidate, Ticket as TicketType } from '@/lib/types'
import CandidateCard from '@/components/CandidateCard'
import CandidateModal from '@/components/CandidateModal'
import TicketManagement from '@/components/TicketManagement'
import { getStatusOptions } from '@/lib/status-labels'

export default function EmployeePortal() {
  const router = useRouter()
  const [employee, setEmployee] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([])
  const [tickets, setTickets] = useState<TicketType[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showModal, setShowModal] = useState(false)
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null)
  const [activeTab, setActiveTab] = useState<'candidates' | 'reports' | 'tickets'>('candidates')
  const [candidateSubTab, setCandidateSubTab] = useState<'part1' | 'part2'>('part1')
  const [showTicketManagement, setShowTicketManagement] = useState(false)

  useEffect(() => {
    const storedEmployee = localStorage.getItem('employee')
    if (!storedEmployee) {
      router.push('/employee-login')
      return
    }
    setEmployee(JSON.parse(storedEmployee))
    fetchCandidates()
    fetchTickets()
  }, [router])

  const fetchCandidates = async () => {
    try {
      // HTTP-only cookies are automatically sent with fetch requests
      const response = await fetch('/api/candidates', {
        credentials: 'include'
      })
      
      if (response.status === 401) {
        router.push('/employee-login')
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

  const fetchTickets = async () => {
    try {
      const response = await fetch('/api/tickets', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setTickets(data.tickets || [])
      }
    } catch (error) {
      console.error('Error fetching tickets:', error)
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

  const handleEdit = (candidate: Candidate) => {
    setEditingCandidate(candidate)
    setShowModal(true)
  }

  const handleAdd = () => {
    setEditingCandidate(null)
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this candidate?')) return

    try {
      const response = await fetch(`/api/candidates/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (response.ok) {
        fetchCandidates()
      }
    } catch (error) {
      console.error('Error deleting candidate:', error)
    }
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
    accepted: candidates.filter(c => c.status === 'accepted').length,
    join: candidates.filter(c => c.status === 'join').length,
    rejected: candidates.filter(c => c.status === 'rejected').length,
  }

  const handleLogout = () => {
    localStorage.removeItem('employee')
    document.cookie = 'employee_token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    router.push('/employee-login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!employee) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">CSO Member Portal</h1>
              <p className="text-sm text-gray-600">Welcome to your personal portal</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('candidates')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === 'candidates'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Users className="w-5 h-5" />
                Part 1: Candidate Management
              </button>
              <button
                onClick={() => setActiveTab('reports')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === 'reports'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <BarChart3 className="w-5 h-5" />
                Part 2: Reports & Analytics
              </button>
              <button
                onClick={() => setActiveTab('tickets')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === 'tickets'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Ticket className="w-5 h-5" />
                Ticket Management
              </button>
            </nav>
          </div>
        </div>

        {/* Welcome Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-primary-600 rounded-full flex items-center justify-center">
              <User className="w-12 h-12 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome, {employee.name}!
              </h2>
              <p className="text-lg text-gray-600">Your Employee Portal</p>
            </div>
          </div>
        </div>

        {/* Employee Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Office ID Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Office ID</p>
                <p className="text-xl font-bold text-gray-900">{employee.officeId || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Email Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Mail className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="text-lg font-semibold text-gray-900">{employee.email}</p>
              </div>
            </div>
          </div>

          {/* Department/Position Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Department</p>
                <p className="text-lg font-semibold text-gray-900">
                  {employee.department || 'Not assigned'}
                </p>
                {employee.position && (
                  <p className="text-sm text-gray-500 mt-1">{employee.position}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Ticket Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {/* Open Tickets Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Open Tickets</p>
                <p className="text-2xl font-bold text-blue-600">
                  {tickets.filter(t => t.status === 'open').length}
                </p>
              </div>
            </div>
          </div>

          {/* In Process Tickets Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">In Process</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {tickets.filter(t => t.status === 'in_progress').length}
                </p>
              </div>
            </div>
          </div>

          {/* Closed Tickets Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Closed Tickets</p>
                <p className="text-2xl font-bold text-green-600">
                  {tickets.filter(t => t.status === 'closed').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Account Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Username</p>
              <p className="text-lg font-semibold text-gray-900">{employee.username}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Account Status</p>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  employee.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {employee.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Member Since</p>
              <p className="text-lg font-semibold text-gray-900">
                {new Date(employee.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Part 1: Candidate Management Content */}
        {activeTab === 'candidates' && (
          <>
            {/* Candidate Management Sub-Tabs */}
            <div className="mb-6 mt-6">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setCandidateSubTab('part1')}
                    className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                      candidateSubTab === 'part1'
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    Part 1: Initial Process (Turnup → OL Release)
                  </button>
                  <button
                    onClick={() => setCandidateSubTab('part2')}
                    className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                      candidateSubTab === 'part2'
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <UserCheck className="w-4 h-4" />
                    Part 2: Final Process (Join → AL Release → Zimyo)
                  </button>
                </nav>
              </div>
            </div>

            {/* Part 1: Initial Process (Turnup → OL Release) */}
            {candidateSubTab === 'part1' && (
              <>
                {/* Statistics Cards for Part 1 */}
                <div className="mt-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Initial Process Statistics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
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
                          <p className="text-sm text-gray-600">OL Released</p>
                          <p className="text-2xl font-bold text-green-600">{stats.accepted}</p>
                        </div>
                        <UserCheck className="w-8 h-8 text-green-600" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Candidate Management Section for Part 1 */}
                <div className="mt-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Candidate Management - Initial Process</h3>
              
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
                          <option value="pending">Selected</option>
                          <option value="reviewing">Rejected</option>
                          <option value="interviewed">Selected Pending</option>
                          <option value="accepted">OL Released</option>
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

                  {/* Candidates Grid - Filter for Part 1 statuses */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCandidates
                      .filter(c => ['pending', 'reviewing', 'interviewed', 'welcome', 'accepted'].includes(c.status))
                      .map((candidate) => (
                        <CandidateCard
                          key={candidate.id}
                          candidate={candidate}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                        />
                      ))}
                  </div>

                  {filteredCandidates.filter(c => ['pending', 'reviewing', 'interviewed', 'welcome', 'accepted'].includes(c.status)).length === 0 && (
                    <div className="text-center py-12 bg-white rounded-lg shadow">
                      <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 text-lg">No candidates in initial process</p>
                      <button
                        onClick={handleAdd}
                        className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                      >
                        Add Your First Candidate
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Part 2: Final Process (Join → AL Release → Zimyo) */}
            {candidateSubTab === 'part2' && (
              <>
                {/* Statistics Cards for Part 2 */}
                <div className="mt-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Final Process Statistics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
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
                    <div className="bg-white p-4 rounded-lg shadow">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Zimyo Access</p>
                          <p className="text-2xl font-bold text-purple-600">
                            {candidates.filter(c => c.status === 'join' || c.status === 'rejected').length}
                          </p>
                        </div>
                        <Building2 className="w-8 h-8 text-purple-600" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Candidate Management Section for Part 2 */}
                <div className="mt-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Candidate Management - Final Process</h3>
              
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
                          <option value="join">Join</option>
                          <option value="rejected">AL Released</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Candidates Grid - Filter for Part 2 statuses */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCandidates
                      .filter(c => ['followup1', 'joiningProbability', 'join', 'rejected'].includes(c.status))
                      .map((candidate) => (
                        <CandidateCard
                          key={candidate.id}
                          candidate={candidate}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                        />
                      ))}
                  </div>

                  {filteredCandidates.filter(c => ['followup1', 'joiningProbability', 'join', 'rejected'].includes(c.status)).length === 0 && (
                    <div className="text-center py-12 bg-white rounded-lg shadow">
                      <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 text-lg">No candidates in final process</p>
                    </div>
                  )}

                  {/* Zimyo Access Planning Section */}
                  <div className="mt-8 bg-white rounded-lg shadow-md p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Building2 className="w-5 h-5" />
                      Zimyo Access Management
                    </h4>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                      <h5 className="font-semibold text-blue-900 mb-3">Zimyo Integration Planning</h5>
                      <div className="space-y-3 text-sm text-blue-800">
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                          <div>
                            <p className="font-medium">Candidates Eligible for Zimyo Access:</p>
                            <p className="text-xs text-blue-700 mt-1">
                              Candidates with status "Join" or "AL Released" are eligible for Zimyo access
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                          <div>
                            <p className="font-medium">Integration Features to Implement:</p>
                            <ul className="list-disc list-inside text-xs text-blue-700 mt-1 space-y-1">
                              <li>Employee onboarding in Zimyo system</li>
                              <li>Automatic account creation</li>
                              <li>Access credentials management</li>
                              <li>Status synchronization</li>
                            </ul>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                          <div>
                            <p className="font-medium">Current Status:</p>
                            <p className="text-xs text-blue-700 mt-1">
                              {candidates.filter(c => c.status === 'join' || c.status === 'rejected').length} candidates ready for Zimyo access
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* Part 2: Reports & Analytics Content */}
        {activeTab === 'reports' && (
          <div className="mt-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Reports & Analytics</h3>
            
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Candidates</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <p className="text-xs text-gray-500">All time candidates</p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-600">OL Released</p>
                    <p className="text-3xl font-bold text-green-600">{stats.accepted}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  {stats.total > 0 ? Math.round((stats.accepted / stats.total) * 100) : 0}% of total
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Pending Actions</p>
                    <p className="text-3xl font-bold text-yellow-600">
                      {stats.pending + stats.interviewed}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
                <p className="text-xs text-gray-500">Selected + Selected Pending</p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Join Status</p>
                    <p className="text-3xl font-bold text-indigo-600">{stats.join}</p>
                  </div>
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <UserCheck className="w-6 h-6 text-indigo-600" />
                  </div>
                </div>
                <p className="text-xs text-gray-500">Candidates joined</p>
              </div>
            </div>

            {/* Detailed Reports */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Status Distribution Chart */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Status Distribution
                </h4>
                <div className="space-y-4">
                  {[
                    { label: 'Selected', value: stats.pending, color: 'bg-yellow-500' },
                    { label: 'Rejected', value: stats.reviewing, color: 'bg-blue-500' },
                    { label: 'Selected Pending', value: stats.interviewed, color: 'bg-purple-500' },
                    { label: 'OL Released', value: stats.accepted, color: 'bg-green-500' },
                    { label: 'Join', value: stats.join, color: 'bg-indigo-500' },
                    { label: 'AL Released', value: stats.rejected, color: 'bg-green-600' },
                  ].map((item) => {
                    const percentage = stats.total > 0 ? (item.value / stats.total) * 100 : 0
                    return (
                      <div key={item.label}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-700">{item.label}</span>
                          <span className="text-gray-900 font-medium">{item.value} ({percentage.toFixed(1)}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`${item.color} h-2 rounded-full transition-all`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Upcoming Joining Dates */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Upcoming Joining Dates
                </h4>
                <div className="space-y-3">
                  {candidates
                    .filter(c => c.expectedDateOfJoining)
                    .sort((a, b) => {
                      const dateA = new Date(a.expectedDateOfJoining!).getTime()
                      const dateB = new Date(b.expectedDateOfJoining!).getTime()
                      return dateA - dateB
                    })
                    .slice(0, 5)
                    .map((candidate) => (
                      <div key={candidate.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">
                            {candidate.firstName} {candidate.lastName}
                          </p>
                          <p className="text-sm text-gray-600">{candidate.position}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-primary-600">
                            {new Date(candidate.expectedDateOfJoining!).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                          <p className="text-xs text-gray-500">
                            {Math.ceil((new Date(candidate.expectedDateOfJoining!).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days
                          </p>
                        </div>
                      </div>
                    ))}
                  {candidates.filter(c => c.expectedDateOfJoining).length === 0 && (
                    <p className="text-gray-500 text-center py-4">No upcoming joining dates</p>
                  )}
                </div>
              </div>
            </div>

            {/* Document Status Report */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Document Status Report
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'With All Documents', count: candidates.filter(c => {
                    if (!c.documents) return false
                    const docs = Array.isArray(c.documents) ? c.documents : (typeof c.documents === 'string' ? JSON.parse(c.documents) : [])
                    const aadhar = docs.filter((d: any) => d.documentType === 'aadhar').length > 0
                    const pan = docs.filter((d: any) => d.documentType === 'pan').length > 0
                    const bank = docs.filter((d: any) => d.documentType === 'bank').length > 0
                    const qual = docs.filter((d: any) => d.documentType === 'qualification').length > 0
                    return aadhar && pan && bank && qual
                  }).length, color: 'text-green-600' },
                  { label: 'Missing Documents', count: candidates.filter(c => {
                    if (!c.documents) return true
                    const docs = Array.isArray(c.documents) ? c.documents : (typeof c.documents === 'string' ? JSON.parse(c.documents) : [])
                    const aadhar = docs.filter((d: any) => d.documentType === 'aadhar').length > 0
                    const pan = docs.filter((d: any) => d.documentType === 'pan').length > 0
                    const bank = docs.filter((d: any) => d.documentType === 'bank').length > 0
                    const qual = docs.filter((d: any) => d.documentType === 'qualification').length > 0
                    return !(aadhar && pan && bank && qual)
                  }).length, color: 'text-yellow-600' },
                  { label: 'OL Released', count: stats.accepted, color: 'text-green-600' },
                  { label: 'Ready for OL Release', count: candidates.filter(c => {
                    if (c.status === 'accepted') return false
                    if (!c.documents) return false
                    const docs = Array.isArray(c.documents) ? c.documents : (typeof c.documents === 'string' ? JSON.parse(c.documents) : [])
                    const aadhar = docs.filter((d: any) => d.documentType === 'aadhar').length > 0
                    const pan = docs.filter((d: any) => d.documentType === 'pan').length > 0
                    const bank = docs.filter((d: any) => d.documentType === 'bank').length > 0
                    const qual = docs.filter((d: any) => d.documentType === 'qualification').length > 0
                    return aadhar && pan && bank && qual
                  }).length, color: 'text-blue-600' },
                ].map((item) => (
                  <div key={item.label} className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">{item.label}</p>
                    <p className={`text-2xl font-bold ${item.color}`}>{item.count}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Recent Activity Summary
              </h4>
              <div className="space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600">Candidates Added Today</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {candidates.filter(c => {
                        const today = new Date().toDateString()
                        return new Date(c.createdAt).toDateString() === today
                      }).length}
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600">OL Released Today</p>
                    <p className="text-2xl font-bold text-green-600">
                      {candidates.filter(c => {
                        if (c.status !== 'accepted' || !c.olReleasedDate) return false
                        const today = new Date().toDateString()
                        return new Date(c.olReleasedDate).toDateString() === today
                      }).length}
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm text-gray-600">Updated This Week</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {candidates.filter(c => {
                        const weekAgo = new Date()
                        weekAgo.setDate(weekAgo.getDate() - 7)
                        return new Date(c.updatedAt) > weekAgo
                      }).length}
                    </p>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <p className="text-sm text-gray-600">Avg. Processing Time</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {stats.accepted > 0
                        ? Math.round(
                            candidates
                              .filter(c => c.status === 'accepted' && c.olReleasedDate)
                              .reduce((acc, c) => {
                                const created = new Date(c.createdAt).getTime()
                                const released = new Date(c.olReleasedDate!).getTime()
                                return acc + (released - created) / (1000 * 60 * 60 * 24)
                              }, 0) / stats.accepted
                          )
                        : 0}
                      <span className="text-sm"> days</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Ticket Management Content */}
        {activeTab === 'tickets' && (
          <div className="mt-8">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Ticket Management System</h3>
              <p className="text-gray-600">Create, manage, and track support tickets</p>
            </div>
            <button
              onClick={() => setShowTicketManagement(true)}
              className="mb-6 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2"
            >
              <Ticket className="w-5 h-5" />
              Open Ticket Management
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

      {showTicketManagement && (
        <TicketManagement
          onClose={() => {
            setShowTicketManagement(false)
            fetchTickets() // Refresh tickets when modal closes
          }}
          currentUserId={employee?.id || employee?.officeId || ''}
          currentUserName={employee?.name || employee?.username || ''}
        />
      )}
    </div>
  )
}

