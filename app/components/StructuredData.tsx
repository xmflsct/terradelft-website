import { useMatches } from '@remix-run/react'

const StructuredData: React.FC = () => {
  const matches = useMatches()
  const structuredData = matches.flatMap(({ data, handle, params }) => {
    if (handle?.structuredData && typeof handle.structuredData === 'function') {
      const result = handle.structuredData(data, params)

      if (result) {
        return result
      }
    }

    return []
  })

  if (structuredData.length === 0) {
    return null
  }

  const renderedScript =
    structuredData.length === 1 ? JSON.stringify(structuredData[0]) : JSON.stringify(structuredData)

  return (
    <script
      type='application/ld+json'
      dangerouslySetInnerHTML={{
        __html: renderedScript
      }}
    />
  )
}

export default StructuredData
