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
  Medal,
  MinusCircle,
  Users,
} from 'lucide-react'
import { useFormatter } from 'next-intl'
import { useParams } from 'next/navigation'

const numberFormatter = new Intl.NumberFormat('en-US', {
  signDisplay: 'exceptZero',
})
const dateFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'long',
})
export function UserInfo() {
  const format = useFormatter()

  const [filter, setFilter] = useState('all')
  const { id } = useParams()
  if (!id || typeof id !== 'string') return null

  const [games] = api.history.user_games.useSuspenseQuery({ user_id: id })
  const [discord_user] = api.discord.get_user_by_id.useSuspenseQuery({
    user_id: id,
  })
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
    winRate: Math.round((wins / games_played) * 100),
    rank: 1,
  }

  const lastGame = games.at(0)
  const firstGame = games.at(-1)
  console.log(lastGame)
  return (
    <div className='min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900'>
      <div className='container mx-auto px-4 py-8'>
        <Card className='overflow-hidden border-none bg-white py-0 shadow-lg dark:bg-slate-900'>
          <CardHeader className='bg-gradient-to-r from-violet-500 to-purple-600 p-6'>
            <div className='flex flex-col items-center gap-6 md:flex-row'>
              <div className='relative'>
                <Avatar className='h-24 w-24 border-4 border-white shadow-md'>
                  <AvatarImage
                    src={profileData.avatar}
                    alt={profileData.username}
                  />
                  <AvatarFallback className='bg-violet-200 font-bold text-2xl text-violet-700'>
                    {profileData.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className='text-center md:text-left'>
                <h1 className='font-bold text-3xl text-white'>
                  {profileData.username}
                </h1>
                <p className='text-sm text-violet-200'>
                  {firstGame ? (
                    <>First game: {dateFormatter.format(firstGame.gameTime)}</>
                  ) : (
                    <>No games played yet</>
                  )}
                </p>
                <div className='mt-2 flex items-center justify-center gap-2 md:justify-start'>
                  <Badge
                    variant='secondary'
                    className='bg-white/20 text-white hover:bg-white/30'
                  >
                    <Users className='mr-1 h-3 w-3' />
                    Rank #342
                  </Badge>
                  <Badge
                    variant='secondary'
                    className='bg-white/20 text-white hover:bg-white/30'
                  >
                    <Medal className='mr-1 h-3 w-3' />
                    Gold
                  </Badge>
                </div>
              </div>

              <div className='flex flex-1 justify-end'>
                <div className='hidden rounded-lg bg-white/10 p-3 text-white backdrop-blur-sm md:block'>
                  <div className='font-medium text-sm'>Current MMR</div>
                  <div className='font-bold text-2xl'>
                    {Math.trunc(
                      lastGame ? lastGame.playerMmr + lastGame.mmrChange : 200
                    )}
                  </div>
                  <div className='text-violet-200 text-xs'>
                    {!!lastGame &&
                      (lastGame.mmrChange > 0 ? (
                        <span className='flex items-center text-green-300'>
                          <ChevronUp className='h-3 w-3' />
                          {numberFormatter.format(
                            Math.trunc(lastGame.mmrChange)
                          )}{' '}
                          last match
                        </span>
                      ) : (
                        <span className='flex items-center text-red-300'>
                          <ChevronDown className='h-3 w-3' />
                          {numberFormatter.format(
                            Math.trunc(lastGame.mmrChange)
                          )}{' '}
                          last match
                        </span>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className='p-0'>
            <div className='grid grid-cols-2 divide-x divide-y divide-gray-100 md:grid-cols-4 md:divide-y-0 dark:divide-gray-800'>
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
                description={`${Math.round((profileData.losses / profileData.games) * 100)}% loss rate`}
                accentColor='text-rose-500'
              />
              <StatsCard
                title='Ties'
                value={profileData.ties}
                icon={<MinusCircle className='h-5 w-5 text-amber-500' />}
                description={`${Math.round((profileData.ties / profileData.games) * 100)}% tie rate`}
                accentColor='text-amber-500'
              />
            </div>

            <Tabs defaultValue='matches' className='p-6'>
              <div className='mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center'>
                <TabsList className='bg-slate-100 dark:bg-slate-800'>
                  <TabsTrigger value='matches'>Match History</TabsTrigger>
                  <TabsTrigger value='stats'>Statistics</TabsTrigger>
                  <TabsTrigger value='achievements'>Achievements</TabsTrigger>
                </TabsList>

                <div className='flex items-center gap-2'>
                  <Filter className='h-4 w-4 text-slate-400' />
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
                        <TableRow className='bg-slate-50 dark:bg-slate-800/50'>
                          <TableHead className='w-[100px]'>Game Type</TableHead>
                          <TableHead>Opponent</TableHead>
                          <TableHead className='text-right'>
                            Opponent MMR
                          </TableHead>
                          <TableHead className='text-right'>Your MMR</TableHead>
                          <TableHead className='text-right'>Result</TableHead>
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
                        {games.map((game) => (
                          <TableRow
                            key={game.gameId}
                            className='transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/70'
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
                            <TableCell className='text-right'>
                              {Math.trunc(game.opponentMmr)}
                            </TableCell>
                            <TableCell className='text-right'>
                              {Math.trunc(game.playerMmr)}
                            </TableCell>
                            <TableCell className='text-right'>
                              {game.mmrChange > 0 ? (
                                <span className='flex items-center justify-end font-medium text-emerald-500'>
                                  <ArrowUpCircle className='mr-1 inline h-4 w-4' />
                                  {numberFormatter.format(
                                    Math.trunc(game.mmrChange)
                                  )}
                                </span>
                              ) : (
                                <span className='flex items-center justify-end font-medium text-rose-500'>
                                  <ArrowDownCircle className='mr-1 inline h-4 w-4' />
                                  {numberFormatter.format(
                                    Math.trunc(game.mmrChange)
                                  )}
                                </span>
                              )}
                            </TableCell>
                            <TableCell className='text-right text-slate-500 dark:text-slate-400'>
                              {format.dateTime(game.gameTime, {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                              })}
                            </TableCell>
                            <TableCell className='text-right text-slate-500 dark:text-slate-400'>
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
                <div className='flex h-40 items-center justify-center rounded-lg border bg-slate-50 dark:bg-slate-800/50'>
                  <p className='text-slate-500 dark:text-slate-400'>
                    Statistics coming soon
                  </p>
                </div>
              </TabsContent>

              <TabsContent value='achievements' className='m-0'>
                <div className='flex h-40 items-center justify-center rounded-lg border bg-slate-50 dark:bg-slate-800/50'>
                  <p className='text-slate-500 dark:text-slate-400'>
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
      <h3 className='mb-1 font-medium text-slate-500 text-sm dark:text-slate-400'>
        {title}
      </h3>
      <p className={cn('font-bold text-3xl', accentColor)}>{value}</p>
      <p className='mt-1 text-slate-500 text-xs dark:text-slate-400'>
        {description}
      </p>
    </div>
  )
}
