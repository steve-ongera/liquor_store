// src/App.jsx
import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import Header from './components/Header';
import Footer from './components/Footer';
import AgeGate from './components/AgeGate';
import IndexPage from './pages/IndexPage';
import StorePage from './pages/StorePage';
import CategoryListPage from './pages/CategoryListPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import './styles/main.css';

function AppLayout({ children }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <main style={{ flex: 1, paddingBottom: 12 }}>
        {children}
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  const [ageVerified, setAgeVerified] = useState(() => {
    return sessionStorage.getItem('age_verified') === 'true';
  });

  const confirmAge = () => {
    sessionStorage.setItem('age_verified', 'true');
    setAgeVerified(true);
  };

  return (
    <BrowserRouter>
      <ToastProvider>
        <CartProvider>
          {!ageVerified && <AgeGate onConfirm={confirmAge} />}
          <AppLayout>
            <Routes>
              <Route path="/" element={<IndexPage />} />
              <Route path="/store" element={<StorePage />} />
              <Route path="/category/:slug" element={<CategoryListPage />} />
              <Route path="/product/:slug" element={<ProductDetailPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="*" element={
                <div className="container" style={{ textAlign: 'center', padding: '80px 0' }}>
                  <i className="bi bi-exclamation-triangle" style={{ fontSize: 64, color: 'var(--primary)', display: 'block', marginBottom: 16 }}></i>
                  <h2>404 — Page Not Found</h2>
                  <a href="/" className="btn btn-primary" style={{ marginTop: 20, display: 'inline-flex' }}>Go Home</a>
                </div>
              } />
            </Routes>
          </AppLayout>
        </CartProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}