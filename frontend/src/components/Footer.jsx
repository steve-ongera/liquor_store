// src/components/Footer.jsx
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="logo" style={{ marginBottom: 12 }}>
              <div className="logo-icon"><i className="bi bi-cup-hot-fill"></i></div>
              <span style={{ color: 'white', fontSize: 22, fontWeight: 800, fontFamily: 'Montserrat, sans-serif' }}>
                Spir<span style={{ color: '#f0a832' }}>itz</span>
              </span>
            </div>
            <p>Kenya's premier online liquor store. We deliver premium spirits, wines, beers and more right to your door or nearest pickup station.</p>
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              {['bi-facebook','bi-instagram','bi-twitter-x','bi-tiktok'].map(ic => (
                <a key={ic} href="#" style={{ color: 'rgba(255,255,255,0.6)', fontSize: 18 }}>
                  <i className={`bi ${ic}`}></i>
                </a>
              ))}
            </div>
          </div>

          <div className="footer-col">
            <h4>Categories</h4>
            <ul>
              {['Whisky','Vodka','Gin','Rum','Brandy','Wine','Beer & Cider','Champagne'].map(c => (
                <li key={c}><Link to={`/category/${c.toLowerCase().replace(/ & /g,'-')}`}>{c}</Link></li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <h4>Customer Care</h4>
            <ul>
              {[
                ['Help Center', '/help'],
                ['Track My Order', '/track-order'],
                ['Returns Policy', '/returns'],
                ['Payment Methods', '/payments'],
                ['Age Policy', '/age-policy'],
                ['Contact Us', '/contact'],
              ].map(([label, to]) => (
                <li key={label}><Link to={to}>{label}</Link></li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <h4>Information</h4>
            <ul>
              {[
                ['About Spiritz', '/about'],
                ['Delivery Info', '/delivery'],
                ['Privacy Policy', '/privacy'],
                ['Terms of Service', '/terms'],
                ['Responsible Drinking', '/responsible'],
                ['Become a Seller', '/sellers'],
              ].map(([label, to]) => (
                <li key={label}><Link to={to}>{label}</Link></li>
              ))}
            </ul>
            <div style={{ marginTop: 16 }}>
              <h4>Download App</h4>
              <div style={{ display: 'flex', gap: 8, flexDirection: 'column' }}>
                <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>
                  <i className="bi bi-google-play" style={{ fontSize: 16 }}></i> Google Play
                </a>
                <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>
                  <i className="bi bi-apple" style={{ fontSize: 16 }}></i> App Store
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Spiritz. All rights reserved. | Must be 18+ to purchase alcohol.</span>
          <div className="footer-payment-icons">
            <span className="payment-icon">M-PESA</span>
            <span className="payment-icon">VISA</span>
            <span className="payment-icon">MASTERCARD</span>
            <span className="payment-icon">CASH</span>
          </div>
        </div>
      </div>
    </footer>
  );
}