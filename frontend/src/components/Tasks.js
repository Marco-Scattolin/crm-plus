import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchTasks = async () => {
      const response = await axios.get('http://localhost:5000/api/tasks', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setTasks(response.data);
    };

    fetchTasks();
  }, []);

  const updateTaskStatus = async (taskId, status) => {
    await axios.put(`http://localhost:5000/api/tasks/${taskId}/status`, { status }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });

    setTasks(tasks.map(task => task._id === taskId ? { ...task, status } : task));
  };

  return (
    <div>
      <h2>I miei task</h2>
      <ul>
        {tasks.map(task => (
          <li key={task._id}>
            {task.title} - {task.status}
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
