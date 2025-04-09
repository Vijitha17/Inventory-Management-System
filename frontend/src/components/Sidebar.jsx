import React from 'react';
import { Link, useLocation } from 'react-router-dom'; // Add useLocation
import { 
  FaTh, 
  FaBox, 
  FaClipboardCheck,
  FaClipboardList,
  FaUniversity,
  FaUsersCog,
  FaExchangeAlt,
  FaHandPaper,
  FaChartBar
} from 'react-icons/fa';
import './Sidebar.css';

const Sidebar = ({ isOpen }) => {
  const location = useLocation(); // Get current location
  const currentPath = location.pathname;
  
  const menuItems = [
    { icon: <FaTh />, name: 'Dashboard', path: '/home' },
    { icon: <FaBox />, name: 'MyAssets', path: '/home/myassets' },
    { icon: <FaClipboardList />, name: 'Inventory Items', path: '/home/inventoryitems' },
    { icon: <FaClipboardCheck />, name: 'Assigned Assets', path: '/home/assignedassets' },
    { icon: <FaUniversity />, name: 'Create Entities', path: '/home/createentities' },
    { icon: <FaUsersCog />, name: 'User Management', path: '/home/usermanagement' },
    { icon: <FaExchangeAlt />, name: 'Assign Assets', path: '/home/assignassets' },
    { icon: <FaHandPaper />, name: 'Requests', path: '/home/requests' },
    { icon: <FaChartBar />, name: 'Reports', path: '/home/reports' }
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


