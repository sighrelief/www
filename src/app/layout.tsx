import '@/styles/globals.css'

import type {Metadata} from 'next'
import {Geist} from 'next/font/google'

import {MainHeader} from '@/components/header'
import {ThemeProvider} from '@/components/theme-provider'
import {TRPCReactProvider} from '@/trpc/react'
import {SessionProvider} from 'next-auth/react'
import {NextIntlClientProvider} from 'next-intl'
import {getLocale} from 'next-intl/server'
import PlausibleProvider from 'next-plausible'

export const metadata: Metadata = {
  title: 'Balatro Multiplayer',
  description: 'Unofficial (for now) stats for the Balatro Multiplayer Mod',
  icons: [{rel: 'icon', url: '/favicon.ico'}],
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
      <title/>
      <PlausibleProvider
        domain='balatromp.com'
        customDomain={'https://plausible.balatromp.com'}
        trackOutboundLinks
        trackFileDownloads
        selfHosted
      />
    </head>
    <body>
    <TRPCReactProvider>
      <NextIntlClientProvider>
        <SessionProvider>
          <ThemeProvider
            attribute='class'
            defaultTheme='system'
            enableSystem
            disableTransitionOnChange
          >

            {children}
          </ThemeProvider>
        </SessionProvider>
      </NextIntlClientProvider>
    </TRPCReactProvider>
    </body>
    </html>
  )
}
