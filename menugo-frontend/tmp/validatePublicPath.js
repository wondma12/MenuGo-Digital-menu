const normalizePath = (path) => String(path || '').replace(/\/+$|^\s+|\s+$/g, '')
const pathPatternToRegExp = (path, exact = false) => {
  const pattern = String(path || '')
    .split(/(:[a-zA-Z0-9_]+)/g)
    .map((segment) => {
      if (segment.startsWith(':')) {
        return '[^/]+'
      }
      return segment.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')
    })
    .join('')
  return new RegExp(`^${pattern}${exact ? '$' : '(?:/|$)'}`)
}
const publicPathRules = [
  { path: '/restaurants/:id', methods: ['get'], exact: true },
  { path: '/coupons/public/restaurant/:restaurantId', methods: ['get'], exact: true },
]
const isPublicPath = (requestPath, method = 'get') => {
  let normalizedRequestPath = normalizePath(requestPath).replace(/\/$/, '')
  if (normalizedRequestPath.startsWith('/api/')) {
    normalizedRequestPath = normalizedRequestPath.replace(/^\/api\//, '/')
  } else if (normalizedRequestPath === '/api') {
    normalizedRequestPath = '/'
  }
  const normalizedMethod = String(method || 'get').toLowerCase()
  return publicPathRules.some((rule) => {
    const normalizedRulePath = normalizePath(rule.path).replace(/\/$/, '')
    const methodMatches = !rule.methods || rule.methods.map((m) => String(m).toLowerCase()).includes(normalizedMethod)
    if (!methodMatches) return false
    const ruleRegex = pathPatternToRegExp(normalizedRulePath, Boolean(rule.exact))
    return ruleRegex.test(normalizedRequestPath)
  })
}
const tests = [
  ['/restaurants/beles', 'get'],
  ['/api/restaurants/beles', 'get'],
  ['/coupons/public/restaurant/beles', 'get'],
  ['/api/coupons/public/restaurant/beles', 'get'],
  ['/restaurants/beles/reviews', 'get'],
  ['/api/restaurants/beles/reviews', 'get'],
]
for (const [path, method] of tests) {
  console.log(path, method, isPublicPath(path, method))
}
