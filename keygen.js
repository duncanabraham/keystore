const crypto = require('crypto');

// Generate a 256-bit (32-byte) random key
const secretKey = crypto.randomBytes(32);
console.log('Secret Key:', secretKey.toString('hex'));

// Generate a 128-bit (16-byte) random IV
const iv = crypto.randomBytes(16);
console.log('IV:', iv.toString('hex'));