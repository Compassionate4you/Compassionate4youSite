import "../../styles/NavBar.css";
import logo from "../../assets/images/CompassionateLogo.jpeg";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useLocation } from "react-router-dom";

function Navbar() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  // DT-37: re render Navbar on route change so login check stays updated
  const location = useLocation();
  // Check if user is logged in
  const isLoggedIn=localStorage.getItem('isLoggedIn') === 'true';
  // Log user out and send them back to login
  function handleLogout() {
    localStorage.removeItem('isLoggedIn');
    navigate('/login');
  } 
  
  return (
    <nav className="navbar" aria-label={i18n.language.startsWith("es") ? "Navegación principal" : "Main navigation"}>
      <div className="logo">
        <Link to="/">
          <img src={logo} alt="CompassionateLogo" className="logo-img"/>
        </Link>
      </div>

      <ul className="nav-links">
        <li><Link to="/" aria-current={location.pathname === "/" ? "page" : undefined}>{t('nav.welcome')}</Link></li>
        <li><Link to="/home-health" aria-current={location.pathname === "/home-health" ? "page" : undefined}>{t('nav.homeHealth')}</Link></li>
        <li><Link to="/hospice" aria-current={location.pathname === "/hospice" ? "page" : undefined}>{t('nav.hospice')}</Link></li>
        <li><Link to="/schedule" aria-current={location.pathname === "/schedule" ? "page" : undefined}>{t('nav.schedule')}</Link></li>

        {/* DT-37: show logout instead of login when logged in, also implement dashboard redirect*/}
        {isLoggedIn ? ( 
          <>
            <li><Link to="/portal" aria-current={location.pathname === "/portal" ? "page" : undefined}>{t('nav.dashboard')}</Link></li>
            <li><button type="button" className="nav-logout" onClick={handleLogout}>{t('nav.logout')}</button></li>
        </>
        ) : (
          <li><Link to="/login" aria-current={location.pathname === "/login" ? "page" : undefined}>{t('nav.login')}</Link></li>)}
      </ul>
    </nav>
  );
}

export default Navbar;
