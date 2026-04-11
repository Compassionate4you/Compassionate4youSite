import { Link } from "react-router-dom";
import "../../styles/NavBar.css";
import logo from "../../assets/images/CompassionateLogo.jpeg";
import { useTranslation } from "react-i18next";

function Navbar() {
  const { t } = useTranslation();
  
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
        <li><Link to="/login">{t('nav.login')}</Link></li>
      </ul>
    </nav>
  );
}

export default Navbar;