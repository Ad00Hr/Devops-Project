// src/controllers/chat.controller.js

// GET /api/chat/messages
exports.getMessages = async (req, res) => {
  try {
    const db = await require('../db').openDb();

    const messages = await db.all(
      'SELECT * FROM chat_messages ORDER BY created_at ASC'
    );

    await db.close();
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// POST /api/chat/messages
exports.sendMessage = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ message: 'Message vide' });
    }

    const db = await require('../db').openDb();

    await db.run(
      'INSERT INTO chat_messages (user_id, content) VALUES (?, ?)',
      [1, content]
    );

    await db.close();
    res.status(201).json({ message: 'Message envoyé' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// DELETE /api/chat/messages/:id
exports.deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;

    const db = await require('../db').openDb();

    await db.run(
      'DELETE FROM chat_messages WHERE id = ?',
      [id]
    );

    await db.close();
    res.json({ message: 'Message supprimé' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
