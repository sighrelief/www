import ky from 'ky'

const NEATQUEUE_URL = 'https://api.neatqueue.com/api'

const instance = ky.create({
  prefixUrl: NEATQUEUE_URL,
  timeout: 60000,
})

const BMM_SERVER_ID = '1226193436521267223'

export const neatqueue_service = {
  get_leaderboard: async (channel_id: string) => {
    const response = await instance.get(
      `leaderboard/${BMM_SERVER_ID}/${channel_id}`
    )

    return response.json<LeaderboardResponse>()
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

export type LeaderboardEntry = {
  id: string
  data: Data
  name: string
}
export type LeaderboardResponse = {
  alltime: LeaderboardEntry[]
}
