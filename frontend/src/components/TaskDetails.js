import React, { useState } from 'react';
import axios from 'axios';
import Comments from './Comments';  // Importa i commenti

const TaskDetails = ({ task }) => {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: task.title,
    description: task.description,
    dueDate: task.dueDate.slice(0, 10),  // Assicura che la data sia nel formato corretto per l'input
    priority: task.priority,
  });

  // Gestione degli input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Funzione per aggiornare il task
  const updateTask = async () => {
    try {
      const response = await axios.put(`http://localhost:5001/api/tasks/${task._id}`, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      console.log('Task aggiornato:', response.data);
      setEditing(false);
    } catch (err) {
      console.error('Errore durante l\'aggiornamento del task:', err);
    }
  };

  return (
    <div>
      {editing ? (
        <div>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
          />
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
          />
          <input
            type="date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleInputChange}
          />
          <select name="priority" value={formData.priority} onChange={handleInputChange}>
            <option value="Alta">Alta</option>
            <option value="Media">Media</option>
            <option value="Bassa">Bassa</option>
          </select>
          <button onClick={updateTask}>Salva</button>
          <button onClick={() => setEditing(false)}>Annulla</button>
        </div>
      ) : (
        <div>
          <h2>{task.title}</h2>
          <p>{task.description}</p>
          <p>Scadenza: {new Date(task.dueDate).toLocaleDateString()}</p>
          <p>Priorità: {task.priority}</p>
          <button onClick={() => setEditing(true)}>Modifica</button>
        </div>
      )}

      {/* Integrazione dei commenti */}
      <Comments taskId={task._id} />
    </div>
  );
};

export default TaskDetails;

