const cloudinary = require('cloudinary').v2;
const { logger } = require('../utils/logger');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const createCloudinaryUpload = (filePath, folder, timeoutMs) => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('Cloudinary upload timed out'));
    }, timeoutMs);

    cloudinary.uploader.upload(
      filePath,
      { folder, resource_type: 'auto' },
      (error, result) => {
        clearTimeout(timer);
        if (error) {
          return reject(error);
        }
        return resolve(result);
      }
    );
  });
};

const uploadToCloudinary = async (filePath, folder = 'menugo') => {
  const fs = require('fs');
  const path = require('path');

  // Local fallback helper
  const localFallback = (reason) => {
    try {
      logger.warn(`Using local upload fallback for ${filePath}. Reason: ${reason}`);
      const uploadsDir = path.join(process.cwd(), 'uploads', folder.replace(/\//g, '_'));
      fs.mkdirSync(uploadsDir, { recursive: true });
      const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2)}${path.extname(filePath)}`;
      const dest = path.join(uploadsDir, uniqueName);
      fs.copyFileSync(filePath, dest);
      const apiUrl = process.env.API_URL || `http://localhost:${process.env.PORT || 5000}`;
      const publicUrl = `${apiUrl.replace(/\/$/, '')}/uploads/${folder.replace(/\//g, '_')}/${uniqueName}`;
      return { url: publicUrl, publicId: null };
    } catch (e) {
      logger.error('Failed to copy file to local uploads during Cloudinary fallback:', e && e.message ? e.message : e);
      throw e;
    }
  };

  try {
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      return localFallback('cloudinary not configured');
    }

    // Configurable retry and timeout
    const maxAttempts = parseInt(process.env.CLOUDINARY_MAX_ATTEMPTS || '4', 10);
    const timeoutMs = parseInt(process.env.CLOUDINARY_UPLOAD_TIMEOUT_MS || '60000', 10); // default 60s
    const backoffBase = parseInt(process.env.CLOUDINARY_BACKOFF_BASE_MS || '800', 10);

    const fsExists = fs.existsSync(filePath);
    if (!fsExists) {
      logger.error('File to upload does not exist:', filePath);
      return localFallback('file not found');
    }

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const result = await createCloudinaryUpload(filePath, folder, timeoutMs);

        // success
        return { url: result.secure_url, publicId: result.public_id };
      } catch (err) {
        // Classify transient errors for retry
        const msg = err && err.message ? err.message : String(err);
        const code = err && err.code ? err.code : null;
        logger.warn(`Cloudinary upload attempt ${attempt} failed: ${msg}`);

        const isTransient = code === 'ECONNRESET' || msg.includes('ECONNRESET') || msg.includes('timed out') || msg.includes('timeout') || msg.includes('ENOTFOUND') || msg.includes('EAI_AGAIN');

        if (attempt < maxAttempts && isTransient) {
          const backoff = backoffBase * Math.pow(2, attempt - 1);
          logger.info(`Retrying Cloudinary upload in ${backoff}ms (attempt ${attempt + 1}/${maxAttempts})`);
          await new Promise((r) => setTimeout(r, backoff));
          continue;
        }

        // Non-transient or exhausted attempts -> fallback
        const fallback = localFallback(`cloudinary error after ${attempt} attempts: ${msg}`);
        // Enqueue a background retry so we try to upload to Cloudinary later
        try {
          enqueueBackgroundRetry(filePath, folder);
        } catch (e) {
          logger.warn('Failed to enqueue background retry:', e && e.message ? e.message : e);
        }
        return fallback;
      }
    }
  } catch (error) {
    logger.error('Cloudinary upload unexpected error:', error && error.message ? error.message : error);
    return localFallback(error && error.message ? error.message : 'unexpected');
  }
};

// Background retry queue: persist pending uploads so we can retry when Cloudinary is reachable.
const pendingDir = (() => {
  const fs = require('fs');
  const path = require('path');
  const dir = path.join(process.cwd(), 'uploads', 'pending');
  try {
    fs.mkdirSync(dir, { recursive: true });
  } catch (e) { /* empty */ }
  return dir;
})();

const pendingFilesDir = (() => {
  const fs = require('fs');
  const path = require('path');
  const dir = path.join(process.cwd(), 'uploads', 'pending_files');
  try {
    fs.mkdirSync(dir, { recursive: true });
  } catch (e) { /* empty */ }
  return dir;
})();

let backgroundProcessorStarted = false;

const enqueueBackgroundRetry = (filePath, folder) => {
  const fs = require('fs');
  const path = require('path');

  if (!fs.existsSync(filePath)) {
    logger.warn(`Cannot enqueue Cloudinary retry because source file is missing: ${filePath}`);
    return;
  }

  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const pendingFile = path.join(pendingFilesDir, `${id}${path.extname(filePath) || ''}`);
  try {
    fs.copyFileSync(filePath, pendingFile);
  } catch (e) {
    logger.warn('Failed to copy file for pending Cloudinary retry:', e && e.message ? e.message : e);
    return;
  }

  const jobFile = path.join(pendingDir, `${id}.json`);
  const job = { filePath: pendingFile, folder, createdAt: new Date().toISOString() };
  fs.writeFileSync(jobFile, JSON.stringify(job));
  startBackgroundProcessor();
};

const startBackgroundProcessor = () => {
  if (backgroundProcessorStarted) {
    return;
  }
  backgroundProcessorStarted = true;
  const fs = require('fs');
  const path = require('path');

  const processOnce = async () => {
    try {
      if (!fs.existsSync(pendingDir)) {
        return;
      }
      const files = fs.readdirSync(pendingDir).filter(f => f.endsWith('.json'));
      for (const file of files) {
        const full = path.join(pendingDir, file);
        let job;
        try {
          const raw = fs.readFileSync(full, 'utf8');
          job = JSON.parse(raw);
        } catch (e) {
          try {
            fs.unlinkSync(full);
          } catch (unlinkError) {
            logger.warn('Failed to remove invalid pending job file:', unlinkError && unlinkError.message ? unlinkError.message : unlinkError);
          }
          continue;
        }

        if (!job || !job.filePath || !job.folder) {
          try {
            fs.unlinkSync(full);
          } catch (e) {
            logger.warn('Failed to remove malformed pending job file:', e && e.message ? e.message : e);
          }
          continue;
        }

        if (!fs.existsSync(job.filePath)) {
          logger.warn(`Pending Cloudinary upload file no longer exists, deleting job: ${job.filePath}`);
          try {
            fs.unlinkSync(full);
          } catch (e) {
            logger.warn('Failed to delete pending job file for missing upload:', e && e.message ? e.message : e);
          }
          continue;
        }

        try {
          logger.info(`Background retry: attempting upload for ${job.filePath}`);
          // Try a longer upload attempt for background jobs
          const res = await uploadToCloudinaryBackground(job.filePath, job.folder);
          if (res && res.url) {
            logger.info(`Background upload succeeded for ${job.filePath}: ${res.url}`);
            try {
              fs.unlinkSync(full);
            } catch (e) {
              logger.warn('Failed to remove pending job file', e && e.message ? e.message : e);
            }
            try {
              fs.unlinkSync(job.filePath);
            } catch (e) {
              logger.warn('Failed to remove pending retry file', e && e.message ? e.message : e);
            }
          } else {
            logger.warn(`Background upload did not return url for ${job.filePath}`);
          }
        } catch (e) {
          logger.warn(`Background upload failed for ${job.filePath}: ${e && e.message ? e.message : e}`);
          // keep job file for next run
        }
      }
    } catch (e) {
      logger.error('Background processor encountered error:', e && e.message ? e.message : e);
    }
  };

  // Run periodically
  (async () => {
    await processOnce();
    setInterval(processOnce, 60 * 1000); // every 60s
  })();
};

// Background upload helper uses same streaming logic but with more attempts and longer timeouts
const uploadToCloudinaryBackground = async (filePath, folder = 'menugo') => {
  const fs = require('fs');
  const path = require('path');
  const maxAttempts = parseInt(process.env.CLOUDINARY_BACKGROUND_MAX_ATTEMPTS || '8', 10);
  const timeoutMs = parseInt(process.env.CLOUDINARY_BACKGROUND_TIMEOUT_MS || '120000', 10); // 2m
  const backoffBase = parseInt(process.env.CLOUDINARY_BACKOFF_BASE_MS || '800', 10);

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await createCloudinaryUpload(filePath, folder, timeoutMs);

      return { url: result.secure_url, publicId: result.public_id };
    } catch (err) {
      const msg = err && err.message ? err.message : String(err);
      logger.warn(`Background Cloudinary upload attempt ${attempt} failed: ${msg}`);
      const isTransient = (err && err.code === 'ECONNRESET') || msg.includes('ECONNRESET') || msg.includes('timed out') || msg.includes('timeout') || msg.includes('ENOTFOUND') || msg.includes('EAI_AGAIN');
      if (attempt < maxAttempts && isTransient) {
        const backoff = backoffBase * Math.pow(2, attempt - 1);
        await new Promise((r) => setTimeout(r, backoff));
        continue;
      }
      throw err;
    }
  }
  return null;
};

const deleteFromCloudinary = async (publicId) => {
  try {
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      // Nothing to delete in cloud; if publicId looks like a local path, try to remove the file
      try {
        const fs = require('fs');
        const path = require('path');
        if (!publicId) {
          return null;
        }
        // If publicId is a URL to /uploads, derive file path
        const uploadsIndex = publicId.indexOf('/uploads/');
        if (uploadsIndex !== -1) {
          const rel = publicId.slice(uploadsIndex + 9); // after /uploads/
          const filePath = path.join(process.cwd(), 'uploads', rel.replace(/\//g, path.sep));
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            return { result: 'deleted' };
          }
        }
      } catch (e) {
        logger.warn('Failed to delete local fallback file:', e && e.message ? e.message : e);
      }
      logger.warn('Cloudinary not configured (CLOUDINARY_CLOUD_NAME missing). Skipping cloud delete.');
      return null;
    }
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    logger.error('Cloudinary delete error:', error && error.message ? error.message : error);
    // Don't throw — deleting from cloud is best-effort. Return null to let callers continue.
    return null;
  }
};

module.exports = { uploadToCloudinary, deleteFromCloudinary };
