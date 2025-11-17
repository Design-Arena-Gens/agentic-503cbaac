import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { postScheduler } from '@/lib/scheduler'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const session = await getServerSession(req, res, authOptions)

  if (!session?.user) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  try {
    const { postId, scheduledDate, action } = req.body

    if (!postId) {
      return res.status(400).json({ message: 'Post ID is required' })
    }

    switch (action) {
      case 'schedule':
        if (!scheduledDate) {
          return res.status(400).json({ message: 'Scheduled date is required' })
        }
        await postScheduler.schedulePost(postId, new Date(scheduledDate))
        break

      case 'cancel':
        await postScheduler.cancelScheduledPost(postId)
        break

      case 'reschedule':
        if (!scheduledDate) {
          return res.status(400).json({ message: 'Scheduled date is required' })
        }
        await postScheduler.reschedulePost(postId, new Date(scheduledDate))
        break

      default:
        return res.status(400).json({ message: 'Invalid action' })
    }

    return res.status(200).json({ success: true })
  } catch (error: any) {
    console.error('Schedule post error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
