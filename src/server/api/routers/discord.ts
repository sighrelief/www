import { createTRPCRouter, publicProcedure } from '@/server/api/trpc'
import { discord_service } from '@/server/services/discord.service'
import { z } from 'zod'

export const discord_router = createTRPCRouter({
  get_user_by_id: publicProcedure
    .input(
      z.object({
        user_id: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      return await discord_service.get_user_by_id(input.user_id)
    }),
})
