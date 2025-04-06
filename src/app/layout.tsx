import '@/styles/globals.css'
import { TRPCReactProvider } from '@/trpc/react'
import { RootProvider } from 'fumadocs-ui/provider'
import type { Metadata } from 'next'
import { SessionProvider } from 'next-auth/react'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale } from 'next-intl/server'
import PlausibleProvider from 'next-plausible'
import { Geist } from 'next/font/google'

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
      <head>
        <title />
        <PlausibleProvider
          domain='balatromp.com'
          customDomain={'https://plausible.balatromp.com'}
          trackOutboundLinks
          trackFileDownloads
          selfHosted
        />
      </head>
      <body className={'flex min-h-screen flex-col'}>
        <TRPCReactProvider>
          <NextIntlClientProvider>
            <SessionProvider>
              <RootProvider>{children}</RootProvider>
            </SessionProvider>
          </NextIntlClientProvider>
        </TRPCReactProvider>
      </body>
    </html>
  )
}
