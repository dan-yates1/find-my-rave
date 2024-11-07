import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/auth'
import { scrapeSkiddleEvents } from '@/services/eventSources/skiddle'

export async function POST() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const eventCount = await scrapeSkiddleEvents()
    return NextResponse.json({ message: `Successfully synced ${eventCount} events` })
  } catch (error) {
    console.error('Error syncing events:', error)
    return NextResponse.json(
      { error: 'Failed to sync events' },
      { status: 500 }
    )
  }
} 