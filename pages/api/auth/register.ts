import { NextApiRequest, NextApiResponse } from 'next'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { email, password, name } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || email.split('@')[0],
      }
    })

    // Create default AI settings
    await prisma.aISettings.create({
      data: {
        userId: user.id,
      }
    })

    return res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      }
    })
  } catch (error: any) {
    console.error('Registration error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
