'use client'

import { api } from '@/trpc/react'

export function UserStats() {
  const sync_mutation = api.history.sync.useMutation()
  return (
    <div className='flex flex-col gap-2'>
      <button onClick={() => sync_mutation.mutate()} type={'button'}>
        Sync
      </button>
      <p>User stats</p>
    </div>
  )
}
