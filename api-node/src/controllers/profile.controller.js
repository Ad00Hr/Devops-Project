const { openDb } = require("../db");

exports.getMyProfile = async (req, res) => {
    try {
        const db = await openDb();
        // req.userId est injecté par le middleware authMiddleware
        const user = await db.get("SELECT id, username, email, bio, avatar_url, display_name, theme FROM users WHERE id = ?", [req.userId]);
        await db.close();
        res.json(user || {});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateMyProfile = async (req, res) => {
    try {
        const { display_name, bio, avatar_url } = req.body;
        const db = await openDb();
        await db.run("UPDATE users SET display_name = ?, bio = ?, avatar_url = ? WHERE id = ?", 
            [display_name, bio, avatar_url, req.userId]);
        await db.close();
        res.json({ message: "Profil mis à jour" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getMyStats = async (req, res) => {
    try {
        const db = await openDb();
        const chatCount = await db.get("SELECT COUNT(*) as count FROM chat_messages WHERE user_id = ?", [req.userId]);
        await db.close();
        res.json({
            tasks_completed: 0,
            polls_voted: 0,
            messages_sent: chatCount ? chatCount.count : 0
        });
    } catch (err) {
        res.json({ tasks_completed: 0, polls_voted: 0, messages_sent: 0 });
    }
};

exports.getMyActivity = async (req, res) => {
    // Renvoie une activité factice en attendant la liaison avec les autres teams
    res.json([
        { type: "info", description: "Bienvenue sur votre profil", created_at: new Date() }
    ]);
};

exports.updatePreferences = async (req, res) => {
    try {
        const { theme } = req.body;
        const db = await openDb();
        await db.run("UPDATE users SET theme = ? WHERE id = ?", [theme, req.userId]);
        await db.close();
        res.json({ theme });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};