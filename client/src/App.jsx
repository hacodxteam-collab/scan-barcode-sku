import React, { useState } from 'react';
import ScanScreen from './screens/ScanScreen';
import LoginScreen from './screens/LoginScreen';
import './App.css';

import AdminScreen from './screens/AdminScreen';

function App() {
  const [user, setUser] = useState(null); // { id, name, role }

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <div className="app-container">
      {!user ? (
        <LoginScreen onLogin={handleLogin} />
      ) : user.role === 'admin' ? (
        <AdminScreen user={user} onLogout={handleLogout} />
      ) : (
        <ScanScreen user={user} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
