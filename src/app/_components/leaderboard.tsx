'use client'

import type React from 'react'
import { type ComponentPropsWithoutRef, Fragment, useRef } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
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
import { useVirtualizer } from '@tanstack/react-virtual'
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Flame,
  Info,
  Medal,
  Search,
  TrendingUp,
  Trophy,
  Users,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

export function LeaderboardPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get the leaderboard type from URL or default to 'ranked'
  const leaderboardType = searchParams.get('type') || 'ranked'

  // State for search and sorting
  const [searchQuery, setSearchQuery] = useState('')
  const [sortColumn, setSortColumn] = useState('rank')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  // Fetch leaderboard data
  const [rankedLeaderboard] = api.leaderboard.get_leaderboard.useSuspenseQuery({
    channel_id: RANKED_CHANNEL,
  })

  const [vanillaLeaderboard] = api.leaderboard.get_leaderboard.useSuspenseQuery(
    {
      channel_id: VANILLA_CHANNEL,
    }
  )

  // Handle tab change
  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams)
    params.set('type', value)
    router.push(`?${params.toString()}`)
  }

  // Get the current leaderboard based on selected tab
  const currentLeaderboard =
    leaderboardType === 'ranked' ? rankedLeaderboard : vanillaLeaderboard

  // Filter leaderboard by search query
  const filteredLeaderboard = currentLeaderboard.filter((entry) =>
    entry.name.toLowerCase().includes(searchQuery.toLowerCase())
  )
  console.log(filteredLeaderboard)
  // Sort leaderboard
  const sortedLeaderboard = [...filteredLeaderboard].sort((a, b) => {
    // biome-ignore lint/style/useSingleVarDeclarator: <explanation>
    // biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
    let valueA, valueB

    // Handle special case for rank which is already sorted
    if (sortColumn === 'rank') {
      valueA = a.rank
      valueB = b.rank
    } else if (sortColumn === 'name') {
      valueA = a.name.toLowerCase()
      valueB = b.name.toLowerCase()
      return sortDirection === 'asc'
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA)
    } else {
      valueA = a[sortColumn as keyof typeof a] as number
      valueB = b[sortColumn as keyof typeof b] as number
    }

    return sortDirection === 'asc' ? valueA - valueB : valueB - valueA
  })

  // Handle column sort
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  // Get medal for top 3 players
  const getMedal = (rank: number) => {
    if (rank === 1) return <Medal className='h-5 w-5 text-yellow-500' />
    if (rank === 2) return <Medal className='h-5 w-5 text-slate-400' />
    if (rank === 3) return <Medal className='h-5 w-5 text-amber-700' />
    return null
  }

  return (
    <div className='flex min-h-screen flex-col bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900'>
      <div className='container mx-auto flex flex-1 flex-col px-4 py-4'>
        <Card className='flex flex-1 flex-col overflow-hidden border-none bg-white p-0 shadow-lg dark:bg-slate-900'>
          <CardHeader className='bg-gradient-to-r from-violet-500 to-purple-600 p-6'>
            <div className='flex flex-col items-center justify-between gap-4 md:flex-row'>
              <div>
                <h1 className='flex items-center gap-2 font-bold text-3xl text-white'>
                  <Trophy className='h-7 w-7' />
                  Leaderboards
                </h1>
                <p className='mt-1 text-violet-200'>
                  View player rankings and statistics
                </p>
              </div>

              <div className='flex items-center gap-3'>
                <Badge
                  variant='secondary'
                  className='bg-white/20 text-white hover:bg-white/30'
                >
                  <Users className='mr-1 h-3 w-3' />
                  {currentLeaderboard.length} Players
                </Badge>

                <Button
                  variant='secondary'
                  size='sm'
                  className='bg-white/20 text-white hover:bg-white/30'
                >
                  <Info className='mr-1 h-4 w-4' />
                  How Rankings Work
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className='flex flex-1 flex-col p-0'>
            <Tabs
              defaultValue={leaderboardType}
              value={leaderboardType}
              onValueChange={handleTabChange}
              className='flex flex-1 flex-col p-4 md:p-6'
            >
              <div className='mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center'>
                <TabsList className='bg-slate-100 dark:bg-slate-800'>
                  <TabsTrigger value='ranked'>Ranked Leaderboard</TabsTrigger>
                  <TabsTrigger value='vanilla'>Vanilla Leaderboard</TabsTrigger>
                </TabsList>

                <div className='relative w-full sm:w-auto'>
                  <Search className='absolute top-2.5 left-2.5 h-4 w-4 text-slate-400' />
                  <Input
                    placeholder='Search players...'
                    className='w-full pl-9 sm:w-[250px]'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <TabsContent value='ranked' className='m-0 flex flex-1 flex-col'>
                <LeaderboardTable
                  leaderboard={sortedLeaderboard}
                  sortColumn={sortColumn}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                  getMedal={getMedal}
                  type='ranked'
                />
              </TabsContent>

              <TabsContent value='vanilla' className='m-0 flex flex-1 flex-col'>
                <LeaderboardTable
                  leaderboard={sortedLeaderboard}
                  sortColumn={sortColumn}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                  getMedal={getMedal}
                  type='vanilla'
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

interface LeaderboardTableProps {
  leaderboard: any[]
  sortColumn: string
  sortDirection: 'asc' | 'desc'
  onSort: (column: string) => void
  getMedal: (rank: number) => React.ReactNode
  type: string
}

function LeaderboardTable({
  leaderboard,
  sortColumn,
  sortDirection,
  onSort,
  getMedal,
  type,
}: LeaderboardTableProps) {
  const tableContainerRef = useRef<HTMLDivElement>(null)

  // Set a fixed row height for virtualization
  const ROW_HEIGHT = 39 // Adjust based on your actual row height
  console.log(leaderboard.length)
  // Create virtualizer instance
  const rowVirtualizer = useVirtualizer({
    count: leaderboard.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 12, // Number of items to render before/after the visible area
  })

  // Get the virtualized rows
  const virtualRows = rowVirtualizer.getVirtualItems()
  console.log({ virtualRows })
  console.log(rowVirtualizer.getTotalSize())
  const paddingTop = virtualRows.length > 0 ? virtualRows?.[0]?.start : 0
  const paddingBottom =
    virtualRows.length > 0
      ? rowVirtualizer.getTotalSize() -
        (virtualRows?.[virtualRows.length - 1]?.end ?? 0)
      : 0
  return (
    <div className='flex flex-1 flex-col overflow-hidden rounded-lg border'>
      <div
        ref={tableContainerRef}
        className='flex-1 overflow-auto overflow-x-auto'
        style={{ maxHeight: 'calc(100vh - 300px)' }}
      >
        <Table>
          <TableHeader className='sticky top-0 z-10 bg-white dark:bg-slate-900'>
            <TableRow className=' bg-slate-50 dark:bg-slate-800/50'>
              <TableHead className='w-[80px]'>
                <SortableHeader
                  column='rank'
                  label='Rank'
                  currentSort={sortColumn}
                  direction={sortDirection}
                  onSort={onSort}
                />
              </TableHead>
              <TableHead>
                <SortableHeader
                  column='name'
                  label='Player'
                  currentSort={sortColumn}
                  direction={sortDirection}
                  onSort={onSort}
                />
              </TableHead>
              <TableHead className='text-right'>
                <SortableHeader
                  className='w-full justify-end'
                  column='mmr'
                  label='MMR'
                  currentSort={sortColumn}
                  direction={sortDirection}
                  onSort={onSort}
                />
              </TableHead>
              <TableHead className='text-right' align={'right'}>
                <SortableHeader
                  className='w-full justify-end'
                  column='peak_mmr'
                  label='Peak MMR'
                  currentSort={sortColumn}
                  direction={sortDirection}
                  onSort={onSort}
                />
              </TableHead>
              <TableHead className='text-right'>
                <SortableHeader
                  className='w-full justify-end'
                  column='winrate'
                  label='Win Rate'
                  currentSort={sortColumn}
                  direction={sortDirection}
                  onSort={onSort}
                />
              </TableHead>
              <TableHead className='text-right'>
                <SortableHeader
                  className='w-full justify-end'
                  column='wins'
                  label='Wins'
                  currentSort={sortColumn}
                  direction={sortDirection}
                  onSort={onSort}
                />
              </TableHead>
              <TableHead className='text-right'>
                <SortableHeader
                  className='w-full justify-end'
                  column='losses'
                  label='Losses'
                  currentSort={sortColumn}
                  direction={sortDirection}
                  onSort={onSort}
                />
              </TableHead>
              <TableHead className='text-right'>
                <SortableHeader
                  className='w-full justify-end'
                  column='totalgames'
                  label='Games'
                  currentSort={sortColumn}
                  direction={sortDirection}
                  onSort={onSort}
                />
              </TableHead>
              <TableHead className='text-right'>
                <SortableHeader
                  className='w-full justify-end'
                  column='streak'
                  label='Streak'
                  currentSort={sortColumn}
                  direction={sortDirection}
                  onSort={onSort}
                />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paddingTop > 0 && (
              <tr>
                <td style={{ height: `${paddingTop}px` }} colSpan={9} />
              </tr>
            )}
            {leaderboard.length > 0 ? (
              virtualRows.map((virtualRow) => {
                const entry = leaderboard[virtualRow.index]
                const winrate = entry.winrate * 100
                return (
                  <Fragment key={entry.id}>
                    {/* Add padding to the top to push content into view */}

                    <TableRow
                      className={cn(
                        'transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/70'
                      )}
                    >
                      <TableCell className='font-medium'>
                        <div className='flex items-center gap-1.5'>
                          {getMedal(entry.rank)}
                          <span>{entry.rank}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/players/${entry.id}`}
                          className='flex items-center gap-2 hover:underline'
                        >
                          {/*<Avatar className='h-8 w-8'>*/}
                          {/*  <AvatarImage*/}
                          {/*    src={`https://cdn.discordapp.com/avatars/${entry.id}/avatar.png`}*/}
                          {/*    alt={entry.name}*/}
                          {/*  />*/}
                          {/*  <AvatarFallback className='bg-violet-100 text-violet-700 text-xs dark:bg-violet-900 dark:text-violet-300'>*/}
                          {/*    {entry.name.slice(0, 2).toUpperCase()}*/}
                          {/*  </AvatarFallback>*/}
                          {/*</Avatar>*/}
                          <span className='font-medium'>{entry.name}</span>
                          {entry.streak >= 3 && (
                            <Badge className='bg-orange-500 text-white'>
                              <Flame className='mr-1 h-3 w-3' />
                              Hot Streak
                            </Badge>
                          )}
                        </Link>
                      </TableCell>
                      <TableCell className='text-right font-medium font-mono'>
                        {Math.round(entry.mmr)}
                      </TableCell>
                      <TableCell className='text-right font-mono'>
                        <div className='flex items-center justify-end gap-1'>
                          {Math.round(entry.peak_mmr)}
                          <TrendingUp className='h-3.5 w-3.5 text-violet-500' />
                        </div>
                      </TableCell>
                      <TableCell className='text-right'>
                        <Badge
                          variant='outline'
                          className={cn(
                            'font-normal ',
                            winrate > 60
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : winrate < 40
                                ? 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                : 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
                          )}
                        >
                          {Math.round(winrate)}%
                        </Badge>
                      </TableCell>
                      <TableCell className='text-right text-emerald-600 dark:text-emerald-400'>
                        {entry.wins}
                      </TableCell>
                      <TableCell className='text-right text-rose-600 dark:text-rose-400'>
                        {entry.losses}
                      </TableCell>
                      <TableCell className='text-right font-mono text-slate-600 dark:text-slate-400'>
                        {entry.totalgames}
                      </TableCell>
                      <TableCell className='text-right'>
                        {entry.streak > 0 ? (
                          <span className='flex items-center justify-end text-emerald-600 dark:text-emerald-400'>
                            <ArrowUp className='mr-1 h-3.5 w-3.5' />
                            {entry.streak}
                          </span>
                        ) : entry.streak < 0 ? (
                          <span className='flex items-center justify-end font-mono text-rose-600 dark:text-rose-400'>
                            <ArrowDown className='mr-1 h-3.5 w-3.5' />
                            <span className={'w-[2ch]'}>
                              {Math.abs(entry.streak)}
                            </span>
                          </span>
                        ) : (
                          <span>0</span>
                        )}
                      </TableCell>
                    </TableRow>
                  </Fragment>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={9} className='h-24 text-center'>
                  No players found
                </TableCell>
              </TableRow>
            )}
            {paddingBottom > 0 && (
              <tr>
                <td style={{ height: `${paddingBottom}px` }} colSpan={9} />
              </tr>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

interface SortableHeaderProps extends ComponentPropsWithoutRef<'button'> {
  column: string
  label: string
  currentSort: string
  direction: 'asc' | 'desc'
  onSort: (column: string) => void
}

function SortableHeader({
  column,
  label,
  currentSort,
  direction,
  onSort,
  className,
  ...rest
}: SortableHeaderProps) {
  const isActive = currentSort === column

  return (
    <button
      type={'button'}
      className={cn(
        'flex items-center gap-1 transition-colors hover:text-violet-600 dark:hover:text-violet-400',
        className
      )}
      {...rest}
      onClick={() => onSort(column)}
    >
      {label}
      {isActive ? (
        direction === 'asc' ? (
          <ArrowUp className='h-3.5 w-3.5' />
        ) : (
          <ArrowDown className='h-3.5 w-3.5' />
        )
      ) : (
        <ArrowUpDown className='h-3.5 w-3.5 opacity-50' />
      )}
    </button>
  )
}
