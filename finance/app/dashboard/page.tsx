'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { 
  Receipt, 
  CreditCard, 
  Users, 
  FileCheck, 
  TrendingUp, 
  DollarSign,
  BookOpen,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalReceivables: 0,
    totalExpenses: 0,
    pendingPayroll: 0,
    complianceDue: 0,
    salesOutstanding: 0,
    netCashFlow: 0,
    dayBookEntries: 0,
  })

  useEffect(() => {
    // Fetch dashboard stats
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // This would fetch from your API
      // For now, using placeholder data
      setStats({
        totalReceivables: 125000,
        totalExpenses: 45000,
        pendingPayroll: 8,
        complianceDue: 3,
        salesOutstanding: 85000,
        netCashFlow: 80000,
        dayBookEntries: 156,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const statCards = [
    {
      title: 'Total Receivables',
      value: `₹${stats.totalReceivables.toLocaleString()}`,
      icon: <Receipt className="w-6 h-6" />,
      color: 'bg-blue-500',
      href: '/dashboard/receivables',
    },
    {
      title: 'Total Expenses',
      value: `₹${stats.totalExpenses.toLocaleString()}`,
      icon: <CreditCard className="w-6 h-6" />,
      color: 'bg-red-500',
      href: '/dashboard/expenses',
    },
    {
      title: 'Pending Payroll',
      value: `${stats.pendingPayroll} employees`,
      icon: <Users className="w-6 h-6" />,
      color: 'bg-green-500',
      href: '/dashboard/payroll',
    },
    {
      title: 'Compliance Due',
      value: `${stats.complianceDue} challans`,
      icon: <FileCheck className="w-6 h-6" />,
      color: 'bg-purple-500',
      href: '/dashboard/compliance',
    },
    {
      title: 'Sales Outstanding',
      value: `₹${stats.salesOutstanding.toLocaleString()}`,
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'bg-orange-500',
      href: '/dashboard/sales',
    },
    {
      title: 'Net Cash Flow',
      value: `₹${stats.netCashFlow.toLocaleString()}`,
      icon: <DollarSign className="w-6 h-6" />,
      color: 'bg-teal-500',
      href: '/dashboard/cashflow',
      trend: stats.netCashFlow > 0 ? 'up' : 'down',
    },
    {
      title: 'Day Book Entries',
      value: `${stats.dayBookEntries} entries`,
      icon: <BookOpen className="w-6 h-6" />,
      color: 'bg-indigo-500',
      href: '/dashboard/daybook',
    },
  ]

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          Overview of your financial operations
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card) => (
          <Link key={card.title} href={card.href}>
            <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow cursor-pointer">
              <div className="p-5">
                <div className="flex items-center">
                  <div className={`${card.color} p-3 rounded-md text-white`}>
                    {card.icon}
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {card.title}
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {card.value}
                        </div>
                        {card.trend && (
                          <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                            card.trend === 'up' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {card.trend === 'up' ? (
                              <ArrowUpRight className="w-4 h-4" />
                            ) : (
                              <ArrowDownRight className="w-4 h-4" />
                            )}
                          </div>
                        )}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/dashboard/receivables/new"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-center"
            >
              Add Receivable
            </Link>
            <Link
              href="/dashboard/expenses/new"
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-center"
            >
              Add Expense
            </Link>
            <Link
              href="/dashboard/daybook/new"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-center"
            >
              Add Day Book Entry
            </Link>
            <Link
              href="/dashboard/daybook/upload"
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-center"
            >
              Upload Vyapar File
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

