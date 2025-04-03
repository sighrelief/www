import { UserStats } from '@/app/_components/user-stats'
import { auth } from '@/server/auth'
import { HydrateClient, api } from '@/trpc/server'

export default async function Home() {
  const hello = await api.post.hello({ text: 'from tRPC' })
  const session = await auth()

  if (session?.user) {
    void api.post.getLatest.prefetch()
  }

  return (
    <HydrateClient>
      <UserStats />
    </HydrateClient>
  )
}
