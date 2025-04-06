import { LeaderboardPage } from '@/app/_components/leaderboard'
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
  }

  return (
    <Suspense>
      <HydrateClient>
        {/*<UserStats/>*/}
        <LeaderboardPage />
      </HydrateClient>
    </Suspense>
  )
}
