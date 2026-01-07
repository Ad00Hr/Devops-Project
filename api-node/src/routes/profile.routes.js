const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/profile.controller");
const auth = require("../middlewares/authMiddleware");

// Toutes ces routes sont protégées par le middleware d'authentification
router.get("/me/profile", auth, ctrl.getMyProfile);
router.put("/me/profile", auth, ctrl.updateMyProfile);
router.get("/me/activity", auth, ctrl.getMyActivity);
router.get("/me/stats", auth, ctrl.getMyStats);
router.patch("/me/preferences", auth, ctrl.updatePreferences);





module.exports = router;


