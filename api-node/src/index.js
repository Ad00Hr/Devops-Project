require('dotenv').config();
const express = require('express');

const app = express();

// Middleware global
app.use(express.json());

// Routes auth
const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

// Healthcheck
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Lancer le serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
