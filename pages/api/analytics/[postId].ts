import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { socialPlatformManager } from '@/lib/social-platforms'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const session = await getServerSession(req, res, authOptions)

  if (!session?.user) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  try {
    const { postId } = req.query

    if (!postId || typeof postId !== 'string') {
      return res.status(400).json({ message: 'Invalid post ID' })
    }

    const post = await prisma.post.findFirst({
      where: {
        id: postId,
        userId: session.user.id,
      },
      include: {
        analytics: true,
      },
    })

    if (!post) {
      return res.status(404).json({ message: 'Post not found' })
    }

    // If post is published, fetch fresh analytics
    if (post.status === 'published') {
      const platforms = JSON.parse(post.platforms)
      const socialAccounts = await prisma.socialAccount.findMany({
        where: {
          userId: session.user.id,
          platform: { in: platforms },
        },
      })

      const analyticsData = []

      for (const platform of platforms) {
        const account = socialAccounts.find(acc => acc.platform === platform)
        if (account && account.accessToken) {
          const analytics = await socialPlatformManager.getAnalytics(
            platform,
            postId,
            account.accessToken
          )

          if (!analytics.error) {
            analyticsData.push({
              platform,
              ...analytics,
            })

            // Update or create analytics record
            await prisma.postAnalytics.upsert({
              where: { postId },
              update: {
                likes: analytics.likes || 0,
                shares: analytics.shares || 0,
                comments: analytics.comments || 0,
                impressions: analytics.impressions || 0,
                clicks: analytics.clicks || 0,
                lastSync: new Date(),
              },
              create: {
                postId,
                platform,
                likes: analytics.likes || 0,
                shares: analytics.shares || 0,
                comments: analytics.comments || 0,
                impressions: analytics.impressions || 0,
                clicks: analytics.clicks || 0,
              },
            })
          }
        }
      }

      return res.status(200).json({ analytics: analyticsData })
    }

    return res.status(200).json({ analytics: post.analytics })
  } catch (error: any) {
    console.error('Get analytics error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
