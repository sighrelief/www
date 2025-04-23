import { createEventIterator, globalEmitter } from '@/lib/events'
import { redis } from '@/server/redis'
import { tracked } from '@trpc/server'
import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '../trpc'

export type PlayerState = {
  status: 'idle' | 'queuing' | 'in_game'
  queueStartTime?: number
  currentMatch?: {
    opponentId: string
    startTime: number
  }
}

const PLAYER_STATE_KEY = (userId: string) => `player:${userId}:state`

export const playerStateRouter = createTRPCRouter({
  getState: publicProcedure
    .input(z.string())
    .query(async ({ input: userId }) => {
      const state = await redis.get(PLAYER_STATE_KEY(userId))
      return state ? (JSON.parse(state) as PlayerState) : null
    }),
  onStateChange: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        lastEventId: z.string().optional(),
      })
    )
    .subscription(async function* ({ input, ctx, signal }) {
      console.log('subscription started for user:', input.userId)

      try {
        const iterator = createEventIterator<PlayerState>(
          globalEmitter,
          `state-change:${input.userId}`,
          { signal: signal }
        )

        console.log('iterator created')

        for await (const [state] of iterator) {
          console.log('emitting state:', state)
          yield tracked(Date.now().toString(), state)
        }
      } catch (error) {
        console.error('subscription error:', error)
        throw error
      } finally {
        console.log('subscription ended for user:', input.userId)
      }
    }),
})
