const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // max 5 requêtes
  message: { message: 'Trop de tentatives, réessayer plus tard' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { loginLimiter };
