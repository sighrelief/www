import { players } from '@/app/(home)/major-league-balatro/_constants/players'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { SiTwitch, SiYoutube } from '@icons-pack/react-simple-icons'
import {
  Calendar,
  Camera,
  Clock,
  TvMinimalPlay,
  Twitch,
  Youtube,
} from 'lucide-react'
import Link from 'next/link'
import { useMemo } from 'react'
import type { BadgeProps, Match, WeekConfig } from '../types'
import { PlayerAvatar } from './player-avatar'

const WEEK_CONFIG: Record<string | number, WeekConfig> = {
  1: {
    label: 'Week 1: April 6-12, 2025',
    badgeProps: {
      variant: 'outline',
      className: 'border-green-500 bg-green-500/10 text-green-500',
      text: 'Completed',
    },
  },
  2: {
    label: 'Week 2: April 13-19, 2025',
    badgeProps: {
      variant: 'outline',
      className: 'border-blue-500 bg-blue-500/10 text-blue-500',
      text: 'Current Week',
    },
  },
  3: {
    label: 'Week 3: April 20-26, 2025',
  },
  4: {
    label: 'Week 4: April 27-May 3, 2025',
  },
  // 5: {
  //   label: 'Week 5: May 4-10, 2025',
  // },
  // 'Play-in': {
  //   label: 'Play-in Week: May 11-16, 2025',
  //   status: 'playoff',
  //   badgeProps: {
  //     variant: 'outline',
  //     className: 'border-purple-500 bg-purple-500/10 text-purple-500',
  //     text: 'Playoff',
  //   },
  // },
  // Finals: {
  //   label: 'League Finals: May 17, 2025',
  //   status: 'finals',
  //   badgeProps: {
  //     variant: 'outline',
  //     className: 'border-red-500 bg-red-500/10 text-red-500',
  //     text: 'Championship',
  //   },
  // },
}

const DEFAULT_BADGE_PROPS: BadgeProps = {
  variant: 'outline',
  className: 'bg-muted text-muted-foreground',
  text: 'Upcoming',
}

type StatusBadgeProps = {
  status: 'completed' | 'current' | 'upcoming'
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const { variant, className } =
    WEEK_CONFIG[status]?.badgeProps || DEFAULT_BADGE_PROPS

  const text =
    status === 'completed'
      ? 'Completed'
      : status === 'current'
        ? 'Current Week'
        : 'Upcoming'
  return (
    <Badge
      variant={variant}
      className={cn(
        status === 'completed'
          ? 'border-green-500 bg-green-500/10 text-green-500'
          : status === 'current'
            ? 'border-blue-500 bg-blue-500/10 text-blue-500'
            : 'bg-muted text-muted-foreground'
      )}
    >
      {text}
    </Badge>
  )
}

type MatchDivisionProps = {
  division: 'Blue' | 'Red'
}

const MatchDivision = ({ division }: MatchDivisionProps) => {
  const bgColor = division === 'Blue' ? 'bg-blue-950/20' : 'bg-red-950/20'
  const textColor =
    division === 'Blue'
      ? 'border-blue-500 text-blue-500'
      : 'border-red-500 text-red-500'

  return (
    <div className={`flex items-center justify-center p-4 sm:w-1/4 ${bgColor}`}>
      <Badge variant='outline' className={textColor}>
        {division} Division
      </Badge>
    </div>
  )
}

type MatchDateTimeProps = {
  date: string
  time: string
}

const MatchDateTime = ({ date, time }: MatchDateTimeProps) => (
  <div className='flex items-center gap-2 text-muted-foreground text-sm'>
    <Calendar className='h-4 w-4' />
    <span>{date}</span>
    <Clock className='ml-2 h-4 w-4' />
    <span>{time}</span>
  </div>
)

type VodButtonProps = {
  url: string
  player: string
}

const VodButton = ({ url, player }: VodButtonProps) => (
  <Link href={url} target='_blank' rel='noopener noreferrer'>
    <Button variant='outline' size='sm' className='gap-1'>
      <Youtube className='h-4 w-4' />
      {player}
    </Button>
  </Link>
)

type LiveButtonProps = {
  username: string
}

const LiveButton = ({ username }: LiveButtonProps) => (
  <Link
    href={`https://twitch.tv/${username.toLowerCase()}`}
    target='_blank'
    rel='noopener noreferrer'
  >
    <Button variant='outline' size='sm' className='gap-1'>
      <Twitch className='h-4 w-4' />
      Watch Live
    </Button>
  </Link>
)

type MatchCardProps = {
  match: Match
}

const MatchCard = ({ match }: MatchCardProps) => {
  const { player1Id, player2Id, date, time, completed, vod1, vod2 } = match

  const player1 = players[player1Id]
  const player2 = players[player2Id]

  if (!player1) {
    throw new Error(`Player ${player1Id} not found`)
  }
  if (!player2) {
    throw new Error(`Player ${player2Id} not found`)
  }

  return (
    <Card className='overflow-hidden'>
      <div className='flex flex-col sm:flex-row'>
        <div className='flex items-center justify-center p-4 sm:w-1/4'>
          <div className='text-muted-foreground text-sm'>
            {date} • {time}
          </div>
        </div>
        <div className='p-4 sm:w-3/4'>
          <div className='flex flex-col justify-between gap-4 sm:flex-row sm:items-center'>
            <div className='flex items-center gap-3'>
              <div className='-space-x-4 flex'>
                <PlayerAvatar playerName={player1.name} img={player1.picture} />
                <PlayerAvatar playerName={player2.name} img={player2.picture} />
              </div>
              <div>
                <h3 className='font-bold text-lg'>
                  {player1.name} vs {player2.name}
                </h3>
              </div>
            </div>
            <div className='flex gap-2'>
              {completed ? (
                <>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant='outline' size='sm' className='gap-1'>
                        <TvMinimalPlay className='size-4' />
                        Watch
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {vod1 && (
                        <DropdownMenuItem asChild>
                          <Link
                            href={vod1}
                            target='_blank'
                            rel='noopener noreferrer'
                          >
                            <SiYoutube className='h-4 w-4' />
                            {player1.name}
                          </Link>
                        </DropdownMenuItem>
                      )}
                      {vod2 && (
                        <DropdownMenuItem asChild>
                          <Link
                            href={vod2}
                            target='_blank'
                            rel='noopener noreferrer'
                          >
                            <SiYoutube className='h-4 w-4' />
                            {player2.name}
                          </Link>
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant='outline' size='sm' className='gap-1'>
                      <SiTwitch className='size-4' />
                      Watch Live
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem asChild>
                      <Link
                        href={`https://twitch.tv/${player1.socials.twitch}`}
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        {player1.name}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href={`https://twitch.tv/${player2.socials.twitch}`}
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        {player2.name}
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

type WeekTabProps = {
  week: string | number
  matches: Match[]
  status: 'current' | 'completed' | 'upcoming'
}

const WeekTab = ({ week, matches, status }: WeekTabProps) => {
  const weekConfig = WEEK_CONFIG[week]
  if (!weekConfig) {
    throw new Error(`Week ${week} not found in WEEK_CONFIG`)
  }
  const filteredMatches = useMemo(
    () =>
      matches.filter(
        (m) => m.week === week || m.week === Number.parseInt(String(week))
      ),
    [matches, week]
  )

  return (
    <TabsContent value={`week${week}`} className='space-y-6'>
      <div className='mb-4 flex items-center justify-between'>
        <h3 className='font-bold text-xl'>{weekConfig.label}</h3>
        <StatusBadge status={status} />
      </div>

      {filteredMatches.map((match, index) => (
        <MatchCard key={index} match={match} />
      ))}
    </TabsContent>
  )
}
type MlbScheduleProps = {
  matches: Match[]
}

export function MlbSchedule({ matches }: MlbScheduleProps) {
  const sortedMatches = useMemo(
    () =>
      [...matches].sort((a, b) => {
        if (typeof a.week === 'string' || typeof b.week === 'string') {
          return String(a.week).localeCompare(String(b.week))
        }
        return a.week - b.week
      }),
    [matches]
  )

  const currentWeek = useMemo(() => {
    const now = new Date()
    return (
      sortedMatches.find((match) => new Date(match.datetime) > now)?.week || 1
    )
  }, [sortedMatches])
  console.log(currentWeek)
  return (
    <section id='schedule' className='container py-8 md:py-12'>
      <div className='mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center'>
        <h2 className='font-bold text-3xl leading-tight tracking-tighter md:text-4xl'>
          Tournament Schedule
        </h2>
        <p className='max-w-[85%] text-muted-foreground leading-normal sm:text-lg sm:leading-7'>
          All matches from April to May 2025
        </p>
      </div>

      <div className='mx-auto mt-8 max-w-5xl'>
        <Tabs defaultValue={`week${currentWeek}`}>
          <TabsList className='mb-4 flex flex-wrap justify-center'>
            {Object.keys(WEEK_CONFIG).map((week) => (
              <TabsTrigger key={week} value={`week${week}`}>
                Week {week}
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.keys(WEEK_CONFIG).map((week) => {
            const weekNumber = Number.parseInt(week)
            const status =
              !Number.isNaN(weekNumber) && weekNumber === currentWeek
                ? 'current'
                : // @ts-ignore
                  weekNumber > currentWeek
                  ? 'upcoming'
                  : 'completed'
            return (
              <WeekTab
                key={week}
                week={week}
                matches={sortedMatches}
                status={status}
              />
            )
          })}
        </Tabs>
      </div>
    </section>
  )
}
