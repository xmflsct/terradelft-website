import { AppLoadContext } from '@react-router/cloudflare'

const isPreview: (context: AppLoadContext) => boolean = context => {
  return context.cloudflare.env.CF_PAGES !== '1'
}

export default isPreview
