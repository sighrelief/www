'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LogIn, LogOut, Menu, Moon, Settings, Sun, User, X } from 'lucide-react'
import { signIn, signOut, useSession } from 'next-auth/react'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import { useState } from 'react'

export function MainHeader() {
  const { setTheme, theme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { data: session, status } = useSession()
  const isAuthenticated = status === 'authenticated'
  return (
    <header className='sticky top-0 z-40 border-gray-200 border-b bg-white dark:border-zinc-800 dark:bg-zinc-900'>
      <div className='container mx-auto px-4'>
        <div className='flex h-16 items-center justify-between'>
          {/* Logo and Brand */}
          <div className='flex items-center'>
            <Link href='/' className='flex items-center gap-2'>
              <span className='hidden font-bold text-xl sm:inline-block'>
                Balatro Multiplayer
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className='hidden items-center space-x-6 md:flex'>
            <Link
              href='/'
              className='font-medium text-gray-700 text-sm transition-colors hover:text-violet-500 dark:text-zinc-300 dark:hover:text-violet-400'
            >
              Home
            </Link>
            <Link
              href='/leaderboards'
              className='font-medium text-gray-700 text-sm transition-colors hover:text-violet-500 dark:text-zinc-300 dark:hover:text-violet-400'
            >
              Leaderboards
            </Link>
            {/*<Link*/}
            {/*  href='/matches'*/}
            {/*  className='font-medium text-gray-700 text-sm transition-colors hover:text-violet-500 dark:text-zinc-300 dark:hover:text-violet-400'*/}
            {/*>*/}
            {/*  Matches*/}
            {/*</Link>*/}
            <Link
              href='/about'
              className='font-medium text-gray-700 text-sm transition-colors hover:text-violet-500 dark:text-zinc-300 dark:hover:text-violet-400'
            >
              About
            </Link>
          </nav>

          {/* Actions: Theme Toggle, Sign In/User Menu */}
          <div className='flex items-center gap-2'>
            {/* Theme Toggle */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' size='icon' className='h-9 w-9'>
                  <Sun className='dark:-rotate-90 h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:scale-0' />
                  <Moon className='absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100' />
                  <span className='sr-only'>Toggle theme</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuItem onClick={() => setTheme('light')}>
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('dark')}>
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('system')}>
                  System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Sign In Button or User Menu */}
            {isAuthenticated && session?.user && session.user.name ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant='ghost'
                    className='relative h-9 w-9 rounded-full'
                  >
                    <Avatar className='h-9 w-9'>
                      <AvatarImage
                        src={session.user.image ?? ''}
                        alt={session.user.name}
                      />
                      <AvatarFallback className='bg-violet-50 text-violet-600 dark:bg-violet-900/50 dark:text-violet-300'>
                        {session.user.name?.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className='w-56' align='end' forceMount>
                  <div className='flex items-center justify-start gap-2 p-2'>
                    <div className='flex flex-col space-y-1 leading-none'>
                      <p className='font-medium'>{session.user.name}</p>
                    </div>
                  </div>
                  <DropdownMenuItem asChild>
                    <Link
                      href={`/players/${session.user.discord_id}`}
                      className='flex w-full items-center'
                    >
                      <User className='mr-2 h-4 w-4' />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href='/settings' className='flex w-full items-center'>
                      <Settings className='mr-2 h-4 w-4' />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut className='mr-2 h-4 w-4' />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant='default'
                size='sm'
                className='bg-violet-600 hover:bg-violet-700 dark:text-zinc-100'
                onClick={() => signIn('discord')}
              >
                <LogIn className='mr-2 h-4 w-4' />
                Sign In
              </Button>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant='ghost'
              size='icon'
              className='h-9 w-9 md:hidden'
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className='h-5 w-5' />
              ) : (
                <Menu className='h-5 w-5' />
              )}
              <span className='sr-only'>Toggle menu</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className='border-gray-200 border-t px-4 py-4 md:hidden dark:border-zinc-800'>
          <nav className='flex flex-col space-y-4'>
            <Link
              href='/'
              className='font-medium text-gray-700 text-sm transition-colors hover:text-violet-500 dark:text-zinc-300 dark:hover:text-violet-400'
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href='/leaderboards'
              className='font-medium text-gray-700 text-sm transition-colors hover:text-violet-500 dark:text-zinc-300 dark:hover:text-violet-400'
              onClick={() => setMobileMenuOpen(false)}
            >
              Leaderboards
            </Link>
            {/*<Link*/}
            {/*  href='/matches'*/}
            {/*  className='font-medium text-gray-700 text-sm transition-colors hover:text-violet-500 dark:text-zinc-300 dark:hover:text-violet-400'*/}
            {/*  onClick={() => setMobileMenuOpen(false)}*/}
            {/*>*/}
            {/*  Matches*/}
            {/*</Link>*/}
            <Link
              href='/about'
              className='font-medium text-gray-700 text-sm transition-colors hover:text-violet-500 dark:text-zinc-300 dark:hover:text-violet-400'
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
