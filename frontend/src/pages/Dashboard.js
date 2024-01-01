import axios from "axios"
import React, { useEffect, useState } from 'react';

export default function Dashboard({token}) {
  const [userData, setUserData] = useState()

  const handleLogout = async () => {
    localStorage.removeItem('googleAccessToken');
    window.location.href = '/login';
  };


  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/user-data', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUserData(response.data);
        console.log("USER DATA DASHBOARD :", response.data);
      } catch (error) {
        // Handle error (e.g., set error state)
        console.error('Error fetching data:', error);
      }
    };

    fetchUserData();
  }, []);

  return (
    <div>
      <h1>Welcome to your dashboard</h1>
      <div>{userData ? <pre>{JSON.stringify(userData.user_data, null, 2)}</pre>: <p>Oups</p>}</div>
      <button onClick={handleLogout}>Logout</button>
    </div>
  )
}