const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const Task = require('../models/Task');
const authenticateJWT = require('../middleware/authenticateJWT'); // Middleware per autenticazione

// Aggiungi un commento a un task
router.post('/:taskId', authenticateJWT, async (req, res) => {
  const { content } = req.body;
  const { taskId } = req.params;

  try {
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task non trovato' });
    }

    const comment = new Comment({
      content,
      taskId,
      author: req.user.id,
    });

    await comment.save();

    res.json({ message: 'Commento aggiunto con successo', comment });
  } catch (err) {
    res.status(500).json({ message: 'Errore nel server', error: err.message });
  }
});

// Ottieni tutti i commenti per un task
router.get('/:taskId', authenticateJWT, async (req, res) => {
  const { taskId } = req.params;

  try {
    const comments = await Comment.find({ taskId }).populate('author', 'username');
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: 'Errore nel server', error: err.message });
  }
});

module.exports = router;
