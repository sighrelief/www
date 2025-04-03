import { UserInfo } from '@/app/players/[id]/user'
import { auth } from '@/server/auth'
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
    await api.history.user_games.prefetch({
      user_id: id,
    })
    await api.discord.get_user_by_id.prefetch({
      user_id: id,
    })
  }
  return (
    <Suspense>
      <HydrateClient>
        <UserInfo />
      </HydrateClient>
    </Suspense>
  )
}
