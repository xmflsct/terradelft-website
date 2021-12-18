import Layout from '@components/layout'
import { Price } from '@components/price'
import { bagAdd } from '@state/slices/bag'
import { graphql } from 'gatsby'
import { GatsbyImage } from 'gatsby-plugin-image'
import { useTranslation } from 'gatsby-plugin-react-i18next'
import { renderRichText } from 'gatsby-source-contentful/rich-text'
import { sumBy } from 'lodash'
import React, { useState } from 'react'
import {
  Button,
  Col,
  Form,
  FormControl,
  InputGroup,
  Row
} from 'react-bootstrap'
import { useDispatch } from 'react-redux'
import ReactSelect from 'react-select'

const PageGiftCard = ({ data }) => {
  const { t } = useTranslation()

  const [quantity, setQuantity] = useState(
    Object.fromEntries(
      data.contentfulGiftCard.defaultAmounts.map(amount => [
        parseInt(amount),
        0
      ])
    )
  )
  const [amountCustom, setAmountCustom] = useState(0)
  const [theAmount, setTheAmount] = useState(20)

  const dispatch = useDispatch()
  const onSubmit = e => {
    e.preventDefault()
    Object.keys(quantity).map(amount => {
      if (quantity[amount] > 0) {
        dispatch(
          bagAdd({
            type: 'giftcard',
            gatsbyPath: '/gift-card',
            contentful_id: `custom-gift-card-${amount}`,
            priceOriginal: parseInt(amount),
            image: data.contentfulGiftCard.images[0],
            stock: 50,
            amount: quantity[amount],
            // Locale dependent
            name: {
              nl: t('translation:gift-card.amount.nl', { amount }),
              en: t('translation:gift-card.amount.en', { amount })
            }
          })
        )
      }
    })
    theAmount >= data.contentfulGiftCard.customAmountMinimum &&
      amountCustom > 0 &&
      dispatch(
        bagAdd({
          type: 'giftcard',
          gatsbyPath: '/gift-card',
          contentful_id: 'custom-gift-card-custom',
          priceOriginal: theAmount,
          image: data.contentfulGiftCard.images[0],
          stock: 50,
          amount: amountCustom,
          // Locale dependent
          name: {
            nl: t('translation:gift-card.amount.nl', { amount: theAmount }),
            en: t('translation:gift-card.amount.en', { amount: theAmount })
          }
        })
      )
  }

  return (
    <Layout
      SEOtitle={t('name')}
      SEOkeywords={[t('name'), 'Terra Delft', 'Gift Card']}
      containerName='dynamic-object'
    >
      <Row>
        <Col lg={6} className='object-images'>
          {data.contentfulGiftCard.images.map(image => (
            <div style={{ marginBottom: '1rem' }}>
              <GatsbyImage
                alt='Gift card front'
                image={image.gatsbyImageData}
              />
            </div>
          ))}
        </Col>
        <Col lg={6} className='object-information'>
          <h1>{t('name')}</h1>
          <Form onSubmit={e => onSubmit(e)} className='sell-main'>
            {data.contentfulGiftCard.defaultAmounts.map(amount => (
              <InputGroup>
                <InputGroup.Text>
                  {t('content.amount', { amount })}
                </InputGroup.Text>
                <div className='form-selection'>
                  <ReactSelect
                    options={Array(50)
                      .fill()
                      .map((_, i) => ({ value: i, label: i }))}
                    value={{ value: quantity[amount], label: quantity[amount] }}
                    onChange={e =>
                      setQuantity({ ...quantity, [amount]: e.value })
                    }
                    isSearchable={false}
                  />
                </div>
              </InputGroup>
            ))}
            {data.contentfulGiftCard.customAmountAllow ? (
              <InputGroup>
                <InputGroup.Text>{t('content.amount')}</InputGroup.Text>
                <FormControl
                  type='number'
                  value={theAmount}
                  onChange={e => setTheAmount(Math.ceil(e.target.value))}
                  style={{ flex: 0.18 }}
                  isInvalid={
                    theAmount < data.contentfulGiftCard.customAmountMinimum
                  }
                />
                <div className='form-selection'>
                  <ReactSelect
                    options={Array(50)
                      .fill()
                      .map((_, i) => ({ value: i, label: i }))}
                    value={{ value: amountCustom, label: amountCustom }}
                    onChange={e => setAmountCustom(e.value)}
                    isSearchable={false}
                  />
                </div>
                <FormControl.Feedback type='invalid'>
                  {t('content.minimum')}
                </FormControl.Feedback>
              </InputGroup>
            ) : null}
            <Price
              showZero
              priceOriginal={
                sumBy(
                  Object.keys(quantity),
                  amount => parseInt(amount) * quantity[amount]
                ) +
                amountCustom * theAmount
              }
            />
            <Button variant='primary' type='submit'>
              {t('add-button.add-to-bag')}
            </Button>
          </Form>
          <div className='object-description'>
            {renderRichText(data.contentfulGiftCard.description)}
          </div>
        </Col>
      </Row>
    </Layout>
  )
}

export const query = graphql`
  query PageGiftCard($language: String!) {
    locales: allLocale(
      filter: {
        ns: { in: ["translation", "page-gift-card"] }
        language: { eq: $language }
      }
    ) {
      edges {
        node {
          ns
          data
          language
        }
      }
    }
    contentfulGiftCard(contentful_id: { eq: "owqoj0fTsXPwPeo6VMb2Z" }) {
      images {
        gatsbyImageData(width: 427, quality: 85)
      }
      defaultAmounts
      customAmountAllow
      customAmountMinimum
      description {
        raw
      }
    }
  }
`

export default PageGiftCard
