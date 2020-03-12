import React from "react"
import { renderToString } from "react-dom/server"
import i18n from "./src/i18n/i18n"

export default replaceRenderer = ({ bodyComponent, replaceBodyHTMLString }) => {
  i18n.loadNamespaces(["translations"], () => {
    replaceBodyHTMLString(bodyComponent)
  })
}