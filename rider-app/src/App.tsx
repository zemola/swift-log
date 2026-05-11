import { useState } from 'react';
import RiderDashboard from './components/RiderDashboard';
import Login from './components/Login';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  return (
    <>
      {!isAuthenticated ? (
        <Login onLogin={() => setIsAuthenticated(true)} />
      ) : (
        <RiderDashboard />
      )}
    </>
  );
}

export default App;
