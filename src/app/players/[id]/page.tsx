import { UserInfo } from '@/app/players/[id]/user'
import { auth } from '@/server/auth'
import { RANKED_CHANNEL, VANILLA_CHANNEL } from '@/shared/constants'
import { HydrateClient, api } from '@/trpc/server'
import { Suspense } from 'react'

export default async function PlayerPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  const { id } = await params
  if (id) {
    await Promise.all([
      api.history.user_games.prefetch({
        user_id: id,
      }),
      api.discord.get_user_by_id.prefetch({
        user_id: id,
      }),
      api.leaderboard.get_leaderboard.prefetch({
        channel_id: RANKED_CHANNEL,
      }),
      api.leaderboard.get_leaderboard.prefetch({
        channel_id: VANILLA_CHANNEL,
      }),
      api.leaderboard.get_user_rank.prefetch({
        channel_id: RANKED_CHANNEL,
        user_id: id,
      }),
      api.leaderboard.get_user_rank.prefetch({
        channel_id: VANILLA_CHANNEL,
        user_id: id,
      }),
    ])
  }
  return (
    <Suspense>
      <HydrateClient>
        <UserInfo />
      </HydrateClient>
    </Suspense>
  )
}
