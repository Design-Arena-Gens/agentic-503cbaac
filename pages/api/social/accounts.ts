import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)

  if (!session?.user) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  if (req.method === 'GET') {
    try {
      const accounts = await prisma.socialAccount.findMany({
        where: {
          userId: session.user.id,
        },
        select: {
          id: true,
          platform: true,
          accountName: true,
          accountId: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      })

      return res.status(200).json({ accounts })
    } catch (error: any) {
      console.error('Get social accounts error:', error)
      return res.status(500).json({ message: 'Internal server error' })
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { accountId } = req.body

      if (!accountId) {
        return res.status(400).json({ message: 'Account ID is required' })
      }

      await prisma.socialAccount.delete({
        where: {
          id: accountId,
          userId: session.user.id,
        },
      })

      return res.status(200).json({ success: true })
    } catch (error: any) {
      console.error('Delete social account error:', error)
      return res.status(500).json({ message: 'Internal server error' })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
}
