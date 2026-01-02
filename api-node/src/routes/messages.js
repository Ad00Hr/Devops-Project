const express = require('express');
const router = express.Router();

// stockage en mémoire (temporaire)
const messages = [];

// GET /messages
router.get('/', (req, res) => {
  res.json(messages);
});

// POST /messages
router.post('/', (req, res) => {
  const { user, text } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Message vide' });
  }

  messages.push({
    user: user || 'Anonymous',
    text,
    createdAt: new Date(),
  });

  res.status(201).json({ success: true });
});

module.exports = router;
