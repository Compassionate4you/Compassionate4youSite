import "../../styles/NavBar.css";
import logo from "../../assets/images/CompassionateLogo.jpeg";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useLocation } from "react-router-dom";

function Navbar() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // DT-37: re render Navbar on route change so login check stays updated
  useLocation();
  // Check if user is logged in
  const isLoggedIn=localStorage.getItem('isLoggedIn') === 'true';
  // Log user out and send them back to login
  function handleLogout() {
    localStorage.removeItem('isLoggedIn');
    navigate('/login');
  } 
  
  return (
    <nav className="navbar">
      <div className="logo">
        <Link to="/">
          <img src={logo} alt="CompassionateLogo" className="logo-img"/>
        </Link>
      </div>

      <ul className="nav-links">
        <li><Link to="/">{t('nav.home')}</Link></li>
        <li><Link to="/home-health">{t('nav.homeHealth')}</Link></li>
        <li><Link to="/hospice">{t('nav.hospice')}</Link></li>
        <li><Link to="/schedule">{t('nav.schedule')}</Link></li>

        {/* DT-37: show logout instead of login when logged in, also implement dashboard redirect*/}
        {isLoggedIn ? ( 
          <>
            <li><Link to="/portal">{t('nav.dashboard')}</Link></li>
            <li><a href="#" onClick={handleLogout}>{t('nav.logout')}</a></li>
        </>
        ) : (
          <li><Link to="/login">{t('nav.login')}</Link></li>)}
      </ul>
    </nav>
  );
}

export default Navbar;