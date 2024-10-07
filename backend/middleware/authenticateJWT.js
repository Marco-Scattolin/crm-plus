const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'supersegreto123';

const authenticateJWT = (req, res, next) => {
  const token = req.header('Authorization') && req.header('Authorization').split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Accesso negato. Nessun token fornito.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;  // Aggiunge l'utente decodificato alla richiesta
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Token non valido' });
  }
};

module.exports = authenticateJWT;
