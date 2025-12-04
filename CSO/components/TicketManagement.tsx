'use client'

import { useState, useEffect } from 'react'
import { Ticket } from '@/lib/types'
import { Search, Plus, Filter, Ticket as TicketIcon, X, ArrowRight, Clock, CheckCircle, AlertCircle, MoreVertical, Edit, Trash2, MessageSquare, User, Calendar } from 'lucide-react'
import TicketModal from './TicketModal'

interface TicketManagementProps {
  onClose: () => void
  currentUserId: string
  currentUserName: string
}

const statusConfig = {
  open: {
    label: 'Open',
    color: 'bg-blue-500',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
    icon: AlertCircle,
  },
  in_progress: {
    label: 'In Progress',
    color: 'bg-yellow-500',
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-700',
    borderColor: 'border-yellow-200',
    icon: Clock,
  },
  resolved: {
    label: 'Resolved',
    color: 'bg-green-500',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    borderColor: 'border-green-200',
    icon: CheckCircle,
  },
  closed: {
    label: 'Closed',
    color: 'bg-gray-500',
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-700',
    borderColor: 'border-gray-200',
    icon: X,
  },
}

const priorityColors = {
  low: 'bg-gray-100 text-gray-700 border-gray-300',
  medium: 'bg-blue-100 text-blue-700 border-blue-300',
  high: 'bg-orange-100 text-orange-700 border-orange-300',
  urgent: 'bg-red-100 text-red-700 border-red-300',
}

export default function TicketManagement({ onClose, currentUserId, currentUserName }: TicketManagementProps) {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [showModal, setShowModal] = useState(false)
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban')

  useEffect(() => {
    fetchTickets()
  }, [])

  useEffect(() => {
    let filtered = tickets

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(
        t =>
          t.title.toLowerCase().includes(searchLower) ||
          t.description.toLowerCase().includes(searchLower) ||
          t.createdByName?.toLowerCase().includes(searchLower)
      )
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(t => t.priority === priorityFilter)
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(t => t.category === categoryFilter)
    }

    setFilteredTickets(filtered)
  }, [searchTerm, priorityFilter, categoryFilter, tickets])

  const fetchTickets = async () => {
    try {
      const response = await fetch('/api/tickets', {
        credentials: 'include',
      })
      if (response.status === 401) {
        return
      }
      const data = await response.json()
      setTickets(data.tickets || [])
      setFilteredTickets(data.tickets || [])
    } catch (error) {
      console.error('Error fetching tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this ticket?')) return

    try {
      const response = await fetch(`/api/tickets/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (response.ok) {
        fetchTickets()
      }
    } catch (error) {
      console.error('Error deleting ticket:', error)
    }
  }

  const handleEdit = (ticket: Ticket) => {
    setEditingTicket(ticket)
    setShowModal(true)
  }

  const handleStatusChange = async (ticketId: string, newStatus: Ticket['status']) => {
    try {
      const ticket = tickets.find(t => t.id === ticketId)
      if (!ticket) return

      const payload = {
        ...ticket,
        status: newStatus,
        resolvedAt: newStatus === 'resolved' ? new Date().toISOString() : ticket.resolvedAt,
        closedAt: newStatus === 'closed' ? new Date().toISOString() : ticket.closedAt,
      }

      const response = await fetch(`/api/tickets/${ticketId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        fetchTickets()
      }
    } catch (error) {
      console.error('Error updating ticket status:', error)
    }
  }

  const handleCreate = async (ticketData: any) => {
    try {
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(ticketData),
      })

      if (response.ok) {
        fetchTickets()
        setShowCreateModal(false)
      }
    } catch (error) {
      console.error('Error creating ticket:', error)
    }
  }

  const handleModalClose = () => {
    setShowModal(false)
    setEditingTicket(null)
    fetchTickets()
  }

  const getTicketsByStatus = (status: Ticket['status']) => {
    return filteredTickets.filter(t => t.status === status)
  }

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    in_progress: tickets.filter(t => t.status === 'in_progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
    closed: tickets.filter(t => t.status === 'closed').length,
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 shadow-xl">
          <div className="text-lg font-medium">Loading tickets...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-gray-100 z-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <TicketIcon className="w-6 h-6 text-primary-600" />
              Ticket Management System
            </h2>
            <p className="text-sm text-gray-600 mt-1">Manage and track support tickets</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-lg hover:bg-gray-100"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Stats Bar */}
        <div className="px-6 pb-4">
          <div className="grid grid-cols-5 gap-4">
            {Object.entries(stats).map(([key, value]) => {
              const config = statusConfig[key as keyof typeof statusConfig]
              if (!config) return null
              const Icon = config.icon
              return (
                <div key={key} className={`${config.bgColor} ${config.borderColor} border rounded-lg p-3`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-600 uppercase">{config.label}</p>
                      <p className={`text-2xl font-bold ${config.textColor} mt-1`}>{value}</p>
                    </div>
                    <Icon className={`w-6 h-6 ${config.textColor}`} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="px-6 pb-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search tickets by title, description, or creator..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">All Categories</option>
                <option value="technical">Technical</option>
                <option value="documentation">Documentation</option>
                <option value="process">Process</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode(viewMode === 'kanban' ? 'list' : 'kanban')}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                {viewMode === 'kanban' ? 'List View' : 'Kanban View'}
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2 shadow-md"
              >
                <Plus className="w-5 h-5" />
                Create Ticket
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'kanban' ? (
          <div className="h-full overflow-x-auto p-6">
            <div className="flex gap-6 h-full min-w-max">
              {(['open', 'in_progress', 'resolved', 'closed'] as Ticket['status'][]).map((status) => {
                const config = statusConfig[status]
                const statusTickets = getTicketsByStatus(status)
                const Icon = config.icon

                return (
                  <div key={status} className="flex-shrink-0 w-80 flex flex-col">
                    <div className={`${config.bgColor} ${config.borderColor} border-2 rounded-t-lg p-4 mb-2`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className={`w-5 h-5 ${config.textColor}`} />
                          <h3 className={`font-semibold ${config.textColor}`}>{config.label}</h3>
                        </div>
                        <span className={`${config.textColor} bg-white px-2 py-1 rounded-full text-sm font-medium`}>
                          {statusTickets.length}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-3 pb-4">
                      {statusTickets.map((ticket) => (
                        <KanbanTicketCard
                          key={ticket.id}
                          ticket={ticket}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                          onStatusChange={handleStatusChange}
                        />
                      ))}
                      {statusTickets.length === 0 && (
                        <div className="text-center py-8 text-gray-400 text-sm">
                          No tickets in this status
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="h-full overflow-y-auto p-6">
            <div className="space-y-3">
              {filteredTickets.map((ticket) => (
                <ListTicketCard
                  key={ticket.id}
                  ticket={ticket}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onStatusChange={handleStatusChange}
                />
              ))}
              {filteredTickets.length === 0 && (
                <div className="text-center py-12">
                  <TicketIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">No tickets found</p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    Create Your First Ticket
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {showModal && editingTicket && (
        <TicketModal
          ticket={editingTicket}
          onClose={handleModalClose}
          currentUserId={currentUserId}
          currentUserName={currentUserName}
        />
      )}

      {showCreateModal && (
        <CreateTicketModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreate}
          currentUserId={currentUserId}
          currentUserName={currentUserName}
        />
      )}
    </div>
  )
}

// Kanban Ticket Card Component
function KanbanTicketCard({
  ticket,
  onEdit,
  onDelete,
  onStatusChange,
}: {
  ticket: Ticket
  onEdit: (ticket: Ticket) => void
  onDelete: (id: string) => void
  onStatusChange: (id: string, status: Ticket['status']) => void
}) {
  const [showMenu, setShowMenu] = useState(false)
  const statuses: Ticket['status'][] = ['open', 'in_progress', 'resolved', 'closed']
  const currentIndex = statuses.indexOf(ticket.status)

  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-all border border-gray-200 group">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-semibold text-gray-900 text-sm flex-1 line-clamp-2">{ticket.title}</h4>
        <div className="relative ml-2">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded transition-opacity"
          >
            <MoreVertical className="w-4 h-4 text-gray-500" />
          </button>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                <button
                  onClick={() => {
                    onEdit(ticket)
                    setShowMenu(false)
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    onDelete(ticket.id)
                    setShowMenu(false)
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <p className="text-xs text-gray-600 mb-3 line-clamp-2">{ticket.description}</p>

      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className={`px-2 py-1 text-xs font-medium rounded border ${priorityColors[ticket.priority]}`}>
          {ticket.priority.toUpperCase()}
        </span>
        <span className="px-2 py-1 text-xs font-medium rounded bg-purple-100 text-purple-700 border border-purple-300">
          {ticket.category.toUpperCase()}
        </span>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
        <div className="flex items-center gap-1">
          <User className="w-3 h-3" />
          <span className="truncate">{ticket.createdByName || ticket.createdBy}</span>
        </div>
        {ticket.comments && ticket.comments.length > 0 && (
          <div className="flex items-center gap-1">
            <MessageSquare className="w-3 h-3" />
            <span>{ticket.comments.length}</span>
          </div>
        )}
      </div>

      {/* Quick Status Change */}
      <div className="flex gap-1 pt-2 border-t border-gray-100">
        {currentIndex > 0 && (
          <button
            onClick={() => onStatusChange(ticket.id, statuses[currentIndex - 1])}
            className="flex-1 px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center justify-center gap-1"
            title="Move left"
          >
            <ArrowRight className="w-3 h-3 rotate-180" />
          </button>
        )}
        {currentIndex < statuses.length - 1 && (
          <button
            onClick={() => onStatusChange(ticket.id, statuses[currentIndex + 1])}
            className="flex-1 px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center justify-center gap-1"
            title="Move right"
          >
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  )
}

// List Ticket Card Component
function ListTicketCard({
  ticket,
  onEdit,
  onDelete,
  onStatusChange,
}: {
  ticket: Ticket
  onEdit: (ticket: Ticket) => void
  onDelete: (id: string) => void
  onStatusChange: (id: string, status: Ticket['status']) => void
}) {
  const statusConfig = {
    open: { label: 'Open', color: 'bg-blue-100 text-blue-800' },
    in_progress: { label: 'In Progress', color: 'bg-yellow-100 text-yellow-800' },
    resolved: { label: 'Resolved', color: 'bg-green-100 text-green-800' },
    closed: { label: 'Closed', color: 'bg-gray-100 text-gray-800' },
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition-all border border-gray-200">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{ticket.title}</h3>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusConfig[ticket.status].color}`}>
              {statusConfig[ticket.status].label}
            </span>
            <span className={`px-2 py-1 text-xs font-medium rounded border ${priorityColors[ticket.priority]}`}>
              {ticket.priority.toUpperCase()}
            </span>
            <span className="px-2 py-1 text-xs font-medium rounded bg-purple-100 text-purple-700 border border-purple-300">
              {ticket.category.toUpperCase()}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-3">{ticket.description}</p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span>Created by: <strong>{ticket.createdByName || ticket.createdBy}</strong></span>
            </div>
            {ticket.assignedTo && (
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span>Assigned to: <strong>{ticket.assignedTo}</strong></span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{new Date(ticket.createdAt).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</span>
            </div>
            {ticket.comments && ticket.comments.length > 0 && (
              <div className="flex items-center gap-1">
                <MessageSquare className="w-4 h-4" />
                <span>{ticket.comments.length} comment(s)</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <select
            value={ticket.status}
            onChange={(e) => onStatusChange(ticket.id, e.target.value as Ticket['status'])}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          <button
            onClick={() => onEdit(ticket)}
            className="px-3 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={() => onDelete(ticket.id)}
            className="px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

// Create Ticket Modal Component
function CreateTicketModal({ onClose, onCreate, currentUserId, currentUserName }: any) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as Ticket['priority'],
    category: 'other' as Ticket['category'],
    assignedTo: '',
    relatedCandidateId: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await onCreate(formData)
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Create New Ticket</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority *
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as Ticket['priority'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as Ticket['category'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="technical">Technical</option>
                <option value="documentation">Documentation</option>
                <option value="process">Process</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assigned To
              </label>
              <input
                type="text"
                value={formData.assignedTo}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                placeholder="Optional"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Related Candidate ID
              </label>
              <input
                type="text"
                value={formData.relatedCandidateId}
                onChange={(e) => setFormData({ ...formData, relatedCandidateId: e.target.value })}
                placeholder="Optional"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

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
              {loading ? 'Creating...' : 'Create Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
