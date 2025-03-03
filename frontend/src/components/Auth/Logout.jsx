import React from 'react';
import axios from "../../api/api";


function Logout() {
  const handleLogout = async () => {
    try {
      await axios.post('/users/logout/');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      alert('Logged out successfully');
    } catch (error) {
      console.error(error.response.data);
    }
  };

  return <button onClick={handleLogout}>Logout</button>;
}

export default Logout;
