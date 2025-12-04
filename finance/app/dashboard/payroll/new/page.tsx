'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

interface PayrollForm {
  employeeId: string
  employeeName: string
  month: string
  year: string
  basicSalary: string
  allowances: string
  deductions: string
  netSalary: string
  status: string
  isDisclosed: string
}

export default function NewPayrollPage() {
  const router = useRouter()
  const { register, handleSubmit, watch, formState: { errors } } = useForm<PayrollForm>()
  const [loading, setLoading] = useState(false)

  const basicSalary = watch('basicSalary')
  const allowances = watch('allowances')
  const deductions = watch('deductions')

  const calculateNetSalary = () => {
    const basic = parseFloat(basicSalary || '0')
    const allow = parseFloat(allowances || '0')
    const deduct = parseFloat(deductions || '0')
    return (basic + allow - deduct).toFixed(2)
  }

  const onSubmit = async (data: PayrollForm) => {
    setLoading(true)
    try {
      const netSalary = calculateNetSalary()
      const response = await fetch('/api/payroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          netSalary,
          isDisclosed: data.isDisclosed === 'true',
        }),
      })

      if (response.ok) {
        toast.success('Payroll created successfully')
        router.push('/dashboard/payroll')
      } else {
        toast.error('Failed to create payroll')
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Add New Payroll</h1>

      <div className="bg-white shadow rounded-lg p-6 max-w-2xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Employee ID
              </label>
              <input
                {...register('employeeId', { required: 'Employee ID is required' })}
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
              {errors.employeeId && (
                <p className="mt-1 text-sm text-red-600">{errors.employeeId.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Employee Name
              </label>
              <input
                {...register('employeeName', { required: 'Employee name is required' })}
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
              {errors.employeeName && (
                <p className="mt-1 text-sm text-red-600">{errors.employeeName.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Month
              </label>
              <select
                {...register('month', { required: 'Month is required' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              >
                <option value="">Select month</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>
              {errors.month && (
                <p className="mt-1 text-sm text-red-600">{errors.month.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Year
              </label>
              <input
                {...register('year', { required: 'Year is required' })}
                type="number"
                min="2020"
                max="2100"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
              {errors.year && (
                <p className="mt-1 text-sm text-red-600">{errors.year.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Basic Salary
            </label>
            <input
              {...register('basicSalary', { required: 'Basic salary is required' })}
              type="number"
              step="0.01"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            />
            {errors.basicSalary && (
              <p className="mt-1 text-sm text-red-600">{errors.basicSalary.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Allowances
            </label>
            <input
              {...register('allowances')}
              type="number"
              step="0.01"
              defaultValue="0"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Deductions
            </label>
            <input
              {...register('deductions')}
              type="number"
              step="0.01"
              defaultValue="0"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            />
          </div>

          <div className="bg-gray-50 p-4 rounded-md">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Net Salary (Calculated)
            </label>
            <p className="text-2xl font-bold text-gray-900">
              ₹{calculateNetSalary()}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                {...register('status')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              >
                <option value="pending">Pending</option>
                <option value="processed">Processed</option>
                <option value="paid">Paid</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Disclosure Status
              </label>
              <select
                {...register('isDisclosed')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              >
                <option value="false">Not Disclosed</option>
                <option value="true">Disclosed</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Payroll'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

