'use client'

import { CDN_URL } from '@/shared/constants'
import type { ComponentPropsWithoutRef } from 'react'

export function OptimizedImage(props: ComponentPropsWithoutRef<'img'>) {
  const isDev = process.env.NODE_ENV === 'development'

  if (isDev) {
    return <img {...props} />
  }

  return <img {...props} src={`${CDN_URL}${props.src}`} alt={props.alt} />
}
