require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
// Middleware global
app.use(express.json());

// Routes auth
app.use('/auth', require('./routes/auth'));

// --- VOTRE AJOUT : Routes notifications ---
// On utilise le préfixe '/api/notifications' pour que vos routes 
// soient accessibles sur http://localhost:3000/api/notifications
app.use('/api/notifications', require('./routes/notificationRoutes'));

// Healthcheck
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Lancer le serveur
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Auth API is running on port ${PORT}`));
}

module.exports = app;