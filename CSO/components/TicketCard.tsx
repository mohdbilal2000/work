'use client'

import { Ticket } from '@/lib/types'
import { Edit, Trash2, MessageSquare, User, Calendar, AlertCircle } from 'lucide-react'

interface TicketCardProps {
  ticket: Ticket
  onEdit: (ticket: Ticket) => void
  onDelete: (id: string) => void
}

const statusColors = {
  open: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800',
}

const priorityColors = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
}

export default function TicketCard({ ticket, onEdit, onDelete }: TicketCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {ticket.title}
          </h3>
          <div className="flex items-center gap-4 mb-2">
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full ${
                statusColors[ticket.status]
              }`}
            >
              {ticket.status.replace('_', ' ').toUpperCase()}
            </span>
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full ${
                priorityColors[ticket.priority]
              }`}
            >
              {ticket.priority.toUpperCase()}
            </span>
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700">
              {ticket.category.toUpperCase()}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(ticket)}
            className="px-3 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 flex items-center justify-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={() => onDelete(ticket.id)}
            className="px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
        {ticket.description}
      </p>

      <div className="space-y-2 text-xs text-gray-600">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4" />
          <span>Created by: <strong>{ticket.createdByName || ticket.createdBy}</strong></span>
        </div>
        {ticket.assignedTo && (
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>Assigned to: <strong>{ticket.assignedTo}</strong></span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <span>Created: {new Date(ticket.createdAt).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</span>
        </div>
        {ticket.comments && ticket.comments.length > 0 && (
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            <span>{ticket.comments.length} comment(s)</span>
          </div>
        )}
        {ticket.attachments && ticket.attachments.length > 0 && (
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{ticket.attachments.length} attachment(s)</span>
          </div>
        )}
      </div>
    </div>
  )
}

