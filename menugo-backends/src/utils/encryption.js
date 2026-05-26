const crypto = require('crypto');

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;

// Encrypt text
const encrypt = (text, secretKey) => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(secretKey, 'hex'), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
};

// Decrypt text
const decrypt = (text, secretKey) => {
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift(), 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(secretKey, 'hex'), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
};

// Hash data with SHA256
const sha256 = (data) => {
  return crypto.createHash('sha256').update(data).digest('hex');
};

// Generate random key
const generateRandomKey = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

// Generate secure random token
const generateSecureToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

// Compare two strings securely (timing safe)
const secureCompare = (a, b) => {
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
};

// Mask sensitive data
const maskData = (data, visibleChars = 4, maskChar = '*') => {
  if (!data) return '';
  const str = String(data);
  if (str.length <= visibleChars) return maskChar.repeat(str.length);
  const visible = str.slice(-visibleChars);
  const masked = maskChar.repeat(str.length - visibleChars);
  return masked + visible;
};

// Mask email
const maskEmail = (email) => {
  if (!email) return '';
  const [local, domain] = email.split('@');
  if (local.length <= 2) return `***@${domain}`;
  const maskedLocal = local[0] + '*'.repeat(local.length - 2) + local[local.length - 1];
  return `${maskedLocal}@${domain}`;
};

// Mask phone number
const maskPhone = (phone) => {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length <= 4) return '*'.repeat(cleaned.length);
  const visible = cleaned.slice(-4);
  const masked = '*'.repeat(cleaned.length - 4);
  return masked + visible;
};

module.exports = {
  encrypt,
  decrypt,
  sha256,
  generateRandomKey,
  generateSecureToken,
  secureCompare,
  maskData,
  maskEmail,
  maskPhone,
};