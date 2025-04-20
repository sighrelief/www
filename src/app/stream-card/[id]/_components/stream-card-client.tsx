'use client'

import { RANKED_CHANNEL } from '@/shared/constants'
import { api } from '@/trpc/react'
import { ArrowDown, ArrowUp } from 'lucide-react'
import { useParams } from 'next/navigation'
import { useEffect } from 'react'

export function StreamCardClient() {
  const { id } = useParams()
  if (!id || typeof id !== 'string') {
    return null
  }

  const [gamesQueryResult, gamesQuery] =
    api.history.user_games.useSuspenseQuery({ user_id: id })
  const games = gamesQueryResult || [] // Ensure games is always an array

  const [rankedUserRank, rankedUserQuery] =
    api.leaderboard.get_user_rank.useSuspenseQuery({
      channel_id: RANKED_CHANNEL,
      user_id: id,
    })

  useEffect(() => {
    setInterval(
      () => {
        gamesQuery.refetch()
        rankedUserQuery.refetch()
      },
      // 1 minute
      1000 * 60 * 1
    )
  }, [])

  if (!rankedUserRank || !games?.length) {
    return null
  }
  const filteredGamesByLeaderboard = games.filter(
    (game) => game.gameType === 'ranked'
  )

  const games_played = filteredGamesByLeaderboard.length
  let wins = 0
  let losses = 0
  let ties = 0
  for (const game of filteredGamesByLeaderboard) {
    if (game.result === 'win') {
      wins++
    } else if (game.result === 'loss') {
      losses++
    } else if (game.result === 'tie') {
      ties++
    } else {
      ties++
    }
  }

  const lastGame = filteredGamesByLeaderboard.at(0)

  const currentName = lastGame?.playerName
  const meaningful_games = games_played - ties
  const playerData = {
    username: currentName,
    games: games_played,
    meaningful_games,
    wins,
    losses,
    ties,
    winRate:
      meaningful_games > 0 ? Math.ceil((wins / meaningful_games) * 100) : 0,
    lossRate:
      meaningful_games > 0 ? Math.floor((losses / meaningful_games) * 100) : 0,
    rank: rankedUserRank.rank,
    mmr: Math.round(rankedUserRank.mmr),
    mmrChange: `${(lastGame?.mmrChange ?? 0) >= 0 ? '+' : '-'}${Math.round(lastGame?.mmrChange ?? 0)}`,
    streak: rankedUserRank?.streak,
  }
  return (
    <div
      style={{ zoom: '200%' }}
      className='flex h-10 w-full max-w-[550px] items-center overflow-hidden rounded-md border-2 border-slate-800 bg-slate-900/90 text-white shadow-lg backdrop-blur-sm'
    >
      <div className='flex h-full items-center gap-1 border-slate-700 border-r bg-gradient-to-r from-indigo-600 to-purple-600 px-2'>
        <span className='font-bold text-sm'>{playerData.rank}</span>
      </div>

      {/* Player Name */}
      <div className='max-w-[180px] flex-shrink-0 border-slate-700 border-r px-2'>
        <div className='truncate font-medium'>{playerData.username}</div>
      </div>

      {/* MMR */}
      <div className='flex items-center gap-1.5 border-slate-700 border-r px-2'>
        <div>MMR:</div>
        <div className='font-bold'>{playerData.mmr}</div>
        <div className='text-emerald-400 text-sm'>{playerData.mmrChange}</div>
      </div>

      {/* Win Rate */}
      <div className='flex items-center gap-1.5 border-slate-700 border-r px-2'>
        <div>Win Rate:</div>
        <div className='text font-bold text-emerald-400'>
          {playerData.winRate}%
        </div>
      </div>

      {/* Win/Loss */}
      <div className='flex items-center gap-0.5 border-slate-700 border-r px-2'>
        <div className='flex items-center'>
          <div className='ml-0.5 font-bold text-emerald-400'>
            {playerData.wins}W
          </div>
        </div>
        |
        <div className='flex items-center'>
          <div className='ml-0.5 font-bold text-rose-400'>
            {playerData.losses}L
          </div>
        </div>
      </div>

      {/* Streak */}
      <div className='flex items-center gap-1.5 border-slate-700 px-2'>
        <div>Streak:</div>
        <div className='font-bold text-emerald-400'>{playerData.streak}</div>
      </div>
    </div>
  )
}
