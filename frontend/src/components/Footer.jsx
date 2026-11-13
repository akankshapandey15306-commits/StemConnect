import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-main">
        <div className="site-footer-brand">
          <Link to="/" className="site-footer-logo">
            <span className="site-footer-logo-icon">🧬</span>
            <span>StemConnect</span>
          </Link>

          <p>
            Connecting donors, supporting patients, and spreading
            awareness about stem cell donation.
          </p>
        </div>

        <div className="site-footer-column">
          <span>EXPLORE</span>

          <Link to="/how-it-works">How It Works</Link>
          <Link to="/awareness">Awareness</Link>
          <Link to="/financial">Financial Support</Link>
          <Link to="/cost-estimation">Cost Estimation</Link>
        </div>

        <div className="site-footer-column">
          <span>FOR DONORS</span>

          <Link to="/donors">Become a Donor</Link>
          <Link to="/donors">Donor Registration</Link>
        </div>

        <div className="site-footer-column">
          <span>PLATFORM</span>

          <Link to="/admin">Admin Portal</Link>
        </div>
      </div>

      <div className="site-footer-bottom">
        <p>© 2026 StemConnect. All rights reserved.</p>

        <span>
          Built for stem cell awareness &amp; patient support.
        </span>
      </div>
    </footer>
  );
}

export default Footer;