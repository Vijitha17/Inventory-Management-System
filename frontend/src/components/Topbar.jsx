import React, { useEffect, useState } from 'react';
import './Topbar.css';
import { FaBars, FaBell, FaUserCircle } from 'react-icons/fa';
import axios from 'axios';

function Topbar({ toggleSidebar }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get('/api/users/me');
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    fetchUser();
  }, []);

  return (
    <div className="topbar">
      <div className="topbar-left">
        <button className="hamburger-menu" onClick={toggleSidebar}>
          <FaBars />
        </button>
        <span className="logo">IMS</span>
      </div>
      <div className="topbar-right">
        <FaBell className="icon" />
        <div className="user-info">
          {user && <span className="user-name">{user.name}</span>}
          <FaUserCircle className="icon" />
        </div>
      </div>
    </div>
  );
}

export default Topbar;


