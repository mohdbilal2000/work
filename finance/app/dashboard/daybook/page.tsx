'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Upload, FileText } from 'lucide-react'
import { format } from 'date-fns'

interface DayBookEntry {
  id: string
  date: string
  type: string
  category: string
  description: string
  amount: number
  source: string
  reference: string | null
}

export default function DayBookPage() {
  const [entries, setEntries] = useState<DayBookEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Force stop loading after 2 seconds maximum
    const maxLoadingTimer = setTimeout(() => {
      setLoading(false)
    }, 2000)

    fetchEntries()

    return () => {
      clearTimeout(maxLoadingTimer)
    }
  }, [])

  const fetchEntries = async () => {
    try {
      const response = await fetch('/api/daybook')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setEntries(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching day book entries:', error)
      setEntries([])
    } finally {
      setLoading(false)
    }
  }

  const totalIncome = entries
    .filter(e => e.type === 'income')
    .reduce((sum, e) => sum + e.amount, 0)

  const totalExpense = entries
    .filter(e => e.type === 'expense')
    .reduce((sum, e) => sum + e.amount, 0)

  const netAmount = totalIncome - totalExpense

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Day Book</h1>
          <p className="mt-2 text-sm text-gray-600">
            Daily financial entries and Vyapar imports
          </p>
        </div>
        <div className="flex space-x-3">
          <Link
            href="/dashboard/daybook/upload"
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            <Upload className="w-5 h-5 mr-2" />
            Upload Vyapar
          </Link>
          <Link
            href="/dashboard/daybook/new"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Entry
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white shadow rounded-lg p-4">
          <div className="flex items-center">
            <FileText className="w-8 h-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Income</p>
              <p className="text-2xl font-bold text-green-600">
                ₹{totalIncome.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <div className="flex items-center">
            <FileText className="w-8 h-8 text-red-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Expense</p>
              <p className="text-2xl font-bold text-red-600">
                ₹{totalExpense.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <div className="flex items-center">
            <FileText className="w-8 h-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Net Amount</p>
              <p className={`text-2xl font-bold ${netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ₹{netAmount.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {entries.map((entry) => (
            <li key={entry.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-md ${entry.type === 'income' ? 'bg-green-100' : 'bg-red-100'}`}>
                      <FileText className={`w-5 h-5 ${entry.type === 'income' ? 'text-green-600' : 'text-red-600'}`} />
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-gray-900">
                          {entry.description}
                        </p>
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {entry.category}
                        </span>
                        {entry.source === 'vyapar' && (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            Vyapar
                          </span>
                        )}
                        {entry.reference && (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {entry.reference}
                          </span>
                        )}
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            Date: {format(new Date(entry.date), 'MMM dd, yyyy')}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <p className={`text-lg font-semibold ${entry.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                            {entry.type === 'income' ? '+' : '-'}₹{entry.amount.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
        {entries.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No day book entries found</p>
          </div>
        )}
      </div>
    </div>
  )
}

