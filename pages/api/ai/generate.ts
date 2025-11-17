import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { aiAssistant } from '@/lib/ai-assistant'
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
    const { prompt, action, content } = req.body

    // Get user's AI settings
    const aiSettings = await prisma.aISettings.findUnique({
      where: { userId: session.user.id },
    })

    let result

    switch (action) {
      case 'generate':
        result = await aiAssistant.generateContent({
          prompt,
          tone: aiSettings?.tonePreference as any,
          includeHashtags: aiSettings?.hashtagsEnabled,
          includeEmojis: aiSettings?.emojiEnabled,
        })
        break

      case 'improve':
        result = await aiAssistant.improveContent(content, aiSettings?.tonePreference)
        break

      case 'hashtags':
        result = await aiAssistant.generateHashtags(content || prompt)
        break

      case 'sentiment':
        result = await aiAssistant.analyzeSentiment(content || prompt)
        break

      case 'best-time':
        const { platform } = req.body
        result = await aiAssistant.suggestBestTime(content || prompt, platform || 'twitter')
        break

      case 'image-prompt':
        result = await aiAssistant.generateImagePrompt(content || prompt)
        break

      case 'generate-image':
        result = await aiAssistant.generateImage(prompt)
        break

      default:
        return res.status(400).json({ message: 'Invalid action' })
    }

    return res.status(200).json({ result })
  } catch (error: any) {
    console.error('AI generation error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
