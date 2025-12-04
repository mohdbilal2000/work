'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { format } from 'date-fns'

interface CashFlow {
  id: string
  date: string
  type: string
  category: string
  description: string
  amount: number
  balance: number
}

export default function CashFlowPage() {
  const [cashflows, setCashflows] = useState<CashFlow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Force stop loading after 2 seconds maximum
    const maxLoadingTimer = setTimeout(() => {
      setLoading(false)
    }, 2000)

    fetchCashFlow()

    return () => {
      clearTimeout(maxLoadingTimer)
    }
  }, [])

  const fetchCashFlow = async () => {
    try {
      const response = await fetch('/api/cashflow')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setCashflows(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching cash flow:', error)
      setCashflows([])
    } finally {
      setLoading(false)
    }
  }

  const totalInflow = cashflows
    .filter(cf => cf.type === 'inflow')
    .reduce((sum, cf) => sum + cf.amount, 0)

  const totalOutflow = cashflows
    .filter(cf => cf.type === 'outflow')
    .reduce((sum, cf) => sum + cf.amount, 0)

  const netCashFlow = totalInflow - totalOutflow
  const currentBalance = cashflows.length > 0 
    ? cashflows[0].balance 
    : 0

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Net Cash Flow</h1>
          <p className="mt-2 text-sm text-gray-600">
            Track your cash inflows and outflows
          </p>
        </div>
        <Link
          href="/dashboard/cashflow/new"
          className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Entry
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white shadow rounded-lg p-4">
          <div className="flex items-center">
            <ArrowUpRight className="w-8 h-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Inflow</p>
              <p className="text-2xl font-bold text-green-600">
                ₹{totalInflow.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <div className="flex items-center">
            <ArrowDownRight className="w-8 h-8 text-red-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Outflow</p>
              <p className="text-2xl font-bold text-red-600">
                ₹{totalOutflow.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <div className="flex items-center">
            <ArrowUpRight className="w-8 h-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Net Cash Flow</p>
              <p className={`text-2xl font-bold ${netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ₹{netCashFlow.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <div className="flex items-center">
            <ArrowUpRight className="w-8 h-8 text-indigo-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Current Balance</p>
              <p className={`text-2xl font-bold ${currentBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ₹{currentBalance.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {cashflows.map((cf) => (
            <li key={cf.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-md ${cf.type === 'inflow' ? 'bg-green-100' : 'bg-red-100'}`}>
                      {cf.type === 'inflow' ? (
                        <ArrowUpRight className="w-5 h-5 text-green-600" />
                      ) : (
                        <ArrowDownRight className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-gray-900">
                          {cf.description}
                        </p>
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {cf.category}
                        </span>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            Date: {format(new Date(cf.date), 'MMM dd, yyyy')}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <p className={`text-lg font-semibold ${cf.type === 'inflow' ? 'text-green-600' : 'text-red-600'}`}>
                            {cf.type === 'inflow' ? '+' : '-'}₹{cf.amount.toLocaleString()}
                          </p>
                          <p className="ml-4 text-sm text-gray-500">
                            Balance: ₹{cf.balance.toLocaleString()}
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
        {cashflows.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No cash flow entries found</p>
          </div>
        )}
      </div>
    </div>
  )
}

