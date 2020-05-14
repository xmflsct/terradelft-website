import React from "react"
import { Container, Spinner } from "react-bootstrap"
import { useTranslation } from "react-i18next"

const StaticLanding = () => {
  const { i18n } = useTranslation()
  if (typeof window !== "undefined") {
    window.location.replace(`${window.location.origin}/${i18n.languages[0]}`)
  }
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

export default StaticLanding
