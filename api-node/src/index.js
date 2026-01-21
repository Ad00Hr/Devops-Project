require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();


app.use(cors());
app.use(express.json());

// Routes Team 1 (Auth)
app.use("/auth", require("./routes/auth"));

// Routes Team 6 (Profil) - On utilise le préfixe demandé par votre frontend
app.use("/api/users", require("./routes/profile.routes"));

// Routes Team 3 (Chat)
app.use("/api/chat", require("./routes/chat.routes"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Serveur actif sur le port ${PORT}`));