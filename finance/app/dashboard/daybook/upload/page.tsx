'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, FileText } from 'lucide-react'
import toast from 'react-hot-toast'

export default function UploadDayBookPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      toast.error('Please select a file')
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/daybook/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(`Successfully imported ${data.entries} entries from Vyapar`)
        router.push('/dashboard/daybook')
      } else {
        toast.error(data.error || 'Failed to upload file')
      }
    } catch (error) {
      toast.error('An error occurred while uploading')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Upload Vyapar File</h1>

      <div className="bg-white shadow rounded-lg p-6 max-w-2xl">
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <FileText className="w-6 h-6 text-indigo-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">File Requirements</h2>
          </div>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-2">
            <li>File format: Excel (.xlsx) or CSV</li>
            <li>Required columns: Date, Type, Category, Description, Amount</li>
            <li>Optional columns: Reference, Invoice Number</li>
            <li>Date format: YYYY-MM-DD or DD/MM/YYYY</li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Vyapar Export File
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-indigo-400 transition-colors">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                  >
                    <span>Upload a file</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      className="sr-only"
                      onChange={handleFileChange}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">Excel or CSV up to 10MB</p>
                {file && (
                  <p className="text-sm text-indigo-600 mt-2">
                    Selected: {file.name}
                  </p>
                )}
              </div>
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
              disabled={loading || !file}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Uploading...' : 'Upload File'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

