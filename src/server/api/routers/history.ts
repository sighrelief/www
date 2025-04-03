import { createTRPCRouter, publicProcedure } from '@/server/api/trpc'
import { db } from '@/server/db'
import { player_games, raw_history } from '@/server/db/schema'
import { desc, eq } from 'drizzle-orm'
import { z } from 'zod'

export const history_router = createTRPCRouter({
  user_games: publicProcedure
    .input(
      z.object({
        user_id: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const entries = await ctx.db
        .select()
        .from(player_games)
        .where(eq(player_games.playerId, input.user_id))
        .orderBy(desc(player_games.gameNum))
      return entries
    }),
  sync: publicProcedure.mutation(async () => {
    await db.delete(raw_history).execute()
    await db.delete(player_games).execute()
    // const chunkedData = chunk(data, 100)
    // for (const chunk of chunkedData) {
    //   await insertGameHistory(chunk).catch((e) => {
    //     console.error(e)
    //   })
    // }
    // return data
  }),
})

function processGameEntry(gameId: number, game_num: number, entry: any) {
  const parsedEntry = typeof entry === 'string' ? JSON.parse(entry) : entry
  if (parsedEntry.game === '1v1-attrition') {
    return []
  }
  if (!parsedEntry.teams?.[0]?.[0] || !parsedEntry.teams?.[1]?.[0]) {
    console.log('skipping game', parsedEntry)
    return []
  }

  if (parsedEntry.winner === -2) {
    console.log('skipping ongoing game', parsedEntry)
    return []
  }
  const player0 = parsedEntry.teams[0][0]
  const player1 = parsedEntry.teams[1][0]
  let p0result = null
  let p1result = null

  if (parsedEntry.winner === 2) {
    p0result = 'tie'
    p1result = 'tie'
  } else if (parsedEntry.winner === 0) {
    p0result = 'win'
    p1result = 'loss'
  } else if (parsedEntry.winner === 1) {
    p0result = 'loss'
    p1result = 'win'
  } else {
    p0result = 'unknown'
    p1result = 'unknown'
  }
  return [
    {
      gameId,
      gameNum: game_num,
      gameTime: new Date(parsedEntry.time),
      gameType: parsedEntry.game,
      mmrChange: Number.parseFloat(player0.mmr_change),
      opponentId: player1.id,
      opponentMmr: Number.parseFloat(player1.mmr),
      opponentName: player1.name,
      playerId: player0.id,
      playerMmr: Number.parseFloat(player0.mmr),
      playerName: player0.name,
      result: p0result,
      won: parsedEntry.winner === 0,
    },
    {
      gameId,
      gameNum: game_num,
      gameTime: new Date(parsedEntry.time),
      gameType: parsedEntry.game,
      mmrChange: Number.parseFloat(player1.mmr_change),
      opponentId: player0.id,
      opponentMmr: Number.parseFloat(player0.mmr),
      opponentName: player0.name,
      playerId: player1.id,
      playerMmr: Number.parseFloat(player1.mmr),
      playerName: player1.name,
      result: p1result,
      won: parsedEntry.winner === 1,
    },
  ]
}
export async function insertGameHistory(entries: any[]) {
  const rawResults = await db
    .insert(raw_history)
    .values(entries.map((entry) => ({ entry, game_num: entry.game_num })))
    .returning()

  const playerGameRows = rawResults.flatMap(({ entry, id, game_num }) => {
    return processGameEntry(id, game_num, entry)
  })

  await db.insert(player_games).values(playerGameRows).onConflictDoNothing()
}
