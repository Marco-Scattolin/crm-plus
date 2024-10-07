import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Tasks from './components/Tasks';
import TaskDetails from './components/TaskDetails';  // Importa TaskDetails
import ProtectedRoute from './components/ProtectedRoute'; 

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Rotta protetta per la lista di task */}
        <Route path="/tasks" element={
          <ProtectedRoute>
            <Tasks />
          </ProtectedRoute>
        } />

        {/* Rotta protetta per i dettagli di un task specifico */}
        <Route path="/task/:id" element={
          <ProtectedRoute>
            <TaskDetails />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
