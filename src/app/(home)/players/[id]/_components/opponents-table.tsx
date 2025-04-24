'use client'

import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import type { SelectGames } from '@/server/db/types'
import {
  type SortingState,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  ArrowDownCircle,
  ArrowUp,
  ArrowUpCircle,
  MinusCircle,
} from 'lucide-react'
import Link from 'next/link'
import { memo, useMemo, useState } from 'react'
import { groupBy } from 'remeda'

const numberFormatter = new Intl.NumberFormat('en-US', {
  signDisplay: 'exceptZero',
})

const columnHelper = createColumnHelper<Stats>()

const useColumns = () => {
  return useMemo(
    () => [
      columnHelper.accessor('opponentName', {
        meta: { className: 'pl-4' },
        header: 'Opponent',
        cell: (info) => (
          <Link
            href={`/players/${info.row.original.opponentId}`}
            className='pl-4 font-medium hover:underline'
          >
            {info.getValue()}
          </Link>
        ),
      }),
      columnHelper.accessor('totalGames', {
        header: 'Games Played',
        meta: { className: 'justify-end' },
        cell: (info) => {
          const totalGames = info.getValue()
          return (
            <span className='flex w-full justify-end font-mono'>
              {totalGames}
            </span>
          )
        },
      }),

      columnHelper.accessor('wins', {
        header: 'Wins',
        meta: { className: 'justify-end' },
        cell: (info) => {
          const wins = info.getValue()
          return (
            <span className='flex w-full justify-end font-mono'>{wins}</span>
          )
        },
      }),
      columnHelper.accessor('losses', {
        header: 'Losses',
        meta: { className: 'justify-end' },
        cell: (info) => {
          const losses = info.getValue()
          return (
            <span className='flex w-full justify-end font-mono'>{losses}</span>
          )
        },
      }),
      columnHelper.accessor('winRate', {
        header: 'Win rate',
        meta: { className: 'justify-end' },
        cell: (info) => {
          const winRate = info.getValue()
          return (
            <span
              className={cn(
                'flex items-center justify-end font-medium font-mono',
                winRate !== null
                  ? winRate === 50
                    ? 'text-zink-800 dark:text-zink-200'
                    : winRate > 50
                      ? 'text-emerald-500'
                      : 'text-rose-500'
                  : null
              )}
            >
              {winRate !== null ? `${Math.round(winRate)}%` : 'N/A'}
            </span>
          )
        },
      }),
      columnHelper.accessor('totalMMRChange', {
        header: 'Total MMR change',
        meta: { className: 'justify-end' },
        cell: (info) => {
          const mmrChange = info.getValue()
          return (
            <span
              className={cn(
                'flex items-center justify-end font-medium font-mono',
                mmrChange === 0
                  ? 'text-zink-800 dark:text-zink-200'
                  : mmrChange > 0
                    ? 'text-emerald-500'
                    : 'text-rose-500'
              )}
            >
              {numberFormatter.format(Math.trunc(mmrChange))}
              {mmrChange === 0 ? (
                <MinusCircle className='ml-1 h-4 w-4' />
              ) : mmrChange > 0 ? (
                <ArrowUpCircle className='ml-1 h-4 w-4' />
              ) : (
                <ArrowDownCircle className='ml-1 h-4 w-4' />
              )}
            </span>
          )
        },
      }),
    ],
    []
  )
}
type Stats = {
  totalGames: number
  wins: number
  losses: number
  opponentName: string
  opponentId: string
  totalMMRChange: number
  winRate: number | null
}

function RawOpponentsTable({ games }: { games: SelectGames[] }) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'totalGames', desc: true },
  ])
  const grouped = useMemo(
    () => groupBy(games, (game) => game.opponentId),
    [games]
  )
  const tableData: Stats[] = useMemo(
    () =>
      Object.values(grouped).map((gamesAgainstOpponent) => {
        const totalGames = gamesAgainstOpponent.filter(
          (x) => x.result !== 'tie'
        ).length
        let wins = 0
        let losses = 0
        let totalMMRChange = 0
        for (const game of gamesAgainstOpponent) {
          totalMMRChange += game.mmrChange

          if (game.mmrChange > 0) wins++
          else if (game.mmrChange < 0) losses++
        }
        const stats: Stats = {
          totalGames,
          wins,
          losses,
          opponentName: gamesAgainstOpponent[0].opponentName,
          opponentId: gamesAgainstOpponent[0].opponentId,
          totalMMRChange,
          winRate: totalGames ? (wins / totalGames) * 100 : null,
        }
        return stats
      }),
    [grouped]
  )

  const columns = useColumns()

  const table = useReactTable({
    data: tableData,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: (originalRow) => originalRow.opponentId,
  })

  return (
    <div className='rounded-md border'>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const sortDirection = header.column.getIsSorted()
                return (
                  <TableHead key={header.id} className={'px-0'}>
                    <span
                      className={cn(
                        'flex w-full items-center',
                        (header.column.columnDef.meta as any)?.className
                      )}
                    >
                      <Button
                        className={cn(
                          header.column.getCanSort() &&
                            'cursor-pointer select-none',
                          (
                            header.column.columnDef.meta as any
                          )?.className?.includes('justify-end') &&
                            'flex-row-reverse'
                        )}
                        size={'table'}
                        variant='ghost'
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {sortDirection ? (
                          <ArrowUp
                            className={cn(
                              'transition-transform',
                              sortDirection === 'desc' ? 'rotate-180' : ''
                            )}
                          />
                        ) : (
                          <div className={'h-4 w-4'} />
                        )}
                      </Button>
                    </span>
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export const OpponentsTable = memo(RawOpponentsTable)
OpponentsTable.displayName = 'OpponentsTable'
