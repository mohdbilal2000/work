'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { CheckCircle, Loader2, Pencil, Plus, RefreshCw, Trash2, XCircle } from 'lucide-react'

const HR_API_BASE =
  process.env.NEXT_PUBLIC_HR_API_URL ?? 'https://api-hr.defitex2.0.org/api'

interface ComplianceChallan {
  id: string
  type: string
  challanNumber: string
  amount: number
  dueDate: string
  paidDate: string | null
  status: string
  accuracy: boolean
  remarks: string | null
}

type ComplianceTab = 'esic' | 'pf'

interface EsicRecord {
  id: number
  employee_id: string
  employee_name: string
  employer_name: string
  esic_number: string
  monthly_contribution: number
  employer_contribution: number
  payment_status: string
  payment_date: string | null
  status: string
}

interface PfRecord {
  id: number
  employee_id: string
  employee_name: string
  pf_number: string
  uan_number: string
  monthly_contribution: number
  status: string
}

interface EsicForm {
  employee_id: string
  employee_name: string
  employer_name: string
  esic_number: string
  monthly_contribution: string
  employer_contribution: string
  payment_status: string
  payment_date: string
  status: string
}

interface PfForm {
  employee_id: string
  employee_name: string
  pf_number: string
  uan_number: string
  monthly_contribution: string
  status: string
}

export default function CompliancePage() {
  return (
    <div className="px-4 py-6 sm:px-0 space-y-10">
      <ChallanAccuracyPanel />
      <ComplianceTransferPanel />
    </div>
  )
}

function ChallanAccuracyPanel() {
  const [challans, setChallans] = useState<ComplianceChallan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const maxLoadingTimer = setTimeout(() => {
      setLoading(false)
    }, 2000)

    fetchChallans()

    return () => {
      clearTimeout(maxLoadingTimer)
    }
  }, [])

  const fetchChallans = async () => {
    try {
      const response = await fetch('/api/compliance')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setChallans(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching compliance challans:', error)
      setChallans([])
    } finally {
      setLoading(false)
    }
  }

  const handleToggleAccuracy = async (id: string, currentAccuracy: boolean) => {
    try {
      await fetch(`/api/compliance/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accuracy: !currentAccuracy }),
      })
      fetchChallans()
    } catch (error) {
      console.error('Error updating accuracy:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'overdue':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'ESIC':
        return 'bg-blue-100 text-blue-800'
      case 'PF':
        return 'bg-purple-100 text-purple-800'
      case 'TDS':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return <div className="bg-white shadow rounded-lg p-6">Loading compliance challans...</div>
  }

  return (
    <section className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Compliance Challans Accuracy</h1>
          <p className="mt-2 text-sm text-gray-600">Manage ESIC, PF and TDS challans captured inside Finance.</p>
        </div>
        <Link
          href="/dashboard/compliance/new"
          className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Challan
        </Link>
      </div>

      <div className="bg-white border rounded-lg">
        <ul className="divide-y divide-gray-200">
          {challans.map((challan) => (
            <li key={challan.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center flex-wrap gap-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(
                          challan.type,
                        )}`}
                      >
                        {challan.type}
                      </span>
                      <p className="text-sm font-medium text-gray-900">{challan.challanNumber}</p>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          challan.status,
                        )}`}
                      >
                        {challan.status}
                      </span>
                      {challan.accuracy ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Accurate
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Inaccurate
                        </span>
                      )}
                    </div>
                    <div className="mt-3 grid gap-3 text-sm text-gray-600 lg:grid-cols-4">
                      <p>Due: {format(new Date(challan.dueDate), 'MMM dd, yyyy')}</p>
                      {challan.paidDate && <p>Paid: {format(new Date(challan.paidDate), 'MMM dd, yyyy')}</p>}
                      {challan.remarks && <p className="lg:col-span-2">Remarks: {challan.remarks}</p>}
                      <p className="text-base font-semibold text-gray-900">
                        ₹{challan.amount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleAccuracy(challan.id, challan.accuracy)}
                    className={`ml-4 p-2 rounded-md ${
                      challan.accuracy ? 'text-green-600 hover:bg-green-50' : 'text-red-600 hover:bg-red-50'
                    }`}
                    title={challan.accuracy ? 'Mark as Inaccurate' : 'Mark as Accurate'}
                  >
                    {challan.accuracy ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
        {challans.length === 0 && <div className="text-center py-12 text-gray-500">No compliance challans found</div>}
      </div>
    </section>
  )
}

function ComplianceTransferPanel() {
  const tabs: { key: ComplianceTab; label: string; accent: string }[] = [
    { key: 'esic', label: 'ESIC compliance', accent: 'text-blue-600' },
    { key: 'pf', label: 'PF compliance', accent: 'text-purple-600' },
  ]

  const defaultEsicForm = (): EsicForm => ({
    employee_id: '',
    employee_name: '',
    employer_name: '',
    esic_number: '',
    monthly_contribution: '',
    employer_contribution: '',
    payment_status: 'pending',
    payment_date: '',
    status: 'active',
  })

  const defaultPfForm = (): PfForm => ({
    employee_id: '',
    employee_name: '',
    pf_number: '',
    uan_number: '',
    monthly_contribution: '',
    status: 'active',
  })

  const [activeTab, setActiveTab] = useState<ComplianceTab>('esic')
  const [records, setRecords] = useState<{ esic: EsicRecord[]; pf: PfRecord[] }>({
    esic: [],
    pf: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalState, setModalState] = useState<{ open: boolean; type: ComplianceTab; editId: number | null }>({
    open: false,
    type: 'esic',
    editId: null,
  })
  const [forms, setForms] = useState<{ esic: EsicForm; pf: PfForm }>({
    esic: defaultEsicForm(),
    pf: defaultPfForm(),
  })
  const [submitting, setSubmitting] = useState(false)

  const endpoints = useMemo(
    () => ({
      esic: `${HR_API_BASE}/esic`,
      pf: `${HR_API_BASE}/pf`,
    }),
    [],
  )

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [esicResponse, pfResponse] = await Promise.all([
        fetch(endpoints.esic),
        fetch(endpoints.pf),
      ])
      const esicPayload = await esicResponse.json()
      const pfPayload = await pfResponse.json()
      if (!esicPayload.success || !pfPayload.success) {
        throw new Error('HR Admin API responded with an error. Is port 3001 running?')
      }
      setRecords({ esic: esicPayload.data || [], pf: pfPayload.data || [] })
    } catch (err) {
      console.error(err)
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to reach HR Admin API. Please start the HR backend (port 3001).',
      )
      setRecords({ esic: [], pf: [] })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const openModal = (type: ComplianceTab, record?: EsicRecord | PfRecord) => {
    setModalState({ open: true, type, editId: record ? record.id : null })
    if (type === 'esic') {
      setForms((prev) => ({
        ...prev,
        esic: record
          ? {
              employee_id: record.employee_id || '',
              employee_name: record.employee_name || '',
              employer_name: (record as EsicRecord).employer_name || '',
              esic_number: (record as EsicRecord).esic_number || '',
              monthly_contribution: String((record as EsicRecord).monthly_contribution ?? ''),
              employer_contribution: String((record as EsicRecord).employer_contribution ?? ''),
              payment_status: (record as EsicRecord).payment_status || 'pending',
              payment_date: (record as EsicRecord).payment_date
                ? (record as EsicRecord).payment_date?.split('T')[0]
                : '',
              status: (record as EsicRecord).status || 'active',
            }
          : defaultEsicForm(),
      }))
    } else {
      setForms((prev) => ({
        ...prev,
        pf: record
          ? {
              employee_id: record.employee_id || '',
              employee_name: record.employee_name || '',
              pf_number: (record as PfRecord).pf_number || '',
              uan_number: (record as PfRecord).uan_number || '',
              monthly_contribution: String((record as PfRecord).monthly_contribution ?? ''),
              status: (record as PfRecord).status || 'active',
            }
          : defaultPfForm(),
      }))
    }
  }

  const closeModal = () => {
    setModalState((prev) => ({ ...prev, open: false, editId: null }))
  }

  const handleFormChange = (type: ComplianceTab, field: string, value: string) => {
    setForms((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value,
      },
    }))
  }

  const handleDelete = async (type: ComplianceTab, id: number, label: string) => {
    if (!window.confirm(`Delete ${label}?`)) return
    try {
      const response = await fetch(`${endpoints[type]}/${id}`, { method: 'DELETE' })
      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete record')
      }
      loadData()
    } catch (err) {
      console.error(err)
      alert(err instanceof Error ? err.message : 'Failed to delete record')
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    const type = modalState.type
    const isEdit = Boolean(modalState.editId)
    const endpoint = isEdit ? `${endpoints[type]}/${modalState.editId}` : endpoints[type]
    const method = isEdit ? 'PUT' : 'POST'

    try {
      const payload =
        type === 'esic'
          ? {
              ...forms.esic,
              monthly_contribution: parseFloat(forms.esic.monthly_contribution) || 0,
              employer_contribution: parseFloat(forms.esic.employer_contribution) || 0,
              payment_date: forms.esic.payment_date || null,
            }
          : {
              ...forms.pf,
              monthly_contribution: parseFloat(forms.pf.monthly_contribution) || 0,
            }

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error || 'Unable to save record')
      }

      closeModal()
      loadData()
    } catch (err) {
      console.error(err)
      alert(err instanceof Error ? err.message : 'Failed to save record')
    } finally {
      setSubmitting(false)
    }
  }

  const summary = useMemo(() => {
    const esicTotal = records.esic.reduce((sum, record) => sum + (record.monthly_contribution || 0), 0)
    const pfTotal = records.pf.reduce((sum, record) => sum + (record.monthly_contribution || 0), 0)
    return { esicTotal, pfTotal }
  }, [records])

  const renderTable = () => {
    if (activeTab === 'esic') {
      return (
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Employee</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">ESIC number</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Contribution</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Payment</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {records.esic.map((record) => (
              <tr key={record.id}>
                <td className="px-4 py-3">
                  <p className="font-semibold text-gray-900">{record.employee_name}</p>
                  <p className="text-xs text-gray-500">{record.employee_id}</p>
                  <p className="text-xs text-gray-500">{record.employer_name}</p>
                </td>
                <td className="px-4 py-3">{record.esic_number || '—'}</td>
                <td className="px-4 py-3">
                  <p className="font-semibold text-gray-900">
                    Employee: ₹{(record.monthly_contribution || 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    Employer: ₹{(record.employer_contribution || 0).toLocaleString()}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm capitalize">{record.payment_status || 'pending'}</p>
                  <p className="text-xs text-gray-500">
                    {record.payment_date ? format(new Date(record.payment_date), 'dd MMM yyyy') : 'Not paid'}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      className="rounded-md border border-gray-200 p-2 text-gray-700 hover:bg-gray-50"
                      onClick={() => openModal('esic', record)}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      className="rounded-md border border-gray-200 p-2 text-red-600 hover:bg-red-50"
                      onClick={() => handleDelete('esic', record.id, record.employee_name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )
    }

    return (
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Employee</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">PF / UAN</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Contribution</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {records.pf.map((record) => (
            <tr key={record.id}>
              <td className="px-4 py-3">
                <p className="font-semibold text-gray-900">{record.employee_name}</p>
                <p className="text-xs text-gray-500">{record.employee_id}</p>
              </td>
              <td className="px-4 py-3">
                <p>{record.pf_number || '—'}</p>
                <p className="text-xs text-gray-500">UAN: {record.uan_number || '—'}</p>
              </td>
              <td className="px-4 py-3 font-semibold text-gray-900">
                ₹{(record.monthly_contribution || 0).toLocaleString()}
              </td>
              <td className="px-4 py-3 capitalize">{record.status || 'active'}</td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <button
                    className="rounded-md border border-gray-200 p-2 text-gray-700 hover:bg-gray-50"
                    onClick={() => openModal('pf', record)}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    className="rounded-md border border-gray-200 p-2 text-red-600 hover:bg-red-50"
                    onClick={() => handleDelete('pf', record.id, record.employee_name)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )
  }

  return (
    <section className="bg-white shadow rounded-lg p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">ESIC & PF Compliance workspace</h2>
          <p className="text-sm text-gray-600">
            These records are pulled directly from the HR Admin API so finance can audit them in one place.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={loadData}
            className="inline-flex items-center rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </button>
          <button
            type="button"
            onClick={() => openModal(activeTab)}
            className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add record
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
          <p className="text-sm font-medium text-blue-900">ESIC monthly contribution (filtered)</p>
          <p className="mt-1 text-2xl font-semibold text-blue-900">
            ₹{summary.esicTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
        </div>
        <div className="rounded-lg border border-purple-100 bg-purple-50 p-4">
          <p className="text-sm font-medium text-purple-900">PF monthly contribution (filtered)</p>
          <p className="mt-1 text-2xl font-semibold text-purple-900">
            ₹{summary.pfTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
        </div>
      </div>

      <div className="mt-6 border-b border-gray-200 flex flex-wrap gap-3">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-2 text-sm font-medium border-b-2 ${
              activeTab === tab.key ? `${tab.accent} border-current` : 'text-gray-500 border-transparent'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-gray-200">
        {loading ? (
          <div className="flex items-center justify-center gap-2 p-6 text-gray-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading HR compliance data...
          </div>
        ) : records[activeTab].length === 0 ? (
          <div className="p-6 text-center text-gray-500">No {activeTab.toUpperCase()} records available.</div>
        ) : (
          renderTable()
        )}
      </div>

      {modalState.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8">
          <div className="w-full max-w-2xl rounded-lg bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {modalState.editId ? 'Update record' : 'Add record'} — {activeTab.toUpperCase()}
                </h3>
                <p className="text-sm text-gray-500">Saving will update the HR Admin SQLite store instantly.</p>
              </div>
              <button className="text-gray-500 hover:text-gray-700" onClick={closeModal}>
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="max-h-[70vh] overflow-y-auto px-6 py-4 space-y-4">
              {modalState.type === 'esic' ? (
                <>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-xs font-semibold text-gray-600">Employee ID *</label>
                      <input
                        required
                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                        value={forms.esic.employee_id}
                        onChange={(event) => handleFormChange('esic', 'employee_id', event.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600">Employee name *</label>
                      <input
                        required
                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                        value={forms.esic.employee_name}
                        onChange={(event) => handleFormChange('esic', 'employee_name', event.target.value)}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs font-semibold text-gray-600">Employer</label>
                      <input
                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                        value={forms.esic.employer_name}
                        onChange={(event) => handleFormChange('esic', 'employer_name', event.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600">ESIC number</label>
                      <input
                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                        value={forms.esic.esic_number}
                        onChange={(event) => handleFormChange('esic', 'esic_number', event.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600">Payment status</label>
                      <select
                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                        value={forms.esic.payment_status}
                        onChange={(event) => handleFormChange('esic', 'payment_status', event.target.value)}
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
                        value={forms.esic.payment_date}
                        onChange={(event) => handleFormChange('esic', 'payment_date', event.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600">Employee contribution</label>
                      <input
                        type="number"
                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                        value={forms.esic.monthly_contribution}
                        onChange={(event) => handleFormChange('esic', 'monthly_contribution', event.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600">Employer contribution</label>
                      <input
                        type="number"
                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                        value={forms.esic.employer_contribution}
                        onChange={(event) => handleFormChange('esic', 'employer_contribution', event.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600">Status</label>
                      <select
                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                        value={forms.esic.status}
                        onChange={(event) => handleFormChange('esic', 'status', event.target.value)}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                </>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold text-gray-600">Employee ID *</label>
                    <input
                      required
                      className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      value={forms.pf.employee_id}
                      onChange={(event) => handleFormChange('pf', 'employee_id', event.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600">Employee name *</label>
                    <input
                      required
                      className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      value={forms.pf.employee_name}
                      onChange={(event) => handleFormChange('pf', 'employee_name', event.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600">PF number</label>
                    <input
                      className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      value={forms.pf.pf_number}
                      onChange={(event) => handleFormChange('pf', 'pf_number', event.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600">UAN number</label>
                    <input
                      className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      value={forms.pf.uan_number}
                      onChange={(event) => handleFormChange('pf', 'uan_number', event.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600">Monthly contribution</label>
                    <input
                      type="number"
                      className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      value={forms.pf.monthly_contribution}
                      onChange={(event) => handleFormChange('pf', 'monthly_contribution', event.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600">Status</label>
                    <select
                      className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      value={forms.pf.status}
                      onChange={(event) => handleFormChange('pf', 'status', event.target.value)}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
                >
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {modalState.editId ? 'Save changes' : 'Create record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}

