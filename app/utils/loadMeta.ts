import { LoaderFunctionArgs } from 'react-router';
import i18next from '~/i18next.server';

type Props = {
  titleKey: string
  titleOptions?: { [key: string]: any }
}

const loadMeta = async (
  args: LoaderFunctionArgs,
  { titleKey, titleOptions }: Props
): Promise<{ title: string }> => {
  const t = await i18next.getFixedT(args.request, 'common')
  const meta = { title: t(titleKey, titleOptions) }

  return meta
}

export default loadMeta
