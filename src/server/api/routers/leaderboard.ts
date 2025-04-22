import { createTRPCRouter, publicProcedure } from '@/server/api/trpc'
import { LeaderboardService } from '@/server/services/leaderboard'
import type { LeaderboardEntry } from '@/server/services/neatqueue.service'
import { z } from 'zod'
const service = new LeaderboardService()

export const leaderboard_router = createTRPCRouter({
  get_leaderboard: publicProcedure
    .input(
      z.object({
        channel_id: z.string(),
      })
    )
    .query(async ({ input }) => {
      return (await service.getLeaderboard(
        input.channel_id
      )) as LeaderboardEntry[]
    }),
  get_user_rank: publicProcedure
    .input(
      z.object({
        channel_id: z.string(),
        user_id: z.string(),
      })
    )
    .query(async ({ input }) => {
      const res = await service.getUserRank(input.channel_id, input.user_id)
      console.log('leaderboard.get_user_rank', res)
      return res
    }),
})
