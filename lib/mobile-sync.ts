export interface MobileSyncData {
  userId: string
  posts: any[]
  socialAccounts: any[]
  analytics: any[]
  lastSync: Date
}

export class MobileSyncManager {
  async syncData(userId: string): Promise<MobileSyncData> {
    // This would be called by mobile apps to sync data
    const { prisma } = await import('./prisma')

    const [posts, socialAccounts] = await Promise.all([
      prisma.post.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: {
          analytics: true,
        },
      }),
      prisma.socialAccount.findMany({
        where: { userId },
      }),
    ])

    return {
      userId,
      posts,
      socialAccounts,
      analytics: posts.map(p => p.analytics).filter(Boolean),
      lastSync: new Date(),
    }
  }

  async pushChanges(userId: string, changes: any): Promise<{ success: boolean; syncedAt: Date }> {
    const { prisma } = await import('./prisma')

    try {
      // Handle new posts
      if (changes.newPosts && changes.newPosts.length > 0) {
        await prisma.post.createMany({
          data: changes.newPosts.map((post: any) => ({
            ...post,
            userId,
          })),
        })
      }

      // Handle updated posts
      if (changes.updatedPosts && changes.updatedPosts.length > 0) {
        for (const post of changes.updatedPosts) {
          await prisma.post.update({
            where: { id: post.id },
            data: post,
          })
        }
      }

      // Handle deleted posts
      if (changes.deletedPosts && changes.deletedPosts.length > 0) {
        await prisma.post.deleteMany({
          where: {
            id: { in: changes.deletedPosts },
            userId,
          },
        })
      }

      return { success: true, syncedAt: new Date() }
    } catch (error) {
      console.error('Mobile sync error:', error)
      return { success: false, syncedAt: new Date() }
    }
  }

  async getConflicts(userId: string, lastSyncDate: Date): Promise<any[]> {
    const { prisma } = await import('./prisma')

    // Find posts that were modified on the server after the last sync
    const conflicts = await prisma.post.findMany({
      where: {
        userId,
        updatedAt: {
          gt: lastSyncDate,
        },
      },
    })

    return conflicts
  }

  async resolveConflict(postId: string, resolution: 'server' | 'client', clientData?: any): Promise<void> {
    const { prisma } = await import('./prisma')

    if (resolution === 'client' && clientData) {
      await prisma.post.update({
        where: { id: postId },
        data: clientData,
      })
    }
    // If resolution is 'server', no action needed as server data is already current
  }
}

export const mobileSyncManager = new MobileSyncManager()
