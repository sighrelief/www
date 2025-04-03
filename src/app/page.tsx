import { LeaderboardPage } from '@/app/_components/leaderboard'
import { UserStats } from '@/app/_components/user-stats'
import { auth } from '@/server/auth'
import { RANKED_CHANNEL, VANILLA_CHANNEL } from '@/shared/constants'
import { HydrateClient, api } from '@/trpc/server'
import { Suspense } from 'react'

export default async function Home() {
  const session = await auth()
  await Promise.all([
    api.leaderboard.get_leaderboard.prefetch({
      channel_id: RANKED_CHANNEL,
    }),
    api.leaderboard.get_leaderboard.prefetch({
      channel_id: VANILLA_CHANNEL,
    }),
  ])
  if (session?.user) {
    console.log('user', session.user)
    // void api.post.getLatest.prefetch()
  }

  return (
    <HydrateClient>
      <Suspense>
        <UserStats />
        <LeaderboardPage />
      </Suspense>
    </HydrateClient>
  )
}
