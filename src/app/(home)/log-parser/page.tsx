'use client'

import {
  Dropzone,
  DropzoneDescription,
  DropzoneGroup,
  DropzoneInput,
  DropzoneTitle,
  DropzoneUploadIcon,
  DropzoneZone,
} from '@/components/ui/dropzone'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useFormatter } from 'next-intl'
import { useState } from 'react'

type LogLine = {
  text: string
  type: 'event' | 'status' | 'system'
}

type Game = {
  host: string | null
  guest: string | null
  hostMods: string | null
  guestMods: string | null
  deck: string | null
  seed: string | null
  seedType: string | null
  isHost: boolean | null
  moneyGained: number
  moneySpent: number
  startDate: Date
  endDate: Date | null
  lastLives: number
  opponentMoneySpent: number
  moneySpentPerShop: (number | null)[]
  moneySpentPerShopOpponent: (number | null)[]
}

type GameState = {
  currentGame: Game | null
  games: Game[]
}

const initGame = (): Game => ({
  host: null,
  guest: null,
  hostMods: null,
  guestMods: null,
  deck: null,
  seed: null,
  seedType: null,
  isHost: null,
  moneyGained: 0,
  moneySpent: 0,
  opponentMoneySpent: 0,
  startDate: new Date(),
  endDate: null,
  lastLives: 4,
  moneySpentPerShop: [],
  moneySpentPerShopOpponent: [],
})

const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  const parts = []
  if (hours > 0) parts.push(`${hours}h`)
  if (minutes > 0) parts.push(`${minutes}m`)
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`)

  return parts.join(' ')
}

export default function LogParser() {
  const formatter = useFormatter()
  const [logLines, setLogLines] = useState<LogLine[]>([])
  const [moneyReports, setMoneyReports] = useState<
    {
      totalSpent: number
      totalSpentOpponent: number
      spentPerShop: (number | null)[]
      spentPerShopOpponent: (number | null)[]
    }[]
  >([])
  const parseLogFile = async (file: File) => {
    const state: GameState = {
      currentGame: null,
      games: [],
    }
    let lastSeenDeck = null
    let lastSeenLobbyOptions = null

    const lines: LogLine[] = []
    try {
      const content = await file.text()
      const logLines = content.split('\n')
      const { seeds, lobbyInfos } = getGamesConfigs(logLines)
      console.log(seeds)
      for (const line of logLines) {
        const timeMatch = line.match(/(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})/)
        const timestamp = timeMatch?.[1] ? new Date(timeMatch[1]) : new Date()
        const lineLower = line.toLowerCase()

        if (lineLower.includes('enemyinfo')) {
          if (!state.currentGame) continue

          const match = line.match(/lives:(\d+)/)
          if (match) {
            const newLives = match[1] ? Number.parseInt(match[1]) : 0
            if (newLives < state.currentGame.lastLives) {
              lines.push({ text: 'Lost a life', type: 'event' })
            }
            state.currentGame.lastLives = newLives
          }
          continue
        }
        if (line.includes(' Client got spentLastShop message')) {
          const match = line.match(/amount: (\d+)/)
          if (match) {
            if (!state.currentGame) continue
            const amount = match[1] ? Number.parseInt(match[1]) : 0
            state.currentGame.opponentMoneySpent += amount
            state.currentGame.moneySpentPerShopOpponent.push(amount)
          }
        }
        if (line.includes('Client sent message: action:spentLastShop')) {
          const match = line.match(/amount:(\d+)/)
          if (match) {
            if (!state.currentGame) continue
            const amount = match[1] ? Number.parseInt(match[1]) : 0
            state.currentGame.moneySpentPerShop.push(amount)
          }
        }
        if (line.includes('Client sent message: action:skip')) {
          if (!state.currentGame) continue
          state.currentGame.moneySpentPerShop.push(null)
        }
        if (lineLower.includes('lobbyinfo message')) {
          if (line.includes('host:')) {
            const hostMatch = line.match(/host: ([^ )]+)/)
            const guestMatch = line.match(/guest: ([^ )]+)/)
            const hostModsMatch = line.match(/hostHash: ([^ )]+)/)
            const guestModsMatch = line.match(/guestHash: ([^ )]+)/)

            if (state.currentGame) {
              state.currentGame.host = hostMatch?.[1] || null
              state.currentGame.guest = guestMatch?.[1] || null
              state.currentGame.hostMods = hostModsMatch?.[1] || ''
              state.currentGame.guestMods = guestModsMatch?.[1] || ''
              state.currentGame.isHost = line.includes('isHost: true')
            }
          }
          continue
        }

        if (lineLower.includes('lobbyoptions')) {
          const parts = line.split(' Client sent message:')
          const params = {} as any
          const paramsString = parts[1]?.trim()?.split(',')
          if (!paramsString) {
            continue
          }
          for (const paramString of paramsString) {
            const [key, value] = paramString.split(':')
            if (!key || !value) continue

            params[key.trim()] = value.trim()
          }
          lastSeenDeck = params.back || null
          lastSeenLobbyOptions = params
          continue
        }

        if (lineLower.includes('startgame message')) {
          if (state.currentGame) {
            state.currentGame.endDate = new Date()
            state.games.push(state.currentGame)
          }

          state.currentGame = initGame()
          const seedMatch = line.match(/seed:\s*([^) ]+)/)
          state.currentGame.startDate = timestamp
          state.currentGame.seed = seedMatch?.[1] || null
          const lobbyInfo = lobbyInfos.shift()
          console.log({ lobbyInfo, lastSeenLobbyOptions })
          lines.push(
            { text: '=== New Game Started ===', type: 'system' },
            {
              text: `Start Time: ${formatter.dateTime(state.currentGame.startDate, { timeStyle: 'medium', dateStyle: 'medium' })}`,
              type: 'system',
            },
            {
              text: `Deck: ${state.currentGame.deck || lastSeenDeck || 'None'}`,
              type: 'system',
            },
            {
              text: `Seed: ${seeds.shift() || 'Unknown'}`,
              type: 'system',
            },
            {
              text: `Custom Seed: ${lastSeenLobbyOptions?.custom_seed || 'unknown'}`,
              type: 'system',
            },
            {
              text: `Ruleset: ${lastSeenLobbyOptions?.ruleset || 'unknown'}`,
              type: 'system',
            },
            {
              text: `Different decks: ${boolStrToText(lastSeenLobbyOptions?.different_decks)}`,
              type: 'system',
            },
            {
              text: `Different seeds: ${boolStrToText(lastSeenLobbyOptions?.different_seeds)}`,
              type: 'system',
            },
            {
              text: `Death on round loss: ${boolStrToText(lastSeenLobbyOptions?.death_on_round_loss)}`,
              type: 'system',
            },
            {
              text: `Gold on life loss: ${boolStrToText(lastSeenLobbyOptions?.gold_on_life_loss)}`,
              type: 'system',
            },
            {
              text: `No gold on round loss: ${boolStrToText(lastSeenLobbyOptions?.no_gold_on_round_loss)}`,
              type: 'system',
            },
            {
              text: `Starting lives: ${lastSeenLobbyOptions?.starting_lives || 'Unknown'}`,
              type: 'system',
            },
            {
              text: `Stake: ${lastSeenLobbyOptions?.stake || 'Unknown'}`,
              type: 'system',
            },
            {
              text: `Host: ${lobbyInfo?.host || 'Unknown'}`,
              type: 'system',
            },
            {
              text: 'Host mods:',
              type: 'system',
            },
            ...(lobbyInfo?.hostHash.map((x) => ({
              text: `\t${x}`,
              type: 'system' as const,
            })) ?? []),
            {
              text: `Guest: ${lobbyInfo?.guest || 'Unknown'}`,
              type: 'system',
            },
            {
              text: 'Guest mods:',
              type: 'system',
            },
            ...(lobbyInfo?.guestHash.map((x) => ({
              text: `\t${x}`,
              type: 'system' as const,
            })) ?? []),
            { text: '===================', type: 'system' },
            { text: '', type: 'system' }
          )
          continue
        }

        if (line.includes('Client got receiveEndGameJokers')) {
          if (!state.currentGame) continue
          state.currentGame.endDate = timestamp

          const seedMatch = line.match(/seed: ([A-Z0-9]+)/)
          state.currentGame.seed = seedMatch?.[1] || null
        }

        if (!lineLower.includes('client sent')) continue

        if (lineLower.includes('moneymoved')) {
          if (!state.currentGame) continue

          const match = line.match(/amount: *(-?\d+)/)
          if (match) {
            const amount = match[1] ? Number.parseInt(match[1]) : -1
            if (amount >= 0) {
              state.currentGame.moneyGained += amount
              lines.push({
                text: `Gained $${amount} (Total gained: $${state.currentGame.moneyGained})`,
                type: 'event',
              })
            } else {
              const spent = Math.abs(amount)
              lines.push({
                text: `Spent $${spent}`,
                type: 'event',
              })
            }
          }
        } else if (lineLower.includes('spentlastshop')) {
          if (!state.currentGame) continue

          const match = line.match(/amount: *(\d+)/)
          if (match) {
            const amount = match[1] ? Number.parseInt(match[1]) : -1
            state.currentGame.moneySpent += amount
            lines.push({
              text: `Spent $${amount} last shop (Total spent: $${state.currentGame.moneySpent})`,
              type: 'event',
            })
          }
        } else if (line.includes('boughtCardFromShop')) {
          const match = line.match(/card:([^,\n]+)/i)
          if (match) {
            const raw = match[1] ? match[1].trim() : ''
            const clean = raw.replace(/^(c_mp_|j_mp_)/, '')
            lines.push({ text: `Bought ${clean}`, type: 'event' })
          }
        } else if (line.includes('rerollShop')) {
          const match = line.match(/cost:([^,\n]+)/i)
          if (match) {
            const cost = match[1] ? match[1].trim() : ''

            lines.push({ text: `Reroll for $${cost}`, type: 'event' })
          }
        } else if (lineLower.includes('usedcard')) {
          const match = line.match(/card:([^,\n]+)/i)
          if (match) {
            const raw = match[1] ? match[1].trim() : ''
            const clean = raw.replace(/^(c_mp_|j_mp_)/, '')
            const pretty = clean
              .replace(/_/g, ' ')
              .replace(
                /\w\S*/g,
                (txt) =>
                  txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
              )
            lines.push({ text: `Used ${pretty}`, type: 'event' })
          }
        } else if (lineLower.includes('setlocation')) {
          const locMatch = line.match(/location:([a-zA-Z0-9_-]+)/)
          if (locMatch) {
            const locCode = locMatch[1]
            if (locCode === 'loc_selecting' || !locCode) continue

            let locationText: string
            if (locCode === 'loc_shop') {
              locationText = 'Shop'
            } else if (locCode.startsWith('loc_playing-')) {
              const subcode = locCode.slice('loc_playing-'.length)
              if (subcode.startsWith('bl_')) {
                const blindName = subcode
                  .slice(3)
                  .replace(/_/g, ' ')
                  .replace(
                    /\w\S*/g,
                    (txt) =>
                      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
                  )
                locationText = `${blindName} Blind`
              } else {
                const readable = subcode
                  .replace(/_/g, ' ')
                  .replace(
                    /\w\S*/g,
                    (txt) =>
                      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
                  )
                locationText = `Playing ${readable}`
              }
            } else {
              locationText = locCode
                .replace(/_/g, ' ')
                .replace(
                  /\w\S*/g,
                  (txt) =>
                    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
                )
            }
            lines.push({ text: locationText, type: 'status' })
          }
        }
      }

      if (state.currentGame) {
        // state.currentGame.endDate = new Date()
        state.games.push(state.currentGame)
      }

      state.games.forEach((game, i) => {
        const duration = game.endDate
          ? (game.endDate.getTime() - game.startDate.getTime()) / 1000
          : 0

        const startTimeStr = game.startDate.toLocaleTimeString()
        const endTimeStr = game.endDate?.toLocaleTimeString() || 'Unknown'

        const summaryLines = [
          { text: `=== Game ${i + 1} Summary ===`, type: 'system' },
          { text: `Start Time: ${startTimeStr}`, type: 'system' },
          { text: `End Time: ${endTimeStr}`, type: 'system' },
          { text: `Duration: ${formatDuration(duration)}`, type: 'system' },
          { text: `Total Money Gained: $${game.moneyGained}`, type: 'system' },
          { text: `Total Money Spent: $${game.moneySpent}`, type: 'system' },
          {
            text: `Net Money: $${game.moneyGained - game.moneySpent}`,
            type: 'system',
          },
          { text: '==================', type: 'system' },
          { text: '', type: 'system' },
        ] as LogLine[]

        lines.unshift(...summaryLines)
      })

      const totalGained = state.games.reduce((sum, g) => sum + g.moneyGained, 0)
      const totalSpent = state.games.reduce((sum, g) => sum + g.moneySpent, 0)

      lines.unshift(
        { text: '=== Overall Summary ===', type: 'system' },
        { text: `Total Games: ${state.games.length}`, type: 'system' },
        { text: `Total Money Gained: $${totalGained}`, type: 'system' },
        { text: `Total Money Spent: $${totalSpent}`, type: 'system' },
        {
          text: `Overall Net Money: $${totalGained - totalSpent}`,
          type: 'system',
        },
        { text: '==================', type: 'system' },
        { text: '', type: 'system' }
      )

      setMoneyReports(
        state.games.map((game) => ({
          totalSpent: game.moneySpent,
          totalSpentOpponent: game.opponentMoneySpent,
          spentPerShop: game.moneySpentPerShop,
          spentPerShopOpponent: game.moneySpentPerShopOpponent,
        }))
      )
      setLogLines(lines)
    } catch (err) {
      console.error('Error parsing log:', err)
      throw err
    }
  }

  return (
    <div
      className={
        'mx-auto flex w-[calc(100%-1rem)] max-w-fd-container flex-col gap-4 pt-16'
      }
    >
      <Dropzone
        onDropAccepted={(files) => {
          const file = files[0]
          if (!(file instanceof File)) {
            return
          }
          return parseLogFile(file)
        }}
      >
        <DropzoneZone className={'w-full'}>
          <DropzoneInput />
          <DropzoneGroup className='gap-4'>
            <DropzoneUploadIcon />
            <DropzoneGroup>
              <DropzoneTitle>Drop files here or click to upload</DropzoneTitle>
              <DropzoneDescription>
                Upload your corrupted <strong>profile.jkr</strong> and get a
                fixed version.
              </DropzoneDescription>
            </DropzoneGroup>
          </DropzoneGroup>
        </DropzoneZone>
      </Dropzone>

      <div className='mt-8 flex w-full justify-between'>
        <div>
          {logLines.map((line, i) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
              key={i}
              className={`whitespace-pre py-2 ${
                line.type === 'event'
                  ? 'text-blue-400'
                  : line.type === 'status'
                    ? 'text-green-400'
                    : 'font-mono text-gray-400'
              }`}
            >
              {line.text}
            </div>
          ))}
        </div>
        <div>
          {moneyReports.map((report, i) => {
            const mostShops =
              report.spentPerShop.length > report.spentPerShopOpponent.length
                ? report.spentPerShop.length
                : report.spentPerShopOpponent.length
            return (
              // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
              <div key={i}>
                <div className='font-bold text-lg'>Game {i + 1}</div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className={'text-right font-mono'}>
                        Shop #
                      </TableHead>
                      <TableHead className={'text-right font-mono'}>
                        Logs owner
                      </TableHead>
                      <TableHead className={'text-right font-mono'}>
                        Opponent
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from({ length: mostShops }).map((_, j) => (
                      // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                      <TableRow key={j}>
                        <TableCell className={'text-right font-mono'}>
                          {j + 1}
                        </TableCell>
                        <TableCell className={'text-right font-mono'}>
                          {report.spentPerShop[j] ?? 'Skipped'}
                        </TableCell>
                        <TableCell className={'text-right font-mono'}>
                          {report.spentPerShopOpponent[j] ?? 'Skipped'}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell>Total</TableCell>
                      <TableCell className={'text-right font-mono'}>
                        {report.totalSpent}
                      </TableCell>
                      <TableCell className={'text-right font-mono'}>
                        {report.totalSpentOpponent}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function getGamesConfigs(lines: string[]) {
  const seeds = []
  const lobbyInfos = []
  let latestLobbyInfo: string | null = null

  for (const line of lines) {
    if (line.includes('Client got lobbyInfo message')) {
      latestLobbyInfo = line
      continue
    }
    if (line.includes('Client got startGame message')) {
      if (!latestLobbyInfo) continue
      const lobbyInfo = parseLobbyInfo(latestLobbyInfo)
      lobbyInfos.push(lobbyInfo)
    }
    if (line.includes('Client got receiveEndGameJokers message')) {
      const match = line.match(/seed: ([A-Z0-9]+)/)
      if (match) {
        const seed = match[1]
        seeds.push(seed)
      }
    }
  }
  return { seeds, lobbyInfos }
}

type LogEntry = {
  timestamp: Date
  level: string
  context: string
  message: string
  hostHash: string[]
  guestHash: string[]
  action: string
  guestCached: boolean
  hostCached: boolean
  guest: string
  host: string
  isHost: boolean
}

function parseLobbyInfo(line: string) {
  const regex =
    /^(INFO|ERROR|WARN|DEBUG) - \[(\w+)\] (\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) :: (\w+) :: (\w+) :: (.+)$/
  const matches = line.match(regex)

  if (!matches || matches.length < 7) {
    throw new Error('Invalid log line format')
  }

  const [, level, context, timestampStr, type, category, message] = matches

  if (!timestampStr || !level || !context || !message) {
    throw new Error('Missing required log components')
  }

  const entry: LogEntry = {
    timestamp: new Date(timestampStr),
    level,
    context,
    message,
    hostHash: [],
    guestHash: [],
    action: '',
    guestCached: false,
    hostCached: false,
    guest: '',
    host: '',
    isHost: false,
  }

  const pairs = message.match(/\(([^)]+)\)/g) || []
  for (const pair of pairs) {
    const keyValue = pair.slice(1, -1).split(': ')
    if (keyValue.length !== 2) continue

    const [key, value] = keyValue.map((s) => s.trim())
    if (!value || !key) {
      continue
    }
    switch (key) {
      case 'hostHash':
      case 'guestHash':
        ;(entry[key] as string[]) = value.split(';')
        break
      case 'guestCached':
      case 'hostCached':
      case 'isHost':
        ;(entry[key] as boolean) = value.toLowerCase() === 'true'
        break
      default:
        if (key in entry) {
          ;(entry[key as keyof LogEntry] as string) = value
        }
    }
  }

  return entry
}

function boolStrToText(str: string | undefined | null) {
  if (!str) {
    return 'Unknown'
  }
  if (str === 'true') {
    return 'Yes'
  }
  if (str === 'false') {
    return 'No'
  }
  return str
}
