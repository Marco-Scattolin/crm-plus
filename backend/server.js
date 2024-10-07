const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const loginRoutes = require('./auth/login');
const taskRoutes = require('./routes/tasks');
const commentRoutes = require('./routes/comments');
const User = require('./models/User'); 

//Importare e configurare
require('dotenv').config();
require('./cron/checkTaskDueDates');

// Inizializzazione dell'app Express
const app = express();  // Spostato qui in alto
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Usa le rotte di autenticazione
app.use('/api/auth', loginRoutes); // DEVE essere dopo l'inizializzazione di `app`

// Connessione al database
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connesso a MongoDB'))
  .catch((err) => console.error('Errore connessione MongoDB:', err
    
  ))

.then(() => console.log('Connesso a MongoDB'))
.catch((err) => console.error('Errore connessione MongoDB:', err));

// Rotte
app.use('/api/tasks', taskRoutes);

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
app.post('/api/auth/login', async (req, res) => {
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

// Middleware di autenticazione
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

// Rotta per ottenere tutti gli utenti (solo per admin)
app.get('/api/users', authenticateJWT, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Accesso negato' });
  }

  try {
    const users = await User.find({}, 'username role'); // Ottieni solo username e ruolo
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Errore nel server' });
  }
});

// Rotta per modificare il ruolo di un utente (solo per admin)
app.put('/api/users/:id/role', authenticateJWT, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Accesso negato' });
  }

  const { role } = req.body;

  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Utente non trovato' });
    }

    user.role = role;
    await user.save();

    res.json({ message: 'Ruolo aggiornato con successo' });
  } catch (err) {
    res.status(500).json({ message: 'Errore nel server' });
  }
});

// Rotta per eliminare un utente (solo per admin)
app.delete('/api/users/:id', authenticateJWT, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Accesso negato' });
  }

  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Utente eliminato con successo' });
  } catch (err) {
    res.status(500).json({ message: 'Errore nel server' });
  }
});

// Rotte per i commenti
app.use('/api/comments', commentRoutes);

// Avvio del server
app.listen(PORT, () => {
  console.log(`Server avviato sulla porta ${PORT}`);
});
