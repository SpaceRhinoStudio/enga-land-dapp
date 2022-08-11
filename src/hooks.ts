import type { Handle } from '@sveltejs/kit'
import 'zone.js'

export const handle: Handle = async ({ event, resolve }) => {
  return resolve(event, { ssr: false })
}
