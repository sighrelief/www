'use client'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import type { SelectGames } from '@/server/db/types'
import { CartesianGrid, Line, LineChart, XAxis } from 'recharts'

const chartConfig = {
  mmr: {
    label: 'MMR',
    color: 'var(--color-violet-500)',
  },
} satisfies ChartConfig

export function MmrTrendChart({ games }: { games: SelectGames[] }) {
  const chartData = games
    .filter((game) => game.gameType === 'ranked')
    .map((game) => ({
      date: game.gameTime,
      mmr: game.playerMmr,
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime())
  return (
    <Card>
      <CardHeader>
        <CardTitle>MMR Trends</CardTitle>
        <CardDescription>All time</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey='date'
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) =>
                new Date(value).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })
              }
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Line
              dataKey='mmr'
              type='natural'
              stroke='var(--color-mmr)'
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className='flex-col items-start gap-2 text-sm'>
        <div className='text-muted-foreground leading-none'>
          Showing only ranked MMR
        </div>
      </CardFooter>
    </Card>
  )
}
