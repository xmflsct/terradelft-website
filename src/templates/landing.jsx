import React from "react"
import { Container, Spinner } from "react-bootstrap"
import { useTranslation } from "react-i18next"

const Index = () => {
  const { i18n } = useTranslation("template-landing")
  window.location.replace(window.location.origin + "/" + i18n.languages[0])
  return (
    <Container
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <Spinner animation='grow' />
    </Container>
  )
}

export default Index
