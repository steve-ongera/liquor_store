// src/pages/CheckoutPage.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

/* ── Map modal ─────────────────────────────────────────────── */
function MapModal({ stations, onClose, onSelect }) {
  return (
    <div className="map-modal-overlay" onClick={onClose}>
      <div className="map-modal" onClick={e => e.stopPropagation()}>
        <div className="map-modal-header">
          <h3>
            <i className="bi bi-geo-alt-fill" style={{ color: 'var(--brand-gold-dim)', marginRight: 8 }}></i>
            Pickup Station Map
          </h3>
          <button className="map-modal-close" onClick={onClose} aria-label="Close">
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        {/* Map placeholder */}
        <div className="map-frame">
          <i className="bi bi-map"></i>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 700, marginBottom: 5, color: 'var(--gray-700)' }}>Interactive Map</div>
            <div style={{ fontSize: 12, color: 'var(--gray-400)', lineHeight: 1.6 }}>
              Integrate Google Maps or Leaflet.js here.<br />
              Pass lat/long from the pickup station API.
            </div>
          </div>
          {/* Station chips */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', padding: '0 20px' }}>
            {stations.slice(0, 6).map(st => (
              <button
                key={st.id}
                style={{
                  background: 'rgba(201,168,76,0.1)',
                  border: '1px solid rgba(201,168,76,0.3)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '6px 14px',
                  fontSize: 11.5,
                  fontWeight: 600,
                  color: 'var(--brand-gold-dim)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                }}
                onClick={() => { onSelect(st); onClose(); }}
              >
                <i className="bi bi-geo-alt-fill"></i> {st.name}
              </button>
            ))}
          </div>
        </div>

        {/* Station list */}
        <div className="map-stations-list">
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
            All Pickup Stations
          </div>
          {stations.map(st => (
            <div
              key={st.id}
              onClick={() => { onSelect(st); onClose(); }}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 0',
                borderBottom: '1px solid var(--border-light)',
                cursor: 'pointer',
                fontSize: 13,
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--brand-champagne)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div>
                <div style={{ fontWeight: 600 }}>{st.name}</div>
                <div style={{ color: 'var(--gray-500)', fontSize: 11.5, marginTop: 2 }}>{st.address}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontWeight: 700, color: 'var(--brand-gold-dim)' }}>
                  {Number(st.pickup_fee) === 0 ? 'FREE' : `KES ${Number(st.pickup_fee).toLocaleString()}`}
                </div>
                <div style={{ color: 'var(--gray-400)', fontSize: 11 }}>{st.opening_hours}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Progress bar ──────────────────────────────────────────── */
function StepProgress({ step }) {
  const steps = [
    { n: 1, label: 'Delivery',  icon: 'bi-building' },
    { n: 2, label: 'Contact',   icon: 'bi-person-fill' },
    { n: 3, label: 'Payment',   icon: 'bi-lock-fill' },
  ];
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      marginBottom: 20,
      background: 'white',
      borderRadius: 'var(--radius-lg)',
      padding: '14px 24px',
      boxShadow: 'var(--shadow-sm)',
      border: '1px solid var(--border-light)',
    }}>
      {steps.map((s, i) => (
        <div key={s.n} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 30, height: 30,
              borderRadius: '50%',
              background: step >= s.n ? 'var(--brand-gold)' : 'var(--surface-raised)',
              color:      step >= s.n ? 'var(--brand-black)' : 'var(--gray-400)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: step > s.n ? 14 : 12,
              fontWeight: 800,
              flexShrink: 0,
              transition: 'all 0.3s',
              boxShadow: step >= s.n ? '0 2px 8px rgba(201,168,76,0.35)' : 'none',
            }}>
              {step > s.n
                ? <i className="bi bi-check" style={{ fontSize: 14 }}></i>
                : s.n
              }
            </div>
            <span style={{
              fontSize: 12.5,
              fontWeight: 600,
              color: step >= s.n ? 'var(--gray-800)' : 'var(--gray-400)',
              whiteSpace: 'nowrap',
              transition: 'color 0.3s',
            }}>
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div style={{
              flex: 1,
              height: 2,
              background: step > s.n ? 'var(--brand-gold)' : 'var(--border-light)',
              margin: '0 14px',
              transition: 'background 0.4s',
              borderRadius: 1,
            }} />
          )}
        </div>
      ))}
    </div>
  );
}

/* ── Main component ────────────────────────────────────────── */
export default function CheckoutPage() {
  const navigate    = useNavigate();
  const { cart, clearCart } = useCart();
  const { addToast }        = useToast();

  const [step,            setStep]            = useState(1);
  const [deliveryType,    setDeliveryType]    = useState('pickup');
  const [regions,         setRegions]         = useState([]);
  const [selectedRegion,  setSelectedRegion]  = useState('');
  const [pickupStations,  setPickupStations]  = useState([]);
  const [deliveryZones,   setDeliveryZones]   = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [selectedZone,    setSelectedZone]    = useState(null);
  const [showMap,         setShowMap]         = useState(false);
  const [submitting,      setSubmitting]      = useState(false);
  const [orderNumber,     setOrderNumber]     = useState('');

  const [contact, setContact] = useState({
    full_name: '', email: '', phone: '', delivery_address: '', notes: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('mpesa');

  useEffect(() => {
    api.getRegions()
      .then(d => setRegions(Array.isArray(d) ? d : d.results || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedRegion) return;
    const region = regions.find(r => r.slug === selectedRegion);
    if (!region) return;
    api.getPickupStations(region.id).then(d => setPickupStations(Array.isArray(d) ? d : d.results || [])).catch(() => {});
    api.getDeliveryZones(region.id).then(d  => setDeliveryZones(Array.isArray(d) ? d : d.results || [])).catch(() => {});
  }, [selectedRegion, regions]);

  const deliveryFee = deliveryType === 'pickup'
    ? (selectedStation ? Number(selectedStation.pickup_fee) : 0)
    : (selectedZone    ? Number(selectedZone.delivery_fee)  : 0);

  const subtotal = cart.total || 0;
  const total    = subtotal + deliveryFee;

  const handleSubmit = async () => {
    if (!contact.full_name || !contact.phone || !contact.email) {
      addToast('Please fill in all required contact fields.', 'error');
      return;
    }
    if (deliveryType === 'pickup' && !selectedStation) {
      addToast('Please select a pickup station.', 'error');
      return;
    }
    if (deliveryType === 'home' && (!selectedZone || !contact.delivery_address)) {
      addToast('Please select a delivery zone and enter your address.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        delivery_type:    deliveryType,
        pickup_station:   deliveryType === 'pickup' ? selectedStation?.id : undefined,
        delivery_zone:    deliveryType === 'home'   ? selectedZone?.id    : undefined,
        delivery_address: contact.delivery_address,
        full_name:        contact.full_name,
        email:            contact.email,
        phone:            contact.phone,
        payment_method:   paymentMethod,
        notes:            contact.notes,
      };
      const order = await api.createOrder(payload);
      setOrderNumber(order.order_number);
      setStep(4);
    } catch (e) {
      addToast(e.message || 'Order failed. Please try again.', 'error');
    }
    setSubmitting(false);
  };

  /* ── Empty cart ─── */
  if (!cart.items?.length && step !== 4) {
    return (
      <div className="container" style={{ paddingTop: 24 }}>
        <div className="empty-cart" style={{
          background: 'white',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <i className="bi bi-bag-x" style={{ color: 'var(--border)' }}></i>
          <h3>Your cart is empty</h3>
          <Link to="/store" className="btn btn-primary btn-lg">
            <i className="bi bi-shop"></i> Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  /* ── Order confirmed ─── */
  if (step === 4) {
    return (
      <div className="container" style={{ paddingTop: 24, paddingBottom: 48 }}>
        <div style={{
          background: 'white',
          borderRadius: 'var(--radius-xl)',
          padding: '56px 32px',
          textAlign: 'center',
          maxWidth: 520,
          margin: '0 auto',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--border-light)',
        }}>
          {/* Success icon */}
          <div style={{
            width: 88, height: 88,
            background: 'var(--success-bg)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px',
            fontSize: 40,
            color: 'var(--success)',
          }}>
            <i className="bi bi-check-circle-fill"></i>
          </div>

          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 28, fontWeight: 700,
            marginBottom: 8, color: 'var(--gray-900)',
          }}>
            Order Confirmed!
          </h2>
          <p style={{ color: 'var(--gray-500)', marginBottom: 24, fontSize: 14 }}>
            Thank you for your purchase. We'll get started right away.
          </p>

          {/* Order number */}
          <div style={{
            background: 'var(--brand-champagne)',
            border: '1px solid rgba(201,168,76,0.25)',
            borderRadius: 'var(--radius)',
            padding: '16px 20px',
            marginBottom: 20,
          }}>
            <div style={{ fontSize: 11, color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
              Order Number
            </div>
            <div style={{
              fontSize: 22,
              fontWeight: 800,
              fontFamily: 'var(--font-body)',
              color: 'var(--brand-gold-dim)',
              letterSpacing: '0.06em',
            }}>
              {orderNumber}
            </div>
          </div>

          <p style={{ fontSize: 12.5, color: 'var(--gray-400)', marginBottom: 28, lineHeight: 1.7 }}>
            {deliveryType === 'pickup'
              ? `Your order will be ready for pickup at ${selectedStation?.name}.`
              : 'Your order will be delivered to your address within the estimated timeframe.'}
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Link to="/" className="btn btn-primary">
              <i className="bi bi-house-fill"></i> Back to Home
            </Link>
            <Link to="/store" className="btn btn-outline">
              <i className="bi bi-shop"></i> Continue Shopping
            </Link>
          </div>

          <div style={{ marginTop: 24, fontSize: 11, color: 'rgba(0,0,0,0.25)' }}>
            <i className="bi bi-exclamation-triangle" style={{ color: 'var(--warning)', marginRight: 5 }}></i>
            Valid ID may be required on delivery. Must be 18+.
          </div>
        </div>
      </div>
    );
  }

  /* ── Checkout layout ─── */
  const FALLBACK_STATIONS = [
    { id: 1, name: 'Mombasa CBD Station',   address: 'Moi Avenue, Mombasa',    pickup_fee: 0,   opening_hours: 'Mon-Sat 8am-7pm' },
    { id: 2, name: 'Shanzu TTC Station',    address: 'Shanzu Road, Shanzu',    pickup_fee: 50,  opening_hours: 'Mon-Sat 9am-6pm' },
    { id: 3, name: 'Nyali Centre Station',  address: 'Links Road, Nyali',      pickup_fee: 100, opening_hours: 'Mon-Sun 8am-8pm' },
    { id: 4, name: 'Likoni Ferry Station',  address: 'Likoni, Mombasa',        pickup_fee: 0,   opening_hours: 'Mon-Fri 8am-5pm' },
  ];
  const FALLBACK_ZONES = [
    { id: 'z1', name: 'Mombasa Island',                                             delivery_fee: 200, estimated_days: '1-2 days' },
    { id: 'z2', name: 'Mainland North (Nyali, Bamburi, Shanzu)',                    delivery_fee: 350, estimated_days: '1-2 days' },
    { id: 'z3', name: 'Mainland South (Likoni, Shelly Beach)',                      delivery_fee: 350, estimated_days: '2-3 days' },
    { id: 'z4', name: 'Kilifi / Malindi',                                           delivery_fee: 600, estimated_days: '2-3 days' },
  ];

  const activeStations = pickupStations.length > 0 ? pickupStations : FALLBACK_STATIONS;
  const activeZones    = deliveryZones.length  > 0 ? deliveryZones   : FALLBACK_ZONES;

  return (
    <div className="container" style={{ paddingBottom: 48 }}>
      <div className="breadcrumb">
        <Link to="/">Home</Link>
        <i className="bi bi-chevron-right"></i>
        <Link to="/cart">Cart</Link>
        <i className="bi bi-chevron-right"></i>
        <span>Checkout</span>
      </div>

      <StepProgress step={step} />

      <div className="checkout-layout">
        <div>

          {/* ── Step 1: Delivery ─── */}
          <div className="checkout-step">
            <div className="checkout-step-header">
              <div className="step-number">1</div>
              <div className="step-title">Delivery Method</div>
              {step > 1 && (
                <button
                  onClick={() => setStep(1)}
                  style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--brand-gold-dim)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  <i className="bi bi-pencil-fill"></i> Edit
                </button>
              )}
            </div>

            <div className="checkout-step-body">
              {/* Delivery type toggle */}
              <div className="delivery-toggle">
                {[
                  { value: 'pickup', icon: 'bi-building',   title: 'Pickup Station',  sub: 'Collect at your nearest station', price: 'From FREE' },
                  { value: 'home',   icon: 'bi-house-fill', title: 'Home Delivery',   sub: 'Delivered to your doorstep',       price: 'From KES 200' },
                ].map(opt => (
                  <div
                    key={opt.value}
                    className={`delivery-type-card ${deliveryType === opt.value ? 'selected' : ''}`}
                    onClick={() => setDeliveryType(opt.value)}
                  >
                    <i className={`bi ${opt.icon}`}></i>
                    <strong>{opt.title}</strong>
                    <small>{opt.sub}</small>
                    <span className="price-tag">{opt.price}</span>
                  </div>
                ))}
              </div>

              {/* Region selector */}
              <div className="form-group">
                <label className="form-label">Select Region / County</label>
                <select
                  className="form-control"
                  value={selectedRegion}
                  onChange={e => {
                    setSelectedRegion(e.target.value);
                    setSelectedStation(null);
                    setSelectedZone(null);
                  }}
                >
                  <option value="">— Select Region —</option>
                  {regions.length > 0
                    ? regions.map(r => <option key={r.slug} value={r.slug}>{r.name}</option>)
                    : ['Nairobi','Mombasa','Kisumu','Nakuru','Eldoret','Thika','Malindi','Nyeri','Meru','Kakamega']
                        .map(r => <option key={r} value={r.toLowerCase()}>{r}</option>)
                  }
                </select>
              </div>

              {/* Pickup stations */}
              {deliveryType === 'pickup' && selectedRegion && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <label className="form-label" style={{ margin: 0 }}>Select Pickup Station</label>
                    <button className="btn-view-map" onClick={() => setShowMap(true)}>
                      <i className="bi bi-map-fill"></i> View on Map
                    </button>
                  </div>
                  <div className="pickup-stations-list">
                    {activeStations.map(st => (
                      <div
                        key={st.id}
                        className={`pickup-station-card ${selectedStation?.id === st.id ? 'selected' : ''}`}
                        onClick={() => setSelectedStation(st)}
                      >
                        <input type="radio" className="pickup-station-radio" readOnly checked={selectedStation?.id === st.id} />
                        <div className="pickup-station-info">
                          <div className="pickup-station-name">{st.name}</div>
                          <div className="pickup-station-address">
                            <i className="bi bi-geo-alt" style={{ marginRight: 4 }}></i>{st.address}
                          </div>
                          <div className="pickup-station-hours">
                            <i className="bi bi-clock" style={{ marginRight: 4 }}></i>{st.opening_hours}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div className="pickup-station-fee">
                            {Number(st.pickup_fee) === 0 ? 'FREE' : `KES ${Number(st.pickup_fee).toLocaleString()}`}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Home delivery zones */}
              {deliveryType === 'home' && selectedRegion && (
                <div className="form-group">
                  <label className="form-label">Select Delivery Zone</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {activeZones.map(zone => (
                      <div
                        key={zone.id}
                        className={`pickup-station-card ${selectedZone?.id === zone.id ? 'selected' : ''}`}
                        onClick={() => setSelectedZone(zone)}
                      >
                        <input type="radio" className="pickup-station-radio" readOnly checked={selectedZone?.id === zone.id} />
                        <div className="pickup-station-info">
                          <div className="pickup-station-name">{zone.name}</div>
                          <div className="pickup-station-hours">Est. {zone.estimated_days}</div>
                        </div>
                        <div className="pickup-station-fee">
                          KES {Number(zone.delivery_fee).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                className="btn btn-primary"
                style={{ marginTop: 18, width: '100%' }}
                onClick={() => setStep(2)}
                disabled={
                  !selectedRegion ||
                  (deliveryType === 'pickup' && !selectedStation) ||
                  (deliveryType === 'home'   && !selectedZone)
                }
              >
                Continue <i className="bi bi-arrow-right"></i>
              </button>
            </div>
          </div>

          {/* ── Step 2: Contact ─── */}
          {step >= 2 && (
            <div className="checkout-step">
              <div className="checkout-step-header">
                <div className="step-number">2</div>
                <div className="step-title">Contact Information</div>
                {step > 2 && (
                  <button
                    onClick={() => setStep(2)}
                    style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--brand-gold-dim)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    <i className="bi bi-pencil-fill"></i> Edit
                  </button>
                )}
              </div>
              <div className="checkout-step-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input className="form-control" placeholder="John Doe"
                      value={contact.full_name} onChange={e => setContact(c => ({ ...c, full_name: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number *</label>
                    <input className="form-control" placeholder="+254 700 000 000"
                      value={contact.phone} onChange={e => setContact(c => ({ ...c, phone: e.target.value }))} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input className="form-control" type="email" placeholder="john@example.com"
                    value={contact.email} onChange={e => setContact(c => ({ ...c, email: e.target.value }))} />
                </div>
                {deliveryType === 'home' && (
                  <div className="form-group">
                    <label className="form-label">Delivery Address *</label>
                    <textarea className="form-control" rows={3}
                      placeholder="Enter your full delivery address…"
                      value={contact.delivery_address}
                      onChange={e => setContact(c => ({ ...c, delivery_address: e.target.value }))}
                      style={{ resize: 'vertical' }}
                    ></textarea>
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label">Order Notes (Optional)</label>
                  <textarea className="form-control" rows={2}
                    placeholder="Special instructions, preferred delivery time, etc."
                    value={contact.notes}
                    onChange={e => setContact(c => ({ ...c, notes: e.target.value }))}
                    style={{ resize: 'vertical' }}
                  ></textarea>
                </div>
                <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setStep(3)}>
                  Continue <i className="bi bi-arrow-right"></i>
                </button>
              </div>
            </div>
          )}

          {/* ── Step 3: Payment ─── */}
          {step >= 3 && (
            <div className="checkout-step">
              <div className="checkout-step-header">
                <div className="step-number">3</div>
                <div className="step-title">Payment Method</div>
              </div>
              <div className="checkout-step-body">
                <div className="payment-methods">
                  {[
                    { value: 'mpesa', icon: 'bi-phone-fill',    label: 'M-Pesa',               sub: 'Pay via Lipa Na M-Pesa STK push' },
                    { value: 'card',  icon: 'bi-credit-card-fill',label: 'Credit / Debit Card', sub: 'Visa & Mastercard accepted' },
                    { value: 'cash',  icon: 'bi-cash-stack',     label: 'Cash on Delivery',     sub: 'Pay when you receive your order' },
                  ].map(pm => (
                    <div
                      key={pm.value}
                      className={`payment-method-card ${paymentMethod === pm.value ? 'selected' : ''}`}
                      onClick={() => setPaymentMethod(pm.value)}
                    >
                      <i className={`bi ${pm.icon}`}></i>
                      <div>
                        <div className="payment-method-label">{pm.label}</div>
                        <div className="payment-method-sub">{pm.sub}</div>
                      </div>
                      {paymentMethod === pm.value && (
                        <i className="bi bi-check-circle-fill" style={{ color: 'var(--brand-gold)', marginLeft: 'auto', fontSize: 19 }}></i>
                      )}
                    </div>
                  ))}
                </div>

                {/* M-Pesa instructions */}
                {paymentMethod === 'mpesa' && (
                  <div style={{
                    background: 'rgba(201,168,76,0.08)',
                    border: '1px solid rgba(201,168,76,0.2)',
                    borderRadius: 'var(--radius)',
                    padding: 14,
                    marginTop: 14,
                    fontSize: 13,
                  }}>
                    <div style={{ fontWeight: 700, marginBottom: 7, color: 'var(--brand-gold-dim)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <i className="bi bi-info-circle-fill"></i> M-Pesa Instructions
                    </div>
                    <p style={{ color: 'var(--gray-600)', lineHeight: 1.8, fontSize: 12.5 }}>
                      After placing your order, an M-Pesa STK push will be sent to your phone.<br />
                      <strong>Paybill: 12345 | Account: Your Order Number</strong><br />
                      Or Till Number: <strong>54321</strong>
                    </p>
                  </div>
                )}

                {/* Place order */}
                <button
                  className="btn-checkout"
                  style={{ marginTop: 20 }}
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting
                    ? <><i className="bi bi-hourglass-split"></i> Processing…</>
                    : <><i className="bi bi-lock-fill"></i> Place Order — KES {total.toLocaleString()}</>
                  }
                </button>

                <p style={{ fontSize: 11, color: 'var(--gray-400)', textAlign: 'center', marginTop: 10, lineHeight: 1.6 }}>
                  <i className="bi bi-shield-lock" style={{ marginRight: 4 }}></i>
                  Your payment information is encrypted and secure.
                  By placing this order you confirm you are 18+ years old.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── Order summary sidebar ─── */}
        <div>
          <div className="cart-summary-box" style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
            <div className="cart-panel-header">
              <i className="bi bi-receipt"></i> Order Summary
            </div>

            {/* Item list */}
            <div style={{ maxHeight: 280, overflowY: 'auto', scrollbarWidth: 'thin' }}>
              {cart.items?.map(item => (
                <div key={item.id} style={{
                  display: 'flex', gap: 10, padding: '10px 14px',
                  borderBottom: '1px solid var(--border-light)', alignItems: 'center',
                }}>
                  <div style={{
                    width: 46, height: 46,
                    background: 'var(--brand-champagne)',
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    {item.product.thumbnail_url
                      ? <img src={item.product.thumbnail_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 3 }} />
                      : <i className="bi bi-cup-hot-fill" style={{ color: 'var(--border)', fontSize: 18 }}></i>
                    }
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--gray-800)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.product.name}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--gray-500)', marginTop: 2 }}>
                      Qty: {item.quantity} × KES {Number(item.product.price).toLocaleString()}
                    </div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, flexShrink: 0, color: 'var(--gray-900)' }}>
                    KES {Number(item.subtotal).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            <div className="summary-row">
              <span className="summary-label">Subtotal</span>
              <span className="summary-value">KES {subtotal.toLocaleString()}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">
                {deliveryType === 'pickup' ? 'Pickup Fee' : 'Delivery Fee'}
                {selectedStation && deliveryType === 'pickup' && (
                  <div style={{ fontSize: 10.5, color: 'var(--gray-400)', marginTop: 2 }}>{selectedStation.name}</div>
                )}
                {selectedZone && deliveryType === 'home' && (
                  <div style={{ fontSize: 10.5, color: 'var(--gray-400)', marginTop: 2 }}>{selectedZone.name}</div>
                )}
              </span>
              <span className="summary-value delivery">
                {deliveryFee === 0
                  ? <span style={{ color: 'var(--success)', fontWeight: 700 }}>FREE</span>
                  : `KES ${deliveryFee.toLocaleString()}`
                }
              </span>
            </div>
            <div className="summary-row total">
              <span className="summary-label">Total</span>
              <span className="summary-value">KES {total.toLocaleString()}</span>
            </div>
          </div>

          {/* Selected delivery summary */}
          {(selectedStation || selectedZone) && (
            <div style={{
              background: 'white',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius)',
              padding: 14,
              marginTop: 12,
              fontSize: 12.5,
            }}>
              <div style={{ fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 7, color: 'var(--gray-700)' }}>
                <i
                  className={`bi bi-${deliveryType === 'pickup' ? 'building' : 'house-fill'}`}
                  style={{ color: 'var(--brand-gold-dim)' }}
                ></i>
                {deliveryType === 'pickup' ? 'Pickup At' : 'Delivering To'}
              </div>
              {selectedStation && (
                <>
                  <div style={{ fontWeight: 600 }}>{selectedStation.name}</div>
                  <div style={{ color: 'var(--gray-500)', marginTop: 3 }}>{selectedStation.address}</div>
                  <div style={{ color: 'var(--gray-400)', marginTop: 3, fontSize: 11.5 }}>{selectedStation.opening_hours}</div>
                </>
              )}
              {selectedZone && (
                <>
                  <div style={{ fontWeight: 600 }}>{selectedZone.name}</div>
                  <div style={{ color: 'var(--gray-500)', marginTop: 3 }}>Est. {selectedZone.estimated_days}</div>
                </>
              )}
            </div>
          )}

          <div style={{ marginTop: 14, fontSize: 11, color: 'var(--gray-400)', textAlign: 'center', lineHeight: 1.7 }}>
            <i className="bi bi-exclamation-triangle" style={{ color: 'var(--warning)', marginRight: 4 }}></i>
            You must be 18+ to purchase alcohol. Valid ID may be required on delivery.
          </div>
        </div>
      </div>

      {/* Map modal */}
      {showMap && (
        <MapModal
          stations={activeStations}
          onClose={() => setShowMap(false)}
          onSelect={st => { setSelectedStation(st); }}
        />
      )}
    </div>
  );
}