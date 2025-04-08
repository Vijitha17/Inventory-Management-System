import React from 'react';
import { Link, useLocation } from 'react-router-dom'; // Add useLocation
import { 
  FaTh, 
  FaBox, 
  FaUsersCog,
  FaChartLine,
  FaCog 
} from 'react-icons/fa';
import './Sidebar.css';

const Sidebar = ({ isOpen }) => {
  const location = useLocation(); // Get current location
  const currentPath = location.pathname;
  
  const menuItems = [
    { icon: <FaTh />, name: 'Dashboard', path: '/home' },
    { icon: <FaBox />, name: 'Assets', path: '/home/assets' },
    { icon: <FaUsersCog />, name: 'Users', path: '/home/users' },
    { icon: <FaChartLine />, name: 'Analytics', path: '/home/analytics' },
    { icon: <FaCog />, name: 'Settings', path: '/home/settings' }
  ];

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-content">
        {menuItems.map((item, index) => {
          // Check if this menu item matches the current path
          const isActive = 
            (item.path === '/home' && currentPath === '/home') ||
            (item.path !== '/home' && currentPath.startsWith(item.path));
            
          return (
            <div key={index} className="menu-item">
              <Link 
                to={item.path} 
                className={`square-button ${isActive ? 'active' : ''}`}
              >
                <div className="button-icon">{item.icon}</div>
                <span className="button-label">{item.name}</span>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;

