import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="logo">Compassionate</div>

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