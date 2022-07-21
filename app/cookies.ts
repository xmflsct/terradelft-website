import { createCookie } from '@remix-run/cloudflare'

export const cookieBag = createCookie('bag', {
  maxAge: 604_800 // one week
})
