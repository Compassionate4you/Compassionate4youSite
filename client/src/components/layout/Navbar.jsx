import { Link } from "react-router-dom";
import "../../styles/NavBar.css";
import logo from "../../assets/images/CompassionateLogo.jpeg";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="logo">
        <Link to="/">
          <img src={logo} alt="CompassionateLogo" className="logo-img"/>
        </Link>
      </div>

      <ul className="nav-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/home-health">Home Health</Link></li>
        <li><Link to="/hospice">Hospice</Link></li>
        <li><Link to="/schedule">Schedule</Link></li>
        <li><Link to="/login">Login</Link></li>
      </ul>
    </nav>
  );
}

export default Navbar;