const { openDb } = require("../db");

/**
 * GET /api/users/:id/profile
 */
exports.getUserProfile = async (req, res) => {
    try {
        const db = await openDb();
        const user = await db.get(
            "SELECT id, username, email, bio, avatar_url, display_name, theme FROM users WHERE id = ?",
            [req.params.id]
        );
        await db.close();

        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * ✅ GET /api/users/me/profile  ← MISSING FUNCTION (FIX)
 */
exports.getUserProfileMe = async (req, res) => {
    try {
        const db = await openDb();
        const user = await db.get(
            "SELECT id, username, email, bio, avatar_url, display_name, theme FROM users WHERE id = ?",
            [req.userId]
        );
        await db.close();

        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * PUT /api/users/me/profile
 */
exports.updateMyProfile = async (req, res) => {
    try {
        const { display_name, bio, avatar_url } = req.body;
        const db = await openDb();

        await db.run(
            "UPDATE users SET display_name = ?, bio = ?, avatar_url = ? WHERE id = ?",
            [display_name, bio, avatar_url, req.userId]
        );

        await db.close();
        res.json({ message: "Profil mis à jour avec succès" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * GET /api/users/me/activity
 */
exports.getMyActivity = async (req, res) => {
    try {
        const db = await openDb();
        const activities = await db.all(
            `SELECT id, content AS description, created_at,
                    'chat_message' AS type
             FROM chat_messages
             WHERE user_id = ?
             ORDER BY created_at DESC
             LIMIT 10`,
            [req.userId]
        );
        await db.close();

        res.json(activities);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * GET /api/users/me/stats
 */
exports.getMyStats = async (req, res) => {
    try {
        const db = await openDb();
        const msgCount = await db.get(
            "SELECT COUNT(*) AS count FROM chat_messages WHERE user_id = ?",
            [req.userId]
        );
        await db.close();

        res.json({
            tasks_completed: 0,
            polls_voted: 0,
            total_messages: msgCount.count
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * PATCH /api/users/me/preferences
 */
exports.updatePreferences = async (req, res) => {
    try {
        const { theme, timezone } = req.body;
        const db = await openDb();

        await db.run(
            "UPDATE users SET theme = COALESCE(?, theme), timezone = COALESCE(?, timezone) WHERE id = ?",
            [theme, timezone, req.userId]
        );

        await db.close();
        res.json({ theme, timezone, message: "Préférences mises à jour" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * GET /api/users
 */
exports.getUsers = async (req, res) => {
    try {
        const db = await openDb();
        const users = await db.all(
            "SELECT id, username, display_name, avatar_url, email FROM users"
        );
        await db.close();

        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
