import { createTRPCRouter, publicProcedure } from '@/server/api/trpc'
import { neatqueue_service } from '@/server/services/neatqueue.service'
import { z } from 'zod'

export const leaderboard_router = createTRPCRouter({
  get_leaderboard: publicProcedure
    .input(
      z.object({
        channel_id: z.string(),
      })
    )
    .query(async ({ input }) => {
      return await neatqueue_service.get_leaderboard(input.channel_id)
    }),
})
