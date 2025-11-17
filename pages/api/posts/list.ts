import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const session = await getServerSession(req, res, authOptions)

  if (!session?.user) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  try {
    const { status, limit = '20', offset = '0' } = req.query

    const where: any = {
      userId: session.user.id,
    }

    if (status && typeof status === 'string') {
      where.status = status
    }

    const posts = await prisma.post.findMany({
      where,
      include: {
        analytics: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
    })

    const total = await prisma.post.count({ where })

    return res.status(200).json({
      posts,
      total,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    })
  } catch (error: any) {
    console.error('List posts error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
