import { redis } from '../redis'
import { neatqueue_service } from './neatqueue.service'

export class LeaderboardService {
  private getZSetKey(channel_id: string) {
    return `zset:leaderboard:${channel_id}`
  }

  private getRawKey(channel_id: string) {
    return `raw:leaderboard:${channel_id}`
  }

  private getUserKey(user_id: string, channel_id: string) {
    return `user:${user_id}:${channel_id}`
  }

  async refreshLeaderboard(channel_id: string) {
    try {
      const fresh = await neatqueue_service.get_leaderboard(channel_id)
      const zsetKey = this.getZSetKey(channel_id)
      const rawKey = this.getRawKey(channel_id)

      const pipeline = redis.pipeline()
      pipeline.setex(rawKey, 180, JSON.stringify(fresh))
      pipeline.del(zsetKey)

      for (const entry of fresh) {
        pipeline.zadd(zsetKey, entry.mmr, entry.id)
        pipeline.hset(this.getUserKey(entry.id, channel_id), {
          ...entry,
          channel_id,
        })
      }

      pipeline.expire(zsetKey, 180)
      await pipeline.exec()

      return fresh
    } catch (error) {
      console.error('Error refreshing leaderboard:', error)
      throw error
    }
  }

  async getLeaderboard(channel_id: string) {
    try {
      const cached = await redis.get(this.getRawKey(channel_id))
      if (cached) return JSON.parse(cached)

      return await this.refreshLeaderboard(channel_id)
    } catch (error) {
      console.error('Error getting leaderboard:', error)
      throw error
    }
  }

  async getUserRank(channel_id: string, user_id: string) {
    try {
      const zsetKey = this.getZSetKey(channel_id)
      const rank = await redis.zrevrank(zsetKey, user_id)

      if (rank === null) return null

      const userData = await redis.hgetall(this.getUserKey(user_id, channel_id))
      if (!userData) return null

      return {
        rank: rank + 1,
        ...userData,
        mmr: Number(userData.mmr),
      }
    } catch (error) {
      console.error('Error getting user rank:', error)
      throw error
    }
  }
}
