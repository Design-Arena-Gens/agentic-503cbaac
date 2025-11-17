import { prisma } from './prisma'
import { socialPlatformManager } from './social-platforms'

export class PostScheduler {
  async schedulePost(postId: string, scheduledDate: Date): Promise<void> {
    await prisma.post.update({
      where: { id: postId },
      data: {
        scheduledAt: scheduledDate,
        status: 'scheduled',
      },
    })
  }

  async processScheduledPosts(): Promise<void> {
    const now = new Date()

    const scheduledPosts = await prisma.post.findMany({
      where: {
        status: 'scheduled',
        scheduledAt: {
          lte: now,
        },
      },
      include: {
        user: {
          include: {
            socialAccounts: true,
          },
        },
      },
    })

    for (const post of scheduledPosts) {
      await this.publishPost(post)
    }
  }

  private async publishPost(post: any): Promise<void> {
    try {
      const platforms = JSON.parse(post.platforms)
      const results = []

      for (const platform of platforms) {
        const socialAccount = post.user.socialAccounts.find(
          (acc: any) => acc.platform === platform && acc.isActive
        )

        if (!socialAccount) {
          continue
        }

        let result
        switch (platform) {
          case 'twitter':
            result = await socialPlatformManager.publishToTwitter(
              post.content,
              socialAccount.accessToken,
              socialAccount.refreshToken
            )
            break
          case 'facebook':
            result = await socialPlatformManager.publishToFacebook(
              post.content,
              socialAccount.accessToken,
              socialAccount.accountId
            )
            break
          case 'linkedin':
            result = await socialPlatformManager.publishToLinkedIn(
              post.content,
              socialAccount.accessToken,
              socialAccount.accountId
            )
            break
          case 'instagram':
            const mediaUrls = post.mediaUrls ? JSON.parse(post.mediaUrls) : []
            if (mediaUrls.length > 0) {
              result = await socialPlatformManager.publishToInstagram(
                post.content,
                mediaUrls[0],
                socialAccount.accessToken,
                socialAccount.accountId
              )
            }
            break
        }

        results.push({ platform, result })
      }

      const allSuccessful = results.every(r => r.result?.success)

      await prisma.post.update({
        where: { id: post.id },
        data: {
          status: allSuccessful ? 'published' : 'failed',
          publishedAt: allSuccessful ? new Date() : null,
          error: allSuccessful ? null : JSON.stringify(results),
        },
      })
    } catch (error: any) {
      await prisma.post.update({
        where: { id: post.id },
        data: {
          status: 'failed',
          error: error.message,
        },
      })
    }
  }

  async cancelScheduledPost(postId: string): Promise<void> {
    await prisma.post.update({
      where: { id: postId },
      data: {
        status: 'draft',
        scheduledAt: null,
      },
    })
  }

  async reschedulePost(postId: string, newDate: Date): Promise<void> {
    await prisma.post.update({
      where: { id: postId },
      data: {
        scheduledAt: newDate,
        status: 'scheduled',
      },
    })
  }

  async getScheduledPosts(userId: string): Promise<any[]> {
    return prisma.post.findMany({
      where: {
        userId,
        status: 'scheduled',
      },
      orderBy: {
        scheduledAt: 'asc',
      },
    })
  }
}

export const postScheduler = new PostScheduler()
