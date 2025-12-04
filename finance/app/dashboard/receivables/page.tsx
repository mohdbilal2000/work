'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Edit, Trash2, Eye, Check } from 'lucide-react'
import { format } from 'date-fns'

interface Payment {
  id: string
  amount: number
  paymentDate: string
  transactionId: string
  createdAt: string
}

interface Receivable {
  id: string
  invoiceNumber: string
  customerName: string
  amount: number
  dueDate: string
  status: string
  paidAmount: number
  payments?: Payment[]
}

export default function ReceivablesPage() {
  const [receivables, setReceivables] = useState<Receivable[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [paymentAmounts, setPaymentAmounts] = useState<{ [key: string]: string }>({})
  const [paymentDates, setPaymentDates] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    // Force stop loading after 2 seconds maximum
    const maxLoadingTimer = setTimeout(() => {
      setLoading(false)
    }, 2000)

    fetchReceivables()

    return () => {
      clearTimeout(maxLoadingTimer)
    }
  }, [])

  const fetchReceivables = async () => {
    try {
      const response = await fetch('/api/receivables')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      const receivables = Array.isArray(data) ? data : []
      
      // If payments are missing, try to fetch them individually
      const receivablesWithPayments = await Promise.all(
        receivables.map(async (receivable: Receivable) => {
          // If payments array is missing or empty but paidAmount > 0, try to fetch payments
          if ((!receivable.payments || receivable.payments.length === 0) && receivable.paidAmount > 0) {
            try {
              const paymentsResponse = await fetch(`/api/receivables/${receivable.id}/payments`)
              if (paymentsResponse.ok) {
                const payments = await paymentsResponse.json()
                return { ...receivable, payments: Array.isArray(payments) ? payments : [] }
              }
            } catch (err) {
              console.warn(`Could not fetch payments for receivable ${receivable.id}:`, err)
            }
          }
          return receivable
        })
      )
      
      setReceivables(receivablesWithPayments)
    } catch (error) {
      console.error('Error fetching receivables:', error)
      setReceivables([])
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this receivable?')) return
    
    try {
      await fetch(`/api/receivables/${id}`, { method: 'DELETE' })
      fetchReceivables()
    } catch (error) {
      console.error('Error deleting receivable:', error)
    }
  }

  const handlePaymentUpdate = async (receivable: Receivable) => {
    const paymentInput = paymentAmounts[receivable.id] || '0'
    const paymentValue = parseFloat(paymentInput)
    const paymentDate = paymentDates[receivable.id] || new Date().toISOString().split('T')[0]
    
    if (isNaN(paymentValue) || paymentValue < 0) {
      alert('Please enter a valid payment amount')
      return
    }

    if (!paymentDate) {
      alert('Please select a payment date')
      return
    }

    const newPaidAmount = receivable.paidAmount + paymentValue
    
    if (newPaidAmount > receivable.amount) {
      alert('Payment amount cannot exceed total amount')
      return
    }

    // Determine status based on payment
    let newStatus = 'pending'
    if (newPaidAmount >= receivable.amount) {
      newStatus = 'paid'
    } else if (newPaidAmount > 0) {
      newStatus = 'partial'
    }

    // Check if overdue
    const dueDate = new Date(receivable.dueDate)
    const today = new Date()
    if (newStatus !== 'paid' && dueDate < today) {
      newStatus = 'overdue'
    }

    try {
      // Use dedicated payment endpoint
      const response = await fetch(`/api/receivables/${receivable.id}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: paymentValue,
          paymentDate: paymentDate,
        }),
      })

      if (response.ok) {
        const updatedReceivable = await response.json()
        console.log('Payment added successfully:', updatedReceivable)
        setPaymentAmounts({ ...paymentAmounts, [receivable.id]: '' })
        setPaymentDates({ ...paymentDates, [receivable.id]: '' })
        setEditingId(null)
        // Refresh receivables to show updated payment history
        setTimeout(() => {
          fetchReceivables()
        }, 500)
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('Payment error:', errorData)
        alert(`Failed to add payment: ${errorData.error || 'Unknown error'}. ${errorData.details ? `Details: ${errorData.details}` : ''}`)
      }
    } catch (error: any) {
      console.error('Error updating payment:', error)
      alert(`Error adding payment: ${error.message || 'Unknown error'}`)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'overdue':
        return 'bg-red-100 text-red-800'
      case 'partial':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Receivable Management</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your accounts receivable
          </p>
        </div>
        <Link
          href="/dashboard/receivables/new"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Receivable
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {receivables.map((receivable) => (
          <div key={receivable.id} className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-lg font-semibold text-indigo-600">
                    {receivable.invoiceNumber}
                  </p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(receivable.status)}`}>
                    {receivable.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-medium">Customer:</span> {receivable.customerName}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Due:</span> {format(new Date(receivable.dueDate), 'MMM dd, yyyy')}
                </p>
              </div>
              <button
                onClick={() => handleDelete(receivable.id)}
                className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                title="Delete"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            
            <div className="border-t pt-4 mt-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Total Amount</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₹{receivable.amount.toLocaleString()}
                  </p>
                </div>
                {receivable.paidAmount > 0 && (
                  <div className="text-right">
                    <p className="text-xs text-gray-500 mb-1">Paid</p>
                    <p className="text-lg font-semibold text-green-600">
                      ₹{receivable.paidAmount.toLocaleString()}
                    </p>
                    {receivable.paidAmount < receivable.amount && (
                      <p className="text-xs text-red-600 mt-1">
                        Outstanding: ₹{(receivable.amount - receivable.paidAmount).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}
              </div>
              
              {/* Payment History */}
              {receivable.paidAmount > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs font-medium text-gray-700 mb-2">
                    Payment History ({receivable.payments && Array.isArray(receivable.payments) ? receivable.payments.length : 0} payment{receivable.payments && receivable.payments.length !== 1 ? 's' : ''})
                  </p>
                  {receivable.payments && Array.isArray(receivable.payments) && receivable.payments.length > 0 ? (
                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                      {receivable.payments.map((payment, index) => (
                        <div key={payment.id || index} className="bg-green-50 border border-green-100 p-2.5 rounded">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                              <span className="font-semibold text-gray-800 text-sm">
                                ₹{payment.amount.toLocaleString()}
                              </span>
                            </div>
                            <div className="text-gray-600 text-xs">
                              {format(new Date(payment.paymentDate), 'MMM dd, yyyy')}
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            <span className="font-medium">Transaction ID:</span> {payment.transactionId || payment.id}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500 italic bg-gray-50 p-2 rounded">
                      No payment records found (Total paid: ₹{receivable.paidAmount.toLocaleString()})
                    </div>
                  )}
                </div>
              )}

              {receivable.paidAmount < receivable.amount && (
                <div className="mt-3 pt-3 border-t">
                  {editingId === receivable.id ? (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="number"
                          placeholder="Enter payment amount"
                          value={paymentAmounts[receivable.id] || ''}
                          onChange={(e) => setPaymentAmounts({ ...paymentAmounts, [receivable.id]: e.target.value })}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min="0"
                          max={receivable.amount - receivable.paidAmount}
                        />
                        <button
                          onClick={() => handlePaymentUpdate(receivable)}
                          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-1"
                        >
                          <Check className="w-4 h-4" />
                          Add
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(null)
                            setPaymentAmounts({ ...paymentAmounts, [receivable.id]: '' })
                            setPaymentDates({ ...paymentDates, [receivable.id]: '' })
                          }}
                          className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                        >
                          Cancel
                        </button>
                      </div>
                      <input
                        type="date"
                        placeholder="Payment date"
                        value={paymentDates[receivable.id] || new Date().toISOString().split('T')[0]}
                        onChange={(e) => setPaymentDates({ ...paymentDates, [receivable.id]: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-500">
                        Max: ₹{(receivable.amount - receivable.paidAmount).toLocaleString()}
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={() => setEditingId(receivable.id)}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                    >
                      Add Payment
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        {receivables.length === 0 && (
          <div className="col-span-full text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">No receivables found</p>
          </div>
        )}
      </div>
    </div>
  )
}

