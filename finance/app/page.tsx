'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Receipt, 
  CreditCard, 
  Users, 
  FileCheck, 
  TrendingUp, 
  DollarSign,
  BookOpen,
  BarChart3
} from 'lucide-react'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to dashboard
    router.push('/dashboard')
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Finance Portal
          </h1>
          <p className="text-xl text-gray-600">
            Comprehensive Financial Management System
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <ModuleCard
            title="Receivable Management"
            icon={<Receipt className="w-8 h-8" />}
            href="/dashboard/receivables"
            color="bg-blue-500"
          />
          <ModuleCard
            title="Expense Management"
            icon={<CreditCard className="w-8 h-8" />}
            href="/dashboard/expenses"
            color="bg-red-500"
          />
          <ModuleCard
            title="Payroll Accuracy"
            icon={<Users className="w-8 h-8" />}
            href="/dashboard/payroll"
            color="bg-green-500"
          />
          <ModuleCard
            title="Compliance Challans"
            icon={<FileCheck className="w-8 h-8" />}
            href="/dashboard/compliance"
            color="bg-purple-500"
          />
          <ModuleCard
            title="Daily Sales Outstanding"
            icon={<TrendingUp className="w-8 h-8" />}
            href="/dashboard/sales"
            color="bg-orange-500"
          />
          <ModuleCard
            title="Net Cash Flow"
            icon={<DollarSign className="w-8 h-8" />}
            href="/dashboard/cashflow"
            color="bg-teal-500"
          />
          <ModuleCard
            title="Day Book"
            icon={<BookOpen className="w-8 h-8" />}
            href="/dashboard/daybook"
            color="bg-indigo-500"
          />
          <ModuleCard
            title="Dashboard"
            icon={<BarChart3 className="w-8 h-8" />}
            href="/dashboard"
            color="bg-gray-500"
          />
        </div>
      </div>
    </div>
  )
}

function ModuleCard({ title, icon, href, color }: {
  title: string
  icon: React.ReactNode
  href: string
  color: string
}) {
  return (
    <Link href={href}>
      <div className={`${color} rounded-lg p-6 text-white hover:shadow-xl transition-shadow cursor-pointer transform hover:scale-105`}>
        <div className="mb-4">{icon}</div>
        <h3 className="text-xl font-semibold">{title}</h3>
      </div>
    </Link>
  )
}

