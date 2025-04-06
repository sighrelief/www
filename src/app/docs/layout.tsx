import { baseOptions } from '@/app/layout.config'
import { DocsLayout } from 'fumadocs-ui/layouts/notebook'
import type { ReactNode } from 'react'
import { source } from '../../../lib/source'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout {...baseOptions} tree={source.pageTree}>
      {children}
    </DocsLayout>
  )
}
