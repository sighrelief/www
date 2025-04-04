'use client'

import type React from 'react'
import { useState } from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { RANKED_CHANNEL, VANILLA_CHANNEL } from '@/shared/constants'
import { api } from '@/trpc/react'
import {
  ArrowDownCircle,
  ArrowUpCircle,
  BarChart3,
  Calendar,
  ChevronDown,
  ChevronUp,
  Clock,
  Filter,
  MinusCircle,
  Star,
  Trophy,
} from 'lucide-react'
import { useFormatter } from 'next-intl'
import { useParams } from 'next/navigation'
import { isNonNullish } from 'remeda'

const numberFormatter = new Intl.NumberFormat('en-US', {
  signDisplay: 'exceptZero',
})
const dateFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'long',
})

export function UserInfo() {
  const format = useFormatter()

  const [filter, setFilter] = useState('all')
  const [leaderboardFilter, setLeaderboardFilter] = useState('all')
  const { id } = useParams()
  if (!id || typeof id !== 'string') return null

  // Fetch games data unconditionally
  const gamesQuery = api.history.user_games.useSuspenseQuery({ user_id: id })
  const games = gamesQuery[0] || [] // Ensure games is always an array

  const [discord_user] = api.discord.get_user_by_id.useSuspenseQuery({
    user_id: id,
  })

  // Mock data for the two leaderboards - replace with actual API calls
  const [rankedLeaderboard] = api.leaderboard.get_leaderboard.useSuspenseQuery({
    channel_id: RANKED_CHANNEL,
  })
  const [vanillaLeaderboard] = api.leaderboard.get_leaderboard.useSuspenseQuery(
    {
      channel_id: VANILLA_CHANNEL,
    }
  )
  const [vanillaUserRank] = api.leaderboard.get_user_rank.useSuspenseQuery({
    channel_id: VANILLA_CHANNEL,
    user_id: id,
  })
  const [rankedUserRank] = api.leaderboard.get_user_rank.useSuspenseQuery({
    channel_id: RANKED_CHANNEL,
    user_id: id,
  })

  // Filter games by leaderboard if needed
  const filteredGamesByLeaderboard =
    leaderboardFilter === 'all'
      ? games
      : games.filter((game) => game.gameType === leaderboardFilter)

  // Filter by result
  const filteredGames =
    filter === 'all'
      ? filteredGamesByLeaderboard
      : filter === 'wins'
        ? filteredGamesByLeaderboard.filter((game) => game.result === 'win')
        : filter === 'losses'
          ? filteredGamesByLeaderboard.filter((game) => game.result === 'loss')
          : filteredGamesByLeaderboard.filter((game) => game.result === 'tie')

  const games_played = games.length
  let wins = 0
  let losses = 0
  let ties = 0
  for (const game of games) {
    if (game.result === 'win') {
      wins++
    } else if (game.result === 'loss') {
      losses++
    } else if (game.result === 'tie') {
      ties++
    }
  }

  const profileData = {
    username: discord_user.username,
    avatar: discord_user.avatar_url,
    games: games_played,
    wins,
    losses,
    ties,
    winRate: games_played > 0 ? Math.round((wins / games_played) * 100) : 0,
  }

  const lastGame = games.at(0)
  const firstGame = games.at(-1)

  // Get last games for each leaderboard
  const lastGameLeaderboard1 = games
    .filter((game) => game.gameType === 'ranked')
    .at(0)
  const lastGameLeaderboard2 = games
    .filter((game) => game.gameType.toLowerCase() === 'vanilla')
    .at(0)

  return (
    <div className='min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-zinc-900 dark:to-zinc-950'>
      <div className='container mx-auto'>
        <Card className='overflow-hidden border-none bg-white py-0 shadow-lg dark:bg-zinc-900'>
          <CardHeader className='border-gray-200 border-b bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900'>
            <div className='flex flex-col items-center gap-6 md:flex-row'>
              <div className='relative'>
                <Avatar className='h-24 w-24 border-4 border-gray-100 shadow-md dark:border-zinc-800'>
                  <AvatarImage
                    src={profileData.avatar}
                    alt={profileData.username}
                  />
                  <AvatarFallback className='bg-violet-50 font-bold text-2xl text-violet-600 dark:bg-violet-900/30 dark:text-violet-300'>
                    {profileData.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className='text-center md:text-left'>
                <h1 className='font-bold text-3xl text-gray-900 dark:text-white'>
                  {profileData.username}
                </h1>
                <p className='text-gray-500 text-sm dark:text-zinc-400'>
                  {firstGame ? (
                    <>First game: {dateFormatter.format(firstGame.gameTime)}</>
                  ) : (
                    <>No games played yet</>
                  )}
                </p>
                <div className='mt-2 flex flex-wrap items-center justify-center gap-2 md:justify-start'>
                  {!!rankedLeaderboard && (
                    <Badge
                      variant='outline'
                      className='border-gray-200 bg-gray-50 dark:border-zinc-700 dark:bg-zinc-800'
                    >
                      <Trophy className='mr-1 h-3 w-3 text-violet-500' />
                      <span className='text-gray-700 dark:text-zinc-300'>
                        Ranked Queue:{' '}
                        {isNonNullish(rankedUserRank?.rank)
                          ? `#${rankedUserRank.rank}`
                          : 'N/A'}
                      </span>
                    </Badge>
                  )}
                  {!!vanillaLeaderboard && (
                    <Badge
                      variant='outline'
                      className='border-gray-200 bg-gray-50 dark:border-zinc-700 dark:bg-zinc-800'
                    >
                      <Trophy className='mr-1 h-3 w-3 text-violet-500' />
                      <span className='text-gray-700 dark:text-zinc-300'>
                        Vanilla Queue:{' '}
                        {isNonNullish(vanillaUserRank?.rank)
                          ? `#${vanillaUserRank.rank}`
                          : 'N/A'}
                      </span>
                    </Badge>
                  )}
                </div>
              </div>

              <div className='flex flex-1 justify-end'>
                <div className='flex gap-3'>
                  {lastGameLeaderboard1 && (
                    <div className='hidden rounded-lg border border-gray-200 bg-gray-50 p-3 md:block dark:border-zinc-700 dark:bg-zinc-800'>
                      <div className='font-medium text-gray-500 text-sm dark:text-zinc-400'>
                        Ranked Queue MMR
                      </div>
                      <div className='font-bold text-2xl text-gray-900 dark:text-white'>
                        {Math.trunc(
                          lastGameLeaderboard1.playerMmr +
                            lastGameLeaderboard1.mmrChange
                        )}
                      </div>
                      <div className='text-gray-500 text-xs dark:text-zinc-400'>
                        {lastGameLeaderboard1.mmrChange > 0 ? (
                          <span className='flex items-center text-emerald-500'>
                            <ChevronUp className='h-3 w-3' />
                            {numberFormatter.format(
                              Math.trunc(lastGameLeaderboard1.mmrChange)
                            )}{' '}
                            last match
                          </span>
                        ) : (
                          <span className='flex items-center text-rose-500'>
                            <ChevronDown className='h-3 w-3' />
                            {numberFormatter.format(
                              Math.trunc(lastGameLeaderboard1.mmrChange)
                            )}{' '}
                            last match
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {lastGameLeaderboard2 && (
                    <div className='hidden rounded-lg border border-gray-200 bg-gray-50 p-3 md:block dark:border-zinc-700 dark:bg-zinc-800'>
                      <div className='font-medium text-gray-500 text-sm dark:text-zinc-400'>
                        Vanilla Queue MMR
                      </div>
                      <div className='font-bold text-2xl text-gray-900 dark:text-white'>
                        {Math.trunc(
                          lastGameLeaderboard2.playerMmr +
                            lastGameLeaderboard2.mmrChange
                        )}
                      </div>
                      <div className='text-gray-500 text-xs dark:text-zinc-400'>
                        {lastGameLeaderboard2.mmrChange > 0 ? (
                          <span className='flex items-center text-emerald-500'>
                            <ChevronUp className='h-3 w-3' />
                            {numberFormatter.format(
                              Math.trunc(lastGameLeaderboard2.mmrChange)
                            )}{' '}
                            last match
                          </span>
                        ) : (
                          <span className='flex items-center text-rose-500'>
                            <ChevronDown className='h-3 w-3' />
                            {numberFormatter.format(
                              Math.trunc(lastGameLeaderboard2.mmrChange)
                            )}{' '}
                            last match
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className='p-0'>
            <div className='grid grid-cols-2 divide-x divide-y divide-gray-100 md:grid-cols-4 md:divide-y-0 dark:divide-zinc-800'>
              <StatsCard
                title='Games'
                value={profileData.games}
                icon={<BarChart3 className='h-5 w-5 text-violet-500' />}
                description='Total matches'
              />
              <StatsCard
                title='Wins'
                value={profileData.wins}
                icon={<ArrowUpCircle className='h-5 w-5 text-emerald-500' />}
                description={`${profileData.winRate}% win rate`}
                accentColor='text-emerald-500'
              />
              <StatsCard
                title='Losses'
                value={profileData.losses}
                icon={<ArrowDownCircle className='h-5 w-5 text-rose-500' />}
                description={`${profileData.games > 0 ? Math.round((profileData.losses / profileData.games) * 100) : 0}% loss rate`}
                accentColor='text-rose-500'
              />
              <StatsCard
                title='Ties'
                value={profileData.ties}
                icon={<MinusCircle className='h-5 w-5 text-amber-500' />}
                description={`${profileData.games > 0 ? Math.round((profileData.ties / profileData.games) * 100) : 0}% tie rate`}
                accentColor='text-amber-500'
              />
            </div>

            <Tabs defaultValue='matches' className='p-6'>
              <div className='mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center'>
                <TabsList className='bg-gray-100 dark:bg-zinc-800'>
                  <TabsTrigger value='matches'>Match History</TabsTrigger>
                  <TabsTrigger value='stats'>Statistics</TabsTrigger>
                  <TabsTrigger value='achievements'>Achievements</TabsTrigger>
                </TabsList>

                <div className='flex items-center gap-2'>
                  <div className='mr-2 flex items-center gap-2'>
                    <Trophy className='h-4 w-4 text-gray-400 dark:text-zinc-400' />
                    <Select
                      value={leaderboardFilter}
                      onValueChange={setLeaderboardFilter}
                    >
                      <SelectTrigger className='h-9 w-[150px]'>
                        <SelectValue placeholder='Leaderboard' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='all'>All Leaderboards</SelectItem>
                        <SelectItem value='ranked'>Ranked</SelectItem>
                        <SelectItem value='vanilla'>Vanilla</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Filter className='h-4 w-4 text-gray-400 dark:text-zinc-400' />
                  <Select value={filter} onValueChange={setFilter}>
                    <SelectTrigger className='h-9 w-[120px]'>
                      <SelectValue placeholder='Filter' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='all'>All Games</SelectItem>
                      <SelectItem value='wins'>Wins</SelectItem>
                      <SelectItem value='losses'>Losses</SelectItem>
                      <SelectItem value='ties'>Ties</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <TabsContent value='matches' className='m-0'>
                <div className='overflow-hidden rounded-lg border'>
                  <div className='overflow-x-auto'>
                    <Table>
                      <TableHeader>
                        <TableRow className='bg-gray-50 dark:bg-zinc-800/50'>
                          <TableHead className='w-[100px]'>Game Type</TableHead>
                          <TableHead>Opponent</TableHead>
                          <TableHead className='text-right'>
                            Opponent MMR
                          </TableHead>
                          <TableHead className='text-right'>MMR</TableHead>
                          <TableHead className='text-right'>Result</TableHead>
                          <TableHead className='text-center'>
                            Leaderboard
                          </TableHead>
                          <TableHead className='text-right'>
                            <span className='flex items-center justify-end gap-1'>
                              <Calendar className='h-4 w-4' /> Date
                            </span>
                          </TableHead>
                          <TableHead className='text-right'>
                            <span className='flex items-center justify-end gap-1'>
                              <Clock className='h-4 w-4' /> Time
                            </span>
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredGames.map((game) => (
                          <TableRow
                            key={game.gameId}
                            className='transition-colors hover:bg-gray-50 dark:hover:bg-zinc-800/70'
                          >
                            <TableCell>
                              <Badge
                                variant='outline'
                                className='font-normal capitalize'
                              >
                                {game.gameType}
                              </Badge>
                            </TableCell>
                            <TableCell className='font-medium'>
                              {game.opponentName}
                            </TableCell>
                            <TableCell className='text-right font-mono'>
                              {Math.trunc(game.opponentMmr)}
                            </TableCell>
                            <TableCell className='text-right font-mono'>
                              {Math.trunc(game.playerMmr)}
                            </TableCell>
                            <TableCell className='text-right font-mono'>
                              {game.mmrChange > 0 ? (
                                <span className='flex items-center justify-end font-medium text-emerald-500'>
                                  {numberFormatter.format(
                                    Math.trunc(game.mmrChange)
                                  )}
                                  <ArrowUpCircle className='ml-1 inline h-4 w-4' />
                                </span>
                              ) : (
                                <span className='flex items-center justify-end font-medium text-rose-500'>
                                  {numberFormatter.format(
                                    Math.trunc(game.mmrChange)
                                  )}
                                  <ArrowDownCircle className='ml-1 inline h-4 w-4' />
                                </span>
                              )}
                            </TableCell>
                            <TableCell className='text-center'>
                              <Badge
                                variant='outline'
                                className={cn(
                                  'w-full font-normal',
                                  game.gameType === 'ranked'
                                    ? 'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-950 dark:text-violet-300'
                                    : game.gameType.toLowerCase() === 'vanilla'
                                      ? 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                      : 'border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-700 dark:text-zinc-300'
                                )}
                              >
                                {game.gameType === 'ranked'
                                  ? 'Ranked Queue'
                                  : game.gameType.toLowerCase() === 'vanilla'
                                    ? 'Vanilla Queue'
                                    : 'N/A'}
                              </Badge>
                            </TableCell>
                            <TableCell className='text-right font-mono text-slate-500 dark:text-slate-400'>
                              {format.dateTime(game.gameTime, {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                              })}
                            </TableCell>
                            <TableCell className='text-right font-mono text-slate-500 dark:text-slate-400'>
                              {format.dateTime(game.gameTime, {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value='stats' className='m-0'>
                <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                  {(rankedLeaderboard || lastGameLeaderboard1) && (
                    <LeaderboardStatsCard
                      title='Ranked Queue Stats'
                      rank={rankedUserRank?.rank}
                      mmr={
                        lastGameLeaderboard1
                          ? Math.trunc(
                              lastGameLeaderboard1.playerMmr +
                                lastGameLeaderboard1.mmrChange
                            )
                          : undefined
                      }
                      icon={<Trophy className='h-5 w-5 text-violet-500' />}
                      accentColor='text-violet-500'
                    />
                  )}

                  {(vanillaLeaderboard || lastGameLeaderboard2) && (
                    <LeaderboardStatsCard
                      title='Vanilla Queue Stats'
                      rank={vanillaUserRank?.rank}
                      mmr={
                        lastGameLeaderboard2
                          ? Math.trunc(
                              lastGameLeaderboard2.playerMmr +
                                lastGameLeaderboard2.mmrChange
                            )
                          : undefined
                      }
                      icon={<Star className='h-5 w-5 text-amber-500' />}
                      accentColor='text-amber-500'
                    />
                  )}

                  {!rankedLeaderboard &&
                    !vanillaLeaderboard &&
                    !lastGameLeaderboard1 &&
                    !lastGameLeaderboard2 && (
                      <div className='col-span-2 flex h-40 items-center justify-center rounded-lg border bg-gray-50 dark:bg-zinc-800/50'>
                        <p className='text-gray-500 dark:text-zinc-400'>
                          No leaderboard data available
                        </p>
                      </div>
                    )}
                </div>
              </TabsContent>

              <TabsContent value='achievements' className='m-0'>
                <div className='flex h-40 items-center justify-center rounded-lg border bg-gray-50 dark:bg-zinc-800/50'>
                  <p className='text-gray-500 dark:text-zinc-400'>
                    Achievements coming soon
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

interface StatsCardProps {
  title: string
  value: number
  icon: React.ReactNode
  description: string
  accentColor?: string
}

function StatsCard({
  title,
  value,
  icon,
  description,
  accentColor = 'text-violet-500',
}: StatsCardProps) {
  return (
    <div className='flex flex-col items-center p-6 text-center'>
      <div className='mb-2 flex items-center justify-center'>{icon}</div>
      <h3 className='mb-1 font-medium text-gray-500 text-sm dark:text-zinc-400'>
        {title}
      </h3>
      <p className={cn('font-bold text-3xl', accentColor)}>{value}</p>
      <p className='mt-1 text-gray-500 text-xs dark:text-zinc-400'>
        {description}
      </p>
    </div>
  )
}

interface LeaderboardStatsCardProps {
  title: string
  rank?: number
  mmr?: number
  icon: React.ReactNode
  accentColor?: string
}

function LeaderboardStatsCard({
  title,
  rank,
  mmr,
  icon,
  accentColor = 'text-violet-500',
}: LeaderboardStatsCardProps) {
  return (
    <div className='rounded-lg border bg-white p-6 dark:bg-zinc-800/20'>
      <div className='mb-4 flex items-center gap-3'>
        <div
          className={cn(
            'rounded-full bg-gray-100 p-2 dark:bg-zinc-800',
            accentColor
          )}
        >
          {icon}
        </div>
        <h3 className='font-semibold text-lg'>{title}</h3>
      </div>

      <div className='grid grid-cols-2 gap-4'>
        {rank !== undefined && (
          <div className='rounded-lg bg-gray-50 p-4 dark:bg-zinc-800/40'>
            <p className='text-gray-500 text-sm dark:text-zinc-400'>Rank</p>
            <p className={cn('mt-1 font-bold text-2xl', accentColor)}>
              #{rank}
            </p>
          </div>
        )}

        {mmr !== undefined && (
          <div className='rounded-lg bg-gray-50 p-4 dark:bg-zinc-800/40'>
            <p className='text-gray-500 text-sm dark:text-zinc-400'>MMR</p>
            <p className={cn('mt-1 font-bold text-2xl', accentColor)}>{mmr}</p>
          </div>
        )}

        {rank === undefined && mmr === undefined && (
          <div className='col-span-2 flex h-20 items-center justify-center rounded-lg bg-gray-50 p-4 dark:bg-zinc-800/40'>
            <p className='text-gray-500 dark:text-zinc-400'>
              No data available
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
