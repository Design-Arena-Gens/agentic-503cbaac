'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { FaTwitter, FaFacebook, FaLinkedin, FaInstagram, FaClock, FaCheck, FaTimes } from 'react-icons/fa'

interface Post {
  id: string
  content: string
  platforms: string
  status: string
  scheduledAt: string | null
  publishedAt: string | null
  createdAt: string
  analytics: any
}

export default function PostsList() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'draft' | 'scheduled' | 'published' | 'failed'>('all')

  useEffect(() => {
    fetchPosts()
  }, [filter])

  const fetchPosts = async () => {
    setLoading(true)
    try {
      const url = filter === 'all' ? '/api/posts/list' : `/api/posts/list?status=${filter}`
      const response = await fetch(url)
      const data = await response.json()
      setPosts(data.posts || [])
    } catch (error) {
      console.error('Failed to fetch posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'twitter':
        return <FaTwitter className="text-blue-400" />
      case 'facebook':
        return <FaFacebook className="text-blue-600" />
      case 'linkedin':
        return <FaLinkedin className="text-blue-700" />
      case 'instagram':
        return <FaInstagram className="text-pink-600" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      draft: { color: 'bg-gray-100 text-gray-800', icon: null },
      scheduled: { color: 'bg-blue-100 text-blue-800', icon: <FaClock className="mr-1" /> },
      published: { color: 'bg-green-100 text-green-800', icon: <FaCheck className="mr-1" /> },
      failed: { color: 'bg-red-100 text-red-800', icon: <FaTimes className="mr-1" /> },
    }
    const badge = badges[status as keyof typeof badges] || badges.draft
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Posts</h2>
        <div className="flex gap-2">
          {(['all', 'draft', 'scheduled', 'published', 'failed'] as const).map((filterOption) => (
            <button
              key={filterOption}
              onClick={() => setFilter(filterOption)}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                filter === filterOption
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Loading posts...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No posts found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => {
            const platforms = JSON.parse(post.platforms)
            return (
              <div key={post.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    {platforms.map((platform: string) => (
                      <span key={platform}>{getPlatformIcon(platform)}</span>
                    ))}
                  </div>
                  {getStatusBadge(post.status)}
                </div>
                <p className="text-gray-800 mb-3">{post.content}</p>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <div>
                    {post.scheduledAt && (
                      <span>Scheduled: {format(new Date(post.scheduledAt), 'MMM dd, yyyy HH:mm')}</span>
                    )}
                    {post.publishedAt && (
                      <span>Published: {format(new Date(post.publishedAt), 'MMM dd, yyyy HH:mm')}</span>
                    )}
                    {!post.scheduledAt && !post.publishedAt && (
                      <span>Created: {format(new Date(post.createdAt), 'MMM dd, yyyy HH:mm')}</span>
                    )}
                  </div>
                  {post.analytics && (
                    <div className="flex gap-4">
                      <span>Likes: {post.analytics.likes || 0}</span>
                      <span>Shares: {post.analytics.shares || 0}</span>
                      <span>Comments: {post.analytics.comments || 0}</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
