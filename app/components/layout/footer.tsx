import { useTranslation } from 'react-i18next'

const Footer = () => {
  const { t } = useTranslation()

  return (
    <footer className='mt-8 pt-4 text-sm border-t border-t-secondary border-dashed flex flex-col lg:flex-row leading-6'>
      <div className='flex-1 text-left'>
        <p>
          {t('footer.left.copyright')}
          <br />
          {t('footer.left.opening.1')}
          <br />
          {t('footer.left.opening.2')}
          <br />
          {t('footer.left.opening.3')}
        </p>
      </div>
      <div className='flex-1 mt-4 lg:m-0 text-left lg:text-center'>
        <p>
          {t('footer.center.address')}
          <br />
          {t('footer.center.phone')}
          <br />
          {t('footer.center.email')}
        </p>
      </div>
      <div className='flex-1 mt-4 lg:m-0 text-left lg:text-right'>
        <p>
          Made with ♥ by{' '}
          <a
            target='_blank'
            href='https://xmflsct.com'
            rel='noopener noreferrer'
          >
            xmflsct.com
          </a>
        </p>
      </div>
    </footer>
  )
}

export default Footer
