import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { socialPlatformManager } from '@/lib/social-platforms'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const session = await getServerSession(req, res, authOptions)

  if (!session?.user) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  try {
    const { content, mediaUrls, platforms, scheduledAt, publishNow } = req.body

    if (!content || !platforms || platforms.length === 0) {
      return res.status(400).json({ message: 'Content and platforms are required' })
    }

    const post = await prisma.post.create({
      data: {
        userId: session.user.id,
        content,
        mediaUrls: mediaUrls ? JSON.stringify(mediaUrls) : null,
        platforms: JSON.stringify(platforms),
        status: publishNow ? 'publishing' : scheduledAt ? 'scheduled' : 'draft',
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      },
    })

    // If publishNow is true, publish immediately
    if (publishNow) {
      const socialAccounts = await prisma.socialAccount.findMany({
        where: {
          userId: session.user.id,
          platform: { in: platforms },
          isActive: true,
        },
      })

      const publishResults = []

      for (const platform of platforms) {
        const account = socialAccounts.find(acc => acc.platform === platform)

        if (!account) {
          publishResults.push({
            platform,
            success: false,
            error: 'Social account not connected',
          })
          continue
        }

        let result
        switch (platform) {
          case 'twitter':
            result = await socialPlatformManager.publishToTwitter(
              content,
              account.accessToken || '',
              account.refreshToken || ''
            )
            break
          case 'facebook':
            result = await socialPlatformManager.publishToFacebook(
              content,
              account.accessToken || '',
              account.accountId
            )
            break
          case 'linkedin':
            result = await socialPlatformManager.publishToLinkedIn(
              content,
              account.accessToken || '',
              account.accountId
            )
            break
          case 'instagram':
            if (mediaUrls && mediaUrls.length > 0) {
              result = await socialPlatformManager.publishToInstagram(
                content,
                mediaUrls[0],
                account.accessToken || '',
                account.accountId
              )
            } else {
              result = { success: false, error: 'Instagram requires media' }
            }
            break
          default:
            result = { success: false, error: 'Platform not supported' }
        }

        publishResults.push({
          platform,
          ...result,
        })
      }

      const allSuccessful = publishResults.every(r => r.success)

      await prisma.post.update({
        where: { id: post.id },
        data: {
          status: allSuccessful ? 'published' : 'failed',
          publishedAt: allSuccessful ? new Date() : null,
          error: allSuccessful ? null : JSON.stringify(publishResults),
        },
      })

      return res.status(200).json({
        post,
        publishResults,
      })
    }

    return res.status(201).json({ post })
  } catch (error: any) {
    console.error('Create post error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
