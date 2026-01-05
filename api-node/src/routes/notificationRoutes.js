const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

// On importe le middleware de l'équipe Auth (vu dans tes fichiers)
const authMiddleware = require('../middlewares/authMiddleware');

/**
 * ROUTES DES NOTIFICATIONS
 * Préfixe dans index.js : /api/notifications
 */

// 1. Liste des notifications (Paginée : ?limit=10&offset=0)
router.get('/', authMiddleware, notificationController.getNotifications);

// 2. Nombre de notifications non lues (pour le badge)
router.get('/unread-count', authMiddleware, notificationController.getUnreadCount);

// 3. Marquer TOUTES les notifications comme lues
router.patch('/read-all', authMiddleware, notificationController.markAllAsRead);

// 4. Marquer une notification spécifique comme lue
router.patch('/:id/read', authMiddleware, notificationController.markAsRead);

// 5. Créer une notification (Usage interne pour les autres équipes)
// On ne met pas d'authMiddleware ici pour faciliter l'appel par d'autres services
router.post('/', notificationController.createNotification);

module.exports = router;