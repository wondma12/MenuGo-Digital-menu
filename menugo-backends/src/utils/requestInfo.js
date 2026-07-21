const normalizeIp = (value) => {
  if (!value) return null;
  const trimmed = String(value).trim();
  if (!trimmed || trimmed === 'unknown' || trimmed === 'undefined') return null;
  return trimmed.replace(/^::ffff:/, '');
};

const getClientIp = (req) => {
  if (!req) return null;

  const forwardedFor = req.headers?.['x-forwarded-for'];
  if (typeof forwardedFor === 'string' && forwardedFor.trim()) {
    const firstIp = forwardedFor.split(',')[0].trim();
    const normalized = normalizeIp(firstIp);
    if (normalized) return normalized;
  }

  const realIp = req.headers?.['x-real-ip'];
  const normalizedRealIp = normalizeIp(realIp);
  if (normalizedRealIp) return normalizedRealIp;

  const cfConnectingIp = req.headers?.['cf-connecting-ip'];
  const normalizedCfIp = normalizeIp(cfConnectingIp);
  if (normalizedCfIp) return normalizedCfIp;

  if (req.ip) {
    const normalizedReqIp = normalizeIp(req.ip);
    if (normalizedReqIp) return normalizedReqIp;
  }

  if (req.socket?.remoteAddress) {
    const normalizedSocketIp = normalizeIp(req.socket.remoteAddress);
    if (normalizedSocketIp) return normalizedSocketIp;
  }

  return null;
};

const getUserAgent = (req) => {
  if (!req) return null;
  const userAgent = req.get?.('user-agent') || req.headers?.['user-agent'];
  return userAgent || null;
};

module.exports = {
  getClientIp,
  getUserAgent,
};
