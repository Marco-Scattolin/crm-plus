const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');  // Assicurati di avere il modello User
const router = express.Router();

// Rotta di login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Cerca l'utente nel database
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Utente non trovato' });
    }

    // Verifica la password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Password errata' });
    }

    // Genera un token JWT
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Restituisce il token e le informazioni dell'utente
    res.json({ token, user: { id: user._id, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Errore del server' });
  }
});

module.exports = router;
