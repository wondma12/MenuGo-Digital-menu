const parseDurationToMs = (value) => {
  if (!value || typeof value !== 'string') return null;

  const trimmed = value.trim().toLowerCase();
  const match = trimmed.match(/^(\d+)([smhdw])$/);
  if (!match) return null;

  const amount = Number(match[1]);
  const unit = match[2];

  const multipliers = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
    w: 7 * 24 * 60 * 60 * 1000,
  };

  return amount * (multipliers[unit] || 0);
};

const getPasswordResetExpiryMs = () => {
  const configured = parseDurationToMs(process.env.PASSWORD_RESET_EXPIRES_IN || '24h');
  return configured || 24 * 60 * 60 * 1000;
};

const getEmailVerificationExpiryMs = () => {
  const configured = parseDurationToMs(process.env.EMAIL_VERIFICATION_EXPIRES_IN || '24h');
  return configured || 24 * 60 * 60 * 1000;
};

module.exports = {
  parseDurationToMs,
  getPasswordResetExpiryMs,
  getEmailVerificationExpiryMs,
};
