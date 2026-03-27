// src/components/AgeGate.jsx
import { useState } from 'react';

export default function AgeGate({ onConfirm }) {
  const [declined, setDeclined] = useState(false);

  if (declined) {
    return (
      <div className="age-gate">
        <div className="age-gate-box">
          <i className="bi bi-shield-x"></i>
          <h2>Access Denied</h2>
          <p>You must be 18 years or older to access this website.</p>
          <p style={{ marginTop: 8, fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
            Drink responsibly. Don't drink and drive.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="age-gate">
      <div className="age-gate-box">
        <i className="bi bi-cup-hot-fill"></i>
        <h2>Are You 18+?</h2>
        <p>
          Welcome to Spiritz — Kenya's premier online liquor store.<br />
          You must be of legal drinking age (18+) to enter this site.
        </p>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 24 }}>
          By clicking "Yes, I'm 18+", you confirm you are of legal drinking age<br />
          in your country of residence.
        </p>
        <div className="age-gate-buttons">
          <button className="btn btn-primary btn-lg" onClick={onConfirm}>
            <i className="bi bi-check-circle"></i> Yes, I'm 18+
          </button>
          <button className="btn btn-outline btn-lg" style={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.5)' }} onClick={() => setDeclined(true)}>
            No, I'm Under 18
          </button>
        </div>
      </div>
    </div>
  );
}