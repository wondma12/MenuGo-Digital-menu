const normalizePath = (path) => String(path || '').replace(/\/+$|^\s+|\s+$/g, '');
const pathPatternToRegExp = (path, exact = false) => {
  const pattern = String(path || '')
    .split(/(:[a-zA-Z0-9_]+)/g)
    .map((segment) => {
      if (segment.startsWith(':')) return '[^/]+';
      return segment.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');
    })
    .join('');
  return new RegExp(`^${pattern}${exact ? '$' : '(?:/|$)'}`);
};
const publicPathRules = [
  { path: '/auth/login', methods: ['post'], exact: true },
  { path: '/auth/register', methods: ['post'], exact: true },
  { path: '/auth/refresh-token', methods: ['post'], exact: true },
  { path: '/auth/forgot-password', methods: ['post'], exact: true },
  { path: '/auth/reset-password', methods: ['post'], exact: true },
  { path: '/auth/verify-email', methods: ['post'], exact: true },
  { path: '/auth/verify-email', methods: ['get'], prefix: true },
  { path: '/platform/public-summary', methods: ['get'], prefix: true },
  { path: '/platform/subscriptions/plans', methods: ['get'], exact: true },
  { path: '/menu/restaurant', methods: ['get'], prefix: true },
  { path: '/menu/items', methods: ['get'], prefix: true },
  { path: '/menu/item', methods: ['get'], prefix: true },
  { path: '/menu/categories', methods: ['get'], prefix: true },
  { path: '/restaurants', methods: ['get'], exact: true },
  { path: '/restaurants/:id', methods: ['get'], exact: true },
  { path: '/restaurants/:id/reviews', methods: ['get'], exact: true },
  { path: '/restaurants/:id/tables', methods: ['get'], exact: true },
  { path: '/restaurants/:id/tables/public', methods: ['get'], exact: true },
  { path: '/restaurants/:id/calls', methods: ['post'], exact: true },
  { path: '/reviews', methods: ['get'], prefix: true },
  { path: '/orders', methods: ['post'], exact: true },
  { path: '/coupons/public/restaurant/:restaurantId', methods: ['get'], exact: true },
  { path: '/public/contact', methods: ['post'], exact: true },
];
const isPublicPath = (requestPath, method = 'get') => {
  let normalizedRequestPath = normalizePath(requestPath).replace(/\/$/, '');
  if (normalizedRequestPath.startsWith('/api/')) {
    normalizedRequestPath = normalizedRequestPath.replace(/^\/api\//, '/');
  } else if (normalizedRequestPath === '/api') {
    normalizedRequestPath = '/';
  }
  const normalizedMethod = String(method || 'get').toLowerCase();
  return publicPathRules.some((rule) => {
    const normalizedRulePath = normalizePath(rule.path).replace(/\/$/, '');
    const methodMatches = !rule.methods || rule.methods.map((m) => String(m).toLowerCase()).includes(normalizedMethod);
    if (!methodMatches) return false;
    const ruleRegex = pathPatternToRegExp(normalizedRulePath, Boolean(rule.exact));
    return ruleRegex.test(normalizedRequestPath);
  });
};
const tests = [
  '/restaurants/123/verify',
  '/api/restaurants/123/verify',
  '/restaurants/123/status',
  '/api/restaurants/123/status',
  '/restaurants/123',
  '/api/restaurants/123',
  '/restaurants/123/reviews'
];

tests.forEach((path) => {
  console.log(path, 'POST public?', isPublicPath(path, 'post'), 'GET public?', isPublicPath(path, 'get'));
});
