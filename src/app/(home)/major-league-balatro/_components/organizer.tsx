import { Button } from '@/components/ui/button'
import { ExternalLink, Twitch, Users, Youtube } from 'lucide-react'
import Link from 'next/link'

export function Organizer() {
  return (
    <section className='container py-8 md:py-12'>
      <div className='mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center'>
        <h2 className='font-bold text-3xl leading-tight tracking-tighter md:text-4xl'>
          About the Organizer
        </h2>
      </div>

      <div className='mx-auto mt-8 flex max-w-3xl flex-col items-center gap-8 md:flex-row'>
        <div className='relative h-32 w-32 flex-shrink-0 rounded-full bg-muted'>
          <div className='absolute inset-0 flex items-center justify-center'>
            <Users className='h-16 w-16 text-muted-foreground/50' />
          </div>
        </div>
        <div>
          <h3 className='mb-2 font-bold text-2xl'>ZainoTV</h3>
          <p className='mb-4 text-muted-foreground'>
            ZainoTV is the creator and organizer of Major League Balatro. With a
            passion for competitive gaming and the Balatro community, Zaino has
            brought together 12 talented creators for this exciting tournament.
          </p>
          <div className='flex gap-4'>
            <Link
              href='https://twitch.tv/zainotv'
              target='_blank'
              rel='noopener noreferrer'
            >
              <Button variant='outline' size='sm' className='gap-2'>
                <Twitch className='h-4 w-4' />
                Twitch
              </Button>
            </Link>
            <Link
              href='https://www.youtube.com/@ZainoTVLive'
              target='_blank'
              rel='noopener noreferrer'
            >
              <Button variant='outline' size='sm' className='gap-2'>
                <Youtube className='h-4 w-4' />
                YouTube
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
