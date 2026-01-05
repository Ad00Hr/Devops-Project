const { openDb } = require('../db');

async function migrateNotifications() {
    let db;
    try {
        db = await openDb();
        console.log('Connexion à la base de données pour les notifications...');

        await db.exec(`
            CREATE TABLE IF NOT EXISTS notifications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                type TEXT NOT NULL,
                message TEXT NOT NULL,
                is_read INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
            );
        `);

        console.log('Table "notifications" prête !');
    } catch (error) {
        console.error('Erreur lors de la migration des notifications :', error);
    } finally {
        if (db) {
            await db.close();
            console.log('Connexion fermée.');
        }
    }
}

migrateNotifications();