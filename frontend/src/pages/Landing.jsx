import { useNavigate } from 'react-router-dom';
import './Landing.css'; // Make sure this is correctly named
import homepageImage from '../assets/Homeimage.png';

function Landing() { // Renamed from Home to Landing for clarity
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      <div className="landing-container">
        <div className="image-section">
          <img src={homepageImage} alt="Inventory System" className="landing-image" />
        </div>
        <div className="login-section">
          <div className="login-content">
            <h1 className="landing-title">Inventory Management System</h1>
            <p className="landing-subtext">Click below to access your account</p>
            <button 
              onClick={() => navigate('/login')} 
              className="login-button"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Landing;

