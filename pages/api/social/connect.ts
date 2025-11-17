import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const session = await getServerSession(req, res, authOptions)

  if (!session?.user) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  try {
    const { platform, accountName, accountId, accessToken, refreshToken, expiresAt } = req.body

    if (!platform || !accountName || !accountId || !accessToken) {
      return res.status(400).json({ message: 'Missing required fields' })
    }

    const socialAccount = await prisma.socialAccount.upsert({
      where: {
        userId_platform_accountId: {
          userId: session.user.id,
          platform,
          accountId,
        },
      },
      update: {
        accountName,
        accessToken,
        refreshToken,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive: true,
      },
      create: {
        userId: session.user.id,
        platform,
        accountName,
        accountId,
        accessToken,
        refreshToken,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive: true,
      },
    })

    return res.status(200).json({ socialAccount })
  } catch (error: any) {
    console.error('Connect social account error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
