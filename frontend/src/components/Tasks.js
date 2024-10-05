import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Tasks = () => {
    const [tasks, setTasks] = useState([]);
    const [filter, setFilter] = useState('');
  
    useEffect(() => {
        const fetchTasks = async () => {
          const response = await axios.get(`http://localhost:5000/api/tasks`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            params: { status: filter },
          });
          setTasks(response.data);
        };
    
        fetchTasks();
      }, [filter]);

  const updateTaskStatus = async (taskId, status) => {
    await axios.put(`http://localhost:5000/api/tasks/${taskId}/status`, { status }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });

    setTasks(tasks.map(task => task._id === taskId ? { ...task, status } : task));
  };
  const isDueSoon = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const timeDiff = due.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysDiff <= 2 && daysDiff >= 0;  // Task in scadenza entro 2 giorni
  };
  return (
    <div>
      <h2>I miei task</h2>

      {/* Filtro per stato del task */}
      <select value={filter} onChange={(e) => setFilter(e.target.value)}>
        <option value="">Tutti</option>
        <option value="Da fare">Da fare</option>
        <option value="In corso">In corso</option>
        <option value="Completato">Completato</option>
      </select>

      <ul>
        {tasks.map(task => (
          <li key={task._id}>
            {task.title} - {task.status} - Priorità: {task.priority}
            {isDueSoon(task.dueDate) && <span style={{ color: 'red' }}> In scadenza!</span>}
            {task.status !== 'Completato' && (
              <button onClick={() => updateTaskStatus(task._id, 'Completato')}>Completa</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};
export default Tasks;