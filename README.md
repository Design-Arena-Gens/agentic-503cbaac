# ConnectUS - Social Media Management Platform

ConnectUS is an all-in-one social media management platform that enables organizations to publish, schedule, monitor, and analyze content across all major social platforms from a unified system.

## Features

- **OAuth Authentication** - Secure login with Google, GitHub, or email/password
- **Multi-Platform Publishing** - Post to Twitter, Facebook, LinkedIn, and Instagram simultaneously
- **Content Scheduling** - Schedule posts for optimal engagement times
- **AI Assistant** - Generate, improve, and optimize content with AI
- **Analytics Dashboard** - Track engagement metrics across all platforms
- **Calendar View** - Visual content calendar for scheduled posts
- **Mobile Sync** - API endpoints for mobile app synchronization
- **Team Collaboration** - Multi-user support with role-based access
- **Social Account Management** - Connect and manage multiple social accounts

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Database

```bash
npx prisma generate
npx prisma db push
```

### 3. Run Development Server

```bash
npm run dev
```

Open http://localhost:3000

### 4. Build for Production

```bash
npm run build
npm start
```

## Environment Variables

Copy `.env.example` to `.env` and configure:
- Authentication keys (NextAuth, OAuth providers)
- Social media API credentials
- OpenAI API key for AI features

## Deployment to Vercel

```bash
vercel deploy --prod --yes --token $VERCEL_TOKEN --name agentic-503cbaac
```

## License

MIT
