import { redis } from '../redis'
import { neatqueue_service } from './neatqueue.service'
export class LeaderboardService {
  private getZSetKey(channel_id: string) {
    return `zset:leaderboard:${channel_id}`
  }

  private getRawKey(channel_id: string) {
    return `raw:leaderboard:${channel_id}`
  }

  async refreshLeaderboard(channel_id: string) {
    const fresh = await neatqueue_service.get_leaderboard(channel_id)
    const zsetKey = this.getZSetKey(channel_id)
    const rawKey = this.getRawKey(channel_id)

    // store raw data for full queries
    await redis.setex(rawKey, 180, JSON.stringify(fresh))

    // store sorted set for rank queries
    const pipeline = redis.pipeline()
    pipeline.del(zsetKey) // clear existing

    for (const entry of fresh.alltime) {
      // store by mmr for ranking
      pipeline.zadd(zsetKey, entry.data.mmr, entry.id)

      // store user data separately for quick lookups
      pipeline.hset(`user:${entry.id}`, {
        name: entry.name,
        mmr: entry.data.mmr,
        wins: entry.data.wins,
        losses: entry.data.losses,
        // add other fields you need for quick lookup
      })
    }

    pipeline.expire(zsetKey, 180)
    await pipeline.exec()
  }

  async getLeaderboard(channel_id: string) {
    const cached = await redis.get(this.getRawKey(channel_id))
    if (cached) return JSON.parse(cached)

    // if not cached, refresh and return
    await this.refreshLeaderboard(channel_id)
    // @ts-ignore
    return redis.get(this.getRawKey(channel_id)).then(JSON.parse)
  }

  async getUserRank(channel_id: string, user_id: string) {
    const zsetKey = this.getZSetKey(channel_id)

    // zrevrank because higher mmr = better rank
    const rank = await redis.zrevrank(zsetKey, user_id)
    if (rank === null) return null

    // get user data
    const userData = await redis.hgetall(`user:${user_id}`)
    if (!userData) return null

    return {
      rank: rank + 1, // zero-based -> one-based
      ...userData,
    }
  }

  // get users around a specific rank
  async getRankRange(channel_id: string, rank: number, range = 5) {
    const zsetKey = this.getZSetKey(channel_id)

    // get ids
    const ids = await redis.zrevrange(
      zsetKey,
      Math.max(0, rank - range),
      rank + range
    )

    // get data for each id
    const pipeline = redis.pipeline()
    // biome-ignore lint/complexity/noForEach: <explanation>
    ids.forEach((id) => pipeline.hgetall(`user:${id}`))

    const results = await pipeline.exec()
    return ids.map((id, i) => ({
      id,
      rank: rank - range + i + 1,
      // @ts-ignore
      ...results[i][1],
    }))
  }
}
