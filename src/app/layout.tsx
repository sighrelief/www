import '@/styles/globals.css'

import type { Metadata } from 'next'
import { Geist } from 'next/font/google'

import { MainHeader } from '@/components/header'
import { ThemeProvider } from '@/components/theme-provider'
import { TRPCReactProvider } from '@/trpc/react'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale } from 'next-intl/server'

export const metadata: Metadata = {
  title: 'Balatro Multiplayer',
  description: 'Unofficial (for now) stats for the Balatro Multiplayer Mod',
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
}

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
})

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale()
  return (
    <html
      lang={locale}
      className={`${geist.variable}`}
      suppressHydrationWarning
    >
      <body>
        <TRPCReactProvider>
          <NextIntlClientProvider>
            <ThemeProvider
              attribute='class'
              defaultTheme='system'
              enableSystem
              disableTransitionOnChange
            >
              <MainHeader />
              {children}
            </ThemeProvider>
          </NextIntlClientProvider>
        </TRPCReactProvider>
      </body>
    </html>
  )
}
