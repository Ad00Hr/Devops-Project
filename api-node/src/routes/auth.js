const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const { loginLimiter } = require('../middlewares/rateLimiter');

router.post('/register', authController.register);
router.post('/login', loginLimiter, authController.login);
router.get('/me', authMiddleware, authController.me);
router.put('/change-password', authMiddleware, authController.changePassword);
router.post('/verify-token', authController.verifyToken);


module.exports = router;
