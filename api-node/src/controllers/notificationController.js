const { 
    getNotifications, 
    countUnread, 
    markAsRead, 
    markAllAsRead, 
    createNotification 
} = require('../models/notificationModel');

/**
 * GET /api/notifications
 * Liste des notifications (paginée)
 */
exports.getNotifications = async (req, res) => {
  try {
    // Utilisation de req.userId pour la cohérence avec authMiddleware.js
    const userId = req.userId; 
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    const notifications = await getNotifications(userId, limit, offset);
    res.json(notifications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

/**
 * GET /api/notifications/unread-count
 * Nombre de notifications non lues
 */
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await countUnread(req.userId);
    res.json({ unreadCount: count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

/**
 * PATCH /api/notifications/:id/read
 * Marquer une notification spécifique comme lue
 */
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const success = await markAsRead(id, req.userId);

    if (!success) {
      return res.status(404).json({ message: 'Notification non trouvée' });
    }

    res.json({ message: 'Notification marquée comme lue' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

/**
 * PATCH /api/notifications/read-all
 * Tout marquer comme lu
 */
exports.markAllAsRead = async (req, res) => {
  try {
    await markAllAsRead(req.userId);
    res.json({ message: 'Toutes les notifications marquées comme lues' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

/**
 * POST /api/notifications
 * Créer une notification (Usage interne)
 */
exports.createNotification = async (req, res) => {
  try {
    const { recipient_id, type, message } = req.body;

    if (!recipient_id || !type || !message) {
      return res.status(400).json({ message: 'Données manquantes (recipient_id, type, message)' });
    }

    const notificationId = await createNotification(recipient_id, type, message);
    res.status(201).json({ 
      message: 'Notification créée avec succès', 
      notificationId 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};