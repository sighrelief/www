import { UserStats } from '@/app/_components/user-stats'
import { auth } from '@/server/auth'
import { HydrateClient } from '@/trpc/server'

export default async function Home() {
  const session = await auth()

  if (session?.user) {
    console.log('user', session.user)
    // void api.post.getLatest.prefetch()
  }

  return (
    <HydrateClient>
      <UserStats />
    </HydrateClient>
  )
}
