import { notFound } from 'next/navigation'
import { client } from '@/libs/sanity/client'
import { homepageQuery } from '@/libs/sanity/queries/homepage'
import { SectionRenderer } from '@/sections/SectionRenderer'

const HOME_ID = 'homepage-heroSection'

export default async function HomePage() {
  const page = await client.fetch(homepageQuery, { id: HOME_ID })
  if (!page) notFound()

  return <SectionRenderer sections={page.pageBuilder?.sectionsArray} />
}
