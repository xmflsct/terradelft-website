import React from "react"
import { Col, Row } from "react-bootstrap"
import { useTranslation } from "react-i18next"
import { graphql, Link } from "gatsby"
import Img from "gatsby-image"
import { shuffle } from "lodash"

const GridObjectDefault = ({ nodes, randomize, limit }) => {
  const { t } = useTranslation(["component-object", "constant"])

  randomize && (nodes = shuffle(nodes))
  limit && (nodes = nodes.slice(0, limit))

  return (
    <Row className='component-grid grid-object-default'>
      {nodes.map((node) => {
        return (
          <Col key={node.contentful_id} xs={4} md={2} className='grid-item'>
            <Link
              to={t("constant:slug.dynamic.object.slug", {
                locale: node.node_locale,
                artist: node.artist.artist,
                object: node.name,
                id: node.contentful_id,
              })}
            >
              <div className='item-image'>
                {node.images[0].fixed ? (
                  <Img fluid={node.images[0].fixed} />
                ) : (
                  <Img fluid={node.images[0].fluid} />
                )}
              </div>
              <p className='item-name'>{node.name}</p>
            </Link>
            <span className='item-sale'>
              {node.fields.object_sale && t("component-object:on-sale")}
            </span>
          </Col>
        )
      })}
    </Row>
  )
}

export const query = graphql`
  fragment ObjectDefault on ContentfulObjectsObjectMain {
    contentful_id
    node_locale
    name
    artist {
      artist
    }
    images {
      fluid(maxWidth: 140) {
        ...GatsbyContentfulFluid_withWebp
      }
    }
    fields {
      object_sale
    }
  }
`

export default GridObjectDefault
