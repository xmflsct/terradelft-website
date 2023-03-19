const SEOTitle = (title?: string | null): string => {
  if (title) {
    return `${title} | Terra Delft`
  } else {
    return 'Terra Delft'
  }
}

const SEOKeywords = (keyworks?: string[]): string => {
  return ['Terra', 'Delft', 'Terra Delft'].concat(keyworks || []).join(',')
}

export { SEOTitle, SEOKeywords }
