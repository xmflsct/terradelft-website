import { DataFunctionArgs } from '@remix-run/cloudflare'
import i18next from '~/i18next.server'

type Props = {
  titleKey: string
  titleOptions?: { [key: string]: any }
}

const loadMeta = async (
  props: DataFunctionArgs,
  { titleKey, titleOptions }: Props
): Promise<{ title: string }> => {
  const t = await i18next.getFixedT(props.request, 'common')
  const meta = { title: t(titleKey, titleOptions) }

  return meta
}

export default loadMeta
