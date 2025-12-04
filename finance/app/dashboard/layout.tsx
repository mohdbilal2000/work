'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Receipt, 
  CreditCard, 
  Users, 
  FileCheck, 
  TrendingUp, 
  DollarSign,
  BookOpen,
  BarChart3,
  Home
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
  { name: 'Receivables', href: '/dashboard/receivables', icon: Receipt },
  { name: 'Expenses', href: '/dashboard/expenses', icon: CreditCard },
  { name: 'Payroll', href: '/dashboard/payroll', icon: Users },
  { name: 'Compliance', href: '/dashboard/compliance', icon: FileCheck },
  { name: 'Sales Outstanding', href: '/dashboard/sales', icon: TrendingUp },
  { name: 'Cash Flow', href: '/dashboard/cashflow', icon: DollarSign },
  { name: 'Day Book', href: '/dashboard/daybook', icon: BookOpen },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/dashboard" className="text-2xl font-bold text-primary-600">
                  Finance Portal
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navigation.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                        isActive
                          ? 'border-primary-500 text-gray-900'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {item.name}
                    </Link>
                  )
                })}
              </div>
            </div>
            <div className="flex items-center">
              <Link
                href="/"
                className="text-gray-500 hover:text-gray-700"
              >
                <Home className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}

