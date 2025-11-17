'use client'

import { useState, useEffect } from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import { format } from 'date-fns'

interface ScheduledPost {
  id: string
  content: string
  scheduledAt: string
  platforms: string
}

export default function CalendarView() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchScheduledPosts()
  }, [])

  const fetchScheduledPosts = async () => {
    try {
      const response = await fetch('/api/posts/list?status=scheduled')
      const data = await response.json()
      setScheduledPosts(data.posts || [])
    } catch (error) {
      console.error('Failed to fetch scheduled posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPostsForDate = (date: Date) => {
    return scheduledPosts.filter(post => {
      const postDate = new Date(post.scheduledAt)
      return (
        postDate.getFullYear() === date.getFullYear() &&
        postDate.getMonth() === date.getMonth() &&
        postDate.getDate() === date.getDate()
      )
    })
  }

  const tileContent = ({ date, view }: any) => {
    if (view === 'month') {
      const posts = getPostsForDate(date)
      if (posts.length > 0) {
        return (
          <div className="flex justify-center">
            <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-indigo-600 rounded-full">
              {posts.length}
            </span>
          </div>
        )
      }
    }
    return null
  }

  const selectedDatePosts = getPostsForDate(selectedDate)

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6">Content Calendar</h2>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Loading calendar...</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <Calendar
              onChange={(value: any) => setSelectedDate(value)}
              value={selectedDate}
              tileContent={tileContent}
              className="w-full border-0 rounded-lg shadow-sm"
            />
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">
              Scheduled for {format(selectedDate, 'MMMM dd, yyyy')}
            </h3>
            {selectedDatePosts.length === 0 ? (
              <p className="text-gray-500">No posts scheduled for this date</p>
            ) : (
              <div className="space-y-4">
                {selectedDatePosts.map((post) => (
                  <div
                    key={post.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-medium text-indigo-600">
                        {format(new Date(post.scheduledAt), 'HH:mm')}
                      </span>
                      <span className="text-xs text-gray-500">
                        {JSON.parse(post.platforms).join(', ')}
                      </span>
                    </div>
                    <p className="text-gray-800 text-sm">{post.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
