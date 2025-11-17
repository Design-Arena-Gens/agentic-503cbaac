'use client'

import { useEffect, useState } from 'react'
import { FaHeart, FaShare, FaComment, FaEye } from 'react-icons/fa'

interface AnalyticsData {
  totalLikes: number
  totalShares: number
  totalComments: number
  totalImpressions: number
  totalPosts: number
  publishedPosts: number
}

export default function AnalyticsSummary() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalLikes: 0,
    totalShares: 0,
    totalComments: 0,
    totalImpressions: 0,
    totalPosts: 0,
    publishedPosts: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/posts/list')
      const data = await response.json()

      const posts = data.posts || []
      const published = posts.filter((p: any) => p.status === 'published')

      const totals = posts.reduce(
        (acc: any, post: any) => {
          if (post.analytics) {
            acc.totalLikes += post.analytics.likes || 0
            acc.totalShares += post.analytics.shares || 0
            acc.totalComments += post.analytics.comments || 0
            acc.totalImpressions += post.analytics.impressions || 0
          }
          return acc
        },
        {
          totalLikes: 0,
          totalShares: 0,
          totalComments: 0,
          totalImpressions: 0,
        }
      )

      setAnalytics({
        ...totals,
        totalPosts: posts.length,
        publishedPosts: published.length,
      })
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const stats = [
    {
      name: 'Total Likes',
      value: analytics.totalLikes,
      icon: FaHeart,
      color: 'text-red-500',
      bgColor: 'bg-red-50',
    },
    {
      name: 'Total Shares',
      value: analytics.totalShares,
      icon: FaShare,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      name: 'Total Comments',
      value: analytics.totalComments,
      icon: FaComment,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
    },
    {
      name: 'Total Impressions',
      value: analytics.totalImpressions,
      icon: FaEye,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Analytics Overview</h2>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Loading analytics...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat) => (
                <div key={stat.name} className={`${stat.bgColor} rounded-lg p-6`}>
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <stat.icon className={`text-3xl ${stat.color}`} />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stat.value.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">Total Posts</h3>
                <p className="text-3xl font-bold text-indigo-600">{analytics.totalPosts}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">Published Posts</h3>
                <p className="text-3xl font-bold text-green-600">{analytics.publishedPosts}</p>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Engagement Rate</h3>
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Average Engagement</span>
                  <span className="text-2xl font-bold text-indigo-600">
                    {analytics.publishedPosts > 0
                      ? (
                          ((analytics.totalLikes + analytics.totalShares + analytics.totalComments) /
                            analytics.publishedPosts)
                        ).toFixed(1)
                      : 0}
                  </span>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min(
                          ((analytics.totalLikes + analytics.totalShares + analytics.totalComments) /
                            (analytics.publishedPosts * 100)) *
                            100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
