import React, { useState, useEffect } from 'react';
import axios from 'axios';

const App = () => {
  const [loggedIn, setLoggedIn] = useState(false);

  const handleLogin = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/login/google');

      setLoggedIn(true);
      window.location.href = response.data.url;
    } catch (error) {
      console.error('Error logging in:', error);
    }
  };

  return (
    <div>
      {loggedIn ? (
        <h1>Welcome to the Home page!</h1>
      ) : (
        <div>
          <h1>Login Page</h1>
          <button onClick={handleLogin}>Login with Google</button>
        </div>
      )}
    </div>
  );
};

export default App;
