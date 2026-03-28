// src/components/AgeGate.jsx
import { useState } from 'react';

export default function AgeGate({ onConfirm }) {
  const [declined, setDeclined] = useState(false);

  /* ── Declined state ── */
  if (declined) {
    return (
      <div className="age-gate">
        <div className="age-gate-box">
          <i className="bi bi-shield-x" style={{ color: 'var(--danger)' }}></i>
          <h2>Access Denied</h2>
          <p>You must be 18 years or older to access this website.</p>
          <p style={{ marginTop: 8, fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
            Drink responsibly. Don't drink and drive.
          </p>
        </div>
      </div>
    );
  }

  /* ── Verification prompt ── */
  return (
    <div className="age-gate">
      <div className="age-gate-box">

        {/* Gold decorative line */}
        <div style={{
          width: 40,
          height: 2,
          background: 'linear-gradient(90deg, transparent, var(--brand-gold), transparent)',
          margin: '0 auto 20px',
        }} />

        <i className="bi bi-cup-hot-fill"></i>

        <h2>Are You 18+?</h2>

        <p>
          Welcome to Spiritz — Kenya's premier online liquor store.<br />
          You must be of legal drinking age to enter this site.
        </p>

        <p style={{
          fontSize: 11,
          color: 'rgba(255,255,255,0.3)',
          marginBottom: 28,
          lineHeight: 1.8,
        }}>
          By clicking "Yes, I'm 18+" you confirm you are of legal<br />
          drinking age in your country of residence.
        </p>

        <div className="age-gate-buttons">
          <button className="btn btn-primary btn-lg" onClick={onConfirm}>
            <i className="bi bi-check-circle-fill"></i>
            Yes, I'm 18+
          </button>
          <button
            className="btn btn-lg"
            style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.15)',
              color: 'rgba(255,255,255,0.4)',
              fontSize: 14,
            }}
            onClick={() => setDeclined(true)}
          >
            No, I'm Under 18
          </button>
        </div>

        {/* Bottom disclaimer */}
        <div style={{
          marginTop: 24,
          fontSize: 10,
          color: 'rgba(255,255,255,0.2)',
          lineHeight: 1.8,
        }}>
          <i className="bi bi-shield-check" style={{ marginRight: 5, color: 'var(--brand-gold-dim)' }}></i>
          Spiritz promotes responsible drinking.
        </div>

      </div>
    </div>
  );
}