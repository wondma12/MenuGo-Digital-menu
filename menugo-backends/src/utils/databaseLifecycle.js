const shutdownDatabase = async ({ sequelize, callbackPool, pool, logger = console } = {}) => {
  const safeLogger = logger || console;

  try {
    if (sequelize && typeof sequelize.close === 'function') {
      try {
        await sequelize.close();
      } catch (error) {
        const message = error && error.message ? error.message : String(error);
        if (safeLogger && typeof safeLogger.warn === 'function') {
          safeLogger.warn('Database shutdown warning:', message);
        }
      }
    }
  } catch (error) {
    const message = error && error.message ? error.message : String(error);
    if (safeLogger && typeof safeLogger.warn === 'function') {
      safeLogger.warn('Unexpected shutdown error:', message);
    }
  } finally {
    try {
      if (callbackPool && typeof callbackPool.end === 'function') {
        await new Promise((resolve) => {
          try {
            callbackPool.end((err) => resolve());
          } catch (error) {
            resolve();
          }
        });
      }
    } catch (error) {
      const message = error && error.message ? error.message : String(error);
      if (safeLogger && typeof safeLogger.warn === 'function') {
        safeLogger.warn('Callback pool shutdown warning:', message);
      }
    }

    try {
      if (pool && typeof pool.end === 'function') {
        await new Promise((resolve) => {
          try {
            pool.end((err) => resolve());
          } catch (error) {
            resolve();
          }
        });
      }
    } catch (error) {
      const message = error && error.message ? error.message : String(error);
      if (safeLogger && typeof safeLogger.warn === 'function') {
        safeLogger.warn('Pool shutdown warning:', message);
      }
    }
  }
};

module.exports = {
  shutdownDatabase,
};
