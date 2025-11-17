'use client'

import { useState } from 'react'
import { FaTwitter, FaFacebook, FaLinkedin, FaInstagram, FaMagic, FaRobot, FaCalendar } from 'react-icons/fa'

export default function PostComposer() {
  const [content, setContent] = useState('')
  const [platforms, setPlatforms] = useState<string[]>([])
  const [scheduledDate, setScheduledDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const platformOptions = [
    { id: 'twitter', name: 'Twitter', icon: FaTwitter, color: 'text-blue-400' },
    { id: 'facebook', name: 'Facebook', icon: FaFacebook, color: 'text-blue-600' },
    { id: 'linkedin', name: 'LinkedIn', icon: FaLinkedin, color: 'text-blue-700' },
    { id: 'instagram', name: 'Instagram', icon: FaInstagram, color: 'text-pink-600' },
  ]

  const togglePlatform = (platformId: string) => {
    setPlatforms(prev =>
      prev.includes(platformId)
        ? prev.filter(p => p !== platformId)
        : [...prev, platformId]
    )
  }

  const handleAIGenerate = async () => {
    setAiLoading(true)
    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: content || 'Generate an engaging social media post',
          action: 'generate',
        }),
      })
      const data = await response.json()
      if (data.result) {
        setContent(data.result)
      }
    } catch (error) {
      console.error('AI generation error:', error)
    } finally {
      setAiLoading(false)
    }
  }

  const handleAIImprove = async () => {
    if (!content) return
    setAiLoading(true)
    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          action: 'improve',
        }),
      })
      const data = await response.json()
      if (data.result) {
        setContent(data.result)
      }
    } catch (error) {
      console.error('AI improve error:', error)
    } finally {
      setAiLoading(false)
    }
  }

  const handleSubmit = async (publishNow: boolean) => {
    if (!content || platforms.length === 0) {
      alert('Please enter content and select at least one platform')
      return
    }

    setLoading(true)
    setSuccess(false)

    try {
      const response = await fetch('/api/posts/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          platforms,
          scheduledAt: scheduledDate || null,
          publishNow,
        }),
      })

      if (response.ok) {
        setSuccess(true)
        setContent('')
        setPlatforms([])
        setScheduledDate('')
        setTimeout(() => setSuccess(false), 3000)
      }
    } catch (error) {
      console.error('Post creation error:', error)
      alert('Failed to create post')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6">Create Post</h2>

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-800">Post created successfully!</p>
        </div>
      )}

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="What's on your mind?"
          />
          <div className="mt-2 flex gap-2">
            <button
              onClick={handleAIGenerate}
              disabled={aiLoading}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <FaMagic className="mr-2" />
              {aiLoading ? 'Generating...' : 'AI Generate'}
            </button>
            <button
              onClick={handleAIImprove}
              disabled={aiLoading || !content}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <FaRobot className="mr-2" />
              {aiLoading ? 'Improving...' : 'AI Improve'}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Platforms
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {platformOptions.map((platform) => (
              <button
                key={platform.id}
                onClick={() => togglePlatform(platform.id)}
                className={`flex items-center justify-center gap-2 p-3 border-2 rounded-lg transition-all ${
                  platforms.includes(platform.id)
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <platform.icon className={platform.color} />
                <span className="text-sm font-medium">{platform.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Schedule (Optional)
          </label>
          <input
            type="datetime-local"
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => handleSubmit(true)}
            disabled={loading}
            className="flex-1 inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Publishing...' : 'Publish Now'}
          </button>
          <button
            onClick={() => handleSubmit(false)}
            disabled={loading}
            className="flex-1 inline-flex justify-center items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            <FaCalendar className="mr-2" />
            {loading ? 'Saving...' : scheduledDate ? 'Schedule' : 'Save Draft'}
          </button>
        </div>
      </div>
    </div>
  )
}
