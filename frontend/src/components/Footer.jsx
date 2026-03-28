// src/components/Footer.jsx
import { Link } from 'react-router-dom';

const CATEGORIES = ['Whisky','Vodka','Gin','Rum','Brandy','Wine','Beer & Cider','Champagne','Liqueurs','Tequila'];
const CARE_LINKS  = [
  ['Help Center',      '/help'],
  ['Track My Order',   '/track-order'],
  ['Returns Policy',   '/returns'],
  ['Payment Methods',  '/payments'],
  ['Age Policy',       '/age-policy'],
  ['Contact Us',       '/contact'],
];
const INFO_LINKS  = [
  ['About Spiritz',       '/about'],
  ['Delivery Info',       '/delivery'],
  ['Privacy Policy',      '/privacy'],
  ['Terms of Service',    '/terms'],
  ['Responsible Drinking','/responsible'],
  ['Become a Seller',     '/sellers'],
];
const SOCIALS = [
  { icon: 'bi-facebook',  href: '#' },
  { icon: 'bi-instagram', href: '#' },
  { icon: 'bi-twitter-x', href: '#' },
  { icon: 'bi-tiktok',    href: '#' },
];

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">

        {/* Main grid */}
        <div className="footer-top">

          {/* Brand column */}
          <div className="footer-brand">
            <Link to="/" className="logo" style={{ marginBottom: 14, display: 'inline-flex' }}>
              <div className="logo-icon"><i className="bi bi-cup-hot-fill"></i></div>
              <span className="logo-text">Spir<span>itz</span></span>
            </Link>
            <p>
              Kenya's premier online liquor store. We deliver premium spirits,
              wines, beers and more right to your door or nearest pickup station.
            </p>

            {/* Socials */}
            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              {SOCIALS.map(({ icon, href }) => (
                <a
                  key={icon}
                  href={href}
                  aria-label={icon.replace('bi-', '')}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid rgba(201,168,76,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'rgba(255,255,255,0.5)',
                    fontSize: 16,
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.color = 'var(--brand-gold-light)';
                    e.currentTarget.style.borderColor = 'rgba(201,168,76,0.5)';
                    e.currentTarget.style.background = 'rgba(201,168,76,0.1)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
                    e.currentTarget.style.borderColor = 'rgba(201,168,76,0.2)';
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <i className={`bi ${icon}`}></i>
                </a>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div className="footer-col">
            <h4>Categories</h4>
            <ul>
              {CATEGORIES.map(c => (
                <li key={c}>
                  <Link to={`/category/${c.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`}>
                    {c}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer care */}
          <div className="footer-col">
            <h4>Customer Care</h4>
            <ul>
              {CARE_LINKS.map(([label, to]) => (
                <li key={label}><Link to={to}>{label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Info + App download */}
          <div className="footer-col">
            <h4>Information</h4>
            <ul>
              {INFO_LINKS.map(([label, to]) => (
                <li key={label}><Link to={to}>{label}</Link></li>
              ))}
            </ul>

            <div style={{ marginTop: 20 }}>
              <h4>Download App</h4>
              {[
                { icon: 'bi-google-play', label: 'Google Play' },
                { icon: 'bi-apple',       label: 'App Store'   },
              ].map(({ icon, label }) => (
                <a
                  key={label}
                  href="#"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    color: 'rgba(255,255,255,0.5)',
                    fontSize: 12.5,
                    marginBottom: 8,
                    transition: 'color 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--brand-gold-light)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
                >
                  <i className={`bi ${icon}`} style={{ fontSize: 16, color: 'var(--brand-gold-dim)' }}></i>
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} Spiritz. All rights reserved.&nbsp;&nbsp;
            <span style={{ color: 'rgba(255,255,255,0.25)' }}>|</span>&nbsp;&nbsp;
            Must be 18+ to purchase alcohol.
          </span>
          <div className="footer-payment-icons">
            {['M-PESA','VISA','MASTERCARD','CASH'].map(p => (
              <span key={p} className="payment-icon">{p}</span>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
}