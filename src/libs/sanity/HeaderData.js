import { sanityClient } from './client'
import { HEADER_QUERY } from './queries'

export async function getHeaderData() {
  const data = await sanityClient.fetch(HEADER_QUERY)
  return data
}