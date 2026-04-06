import { Link } from "react-router-dom";
import "../../styles/NavBar.css";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="logo">
        <Link to="/">Compassionate</Link>
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