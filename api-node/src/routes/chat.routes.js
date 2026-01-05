const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chat.controller");

router.get("/messages", chatController.getMessages);
router.post("/messages", chatController.sendMessage);
router.delete("/messages/:id", chatController.deleteMessage);

module.exports = router;
