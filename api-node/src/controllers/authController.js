const { createUser, findByEmailOrUsername, findById } = require('../models/userModel');
const { hashPassword, comparePassword } = require('../utils/password');
const { validateRegister } = require('../utils/validators');
const { generateToken } = require('../utils/jwt');

exports.register = async (req, res) => {
  try {
    const error = validateRegister(req.body);
    if (error) {
      return res.status(400).json({ message: error });
    }

    const { username, email, password } = req.body;

    const existingUser = await findByEmailOrUsername(email);
    if (existingUser) {
      return res.status(409).json({ message: 'Utilisateur déjà existant' });
    }

    const hashedPassword = await hashPassword(password);
    await createUser(username, email, hashedPassword);

    res.status(201).json({ message: 'Compte créé avec succès' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    const user = await findByEmailOrUsername(identifier);
    if (!user) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }

    const token = generateToken(user.id);
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.me = async (req, res) => {
  try {
    const user = await findById(req.userId);
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
