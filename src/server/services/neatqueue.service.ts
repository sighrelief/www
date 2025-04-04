import ky from 'ky'

const NEATQUEUE_URL = 'https://api.neatqueue.com/api'

const instance = ky.create({
  prefixUrl: NEATQUEUE_URL,
  timeout: 60000,
})

const BMM_SERVER_ID = '1226193436521267223'

export const neatqueue_service = {
  get_leaderboard: async (channel_id: string) => {
    const res = await instance
      .get(`leaderboard/${BMM_SERVER_ID}/${channel_id}`)
      .json<LeaderboardResponse>()

    //desc
    res.alltime.sort((a, b) => b.data.mmr - a.data.mmr)
    const fixed: Array<Data & { id: string; name: string }> = res.alltime.map(
      (entry, idx) => {
        return {
          ...entry.data,
          rank: idx + 1,
          id: entry.id,
          name: entry.name,
          totalgames: entry.data.wins + entry.data.losses,
          winrate: entry.data.wins / (entry.data.wins + entry.data.losses),
        }
      }
    )
    return fixed
  },
  get_history: async (
    player_ids: string[],
    server_id: string = BMM_SERVER_ID
  ) => {
    const response = await instance
      .get(`history/${server_id}`, {
        searchParams: {
          server_id,
        },
      })
      .json()
    return response
  },
}
export type Data = {
  mmr: number
  wins: number
  losses: number
  streak: number
  totalgames: number
  decay: number
  ign?: any
  peak_mmr: number
  peak_streak: number
  rank: number
  winrate: number
}

export type LeaderboardEntryInternal = {
  id: string
  data: Data
  name: string
}
export type LeaderboardResponse = {
  alltime: LeaderboardEntryInternal[]
}

export type LeaderboardEntry = Data & {
  id: string
  name: string
}
