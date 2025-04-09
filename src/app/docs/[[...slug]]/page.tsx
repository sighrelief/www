import { Button } from '@/components/ui/button'
import { ImageZoom } from 'fumadocs-ui/components/image-zoom'
import defaultMdxComponents from 'fumadocs-ui/mdx'
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from 'fumadocs-ui/page'
import { notFound } from 'next/navigation'
import { metadataImage } from '../../../../lib/metadata'
import { source } from '../../../../lib/source'

export default async function Page(props: {
  params: Promise<{ slug?: string[] }>
}) {
  const params = await props.params
  const page = source.getPage(params.slug)
  if (!page) notFound()

  const MDX = page.data.body

  return (
    <DocsPage toc={page.data.toc} full={page.data.full}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <MDX
          components={{
            ...defaultMdxComponents,
            img: (props) => <ImageZoom {...(props as any)} />,
            Button: (props) => <Button {...(props as any)} />,
          }}
        />
      </DocsBody>
    </DocsPage>
  )
}

export async function generateStaticParams() {
  return source.generateParams()
}

export async function generateMetadata(props: {
  params: Promise<{ slug?: string[] }>
}) {
  const params = await props.params
  const page = source.getPage(params.slug)
  if (!page) notFound()

  return metadataImage.withImage(page.slugs, {
    title: page.data.title,
    description: page.data.description,
  })
}
