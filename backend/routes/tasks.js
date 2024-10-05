const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const { sendTaskNotification } = require('../utils/mailer');  // Importa la funzione per l'email
const User = require('../models/User');  // Modello per gli utenti
const authenticateJWT = require('../middleware/authenticateJWT'); // Middleware per autenticazione

// Crea un nuovo task (solo per admin)
router.post('/', authenticateJWT, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Accesso negato' });
  }

  const { title, description, assignedTo, dueDate } = req.body;

  try {
    // Crea il task
    const task = new Task({
      title,
      description,
      assignedTo,
      dueDate,
    });

    await task.save();

    // Trova l'email dell'utente assegnato
    const assignedUser = await User.findById(assignedTo);

    if (assignedUser) {
      // Invia una notifica via email all'utente
      sendTaskNotification(
        assignedUser.email,
        'Nuovo task assegnato',
        `Ti è stato assegnato un nuovo task: "${title}".`
      );
    }

    res.json({ message: 'Task creato con successo' });
  } catch (err) {
    res.status(500).json({ message: 'Errore nel server' });
  }
});

// Ottieni i task dell'utente autenticato
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user.id });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Errore nel server' });
  }
});

// Aggiorna lo stato di un task
router.put('/:id/status', authenticateJWT, async (req, res) => {
  const { status } = req.body;

  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task non trovato' });
    }

    if (task.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Accesso negato' });
    }

    task.status = status;
    await task.save();

    res.json({ message: 'Stato del task aggiornato' });
  } catch (err) {
    res.status(500).json({ message: 'Errore nel server' });
  }
});

// Ottieni i task dell'utente autenticato con filtri opzionali per stato
router.get('/', authenticateJWT, async (req, res) => {
  const { status } = req.query;

  let filter = { assignedTo: req.user.id };
  if (status) {
    filter.status = status;
  }

  try {
    const tasks = await Task.find(filter);
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Errore nel server' });
  }
});

module.exports = router;
