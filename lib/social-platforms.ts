import { TwitterApi } from 'twitter-api-v2'

export interface PostData {
  content: string
  mediaUrls?: string[]
  platforms: string[]
}

export class SocialPlatformManager {
  async publishToTwitter(content: string, accessToken: string, accessSecret: string): Promise<any> {
    try {
      const client = new TwitterApi({
        appKey: process.env.TWITTER_API_KEY || '',
        appSecret: process.env.TWITTER_API_SECRET || '',
        accessToken: accessToken,
        accessSecret: accessSecret,
      })

      const tweet = await client.v2.tweet(content)
      return { success: true, data: tweet }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  async publishToFacebook(content: string, accessToken: string, pageId?: string): Promise<any> {
    try {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${pageId || 'me'}/feed`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: content,
            access_token: accessToken,
          }),
        }
      )
      const data = await response.json()
      return { success: response.ok, data }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  async publishToLinkedIn(content: string, accessToken: string, authorId: string): Promise<any> {
    try {
      const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'X-Restli-Protocol-Version': '2.0.0',
        },
        body: JSON.stringify({
          author: `urn:li:person:${authorId}`,
          lifecycleState: 'PUBLISHED',
          specificContent: {
            'com.linkedin.ugc.ShareContent': {
              shareCommentary: {
                text: content,
              },
              shareMediaCategory: 'NONE',
            },
          },
          visibility: {
            'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
          },
        }),
      })
      const data = await response.json()
      return { success: response.ok, data }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  async publishToInstagram(content: string, imageUrl: string, accessToken: string, accountId: string): Promise<any> {
    try {
      // Create media container
      const containerResponse = await fetch(
        `https://graph.facebook.com/v18.0/${accountId}/media`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image_url: imageUrl,
            caption: content,
            access_token: accessToken,
          }),
        }
      )
      const containerData = await containerResponse.json()

      if (!containerResponse.ok) {
        return { success: false, error: containerData }
      }

      // Publish media
      const publishResponse = await fetch(
        `https://graph.facebook.com/v18.0/${accountId}/media_publish`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            creation_id: containerData.id,
            access_token: accessToken,
          }),
        }
      )
      const publishData = await publishResponse.json()
      return { success: publishResponse.ok, data: publishData }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  async getAnalytics(platform: string, postId: string, accessToken: string): Promise<any> {
    switch (platform) {
      case 'twitter':
        return this.getTwitterAnalytics(postId, accessToken)
      case 'facebook':
        return this.getFacebookAnalytics(postId, accessToken)
      case 'linkedin':
        return this.getLinkedInAnalytics(postId, accessToken)
      case 'instagram':
        return this.getInstagramAnalytics(postId, accessToken)
      default:
        return { error: 'Platform not supported' }
    }
  }

  private async getTwitterAnalytics(tweetId: string, accessToken: string): Promise<any> {
    try {
      const client = new TwitterApi(accessToken)
      const tweet = await client.v2.singleTweet(tweetId, {
        'tweet.fields': ['public_metrics'],
      })
      return {
        likes: tweet.data.public_metrics?.like_count || 0,
        shares: tweet.data.public_metrics?.retweet_count || 0,
        comments: tweet.data.public_metrics?.reply_count || 0,
        impressions: tweet.data.public_metrics?.impression_count || 0,
      }
    } catch (error) {
      return { error: 'Failed to fetch Twitter analytics' }
    }
  }

  private async getFacebookAnalytics(postId: string, accessToken: string): Promise<any> {
    try {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${postId}?fields=likes.summary(true),shares,comments.summary(true)&access_token=${accessToken}`
      )
      const data = await response.json()
      return {
        likes: data.likes?.summary?.total_count || 0,
        shares: data.shares?.count || 0,
        comments: data.comments?.summary?.total_count || 0,
      }
    } catch (error) {
      return { error: 'Failed to fetch Facebook analytics' }
    }
  }

  private async getLinkedInAnalytics(postId: string, accessToken: string): Promise<any> {
    try {
      const response = await fetch(
        `https://api.linkedin.com/v2/socialActions/${postId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )
      const data = await response.json()
      return {
        likes: data.likesSummary?.totalLikes || 0,
        shares: data.sharesSummary?.totalShares || 0,
        comments: data.commentsSummary?.totalComments || 0,
      }
    } catch (error) {
      return { error: 'Failed to fetch LinkedIn analytics' }
    }
  }

  private async getInstagramAnalytics(postId: string, accessToken: string): Promise<any> {
    try {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${postId}?fields=like_count,comments_count,shares_count&access_token=${accessToken}`
      )
      const data = await response.json()
      return {
        likes: data.like_count || 0,
        shares: data.shares_count || 0,
        comments: data.comments_count || 0,
      }
    } catch (error) {
      return { error: 'Failed to fetch Instagram analytics' }
    }
  }
}

export const socialPlatformManager = new SocialPlatformManager()
