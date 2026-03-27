// src/pages/CheckoutPage.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

function MapModal({ stations, onClose, onSelect }) {
  return (
    <div className="map-modal-overlay" onClick={onClose}>
      <div className="map-modal" onClick={e => e.stopPropagation()}>
        <div className="map-modal-header">
          <h3><i className="bi bi-geo-alt-fill" style={{ color: 'var(--primary)', marginRight: 6 }}></i>Pickup Station Map</h3>
          <button className="map-modal-close" onClick={onClose}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        {/* Map placeholder */}
        <div className="map-frame">
          <i className="bi bi-map"></i>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>Interactive Map</div>
            <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>
              Integrate Google Maps or Leaflet.js here.<br />
              Pass latitude/longitude from pickup station API.
            </div>
          </div>
          {/* In production, render: <GoogleMap> or <MapContainer> with markers for each station */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', padding: '0 16px' }}>
            {stations.slice(0, 6).map(st => (
              <div key={st.id} style={{
                background: 'var(--primary-xlight)', border: '1px solid var(--primary)',
                borderRadius: 6, padding: '6px 12px', fontSize: 11, fontWeight: 600,
                color: 'var(--primary-dark)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 4
              }} onClick={() => { onSelect(st); onClose(); }}>
                <i className="bi bi-geo-alt-fill"></i> {st.name}
              </div>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="map-stations-list">
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-600)', marginBottom: 8 }}>
            All Pickup Stations
          </div>
          {stations.map(st => (
            <div key={st.id} onClick={() => { onSelect(st); onClose(); }}
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '8px 0', borderBottom: '1px solid var(--gray-100)',
                cursor: 'pointer', fontSize: 12
              }}>
              <div>
                <div style={{ fontWeight: 600 }}>{st.name}</div>
                <div style={{ color: 'var(--gray-400)', fontSize: 11 }}>{st.address}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700, color: 'var(--primary)' }}>
                  {st.pickup_fee > 0 ? `KES ${Number(st.pickup_fee).toLocaleString()}` : 'FREE'}
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

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  const { addToast } = useToast();

  const [step, setStep] = useState(1); // 1=delivery, 2=contact, 3=payment, 4=confirm
  const [deliveryType, setDeliveryType] = useState('pickup');
  const [regions, setRegions] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [pickupStations, setPickupStations] = useState([]);
  const [deliveryZones, setDeliveryZones] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [selectedZone, setSelectedZone] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  const [contact, setContact] = useState({ full_name: '', email: '', phone: '', delivery_address: '', notes: '' });
  const [paymentMethod, setPaymentMethod] = useState('mpesa');

  useEffect(() => {
    api.getRegions().then(d => setRegions(Array.isArray(d) ? d : d.results || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedRegion) {
      const region = regions.find(r => r.slug === selectedRegion);
      if (region) {
        api.getPickupStations(region.id).then(d => setPickupStations(Array.isArray(d) ? d : d.results || [])).catch(() => {});
        api.getDeliveryZones(region.id).then(d => setDeliveryZones(Array.isArray(d) ? d : d.results || [])).catch(() => {});
      }
    }
  }, [selectedRegion, regions]);

  const deliveryFee = deliveryType === 'pickup'
    ? (selectedStation ? Number(selectedStation.pickup_fee) : 0)
    : (selectedZone ? Number(selectedZone.delivery_fee) : 0);

  const subtotal = cart.total || 0;
  const total = subtotal + deliveryFee;

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
        delivery_type: deliveryType,
        pickup_station: deliveryType === 'pickup' ? selectedStation?.id : undefined,
        delivery_zone: deliveryType === 'home' ? selectedZone?.id : undefined,
        delivery_address: contact.delivery_address,
        full_name: contact.full_name,
        email: contact.email,
        phone: contact.phone,
        payment_method: paymentMethod,
        notes: contact.notes,
      };
      const order = await api.createOrder(payload);
      setOrderNumber(order.order_number);
      setStep(4);
    } catch (e) {
      addToast(e.message || 'Order failed. Please try again.', 'error');
    }
    setSubmitting(false);
  };

  if (!cart.items?.length && step !== 4) {
    return (
      <div className="container" style={{ paddingTop: 20 }}>
        <div className="empty-cart" style={{ background: 'white', borderRadius: 8 }}>
          <i className="bi bi-bag-x"></i>
          <h3>Your cart is empty</h3>
          <Link to="/store" className="btn btn-primary btn-lg"><i className="bi bi-shop"></i> Start Shopping</Link>
        </div>
      </div>
    );
  }

  // Order confirmed
  if (step === 4) {
    return (
      <div className="container" style={{ paddingTop: 20, paddingBottom: 40 }}>
        <div style={{
          background: 'white', borderRadius: 12, padding: '48px 24px',
          textAlign: 'center', maxWidth: 500, margin: '0 auto', boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
        }}>
          <div style={{ width: 80, height: 80, background: 'var(--success-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 36, color: 'var(--success)' }}>
            <i className="bi bi-check-circle-fill"></i>
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8, color: 'var(--gray-900)' }}>Order Confirmed! 🎉</h2>
          <p style={{ color: 'var(--gray-500)', marginBottom: 16 }}>Thank you for your purchase!</p>
          <div style={{ background: 'var(--gray-50)', borderRadius: 8, padding: 16, marginBottom: 20 }}>
            <div style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 4 }}>Order Number</div>
            <div style={{ fontSize: 20, fontWeight: 800, fontFamily: 'Montserrat,sans-serif', color: 'var(--primary)', letterSpacing: 1 }}>{orderNumber}</div>
          </div>
          <p style={{ fontSize: 12, color: 'var(--gray-400)', marginBottom: 24 }}>
            {deliveryType === 'pickup'
              ? `Your order will be ready for pickup at ${selectedStation?.name}.`
              : 'Your order will be delivered to your address within the estimated timeframe.'}
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <Link to="/" className="btn btn-primary"><i className="bi bi-house-fill"></i> Back to Home</Link>
            <Link to="/store" className="btn btn-outline"><i className="bi bi-shop"></i> Continue Shopping</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingBottom: 40 }}>
      <div className="breadcrumb">
        <Link to="/">Home</Link>
        <i className="bi bi-chevron-right"></i>
        <Link to="/cart">Cart</Link>
        <i className="bi bi-chevron-right"></i>
        <span>Checkout</span>
      </div>

      {/* Progress bar */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20, background: 'white', borderRadius: 8, padding: '12px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        {[
          { n: 1, label: 'Delivery' },
          { n: 2, label: 'Contact' },
          { n: 3, label: 'Payment' },
        ].map((s, i) => (
          <div key={s.n} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: step >= s.n ? 'var(--primary)' : 'var(--gray-200)',
                color: step >= s.n ? 'white' : 'var(--gray-500)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, flexShrink: 0
              }}>{step > s.n ? <i className="bi bi-check"></i> : s.n}</div>
              <span style={{ fontSize: 12, fontWeight: 600, color: step >= s.n ? 'var(--primary)' : 'var(--gray-400)', whiteSpace: 'nowrap' }}>{s.label}</span>
            </div>
            {i < 2 && <div style={{ flex: 1, height: 2, background: step > s.n ? 'var(--primary)' : 'var(--gray-200)', margin: '0 12px' }}></div>}
          </div>
        ))}
      </div>

      <div className="checkout-layout">
        <div>
          {/* STEP 1: Delivery */}
          <div className="checkout-step">
            <div className="checkout-step-header">
              <div className="step-number">1</div>
              <div className="step-title">Delivery Method</div>
              {step > 1 && (
                <button onClick={() => setStep(1)} style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--primary)', fontWeight: 600 }}>
                  <i className="bi bi-pencil"></i> Edit
                </button>
              )}
            </div>

            {step >= 1 && (
              <div className="checkout-step-body">
                {/* Toggle */}
                <div className="delivery-toggle">
                  <div
                    className={`delivery-type-card ${deliveryType === 'pickup' ? 'selected' : ''}`}
                    onClick={() => setDeliveryType('pickup')}
                  >
                    <i className="bi bi-building"></i>
                    <strong>Pickup Station</strong>
                    <small>Collect at your nearest station</small>
                    <span className="price-tag">From FREE</span>
                  </div>
                  <div
                    className={`delivery-type-card ${deliveryType === 'home' ? 'selected' : ''}`}
                    onClick={() => setDeliveryType('home')}
                  >
                    <i className="bi bi-house-fill"></i>
                    <strong>Home Delivery</strong>
                    <small>Delivered to your doorstep</small>
                    <span className="price-tag">From KES 200</span>
                  </div>
                </div>

                {/* Region selector */}
                <div className="form-group">
                  <label className="form-label">Select Region / County</label>
                  <select className="form-control" value={selectedRegion} onChange={e => {
                    setSelectedRegion(e.target.value);
                    setSelectedStation(null);
                    setSelectedZone(null);
                  }}>
                    <option value="">-- Select Region --</option>
                    {regions.map(r => <option key={r.slug} value={r.slug}>{r.name}</option>)}
                    {/* Fallback hardcoded regions */}
                    {regions.length === 0 && [
                      'Nairobi','Mombasa','Kisumu','Nakuru','Eldoret',
                      'Thika','Malindi','Nyeri','Meru','Kakamega'
                    ].map(r => <option key={r} value={r.toLowerCase()}>{r}</option>)}
                  </select>
                </div>

                {/* Pickup stations */}
                {deliveryType === 'pickup' && selectedRegion && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <label className="form-label" style={{ margin: 0 }}>Select Pickup Station</label>
                      <button className="btn-view-map" onClick={() => setShowMap(true)}>
                        <i className="bi bi-map-fill"></i> View on Map
                      </button>
                    </div>
                    {pickupStations.length > 0 ? (
                      <div className="pickup-stations-list">
                        {pickupStations.map(st => (
                          <div
                            key={st.id}
                            className={`pickup-station-card ${selectedStation?.id === st.id ? 'selected' : ''}`}
                            onClick={() => setSelectedStation(st)}
                          >
                            <input type="radio" className="pickup-station-radio" readOnly
                              checked={selectedStation?.id === st.id} />
                            <div className="pickup-station-info">
                              <div className="pickup-station-name">{st.name}</div>
                              <div className="pickup-station-address">
                                <i className="bi bi-geo-alt" style={{ marginRight: 3 }}></i>{st.address}
                              </div>
                              <div className="pickup-station-hours">
                                <i className="bi bi-clock" style={{ marginRight: 3 }}></i>{st.opening_hours}
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
                    ) : (
                      // Fallback example stations
                      <div className="pickup-stations-list">
                        {[
                          { id: 1, name: 'Mombasa CBD Station', address: 'Moi Avenue, Mombasa', pickup_fee: 0, opening_hours: 'Mon-Sat 8am-7pm' },
                          { id: 2, name: 'Shanzu TTC Station', address: 'Shanzu Road, Shanzu', pickup_fee: 50, opening_hours: 'Mon-Sat 9am-6pm' },
                          { id: 3, name: 'Nyali Centre Station', address: 'Links Road, Nyali', pickup_fee: 100, opening_hours: 'Mon-Sun 8am-8pm' },
                          { id: 4, name: 'Likoni Ferry Station', address: 'Likoni, Mombasa', pickup_fee: 0, opening_hours: 'Mon-Fri 8am-5pm' },
                        ].map(st => (
                          <div
                            key={st.id}
                            className={`pickup-station-card ${selectedStation?.id === st.id ? 'selected' : ''}`}
                            onClick={() => setSelectedStation(st)}
                          >
                            <input type="radio" className="pickup-station-radio" readOnly checked={selectedStation?.id === st.id} />
                            <div className="pickup-station-info">
                              <div className="pickup-station-name">{st.name}</div>
                              <div className="pickup-station-address"><i className="bi bi-geo-alt" style={{ marginRight: 3 }}></i>{st.address}</div>
                              <div className="pickup-station-hours"><i className="bi bi-clock" style={{ marginRight: 3 }}></i>{st.opening_hours}</div>
                            </div>
                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                              <div className="pickup-station-fee">{st.pickup_fee === 0 ? 'FREE' : `KES ${st.pickup_fee}`}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Home delivery zones */}
                {deliveryType === 'home' && selectedRegion && (
                  <div>
                    <div className="form-group">
                      <label className="form-label">Delivery Zone</label>
                      {deliveryZones.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {deliveryZones.map(zone => (
                            <div key={zone.id}
                              className={`pickup-station-card ${selectedZone?.id === zone.id ? 'selected' : ''}`}
                              onClick={() => setSelectedZone(zone)}
                            >
                              <input type="radio" className="pickup-station-radio" readOnly checked={selectedZone?.id === zone.id} />
                              <div className="pickup-station-info">
                                <div className="pickup-station-name">{zone.name}</div>
                                <div className="pickup-station-hours">Est. {zone.estimated_days}</div>
                              </div>
                              <div className="pickup-station-fee">KES {Number(zone.delivery_fee).toLocaleString()}</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        // Fallback zones
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {[
                            { id: 'z1', name: 'Mombasa Island', delivery_fee: 200, estimated_days: '1-2 days' },
                            { id: 'z2', name: 'Mombasa Mainland North (Nyali, Bamburi, Shanzu)', delivery_fee: 350, estimated_days: '1-2 days' },
                            { id: 'z3', name: 'Mombasa Mainland South (Likoni, Shelly Beach)', delivery_fee: 350, estimated_days: '2-3 days' },
                            { id: 'z4', name: 'Kilifi / Malindi', delivery_fee: 600, estimated_days: '2-3 days' },
                          ].map(zone => (
                            <div key={zone.id}
                              className={`pickup-station-card ${selectedZone?.id === zone.id ? 'selected' : ''}`}
                              onClick={() => setSelectedZone(zone)}
                            >
                              <input type="radio" className="pickup-station-radio" readOnly checked={selectedZone?.id === zone.id} />
                              <div className="pickup-station-info">
                                <div className="pickup-station-name">{zone.name}</div>
                                <div className="pickup-station-hours">Est. {zone.estimated_days}</div>
                              </div>
                              <div className="pickup-station-fee">KES {zone.delivery_fee}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <button
                  className="btn btn-primary"
                  style={{ marginTop: 16, width: '100%' }}
                  onClick={() => setStep(2)}
                  disabled={
                    !selectedRegion ||
                    (deliveryType === 'pickup' && !selectedStation) ||
                    (deliveryType === 'home' && !selectedZone)
                  }
                >
                  Continue <i className="bi bi-arrow-right"></i>
                </button>
              </div>
            )}
          </div>

          {/* STEP 2: Contact */}
          {step >= 2 && (
            <div className="checkout-step">
              <div className="checkout-step-header">
                <div className="step-number">2</div>
                <div className="step-title">Contact Information</div>
                {step > 2 && (
                  <button onClick={() => setStep(2)} style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--primary)', fontWeight: 600 }}>
                    <i className="bi bi-pencil"></i> Edit
                  </button>
                )}
              </div>
              <div className="checkout-step-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input className="form-control" placeholder="John Doe" value={contact.full_name}
                      onChange={e => setContact(c => ({ ...c, full_name: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number *</label>
                    <input className="form-control" placeholder="+254 700 000 000" value={contact.phone}
                      onChange={e => setContact(c => ({ ...c, phone: e.target.value }))} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input className="form-control" type="email" placeholder="john@example.com" value={contact.email}
                    onChange={e => setContact(c => ({ ...c, email: e.target.value }))} />
                </div>
                {deliveryType === 'home' && (
                  <div className="form-group">
                    <label className="form-label">Delivery Address *</label>
                    <textarea className="form-control" rows={3} placeholder="Enter your full delivery address..."
                      value={contact.delivery_address}
                      onChange={e => setContact(c => ({ ...c, delivery_address: e.target.value }))}
                      style={{ resize: 'vertical' }}></textarea>
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label">Order Notes (Optional)</label>
                  <textarea className="form-control" rows={2} placeholder="Special instructions, preferred delivery time, etc."
                    value={contact.notes}
                    onChange={e => setContact(c => ({ ...c, notes: e.target.value }))}
                    style={{ resize: 'vertical' }}></textarea>
                </div>
                <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setStep(3)}>
                  Continue <i className="bi bi-arrow-right"></i>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Payment */}
          {step >= 3 && (
            <div className="checkout-step">
              <div className="checkout-step-header">
                <div className="step-number">3</div>
                <div className="step-title">Payment Method</div>
              </div>
              <div className="checkout-step-body">
                <div className="payment-methods">
                  {[
                    { value: 'mpesa', icon: 'bi-phone-fill', label: 'M-Pesa', sub: 'Pay via Lipa Na M-Pesa' },
                    { value: 'card', icon: 'bi-credit-card-fill', label: 'Credit / Debit Card', sub: 'Visa, Mastercard accepted' },
                    { value: 'cash', icon: 'bi-cash-stack', label: 'Cash on Delivery', sub: 'Pay when you receive your order' },
                  ].map(pm => (
                    <div key={pm.value} className={`payment-method-card ${paymentMethod === pm.value ? 'selected' : ''}`}
                      onClick={() => setPaymentMethod(pm.value)}>
                      <i className={`bi ${pm.icon}`}></i>
                      <div>
                        <div className="payment-method-label">{pm.label}</div>
                        <div className="payment-method-sub">{pm.sub}</div>
                      </div>
                      {paymentMethod === pm.value && (
                        <i className="bi bi-check-circle-fill" style={{ color: 'var(--primary)', marginLeft: 'auto', fontSize: 18 }}></i>
                      )}
                    </div>
                  ))}
                </div>

                {paymentMethod === 'mpesa' && (
                  <div style={{ background: 'var(--primary-xlight)', borderRadius: 8, padding: 14, marginTop: 14, fontSize: 13 }}>
                    <div style={{ fontWeight: 700, marginBottom: 6, color: 'var(--primary-dark)' }}>
                      <i className="bi bi-info-circle-fill" style={{ marginRight: 6 }}></i>M-Pesa Instructions
                    </div>
                    <p style={{ color: 'var(--gray-600)', lineHeight: 1.7, fontSize: 12 }}>
                      After placing your order, you will receive an M-Pesa STK push prompt on your phone.<br />
                      <strong>Paybill: 12345 | Account: Your Order Number</strong><br />
                      Or Lipa Na M-Pesa → Till Number: <strong>54321</strong>
                    </p>
                  </div>
                )}

                <button
                  className="btn-checkout"
                  style={{ marginTop: 20 }}
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? (
                    <><i className="bi bi-hourglass-split"></i> Processing...</>
                  ) : (
                    <><i className="bi bi-lock-fill"></i> Place Order — KES {total.toLocaleString()}</>
                  )}
                </button>

                <p style={{ fontSize: 11, color: 'var(--gray-400)', textAlign: 'center', marginTop: 10 }}>
                  <i className="bi bi-shield-lock" style={{ marginRight: 3 }}></i>
                  Your payment information is encrypted and secure.
                  By placing this order you confirm you are 18+ years old.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div>
          <div className="cart-summary-box" style={{ borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <div className="cart-panel-header">
              <i className="bi bi-receipt"></i> Order Summary
            </div>
            <div style={{ maxHeight: 280, overflowY: 'auto' }}>
              {cart.items?.map(item => (
                <div key={item.id} style={{ display: 'flex', gap: 10, padding: '10px 14px', borderBottom: '1px solid var(--gray-100)', alignItems: 'center' }}>
                  <div style={{ width: 44, height: 44, background: 'var(--gray-50)', border: '1px solid var(--gray-200)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {item.product.thumbnail_url
                      ? <img src={item.product.thumbnail_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 2 }} />
                      : <i className="bi bi-cup-hot-fill" style={{ color: 'var(--gray-300)' }}></i>
                    }
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--gray-800)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.product.name}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>Qty: {item.quantity} × KES {Number(item.product.price).toLocaleString()}</div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, flexShrink: 0 }}>KES {Number(item.subtotal).toLocaleString()}</div>
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
                  <div style={{ fontSize: 10, color: 'var(--gray-400)', marginTop: 1 }}>{selectedStation.name}</div>
                )}
                {selectedZone && deliveryType === 'home' && (
                  <div style={{ fontSize: 10, color: 'var(--gray-400)', marginTop: 1 }}>{selectedZone.name}</div>
                )}
              </span>
              <span className="summary-value delivery">
                {deliveryFee === 0 ? <span style={{ color: 'var(--success)' }}>FREE</span> : `KES ${deliveryFee.toLocaleString()}`}
              </span>
            </div>
            <div className="summary-row total">
              <span className="summary-label">Total</span>
              <span className="summary-value">KES {total.toLocaleString()}</span>
            </div>
          </div>

          {/* Delivery summary card */}
          {(selectedStation || selectedZone) && (
            <div style={{ background: 'white', borderRadius: 8, padding: 14, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginTop: 12, fontSize: 12 }}>
              <div style={{ fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <i className={`bi bi-${deliveryType === 'pickup' ? 'building' : 'house-fill'}`} style={{ color: 'var(--primary)' }}></i>
                {deliveryType === 'pickup' ? 'Pickup At' : 'Delivering To'}
              </div>
              {selectedStation && (
                <div>
                  <div style={{ fontWeight: 600 }}>{selectedStation.name}</div>
                  <div style={{ color: 'var(--gray-400)', marginTop: 2 }}>{selectedStation.address}</div>
                  <div style={{ color: 'var(--gray-400)', marginTop: 2 }}>{selectedStation.opening_hours}</div>
                </div>
              )}
              {selectedZone && (
                <div>
                  <div style={{ fontWeight: 600 }}>{selectedZone.name}</div>
                  <div style={{ color: 'var(--gray-400)', marginTop: 2 }}>Est. {selectedZone.estimated_days}</div>
                </div>
              )}
            </div>
          )}

          <div style={{ marginTop: 12, fontSize: 11, color: 'var(--gray-400)', textAlign: 'center', lineHeight: 1.6 }}>
            <i className="bi bi-exclamation-triangle" style={{ color: 'var(--warning)', marginRight: 4 }}></i>
            You must be 18+ to purchase alcohol. Valid ID may be required on delivery.
          </div>
        </div>
      </div>

      {/* Map Modal */}
      {showMap && (
        <MapModal
          stations={pickupStations.length > 0 ? pickupStations : [
            { id: 1, name: 'Mombasa CBD Station', address: 'Moi Avenue, Mombasa', pickup_fee: 0, opening_hours: 'Mon-Sat 8am-7pm' },
            { id: 2, name: 'Shanzu TTC Station', address: 'Shanzu Road, Shanzu', pickup_fee: 50, opening_hours: 'Mon-Sat 9am-6pm' },
            { id: 3, name: 'Nyali Centre Station', address: 'Links Road, Nyali', pickup_fee: 100, opening_hours: 'Mon-Sun 8am-8pm' },
          ]}
          onClose={() => setShowMap(false)}
          onSelect={(st) => setSelectedStation(st)}
        />
      )}
    </div>
  );
}