const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const { sendTaskNotification } = require('../utils/mailer');
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
// Modifica un task esistente (solo per admin o assegnatario)
router.put('/:id', authenticateJWT, async (req, res) => {
    const { title, description, dueDate, assignedTo, priority } = req.body;
  
    try {
      const task = await Task.findById(req.params.id);
      if (!task) {
        return res.status(404).json({ message: 'Task non trovato' });
      }
  
      // Controlla se l'utente è l'admin o l'assegnatario
      if (req.user.role !== 'admin' && task.assignedTo.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Accesso negato' });
      }
  
      // Aggiorna i campi del task
      if (title) task.title = title;
      if (description) task.description = description;
      if (dueDate) task.dueDate = dueDate;
      if (assignedTo) task.assignedTo = assignedTo;
      if (priority) task.priority = priority;
  
      await task.save();
      res.json({ message: 'Task aggiornato con successo', task });
    } catch (err) {
      res.status(500).json({ message: 'Errore nel server' });
    }
  });
// Ottieni i task dell'utente autenticato con filtri opzionali per stato, priorità e scadenza
router.get('/', authenticateJWT, async (req, res) => {
    const { status, priority, dueDateBefore, dueDateAfter } = req.query;
  
    let filter = { assignedTo: req.user.id };
  
    if (status) {
      filter.status = status;
    }
    if (priority) {
      filter.priority = priority;
    }
    if (dueDateBefore || dueDateAfter) {
      filter.dueDate = {};
      if (dueDateBefore) {
        filter.dueDate.$lte = new Date(dueDateBefore);
      }
      if (dueDateAfter) {
        filter.dueDate.$gte = new Date(dueDateAfter);
      }
    }
  
    try {
      const tasks = await Task.find(filter);
      res.json(tasks);
    } catch (err) {
      res.status(500).json({ message: 'Errore nel server' });
    }
  });
    
module.exports = router;
