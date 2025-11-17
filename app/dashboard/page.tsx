'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import PostComposer from '@/components/PostComposer'
import PostsList from '@/components/PostsList'
import AnalyticsSummary from '@/components/AnalyticsSummary'
import CalendarView from '@/components/CalendarView'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'compose' | 'posts' | 'calendar' | 'analytics'>('compose')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {session.user?.name || 'User'}!
          </h1>
        </div>

        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('compose')}
              className={`${
                activeTab === 'compose'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
            >
              Compose
            </button>
            <button
              onClick={() => setActiveTab('posts')}
              className={`${
                activeTab === 'posts'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
            >
              Posts
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`${
                activeTab === 'calendar'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
            >
              Calendar
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`${
                activeTab === 'analytics'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
            >
              Analytics
            </button>
          </nav>
        </div>

        <div className="py-6">
          {activeTab === 'compose' && <PostComposer />}
          {activeTab === 'posts' && <PostsList />}
          {activeTab === 'calendar' && <CalendarView />}
          {activeTab === 'analytics' && <AnalyticsSummary />}
        </div>
      </div>
    </DashboardLayout>
  )
}
