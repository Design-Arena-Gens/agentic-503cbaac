import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

export interface AIAssistantRequest {
  prompt: string
  tone?: 'professional' | 'casual' | 'friendly' | 'formal'
  includeHashtags?: boolean
  includeEmojis?: boolean
  maxLength?: number
}

export class AIAssistant {
  async generateContent(request: AIAssistantRequest): Promise<string> {
    try {
      const { prompt, tone = 'professional', includeHashtags = true, includeEmojis = false, maxLength = 280 } = request

      const systemPrompt = `You are a social media content assistant. Generate engaging content with the following requirements:
- Tone: ${tone}
- Include hashtags: ${includeHashtags}
- Include emojis: ${includeEmojis}
- Maximum length: ${maxLength} characters
Keep the content concise, engaging, and optimized for social media.`

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        max_tokens: 500,
        temperature: 0.7,
      })

      return completion.choices[0]?.message?.content || ''
    } catch (error: any) {
      console.error('AI generation error:', error)
      return '' // Return empty string if AI fails
    }
  }

  async improveContent(content: string, tone?: string): Promise<string> {
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a social media expert. Improve the following content to make it more engaging and effective for social media. ${tone ? `Use a ${tone} tone.` : ''} Keep it concise.`,
          },
          { role: 'user', content },
        ],
        max_tokens: 500,
        temperature: 0.7,
      })

      return completion.choices[0]?.message?.content || content
    } catch (error) {
      return content
    }
  }

  async generateHashtags(content: string, count: number = 5): Promise<string[]> {
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `Generate ${count} relevant hashtags for the following social media content. Return only the hashtags separated by spaces, with # prefix.`,
          },
          { role: 'user', content },
        ],
        max_tokens: 100,
        temperature: 0.5,
      })

      const hashtags = completion.choices[0]?.message?.content?.split(' ').filter(tag => tag.startsWith('#')) || []
      return hashtags.slice(0, count)
    } catch (error) {
      return []
    }
  }

  async analyzeSentiment(content: string): Promise<{ sentiment: string; score: number }> {
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'Analyze the sentiment of this social media content. Respond with a JSON object containing "sentiment" (positive/negative/neutral) and "score" (0-1).',
          },
          { role: 'user', content },
        ],
        max_tokens: 50,
        temperature: 0.3,
      })

      const result = JSON.parse(completion.choices[0]?.message?.content || '{"sentiment":"neutral","score":0.5}')
      return result
    } catch (error) {
      return { sentiment: 'neutral', score: 0.5 }
    }
  }

  async suggestBestTime(content: string, platform: string): Promise<string> {
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `Based on social media best practices, suggest the best time to post this content on ${platform}. Consider the content type and target audience. Respond with a specific time suggestion in format "HH:MM AM/PM timezone".`,
          },
          { role: 'user', content },
        ],
        max_tokens: 100,
        temperature: 0.5,
      })

      return completion.choices[0]?.message?.content || '9:00 AM EST'
    } catch (error) {
      return '9:00 AM EST'
    }
  }

  async generateImagePrompt(content: string): Promise<string> {
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'Generate a detailed image prompt for DALL-E based on this social media content. The prompt should create an eye-catching visual that complements the content.',
          },
          { role: 'user', content },
        ],
        max_tokens: 200,
        temperature: 0.7,
      })

      return completion.choices[0]?.message?.content || ''
    } catch (error) {
      return ''
    }
  }

  async generateImage(prompt: string): Promise<string | null> {
    try {
      const response = await openai.images.generate({
        model: 'dall-e-3',
        prompt,
        n: 1,
        size: '1024x1024',
      })

      return response.data?.[0]?.url || null
    } catch (error) {
      console.error('Image generation error:', error)
      return null
    }
  }
}

export const aiAssistant = new AIAssistant()
