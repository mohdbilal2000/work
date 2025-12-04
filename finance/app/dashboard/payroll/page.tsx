'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import {
  CheckCircle,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  XCircle,
} from 'lucide-react'

const HR_API_BASE =
  process.env.NEXT_PUBLIC_HR_API_URL ?? 'https://api-hr.defitex2.0.org/api'
const INTERNAL_PAYROLL_ENDPOINT = `${HR_API_BASE}/interior-payroll`

interface Payroll {
  id: string
  employeeId: string
  employeeName: string
  month: number
  year: number
  basicSalary: number
  allowances: number
  deductions: number
  netSalary: number
  status: string
  isDisclosed: boolean
}

interface InteriorPayrollRecord {
  id: number
  employee_id: string
  employee_name: string
  department: string | null
  designation: string | null
  pay_period: string | null
  pay_month: string
  pay_year: string
  basic_salary: number
  allowances: number
  deductions: number
  net_salary: number
  payment_status: string
  payment_date: string | null
  payment_method: string | null
  bank_account: string | null
  ifsc_code: string | null
  remarks: string | null
  status: string
}

interface PayrollFormState {
  employee_id: string
  employee_name: string
  department: string
  designation: string
  pay_period: string
  pay_month: string
  pay_year: string
  basic_salary: string
  allowances: string
  deductions: string
  net_salary: string
  payment_status: string
  payment_date: string
  payment_method: string
  bank_account: string
  ifsc_code: string
  remarks: string
  status: string
}

export default function PayrollPage() {
  return (
    <div className="px-4 py-6 sm:px-0 space-y-10">
      <DisclosurePanel />
      <InternalPayrollPanel />
    </div>
  )
}

function DisclosurePanel() {
  const [payrolls, setPayrolls] = useState<Payroll[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const maxLoadingTimer = setTimeout(() => {
      setLoading(false)
    }, 2000)

    fetchPayrolls()

    return () => {
      clearTimeout(maxLoadingTimer)
    }
  }, [])

  const fetchPayrolls = async () => {
    try {
      const response = await fetch('/api/payroll')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setPayrolls(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching payrolls:', error)
      setPayrolls([])
    } finally {
      setLoading(false)
    }
  }

  const handleToggleDisclosure = async (id: string, currentStatus: boolean) => {
    try {
      await fetch(`/api/payroll/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDisclosed: !currentStatus }),
      })
      fetchPayrolls()
    } catch (error) {
      console.error('Error updating disclosure:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'processed':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  if (loading) {
    return <div className="p-6 bg-white shadow rounded-lg">Loading payroll...</div>
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payroll Accuracy & Disclosure</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage finance-owned payroll disclosures and approvals
          </p>
        </div>
        <Link
          href="/dashboard/payroll/new"
          className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Payroll
        </Link>
      </div>

      <div className="bg-white border rounded-lg">
        <ul className="divide-y divide-gray-200">
          {payrolls.map((payroll) => (
            <li key={payroll.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium text-gray-900">
                        {payroll.employeeName} ({payroll.employeeId})
                      </p>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          payroll.status,
                        )}`}
                      >
                        {payroll.status}
                      </span>
                      {payroll.isDisclosed ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Disclosed
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Not Disclosed
                        </span>
                      )}
                    </div>
                    <div className="mt-3 grid gap-3 text-sm text-gray-600 sm:grid-cols-2 lg:grid-cols-4">
                      <p>Period: {monthNames[payroll.month - 1]} {payroll.year}</p>
                      <p>Basic: ₹{payroll.basicSalary.toLocaleString()}</p>
                      <p>Allowances: ₹{payroll.allowances.toLocaleString()}</p>
                      <p>Deductions: ₹{payroll.deductions.toLocaleString()}</p>
                    </div>
                    <p className="mt-2 text-lg font-semibold text-gray-900">
                      Net: ₹{payroll.netSalary.toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggleDisclosure(payroll.id, payroll.isDisclosed)}
                    className={`p-2 rounded-md ${
                      payroll.isDisclosed
                        ? 'text-green-600 hover:bg-green-50'
                        : 'text-red-600 hover:bg-red-50'
                    }`}
                    title={payroll.isDisclosed ? 'Mark as Not Disclosed' : 'Mark as Disclosed'}
                  >
                    {payroll.isDisclosed ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
        {payrolls.length === 0 && (
          <div className="text-center py-12 text-gray-500">No payroll records found</div>
        )}
      </div>
    </div>
  )
}

function InternalPayrollPanel() {
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 6 }, (_, idx) => String(currentYear - idx))

  const newFormState = (): PayrollFormState => ({
    employee_id: '',
    employee_name: '',
    department: '',
    designation: '',
    pay_period: '',
    pay_month: months[new Date().getMonth()],
    pay_year: String(currentYear),
    basic_salary: '',
    allowances: '',
    deductions: '',
    net_salary: '',
    payment_status: 'pending',
    payment_date: '',
    payment_method: '',
    bank_account: '',
    ifsc_code: '',
    remarks: '',
    status: 'active',
  })

  const [records, setRecords] = useState<InteriorPayrollRecord[]>([])
  const [filters, setFilters] = useState({
    pay_month: '',
    pay_year: '',
    department: '',
    payment_status: '',
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<InteriorPayrollRecord | null>(null)
  const [formData, setFormData] = useState<PayrollFormState>(() => newFormState())
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let ignore = false
    const fetchRecords = async () => {
      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams()
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, value)
        })
        const query = params.toString()
        const response = await fetch(
          `${INTERNAL_PAYROLL_ENDPOINT}${query ? `?${query}` : ''}`,
        )
        const payload = await response.json()
        if (!ignore) {
          if (payload.success) {
            setRecords(payload.data || [])
          } else {
            throw new Error(payload.error || 'Unable to load payroll records')
          }
        }
      } catch (err) {
        if (!ignore) {
          console.error(err)
          setRecords([])
          setError(
            err instanceof Error
              ? err.message
              : 'Unable to reach HR Admin API. Please start the HR backend (port 3001).',
          )
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }
    fetchRecords()
    return () => {
      ignore = true
    }
  }, [filters])

  const departments = useMemo(
    () => Array.from(new Set(records.map((record) => record.department).filter(Boolean))) as string[],
    [records],
  )

  const summary = useMemo(() => {
    const totalNet = records.reduce((sum, record) => sum + (record.net_salary || 0), 0)
    const pending = records.filter((record) => record.payment_status === 'pending').length
    const processing = records.filter((record) => record.payment_status === 'processing').length
    const paid = records.filter((record) => record.payment_status === 'paid').length
    return { totalNet, pending, processing, paid }
  }, [records])

  const handleFilterChange = (name: string, value: string) => {
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const resetFilters = () => {
    setFilters({
      pay_month: '',
      pay_year: '',
      department: '',
      payment_status: '',
    })
  }

  const openAddModal = () => {
    setEditingRecord(null)
    setFormData(newFormState())
    setModalOpen(true)
  }

  const openEditModal = (record: InteriorPayrollRecord) => {
    setEditingRecord(record)
    setFormData({
      employee_id: record.employee_id || '',
      employee_name: record.employee_name || '',
      department: record.department || '',
      designation: record.designation || '',
      pay_period: record.pay_period || '',
      pay_month: record.pay_month || months[new Date().getMonth()],
      pay_year: record.pay_year || String(currentYear),
      basic_salary: record.basic_salary?.toString() || '',
      allowances: record.allowances?.toString() || '',
      deductions: record.deductions?.toString() || '',
      net_salary: record.net_salary?.toString() || '',
      payment_status: record.payment_status || 'pending',
      payment_date: record.payment_date ? record.payment_date.split('T')[0] : '',
      payment_method: record.payment_method || '',
      bank_account: record.bank_account || '',
      ifsc_code: record.ifsc_code || '',
      remarks: record.remarks || '',
      status: record.status || 'active',
    })
    setModalOpen(true)
  }

  const handleInputChange = (name: keyof PayrollFormState, value: string) => {
    setFormData((prev) => {
      const next = { ...prev, [name]: value }
      if (['basic_salary', 'allowances', 'deductions'].includes(name)) {
        const basic = parseFloat(name === 'basic_salary' ? value : prev.basic_salary) || 0
        const allowances = parseFloat(name === 'allowances' ? value : prev.allowances) || 0
        const deductions = parseFloat(name === 'deductions' ? value : prev.deductions) || 0
        next.net_salary = (basic + allowances - deductions).toFixed(2)
      }
      return next
    })
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    try {
      const payload = {
        employee_id: formData.employee_id,
        employee_name: formData.employee_name,
        department: formData.department || null,
        designation: formData.designation || null,
        pay_period: formData.pay_period || null,
        pay_month: formData.pay_month,
        pay_year: formData.pay_year,
        basic_salary: parseFloat(formData.basic_salary) || 0,
        allowances: parseFloat(formData.allowances) || 0,
        deductions: parseFloat(formData.deductions) || 0,
        net_salary: parseFloat(formData.net_salary) || 0,
        payment_status: formData.payment_status,
        payment_date: formData.payment_date || null,
        payment_method: formData.payment_method || null,
        bank_account: formData.bank_account || null,
        ifsc_code: formData.ifsc_code || null,
        remarks: formData.remarks || null,
        status: formData.status,
      }

      const endpoint = editingRecord
        ? `${INTERNAL_PAYROLL_ENDPOINT}/${editingRecord.id}`
        : INTERNAL_PAYROLL_ENDPOINT
      const method = editingRecord ? 'PUT' : 'POST'

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error || 'Unable to save payroll record')
      }
      setModalOpen(false)
      setEditingRecord(null)
      setFormData(newFormState())
      setFilters((prev) => ({ ...prev })) // trigger reload
    } catch (err) {
      console.error(err)
      alert(err instanceof Error ? err.message : 'Failed to save payroll record')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (record: InteriorPayrollRecord) => {
    if (!window.confirm(`Delete payroll entry for ${record.employee_name}?`)) return
    try {
      const response = await fetch(`${INTERNAL_PAYROLL_ENDPOINT}/${record.id}`, {
        method: 'DELETE',
      })
      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error || 'Unable to delete payroll record')
      }
      setFilters((prev) => ({ ...prev }))
    } catch (err) {
      console.error(err)
      alert(err instanceof Error ? err.message : 'Failed to delete payroll record')
    }
  }

  return (
    <section className="bg-white shadow rounded-lg p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Internal Payroll (HR → Finance)</h2>
          <p className="text-sm text-gray-600">
            Live data fetched from the HR Admin API (https://api-hr.defitex2.0.org). Add, edit or audit payroll
            entries without leaving the finance portal.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setFilters((prev) => ({ ...prev }))}
            className="inline-flex items-center rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </button>
          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add payroll
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <div className="rounded-lg bg-indigo-50 p-4">
          <p className="text-sm text-indigo-700">Net payroll (filtered)</p>
          <p className="mt-1 text-2xl font-semibold text-indigo-900">
            ₹{summary.totalNet.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
        </div>
        <div className="rounded-lg bg-yellow-50 p-4">
          <p className="text-sm text-yellow-700">Pending payouts</p>
          <p className="mt-1 text-2xl font-semibold text-yellow-900">{summary.pending}</p>
        </div>
        <div className="rounded-lg bg-blue-50 p-4">
          <p className="text-sm text-blue-700">Processing</p>
          <p className="mt-1 text-2xl font-semibold text-blue-900">{summary.processing}</p>
        </div>
        <div className="rounded-lg bg-green-50 p-4">
          <p className="text-sm text-green-700">Paid</p>
          <p className="mt-1 text-2xl font-semibold text-green-900">{summary.paid}</p>
        </div>
      </div>

      <div className="mt-6 space-y-3 rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Filters</h3>
          <button
            type="button"
            onClick={resetFilters}
            className="text-xs font-medium text-indigo-600 hover:underline"
          >
            Clear all
          </button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="text-xs font-medium text-gray-600">Pay month</label>
            <select
              value={filters.pay_month}
              onChange={(event) => handleFilterChange('pay_month', event.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">All months</option>
              {months.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Pay year</label>
            <select
              value={filters.pay_year}
              onChange={(event) => handleFilterChange('pay_year', event.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">All years</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Department</label>
            <select
              value={filters.department}
              onChange={(event) => handleFilterChange('department', event.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">All departments</option>
              {departments.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Payment status</label>
            <select
              value={filters.payment_status}
              onChange={(event) => handleFilterChange('payment_status', event.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="paid">Paid</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-gray-200">
        {loading ? (
          <div className="flex items-center justify-center gap-2 p-6 text-gray-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading internal payroll...
          </div>
        ) : records.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No payroll records match the selected filters.</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Employee</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Pay period</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Net salary</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Payment status</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Payment date</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {records.map((record) => (
                <tr key={record.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{record.employee_name}</p>
                    <p className="text-xs text-gray-500">
                      {record.employee_id} {record.department ? `• ${record.department}` : ''}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p>
                      {record.pay_month} {record.pay_year}
                    </p>
                    {record.pay_period && <p className="text-xs text-gray-500">{record.pay_period}</p>}
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-900">
                    ₹{(record.net_salary || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        record.payment_status === 'paid'
                          ? 'bg-green-100 text-green-800'
                          : record.payment_status === 'processing'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {record.payment_status || 'pending'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {record.payment_date ? format(new Date(record.payment_date), 'dd MMM yyyy') : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        className="rounded-md border border-gray-200 p-2 text-gray-700 hover:bg-gray-50"
                        onClick={() => openEditModal(record)}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        className="rounded-md border border-gray-200 p-2 text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(record)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8">
          <div className="w-full max-w-4xl rounded-lg bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingRecord ? 'Update payroll entry' : 'Add payroll entry'}
                </h3>
                <p className="text-sm text-gray-500">Changes sync directly to the HR Admin database.</p>
              </div>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => {
                  setModalOpen(false)
                  setEditingRecord(null)
                }}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="max-h-[75vh] overflow-y-auto px-6 py-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-gray-600">Employee ID *</label>
                  <input
                    required
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    value={formData.employee_id}
                    onChange={(event) => handleInputChange('employee_id', event.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600">Employee name *</label>
                  <input
                    required
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    value={formData.employee_name}
                    onChange={(event) => handleInputChange('employee_name', event.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600">Department</label>
                  <input
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    value={formData.department}
                    onChange={(event) => handleInputChange('department', event.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600">Designation</label>
                  <input
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    value={formData.designation}
                    onChange={(event) => handleInputChange('designation', event.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600">Pay month *</label>
                  <select
                    required
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    value={formData.pay_month}
                    onChange={(event) => handleInputChange('pay_month', event.target.value)}
                  >
                    {months.map((month) => (
                      <option key={month} value={month}>
                        {month}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600">Pay year *</label>
                  <select
                    required
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    value={formData.pay_year}
                    onChange={(event) => handleInputChange('pay_year', event.target.value)}
                  >
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600">Basic salary *</label>
                  <input
                    required
                    type="number"
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    value={formData.basic_salary}
                    onChange={(event) => handleInputChange('basic_salary', event.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600">Allowances</label>
                  <input
                    type="number"
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    value={formData.allowances}
                    onChange={(event) => handleInputChange('allowances', event.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600">Deductions</label>
                  <input
                    type="number"
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    value={formData.deductions}
                    onChange={(event) => handleInputChange('deductions', event.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600">Net salary</label>
                  <input
                    disabled
                    className="mt-1 w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm"
                    value={formData.net_salary}
                    readOnly
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600">Payment status *</label>
                  <select
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    value={formData.payment_status}
                    onChange={(event) => handleInputChange('payment_status', event.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600">Payment date</label>
                  <input
                    type="date"
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    value={formData.payment_date}
                    onChange={(event) => handleInputChange('payment_date', event.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600">Payment method</label>
                  <input
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    value={formData.payment_method}
                    onChange={(event) => handleInputChange('payment_method', event.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600">Bank account</label>
                  <input
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    value={formData.bank_account}
                    onChange={(event) => handleInputChange('bank_account', event.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600">IFSC code</label>
                  <input
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    value={formData.ifsc_code}
                    onChange={(event) => handleInputChange('ifsc_code', event.target.value)}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-semibold text-gray-600">Remarks</label>
                  <textarea
                    rows={3}
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    value={formData.remarks}
                    onChange={(event) => handleInputChange('remarks', event.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600">Record status</label>
                  <select
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    value={formData.status}
                    onChange={(event) => handleInputChange('status', event.target.value)}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                  onClick={() => {
                    setModalOpen(false)
                    setEditingRecord(null)
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
                >
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingRecord ? 'Save changes' : 'Create entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}

