import { Transition } from '@headlessui/react'
import { useContext, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BagContext } from '~/states/bag'
import classNames from '~/utils/classNames'

const BagAnimate = () => {
  const { t } = useTranslation()

  const { objects } = useContext(BagContext)
  const [bagAnimate, setBagAnimate] = useState(false)
  const prevBagCount = useRef(objects.length)
  useEffect(() => {
    if (objects.length > prevBagCount.current) {
      setBagAnimate(true)
    }
    prevBagCount.current = objects.length
  }, [objects.length, prevBagCount])

  return (
    <Transition
      show={bagAnimate}
      className={classNames(
        'z-50 sticky lg:absolute top-0 left-0',
        'w-full h-12 pt-1',
        'bg-secondary text-white',
        'text-center leading-10 font-semibold'
      )}
      enter='transition-transform'
      enterFrom='-translate-y-12'
      enterTo='translate-y-0'
      afterEnter={() => {
        setTimeout(() => {
          setBagAnimate(false)
        }, 3000)
      }}
      leave='transition-transform'
      leaveFrom='translate-y-0'
      leaveTo='-translate-y-12'
    >
      <div>{t('common:header.mini-bag')}</div>
    </Transition>
  )
}

export default BagAnimate
