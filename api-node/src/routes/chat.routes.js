const express = require('express');
const router = express.Router();

const chatController = require('../controllers/chat.controller');

// GET messages
router.get('/messages', chatController.getMessages);

// POST message
router.post('/messages', chatController.sendMessage);

// DELETE message
router.delete('/messages/:id', chatController.deleteMessage);

module.exports = router;
