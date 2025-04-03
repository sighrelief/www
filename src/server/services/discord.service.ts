import { env } from '@/env'
import ky from 'ky'

const DISCORD_URL = 'https://discord.com/api/v10'
const instance = ky.create({
  prefixUrl: DISCORD_URL,
  headers: {
    Authorization: `Bot ${env.DISCORD_BOT_TOKEN}`,
  },
  timeout: 10000,
})

export const discord_service = {
  get_user_by_id: async (user_id: string) => {
    const res = await instance.get(`users/${user_id}`)
    const res_json = await res.json<DiscordUser>()

    return {
      ...res_json,
      avatar_url: `https://cdn.discordapp.com/avatars/${user_id}/${res_json.avatar}.png`,
    }
  },
}
export type DiscordUser = {
  id: string
  username: string
  avatar: string
  discriminator: string
  public_flags: number
  flags: number
  banner?: unknown
  accent_color?: unknown
  global_name: string
  avatar_decoration_data?: unknown
  collectibles?: unknown
  banner_color?: unknown
  clan?: unknown
  primary_guild?: unknown
}
