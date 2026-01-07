const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/profile.controller");
const auth = require("../middlewares/authMiddleware");

// Route publique pour lister les users
router.get("/", auth, ctrl.getUsers);

// Routes "Me" (Utilisateur connecté)
router.get("/me/profile", auth, ctrl.getUserProfileMe); // Voir note ci-dessous
router.put("/me/profile", auth, ctrl.updateMyProfile);
router.get("/me/activity", auth, ctrl.getMyActivity);
router.get("/me/stats", auth, ctrl.getMyStats);
router.patch("/me/preferences", auth, ctrl.updatePreferences);

// Route spécifique
router.get("/:id/profile", auth, ctrl.getUserProfile);

module.exports = router;


