require("dotenv").config();
const express = require("express");

const app = express();

// Middleware global
app.use(express.json());

// Routes auth (déjà existantes)
app.use("/auth", require("./routes/auth"));

// Routes chat
const chatRoutes = require("./routes/chat.routes");
app.use("/api/chat", chatRoutes);

// Healthcheck
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Lancer le serveur
if (process.env.NODE_ENV !== "test") {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () =>
    console.log(`Auth API running on port ${PORT}`)
  );
}

module.exports = app;
