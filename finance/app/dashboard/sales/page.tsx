'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, TrendingUp, Check, Edit, X } from 'lucide-react'
import { format } from 'date-fns'

interface DailySales {
  id: string
  date: string
  invoiceNumber: string
  customerName: string
  amount: number
  paymentStatus: string
  daysOutstanding: number
}

export default function SalesPage() {
  const [sales, setSales] = useState<DailySales[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<DailySales>>({})

  useEffect(() => {
    fetchSales()
  }, [])

  const fetchSales = () => {
    fetch('/api/sales')
      .then(res => res.ok ? res.json() : [])
      .then(data => setSales(Array.isArray(data) ? data : []))
      .catch(() => setSales([]))
  }

  const handleMarkAsPaid = async (sale: DailySales) => {
    if (!confirm(`Mark sale ${sale.invoiceNumber} as paid?`)) return

    try {
      const response = await fetch(`/api/sales/${sale.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...sale,
          paymentStatus: 'paid',
          daysOutstanding: 0,
        }),
      })

      if (response.ok) {
        fetchSales()
      } else {
        const errorData = await response.json().catch(() => ({}))
        alert(`Failed to update sale: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error: any) {
      console.error('Error updating sale:', error)
      alert(`Error updating sale: ${error.message || 'Unknown error'}`)
    }
  }

  const handleEdit = (sale: DailySales) => {
    setEditingId(sale.id)
    setEditForm({
      invoiceNumber: sale.invoiceNumber,
      customerName: sale.customerName,
      amount: sale.amount,
      date: sale.date.split('T')[0], // Format date for input
      paymentStatus: sale.paymentStatus,
    })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditForm({})
  }

  const handleSaveEdit = async (saleId: string) => {
    try {
      const today = new Date()
      const saleDate = new Date(editForm.date || today)
      const daysOutstanding = Math.floor(
        (today.getTime() - saleDate.getTime()) / (1000 * 60 * 60 * 24)
      )

      const response = await fetch(`/api/sales/${saleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceNumber: editForm.invoiceNumber,
          customerName: editForm.customerName,
          amount: parseFloat(editForm.amount?.toString() || '0'),
          date: editForm.date,
          paymentStatus: editForm.paymentStatus,
          daysOutstanding: editForm.paymentStatus === 'paid' ? 0 : (daysOutstanding > 0 ? daysOutstanding : 0),
        }),
      })

      if (response.ok) {
        setEditingId(null)
        setEditForm({})
        fetchSales()
      } else {
        const errorData = await response.json().catch(() => ({}))
        alert(`Failed to update sale: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error: any) {
      console.error('Error updating sale:', error)
      alert(`Error updating sale: ${error.message || 'Unknown error'}`)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  const totalOutstanding = sales
    .filter((s: DailySales) => s.paymentStatus === 'pending')
    .reduce((sum: number, s: DailySales) => sum + s.amount, 0)

  // Calculate DSO: DSO = Outstanding Amount / Daily Revenue
  // Daily Revenue = Total Revenue / 30 days
  const totalRevenue = sales.reduce((sum: number, s: DailySales) => sum + s.amount, 0)
  const numberOfDays = 30 // Monthly period
  const dailyRevenue = totalRevenue > 0 ? totalRevenue / numberOfDays : 0
  const dso = dailyRevenue > 0 ? Math.round(totalOutstanding / dailyRevenue) : 0

  const averageDaysOutstanding = sales.length > 0
    ? Math.round(sales.reduce((sum: number, s: DailySales) => sum + s.daysOutstanding, 0) / sales.length)
    : 0

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Daily Sales Outstanding</h1>
          <p className="mt-2 text-sm text-gray-600">
            Track sales and outstanding amounts
          </p>
        </div>
        <Link
          href="/dashboard/sales/new"
          className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Sale
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white shadow rounded-lg p-4">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-orange-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Outstanding</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{totalOutstanding.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-blue-500" />
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-500">Days Sales Outstanding (DSO)</p>
              <p className="text-2xl font-bold text-gray-900">
                {dso} days
              </p>
              {totalRevenue > 0 && (
                <div className="text-xs text-gray-600 mt-2 space-y-1 border-t pt-2">
                  <div className="font-medium text-gray-700 mb-1">Calculation:</div>
                  <p>Total Revenue = ₹{(totalRevenue / 100000).toFixed(1)}L</p>
                  <p>Daily Revenue = ₹{(totalRevenue / 100000).toFixed(1)}L ÷ 30 = ₹{(dailyRevenue / 100000).toFixed(1)}L</p>
                  <p className="font-semibold text-gray-800 mt-1">
                    DSO = Total Outstanding ÷ Daily Revenue = {dso} days
                  </p>
                  <p className="text-gray-500 italic">
                    (₹{(totalOutstanding / 100000).toFixed(1)}L ÷ ₹{(dailyRevenue / 100000).toFixed(1)}L)
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Sales</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{sales.reduce((sum: number, s: DailySales) => sum + s.amount, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sales.map((sale: DailySales) => (
          <div key={sale.id} className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                {editingId === sale.id ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Invoice Number</label>
                      <input
                        type="text"
                        value={editForm.invoiceNumber || ''}
                        onChange={(e) => setEditForm({ ...editForm, invoiceNumber: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Customer Name</label>
                      <input
                        type="text"
                        value={editForm.customerName || ''}
                        onChange={(e) => setEditForm({ ...editForm, customerName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Amount</label>
                      <input
                        type="number"
                        step="0.01"
                        value={editForm.amount || ''}
                        onChange={(e) => setEditForm({ ...editForm, amount: parseFloat(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
                      <input
                        type="date"
                        value={editForm.date || ''}
                        onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Payment Status</label>
                      <select
                        value={editForm.paymentStatus || 'pending'}
                        onChange={(e) => setEditForm({ ...editForm, paymentStatus: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                      </select>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => handleSaveEdit(sale.id)}
                        className="flex-1 px-3 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 text-sm font-medium"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <p className="text-lg font-semibold text-indigo-600">
                        {sale.invoiceNumber}
                      </p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(sale.paymentStatus)}`}>
                        {sale.paymentStatus}
                      </span>
                      {sale.daysOutstanding > 0 && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          {sale.daysOutstanding} days
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Customer:</span> {sale.customerName}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Date:</span> {format(new Date(sale.date), 'MMM dd, yyyy')}
                    </p>
                  </>
                )}
              </div>
              {editingId !== sale.id && (
                <button
                  onClick={() => handleEdit(sale)}
                  className="text-gray-600 hover:text-gray-900 p-1 hover:bg-gray-50 rounded"
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </button>
              )}
            </div>
            
            {editingId !== sale.id && (
              <div className="border-t pt-4 mt-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Sale Amount</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₹{sale.amount.toLocaleString()}
                  </p>
                  {sale.daysOutstanding > 0 && (
                    <p className="text-xs text-red-600 mt-2">
                      Outstanding for {sale.daysOutstanding} {sale.daysOutstanding === 1 ? 'day' : 'days'}
                    </p>
                  )}
                </div>
                {sale.paymentStatus === 'pending' && (
                  <div className="mt-4 pt-4 border-t">
                    <button
                      onClick={() => handleMarkAsPaid(sale)}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Mark as Paid
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        {sales.length === 0 && (
          <div className="col-span-full text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">No sales records found</p>
          </div>
        )}
      </div>
    </div>
  )
}
