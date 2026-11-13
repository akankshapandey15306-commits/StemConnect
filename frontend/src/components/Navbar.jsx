import { Link } from "react-router-dom";

function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-container">

        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">🧬</span>
          <span>StemConnect</span>
        </Link>

        {/* Navigation */}
        <nav className="navbar-menu">
          <Link to="/how-it-works">How It Works</Link>

          <Link to="/donors">For Donors</Link>

          <Link to="/patients">For Patients</Link>

          <Link to="/awareness">Awareness</Link>

          <Link to="/financial">Financial Support</Link>

          <Link to="/cost-estimation">Cost Estimation</Link>
        </nav>

        {/* Actions */}
        <div className="navbar-actions">
          
          <Link to="/admin" className="login-link">
          Admin Login
          </Link>

          <Link to="/donors" className="donor-btn">
            Become a Donor
          </Link>
        </div>

      </div>
    </header>
  );
}

export default Navbar;