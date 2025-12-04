'use client'

import { useRouter } from 'next/navigation'
import { Building2, Users, ArrowRight } from 'lucide-react'

export default function Home() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Candidate Service Portal</h1>
          <p className="text-lg text-gray-600">Choose your login portal</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Office Member Login Card */}
          <div
            onClick={() => router.push('/login')}
            className="bg-white rounded-lg shadow-lg p-8 cursor-pointer hover:shadow-xl transition-shadow border-2 border-transparent hover:border-primary-500"
          >
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-600 rounded-full mb-4">
                <Users className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Office Member Login</h2>
              <p className="text-gray-600 mb-6">
                For administrators, recruiters, and managers
              </p>
              <div className="flex items-center justify-center gap-2 text-primary-600 font-medium">
                <span>Login</span>
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Employee/Team Member Login Card */}
          <div
            onClick={() => router.push('/employee-login')}
            className="bg-white rounded-lg shadow-lg p-8 cursor-pointer hover:shadow-xl transition-shadow border-2 border-transparent hover:border-primary-500"
          >
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-600 rounded-full mb-4">
                <Building2 className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">CSO Member Login</h2>
              <p className="text-gray-600 mb-6">
                For CSO members - Login with your Office ID
              </p>
              <div className="flex items-center justify-center gap-2 text-green-600 font-medium">
                <span>Login</span>
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Select a login option above to continue</p>
        </div>
      </div>
    </div>
  )
}

