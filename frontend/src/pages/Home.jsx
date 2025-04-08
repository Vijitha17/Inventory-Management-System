import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { Outlet } from 'react-router-dom';
import './Home.css';

function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="home-container">
      <Topbar toggleSidebar={toggleSidebar} />
      <div className="main-area">
        <Sidebar isOpen={sidebarOpen} />
        <div className={`content-area ${sidebarOpen ? 'shifted' : ''}`}>

          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default Home;
