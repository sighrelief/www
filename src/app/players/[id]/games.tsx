'use client'

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { api } from '@/trpc/react'
import { useFormatter } from 'next-intl'
import { useParams } from 'next/navigation'

export function PlayerGames() {
  const { id } = useParams()
  if (!id || typeof id !== 'string') {
    return null
  }
  const [games] = api.history.user_games.useSuspenseQuery({ user_id: id })

  const format = useFormatter()

  return (
    <Table>
      <TableCaption>User's latest games</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className='w-[100px]'>Game type</TableHead>
          <TableHead>Opponent</TableHead>
          <TableHead className='text-right'>Opponent MMR</TableHead>
          <TableHead className='text-right'>MMR</TableHead>
          <TableHead className='text-right'>Result</TableHead>
          <TableHead>Date</TableHead>
          <TableHead className='text-right'>Time</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {games.map((game) => {
          return (
            <TableRow key={game.gameId}>
              <TableCell className='font-medium'>{game.gameType}</TableCell>
              <TableCell>{game.opponentName}</TableCell>
              <TableCell className='text-right font-mono'>
                {Math.trunc(game.opponentMmr)}
              </TableCell>
              <TableCell className='text-right font-mono'>
                {Math.trunc(game.playerMmr)}
              </TableCell>
              <GameResultCell result={game.result} mmrChange={game.mmrChange} />
              <TableCell className='text-right font-mono'>
                <time dateTime={game.gameTime.toISOString()}>
                  {format.dateTime(game.gameTime, {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                  })}
                </time>
              </TableCell>
              <TableCell className='text-right font-mono'>
                {format.dateTime(game.gameTime, {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

const numberFormatter = new Intl.NumberFormat('en-US', {
  signDisplay: 'exceptZero',
})

function GameResultCell({
  result,
  mmrChange,
}: { result: string; mmrChange: number }) {
  return (
    <TableCell
      className={cn(
        'text-right',
        'font-mono',
        result === 'win' && 'text-green-600',
        result === 'loss' && 'text-red-500',
        result === 'tie' && 'text-yellow-500'
      )}
    >
      {numberFormatter.format(Math.trunc(mmrChange))}
    </TableCell>
  )
}
