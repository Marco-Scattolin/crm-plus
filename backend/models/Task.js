const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['Da fare', 'In corso', 'Completato'], default: 'Da fare' },
  dueDate: { type: Date },
  priority: { type: String, enum: ['Alta', 'Media', 'Bassa'], default: 'Media' },  
});


module.exports = mongoose.model('Task', TaskSchema);
