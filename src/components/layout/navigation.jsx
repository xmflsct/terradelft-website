import { faSearch } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Link, useTranslation } from 'gatsby-plugin-react-i18next'
import React, { useEffect, useState } from 'react'
import { Button, Col, Dropdown, Form, InputGroup, Row } from 'react-bootstrap'

const activeChildren = (location, children) => {
  if (location.pathname.includes(children)) {
    return { className: 'active-children' }
  }
}

const Navigation = () => {
  const { t, i18n } = useTranslation()
  const [locationOrigin, setLocationOrigin] = useState()

  useEffect(() => {
    setLocationOrigin(window.location.origin)
  }, [])

  return (
    <Row as='nav'>
      <Col md={12} className='nav-search mb-3'>
        <Form action={`${locationOrigin}/search`}>
          <InputGroup>
            <InputGroup.Text>
              <Button variant='link' type='submit'>
                <FontAwesomeIcon icon={faSearch} size='sm' fixedWidth />
              </Button>
            </InputGroup.Text>
            <Form.Control name='query' placeholder='Search' />
          </InputGroup>
        </Form>
      </Col>
      <Col xs={12} sm={4} md={2} className='nav-item'>
        <Link
          to='/'
          getProps={({ location }) => {
            activeChildren(
              location,
              t('translation:navigation.1.children', { locale: i18n.language })
            )
          }}
        >
          {t('translation:navigation.1.name')}
        </Link>
      </Col>
      <Col xs={12} sm={4} md={2} className='nav-item'>
        <Link to='/shop'>{t('translation:navigation.2.name')}</Link>
      </Col>
      <Col xs={12} sm={4} md={2} className='nav-item'>
        <Link
          to='/exhibitions'
          getProps={({ location }) => {
            activeChildren(
              location,
              t('translation:navigation.3.children', { locale: i18n.language })
            )
          }}
        >
          {t('translation:navigation.3.name')}
        </Link>
      </Col>
      <Col xs={12} sm={4} md={2} className='nav-item'>
        <Link
          to='/news/page/1'
          getProps={({ location }) => {
            activeChildren(
              location,
              t('translation:navigation.4.children', { locale: i18n.language })
            )
          }}
        >
          {t('translation:navigation.4.name')}
        </Link>
      </Col>
      <Col xs={12} sm={4} md={2} className='nav-item'>
        <Link
          to='/terra-in-china'
          getProps={({ location }) => {
            activeChildren(
              location,
              t('translation:navigation.5.children', { locale: i18n.language })
            )
          }}
        >
          {t('translation:navigation.5.name')}
        </Link>
      </Col>
      <Dropdown as={Col} xs={12} sm={4} md={2} role='menu' className='nav-item'>
        <Dropdown.Toggle as={Col}>
          {t('translation:navigation.6.name')}
        </Dropdown.Toggle>
        <Dropdown.Menu alignRight>
          <Link to='/about-terra'>{t('translation:navigation.6.1.name')}</Link>
          <Link to='/reach-terra'>{t('translation:navigation.6.2.name')}</Link>
          <Link to='/newsletter'>{t('translation:navigation.6.3.name')}</Link>
        </Dropdown.Menu>
      </Dropdown>
    </Row>
  )
}

export default Navigation
