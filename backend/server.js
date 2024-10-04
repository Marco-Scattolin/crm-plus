const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

//Importare e configurare
require('dotenv').config();

// Inizializzazione dell'app Express
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connessione a MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connesso a MongoDB'))
.catch((err) => console.error('Errore connessione MongoDB:', err));

// Modello Utente (esempio base)
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' }, // Default: user, può essere admin o altri
});

const User = mongoose.model('User', UserSchema);

// Funzione per generare JWT
const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// Rotta di registrazione (signup)
app.post('/api/signup', async (req, res) => {
  const { username, password, role } = req.body;
  
  try {
    // Controlla se l'utente esiste già
    let user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ message: 'Utente già esistente' });
    }

    // Crea nuovo utente
    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({
      username,
      password: hashedPassword,
      role,
    });

    await user.save();
    const token = generateToken(user);
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Errore nel server' });
  }
});

// Rotta di login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Utente non trovato' });
    }

    // Controllo password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Password non corretta' });
    }

    // Genera token JWT
    const token = generateToken(user);
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Errore nel server' });
  }
});

// Middleware di autenticazione per proteggere le rotte
const authenticateJWT = (req, res, next) => {
  const token = req.headers.authorization;

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ message: 'Token non valido' });
      }
      req.user = user;
      next();
    });
  } else {
    res.status(401).json({ message: 'Token mancante' });
  }
};

// Rotta protetta
app.get('/api/dashboard', authenticateJWT, (req, res) => {
  res.json({ message: `Benvenuto ${req.user.role}, hai accesso alla dashboard.` });
});

// Avvio del server
app.listen(PORT, () => {
  console.log(`Server avviato sulla porta ${PORT}`);
});
