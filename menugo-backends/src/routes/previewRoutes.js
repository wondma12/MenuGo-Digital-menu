const express = require('express');
const axios = require('axios');
const { logger } = require('../utils/logger');
const { URL } = require('url');

const router = express.Router();
// Cloudinary helper (optional)
let cloudinary = null;
try {
  cloudinary = require('../config/cloudinary');
} catch (e) {
  // cloudinary config optional
  cloudinary = null;
}

// Hosts allowed to be proxied for preview. Comma-separated in env or defaults to Cloudinary.
const ALLOWED_HOSTS = (process.env.PREVIEW_ALLOWED_HOSTS || 'res.cloudinary.com').split(',').map((v) => v.trim().toLowerCase()).filter(Boolean);
const PREVIEW_TIMEOUT_MS = parseInt(process.env.PREVIEW_FETCH_TIMEOUT_MS || '20000', 10);

function isHostAllowed(targetUrl) {
  try {
    const u = new URL(targetUrl);
    const hostname = u.hostname.toLowerCase();
    return ALLOWED_HOSTS.some((allowed) => hostname === allowed || hostname.endsWith(`.${allowed}`));
  } catch (e) {
    return false;
  }
}

// GET /api/preview?url=<encodedUrl>
// HEAD also supported for a lightweight availability check.
router.all('/', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ success: false, message: 'Missing url query parameter' });

  if (!isHostAllowed(url)) {
    logger.warn('Preview request blocked for disallowed host', { url, ip: req.ip });
    return res.status(403).json({ success: false, message: 'Preview host not permitted' });
  }

  try {
    const axiosConfig = {
      url,
      method: req.method === 'HEAD' ? 'HEAD' : 'GET',
      responseType: req.method === 'HEAD' ? 'json' : 'stream',
      timeout: PREVIEW_TIMEOUT_MS,
      maxContentLength: 50 * 1024 * 1024, // 50MB
      validateStatus: (s) => s >= 200 && s < 400,
      headers: {
        // Identify our proxy to remote servers in a minimal way
        'User-Agent': `MenuGo-Preview-Proxy/1.0 (+https://menugo.example)`,
        Accept: '*/*',
      },
    };

    const upstream = await axios.request(axiosConfig);

    // For HEAD we only return headers to the caller so the frontend can decide
    if (req.method === 'HEAD') {
      const ct = upstream.headers['content-type'] || 'application/octet-stream';
      res.set('Content-Type', ct);
      if (upstream.headers['content-length']) res.set('Content-Length', upstream.headers['content-length']);
      return res.status(200).end();
    }

    // Stream GET response through to the client. Do NOT forward X-Frame-Options
    const contentType = upstream.headers['content-type'] || 'application/octet-stream';
    res.set('Content-Type', contentType);
    // Allow frontend embedding since we serve same-origin
    res.removeHeader('X-Frame-Options');
    // Security: prevent sniffing
    res.set('X-Content-Type-Options', 'nosniff');
    // Cache for a short period (adjustable via env)
    const cacheMaxAge = parseInt(process.env.PREVIEW_CACHE_SECONDS || '60', 10);
    res.set('Cache-Control', `public, max-age=${cacheMaxAge}`);

    upstream.data.pipe(res);
    upstream.data.on('error', (err) => {
      logger.warn('Error streaming preview upstream', { err: err && err.message });
      try { res.end(); } catch (e) { /* ignore */ }
    });
  } catch (err) {
    logger.warn('Preview proxy fetch failed', { url, err: err && err.message });

    // If Cloudinary returned 401 and we have cloudinary configured, try admin API lookup
    const status = err && err.response && err.response.status;
    if (status === 401 && cloudinary && process.env.CLOUDINARY_CLOUD_NAME) {
      try {
        // Heuristic: parse public_id from Cloudinary URL
        const parsePublicId = (u) => {
          try {
            const idx = u.indexOf('/upload/');
            if (idx === -1) return null;
            let after = u.substring(idx + '/upload/'.length);
            // drop leading version v12345/
            const parts = after.split('/');
            if (parts.length === 0) return null;
            if (/^v\d+$/.test(parts[0])) parts.shift();
            // remove transformation segments (heuristic: contain ':' or ',' or start with 'f_' or include 'q_')
            while (parts.length && (parts[0].includes(':') || parts[0].includes(',') || parts[0].startsWith('f_') || parts[0].includes('q_'))) {
              parts.shift();
            }
            if (parts.length === 0) return null;
            const last = parts.join('/');
            return last.replace(/\.[^/.]+$/, '');
          } catch (e) { return null; }
        };

        const publicId = parsePublicId(url);
        if (!publicId) throw new Error('Could not parse Cloudinary public_id');

        // Attempt to fetch resource metadata via Cloudinary API (resource_type raw or image)
        const cld = require('cloudinary').v2;
        const tryTypes = ['raw', 'image', 'video'];
        let resource = null;
        for (const t of tryTypes) {
          try {
            // eslint-disable-next-line no-await-in-loop
            resource = await cld.api.resource(publicId, { resource_type: t });
            if (resource && (resource.secure_url || resource.url)) break;
          } catch (e) {
            // continue to next type
          }
        }

        if (resource && (resource.secure_url || resource.url)) {
          const fetchUrl = resource.secure_url || resource.url;
          logger.info('Cloudinary admin API provided fallback URL for preview', { publicId, fetchUrl });
          try {
            // Try direct fetch of the resource
            const upstream2 = await axios.request({ url: fetchUrl, method: 'GET', responseType: 'stream', timeout: PREVIEW_TIMEOUT_MS });
            const contentType = upstream2.headers['content-type'] || 'application/octet-stream';
            res.set('Content-Type', contentType);
            res.set('X-Content-Type-Options', 'nosniff');
            const cacheMaxAge = parseInt(process.env.PREVIEW_CACHE_SECONDS || '60', 10);
            res.set('Cache-Control', `public, max-age=${cacheMaxAge}`);
            return upstream2.data.pipe(res);
          } catch (fetchErr) {
            logger.warn('Cloudinary direct fetch of resource failed', { publicId, err: fetchErr && fetchErr.message });
            // If fetching the secure URL returns 401, attempt to generate a signed private download URL
            try {
              const cld = require('cloudinary').v2;
              // Determine resource type from Cloudinary response if available
              const rtype = resource.resource_type || 'raw';
              // Generate a signed private download URL (expires shortly)
              const signed = cld.utils && typeof cld.utils.private_download_url === 'function'
                ? cld.utils.private_download_url(publicId, { resource_type: rtype })
                : null;
              if (signed) {
                // If we can generate a signed Cloudinary download URL, redirect the client
                // to it so the browser can handle authentication and download directly.
                try {
                  return res.redirect(302, signed);
                } catch (redirectErr) {
                  logger.warn('Failed to redirect to Cloudinary signed URL', { publicId, err: redirectErr && redirectErr.message });
                }
              }
              // Try alternate signed URL variants (authenticated type, with expires)
              try {
                const cld2 = require('cloudinary').v2;
                const expires = Math.floor(Date.now() / 1000) + 300; // 5 minutes
                const altVariants = [
                  { resource_type: rtype, type: 'authenticated', expires },
                  { resource_type: rtype, type: 'authenticated', expires, attachment: false },
                ];
                for (const opts of altVariants) {
                  try {
                    const s = cld2.utils.private_download_url(publicId, opts);
                    // Redirect client to the signed URL so the browser can download/embed it
                    return res.redirect(302, s);
                  } catch (eVariant) {
                    logger.warn('Cloudinary signed variant generation failed', { publicId, opts, err: eVariant && eVariant.message });
                    // try next
                  }
                }
              } catch (eVarAll) {
                logger.warn('Cloudinary signed URL alternate variants failed', { publicId, err: eVarAll && eVarAll.message });
              }
            } catch (signedErr) {
              logger.warn('Cloudinary signed URL fetch failed', { publicId, err: signedErr && signedErr.message });
            }
          }
        }
      } catch (e) {
        logger.warn('Cloudinary admin fallback failed for preview', { url, err: e && e.message });
      }
    }

    // Forward a friendly JSON error so frontend can fallback gracefully
    if (!res.headersSent) {
      return res.status(502).json({ success: false, message: 'Failed to fetch preview resource' });
    }
  }
});

module.exports = router;
