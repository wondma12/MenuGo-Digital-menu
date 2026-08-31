const DEFAULT_MAX_LOGIN_ATTEMPTS = 5;
const WARNING_ATTEMPTS = 3;

const getLoginLockoutState = (loginAttempts = 0, now = new Date(), lockedUntil = null) => {
  const attempts = Number(loginAttempts) || 0;
  const lockUntilTime = lockedUntil ? new Date(lockedUntil).getTime() : 0;
  const locked = Boolean(lockedUntil) && lockUntilTime > now.getTime();

  if (locked) {
    return {
      locked: true,
      shouldLock: false,
      nextAttempts: attempts,
      lockUntil: new Date(lockUntilTime),
      message: 'Multiple attempts. Please try again later.',
    };
  }

  if (attempts >= DEFAULT_MAX_LOGIN_ATTEMPTS) {
    return {
      locked: false,
      shouldLock: true,
      nextAttempts: attempts,
      lockUntil: null,
      message: 'Multiple attempts. Please try again later.',
    };
  }

  if (attempts >= WARNING_ATTEMPTS) {
    return {
      locked: false,
      shouldLock: false,
      nextAttempts: attempts,
      lockUntil: null,
      message: 'Multiple attempts. Please try again later.',
    };
  }

  return {
    locked: false,
    shouldLock: false,
    nextAttempts: attempts,
    lockUntil: null,
    message: 'Invalid credentials',
  };
};

module.exports = {
  DEFAULT_MAX_LOGIN_ATTEMPTS,
  WARNING_ATTEMPTS,
  getLoginLockoutState,
};
