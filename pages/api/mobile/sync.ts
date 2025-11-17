import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { mobileSyncManager } from '@/lib/mobile-sync'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)

  if (!session?.user) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  if (req.method === 'GET') {
    try {
      const syncData = await mobileSyncManager.syncData(session.user.id)
      return res.status(200).json(syncData)
    } catch (error: any) {
      console.error('Mobile sync error:', error)
      return res.status(500).json({ message: 'Internal server error' })
    }
  }

  if (req.method === 'POST') {
    try {
      const { changes, lastSync } = req.body

      // Check for conflicts
      if (lastSync) {
        const conflicts = await mobileSyncManager.getConflicts(
          session.user.id,
          new Date(lastSync)
        )

        if (conflicts.length > 0) {
          return res.status(409).json({
            message: 'Conflicts detected',
            conflicts,
          })
        }
      }

      const result = await mobileSyncManager.pushChanges(session.user.id, changes)
      return res.status(200).json(result)
    } catch (error: any) {
      console.error('Mobile push error:', error)
      return res.status(500).json({ message: 'Internal server error' })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
}
