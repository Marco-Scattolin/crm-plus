import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState({
    status: '',
    priority: '',
    dueDateBefore: '',
    dueDateAfter: '',
  });

  useEffect(() => {
    const fetchTasks = async () => {
      const response = await axios.get('http://localhost:5000/api/tasks', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        params: filter,
      });
      setTasks(response.data);
    };

    fetchTasks();
  }, [filter]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter({ ...filter, [name]: value });
  };

  return (
    <div>
      <h2>Task</h2>

      {/* Filtri */}
      <div>
        <select name="status" value={filter.status} onChange={handleFilterChange}>
          <option value="">Tutti</option>
          <option value="Da fare">Da fare</option>
          <option value="In corso">In corso</option>
          <option value="Completato">Completato</option>
        </select>

        <select name="priority" value={filter.priority} onChange={handleFilterChange}>
          <option value="">Tutte le priorità</option>
          <option value="Alta">Alta</option>
          <option value="Media">Media</option>
          <option value="Bassa">Bassa</option>
        </select>

        <input
          type="date"
          name="dueDateAfter"
          value={filter.dueDateAfter}
          onChange={handleFilterChange}
          placeholder="Dopo"
        />

        <input
          type="date"
          name="dueDateBefore"
          value={filter.dueDateBefore}
          onChange={handleFilterChange}
          placeholder="Prima"
        />
      </div>

      {/* Lista Task */}
      <ul>
        {tasks.map(task => (
          <li key={task._id}>
            {task.title} - {task.priority} - {task.status}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Tasks;
