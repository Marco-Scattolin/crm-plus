const cron = require('node-cron');
const Task = require('../models/Task');
const User = require('../models/User');
const { sendTaskNotification } = require('../utils/mailer');

// Job eseguito ogni giorno alle 9:00
cron.schedule('0 9 * * *', async () => {
  try {
    // Ottieni i task con scadenza entro 1 giorno
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const tasks = await Task.find({
      dueDate: { $lte: tomorrow, $gte: today },  // Scadenza entro 1 giorno
      status: { $ne: 'Completato' },  // Escludi i task già completati
    });

    for (const task of tasks) {
      const user = await User.findById(task.assignedTo);
      if (user) {
        // Invia notifica via email
        sendTaskNotification(
          user.email,
          'Task in scadenza',
          `Il task "${task.title}" scade il ${task.dueDate.toLocaleDateString()}.`
        );
      }
    }

    console.log('Controllo scadenze completato');
  } catch (err) {
    console.error('Errore nel controllo delle scadenze:', err);
  }
});
