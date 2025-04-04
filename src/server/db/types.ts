import type { player_games } from '@/server/db/schema'

export type SelectGames = typeof player_games.$inferSelect
