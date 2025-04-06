import { useNavigate } from 'react-router-dom';
import './Home.css';
import homepageImage from '../assets/Homeimage.png';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      <div className="home-card">
        <div className="home-image-section">
          <img src={homepageImage} alt="Inventory" className="home-image" />
        </div>
        <div className="home-login-section">
          <h1 className="home-title">Inventory Management System</h1>
          <p className="home-subtext">Click below to login</p>
          <button onClick={() => navigate('/login')} className="home-login-button">
            Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;

