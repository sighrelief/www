import { env } from '@/env'
import { LeaderboardService } from '@/server/services/leaderboard'
import { RANKED_CHANNEL, VANILLA_CHANNEL } from '@/shared/constants'
import { headers } from 'next/headers'

const SECURE_TOKEN = env.CRON_SECRET
const CHANNEL_IDS = [RANKED_CHANNEL, VANILLA_CHANNEL]
export async function POST() {
  const headersList = await headers()
  const authToken = headersList.get('authorization')?.replace('Bearer ', '')

  if (authToken !== SECURE_TOKEN) {
    return new Response('unauthorized', { status: 401 })
  }

  try {
    const service = new LeaderboardService()

    for (const channelId of CHANNEL_IDS) {
      try {
        console.log(`refreshing leaderboard for ${channelId}...`)
        await service.refreshLeaderboard(channelId)
      } catch (err) {
        console.error('refresh failed:', err)
        return new Response('internal error', { status: 500 })
      }
    }

    return Response.json({ success: true })
  } catch (err) {
    console.error('refresh failed:', err)
    return new Response('internal error', { status: 500 })
  }
}
