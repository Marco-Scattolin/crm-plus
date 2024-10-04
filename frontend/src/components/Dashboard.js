import React, { useState, useEffect } from 'react';
import jwtDecode from 'jwt-decode';

const Dashboard = () => {
  const [role, setRole] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = jwtDecode(token);
      setRole(decodedToken.role);
    }
  }, []);

  return (
    <div>
      <h1>Benvenuto nella Dashboard</h1>
      {role === 'admin' ? (
        <p>Sei un amministratore.</p>
      ) : (
        <p>Sei un utente.</p>
      )}
    </div>
  );
};

export default Dashboard;
