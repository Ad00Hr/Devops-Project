const { openDb } = require("../db");

/**
 * GET /api/chat/messages
 */
exports.getMessages = async (req, res) => {
  try {
    const db = await openDb();
    const messages = await db.all(`
      SELECT 
        chat_messages.id,
        chat_messages.content,
        chat_messages.created_at,
        users.id AS user_id,
        users.username
      FROM chat_messages
      JOIN users ON users.id = chat_messages.user_id
      ORDER BY chat_messages.created_at ASC
    `);
    await db.close();
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

/**
 * POST /api/chat/messages
 */
exports.sendMessage = async (req, res) => {
  try {
    const { username, content } = req.body;
    if (!username || !content) {
      return res.status(400).json({ message: "Données manquantes" });
    }

    const db = await openDb();

    // récupérer user_id depuis username
    const user = await db.get(
      "SELECT id FROM users WHERE username = ?",
      [username]
    );

    if (!user) {
      await db.close();
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    await db.run(
      "INSERT INTO chat_messages (user_id, content) VALUES (?, ?)",
      [user.id, content]
    );

    await db.close();
    res.status(201).json({ message: "Message envoyé" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

/**
 * DELETE /api/chat/messages/:id
 */
exports.deleteMessage = async (req, res) => {
  try {
    const db = await openDb();
    await db.run("DELETE FROM chat_messages WHERE id = ?", [
      req.params.id,
    ]);
    await db.close();
    res.json({ message: "Message supprimé" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
