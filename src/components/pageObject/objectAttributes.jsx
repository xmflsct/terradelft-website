import React from "react"

const ObjectAttributes = ({ title, data }) => (
  <div>
    <span>{title}</span>-
    {!Array.isArray(data) ? (
      <span>{data}</span>
    ) : (
      data.map(d => (
        <span key={Object.values(d)[0]}>{Object.values(d)[0]}</span>
      ))
    )}
  </div>
)

export default ObjectAttributes
