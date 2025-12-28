import { useState } from 'react';
import api from '../api/client'; //an Axios instance configured with base URL

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  //could be unified into a single state object, though separate states are simpler to modify

  async function handleLogin(e) {
    e.preventDefault(); // otherwise the browser's default form submission behavior would reload the page
    setError('');// Clear previous error
    // User tries to login with wrong password
    //   → error = 'Invalid credentials' (red text shows)
    // User fixes password and submits again
    //   → Without setError(''), old error still shows!
    //   → With setError(''), error cleared before new attempt

    try {
      const res = await api.post('/admin/login', {
        email,
        password,
      });
      // Long way: { email: email, password: password }

      localStorage.setItem('token', res.data.token); //localStorage: Persist data across page refreshes
      //its browser's built-in storage system for saving data as key-value pairs.
      // localStorage vs Cookies vs sessionStorage
      // Feature               localStorage  sessionStorage  Cookies
      // Storage limit         ~5-10 MB      ~5-10 MB          ~4 KB
      // Lifespan: Forever(until cleared); Tab/window session only; Set expiration date
      // Sent to server        ❌ No         ❌ No                 ✅ Yes (with every request)
      // Accessible from       JS only       JS only             JS + Server
      // Survives page refresh ✅ Yes        ✅ Yes (same tab)     ✅ Yes
      // Survives browser close✅ Yes        ❌ No (data deleted)  ✅ Yes
      // Scope                 Same origin   Same tab + origin   Same domain
      // RECALL: localStorage.clear() being performed while altering backend

      // to prevent XSS (Cross-Site Scripting) Attack, use httpOnly cookies for sensitive tokens in production apps
      // httpOnly cookies cannot be accessed via JavaScript, reducing risk of token theft via XSS
      // in our case, users are trusted admins, so localStorage is acceptable for simplicity

      // res = Full Axios response object
      // res.data = The actual data from backend
      // res.data.token = The JWT token string

      onLogin();//Notify Parent Component; refer App.jsx
    } 
    catch (err) { // hardcoded error msg: Cons: Can't distinguish between "wrong password" and "server down"
      setError('Invalid credentials');
    }
  }

  //   Flow:
  // 1. Login.jsx calls: onLogin()
  //    ↓
  // 2. This executes in App.jsx: () => setLoggedIn(true)
  //    ↓
  // 3. setLoggedIn(true) updates state
  //    ↓
  // 4. App.jsx re-renders
  //    ↓
  // 5. Shows Dashboard instead of Login

  const styles = {
    page: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #e3f2fd 0%, #ffffff 50%, #f3e5f5 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    },
    header: {
      backgroundColor: 'white',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    },
    headerContent: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '16px 24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '16px',
    },
    logoSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
    },
    logoPlaceholder: {
      width: '60px',
      height: '60px',
      backgroundColor: '#d1e2ffff',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontWeight: 'bold',
      fontSize: '24px',
    },
    clinicInfo: {
      display: 'flex',
      flexDirection: 'column',
    },
    clinicName: {
      fontSize: '20px',
      fontWeight: 'bold',
      color: '#1f2937',
      margin: 0,
    },
    clinicLocation: {
      fontSize: '14px',
      color: '#6b7280',
      margin: 0,
    },
    headerButtons: {
      display: 'flex',
      gap: '12px',
      flexWrap: 'wrap',
    },
    ctaButton: {
      padding: '12px 24px',
      border: 'none',
      borderRadius: '8px',
      fontSize: '15px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    primaryButton: {
      background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
      color: 'white',
      boxShadow: '0 2px 4px rgba(37, 99, 235, 0.3)',
    },
    secondaryButton: {
      backgroundColor: 'white',
      color: '#2563eb',
      border: '2px solid #2563eb',
    },
    hero: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '60px 24px',
      textAlign: 'center',
    },
    heroTitle: {
      fontSize: '42px',
      fontWeight: 'bold',
      color: '#1f2937',
      marginBottom: '16px',
      lineHeight: '1.2',
    },
    heroSubtitle: {
      fontSize: '20px',
      color: '#6b7280',
      marginBottom: '40px',
      maxWidth: '800px',
      margin: '0 auto 40px',
    },
    servicesGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '24px',
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 24px 60px',
    },
    serviceCard: {
      backgroundColor: 'white',
      borderRadius: '16px',
      padding: '32px 24px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
      border: '1px solid #f3f4f6',
      textAlign: 'center',
      transition: 'all 0.3s',
    },
    serviceIcon: {
      width: '60px',
      height: '60px',
      margin: '0 auto 16px',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '32px',
    },
    serviceTitle: {
      fontSize: '20px',
      fontWeight: '600',
      color: '#1f2937',
      marginBottom: '8px',
    },
    serviceDesc: {
      fontSize: '15px',
      color: '#6b7280',
      lineHeight: '1.6',
    },
    loginSection: {
      maxWidth: '480px',
      margin: '0 auto 60px',
      padding: '0 24px',
    },
    loginCard: {
      backgroundColor: 'white',
      borderRadius: '16px',
      padding: '32px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
      border: '1px solid #f3f4f6',
    },
    loginTitle: {
      fontSize: '24px',
      fontWeight: '600',
      color: '#1f2937',
      marginBottom: '24px',
      textAlign: 'center',
    },
    formGroup: {
      marginBottom: '20px',
    },
    label: {
      display: 'block',
      fontSize: '14px',
      fontWeight: '500',
      color: '#374151',
      marginBottom: '8px',
    },
    input: {
      width: '100%',
      padding: '12px 16px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '16px',
      outline: 'none',
      transition: 'all 0.2s',
      boxSizing: 'border-box',
    },
    loginButton: {
      width: '100%',
      padding: '12px 24px',
      background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
      color: 'white',
      fontWeight: '600',
      border: 'none',
      borderRadius: '8px',
      fontSize: '16px',
      cursor: 'pointer',
      transition: 'all 0.2s',
      boxShadow: '0 2px 4px rgba(37, 99, 235, 0.3)',
    },
    errorBox: {
      padding: '12px',
      backgroundColor: '#fef2f2',
      border: '1px solid #fecaca',
      color: '#991b1b',
      borderRadius: '8px',
      marginTop: '16px',
      fontSize: '14px',
    },
    footer: {
      backgroundColor: '#1f2937',
      color: 'white',
      padding: '40px 24px',
      marginTop: '60px',
    },
    footerContent: {
      maxWidth: '1200px',
      margin: '0 auto',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '32px',
    },
    footerSection: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    },
    footerTitle: {
      fontSize: '18px',
      fontWeight: '600',
      marginBottom: '8px',
    },
    footerText: {
      fontSize: '14px',
      color: '#d1d5db',
      lineHeight: '1.6',
    },
    footerLink: {
      fontSize: '14px',
      color: '#d1d5db',
      textDecoration: 'none',
      transition: 'color 0.2s',
    },
    copyright: {
      maxWidth: '1200px',
      margin: '0 auto',
      paddingTop: '32px',
      marginTop: '32px',
      borderTop: '1px solid #374151',
      textAlign: 'center',
      fontSize: '14px',
      color: '#9ca3af',
    },
    adminLink: {
      textAlign: 'center',
      marginTop: '16px',
    },
    textLink: {
      color: '#2563eb',
      textDecoration: 'none',
      fontSize: '14px',
      cursor: 'pointer',
    },
  };

  return (
    <div style={styles.page}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.logoSection}>
            <div style={styles.logoPlaceholder}>
  <img src="/logo.png" alt="Clinic Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
</div>
            <div style={styles.clinicInfo}>
              <h1 style={styles.clinicName}>Shri Raj Child Care Clinic</h1>
              <p style={styles.clinicLocation}>Rustumpur, Gorakhpur</p>
            </div>
          </div>
          <div style={styles.headerButtons}>
  <button 
    style={{...styles.ctaButton, ...styles.secondaryButton}}
    onMouseEnter={(e) => {
      e.target.style.backgroundColor = '#eff6ff';
    }}
    onMouseLeave={(e) => {
      e.target.style.backgroundColor = 'white';
    }}
    // Added onClick for Phone Call
    onClick={() => window.location.href = 'tel:9889156942'}
  >
    📞 Call Us
  </button>
  
  <button 
    style={{...styles.ctaButton, ...styles.primaryButton}}
    onMouseEnter={(e) => {
      e.target.style.transform = 'translateY(-2px)';
    }}
    onMouseLeave={(e) => {
      e.target.style.transform = 'translateY(0)';
    }}
    // Added onClick for Website Visit (opens in new tab)
    onClick={() => window.open('https://www.google.com/maps/dir/?api=1&destination=Shri+Raj+Child+Care+Clinic')}
  >
    📍 Visit Us
  </button>
</div>
        </div>
      </header>

      {/* Hero Section */}
      <section style={styles.hero}>
        <h2 style={styles.heroTitle}>
          Comprehensive Child Healthcare You Can Trust
        </h2>
        <p style={styles.heroSubtitle}>
          Providing exceptional pediatric care with compassion, expertise, and personalized attention for your child's health and development.
        </p>
      </section>

      {/* Services Grid */}
      <section style={styles.servicesGrid}>
        <div 
          style={styles.serviceCard}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 8px 12px rgba(0, 0, 0, 0.12)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.07)';
          }}
        >
          <div style={{...styles.serviceIcon, backgroundColor: '#dbeafe'}}>
            💉
          </div>
          <h3 style={styles.serviceTitle}>Vaccination Services</h3>
          <p style={styles.serviceDesc}>
            Complete immunization schedules with automated reminders to keep your child protected and healthy.
          </p>
        </div>

        <div 
          style={styles.serviceCard}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 8px 12px rgba(0, 0, 0, 0.12)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.07)';
          }}
        >
          <div style={{...styles.serviceIcon, backgroundColor: '#dcfce7'}}>
            🩺
          </div>
          <h3 style={styles.serviceTitle}>Pediatric Care</h3>
          <p style={styles.serviceDesc}>
            Expert medical care for children of all ages, from newborns to adolescents, with personalized treatment plans.
          </p>
        </div>

        <div 
          style={styles.serviceCard}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 8px 12px rgba(0, 0, 0, 0.12)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.07)';
          }}
        >
          <div style={{...styles.serviceIcon, backgroundColor: '#fef3c7'}}>
            📋
          </div>
          <h3 style={styles.serviceTitle}>Health Checkups</h3>
          <p style={styles.serviceDesc}>
            Regular wellness visits and developmental screenings to monitor your child's growth and wellbeing.
          </p>
        </div>
      </section>

      {/* Admin Login Section - Only shown when clicked */}
      {showLogin && (
        <section style={styles.loginSection}>
          <div style={styles.loginCard}>
            <h3 style={styles.loginTitle}>Admin Login</h3>
            <div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Email</label>
                <input
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={styles.input}
                  onFocus={(e) => e.target.style.border = '2px solid #3b82f6'}
                  onBlur={(e) => e.target.style.border = '1px solid #d1d5db'}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Password</label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={styles.input}
                  onFocus={(e) => e.target.style.border = '2px solid #3b82f6'}
                  onBlur={(e) => e.target.style.border = '1px solid #d1d5db'}
                />
              </div>

              <button
                onClick={handleLogin}
                style={styles.loginButton}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                Login
              </button>

              {error && <div style={styles.errorBox}>{error}</div>}
            </div>
          </div>
        </section>
      )}

      {/* Admin Link */}
      {!showLogin && (
        <div style={styles.adminLink}>
          <a 
            style={styles.textLink}
            onClick={() => setShowLogin(true)}
            onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
            onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
          >
            Admin Login
          </a>
        </div>
      )}

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <div style={styles.footerSection}>
            <h4 style={styles.footerTitle}>About Us</h4>
            <p style={styles.footerText}>
              Shri Raj Child Care Clinic is dedicated to providing exceptional pediatric healthcare services with compassion and expertise.
            </p>
          </div>

          <div style={styles.footerSection}>
            <h4 style={styles.footerTitle}>Contact Info</h4>
            <p style={styles.footerText}>📍 Shri Raj Child Care Clinic, Nahar Road, Near Jagdish Hospital, Rustumpur, Gorakhpur, U.P. 273016</p>
            <p style={styles.footerText}>📞 9889156942; 9453457910</p>
            <p style={styles.footerText}>✉️ &lt;Email Address&gt;</p>
          </div>

          <div style={styles.footerSection}>
            <h4 style={styles.footerTitle}>Clinic Hours</h4>
            <p style={styles.footerText}>Monday - Saturday: 24 hours</p>
            {/* <p style={styles.footerText}>24 hours</p> */}
            <p style={styles.footerText}>Sunday: Till 2 PM</p>
          </div>
        </div>

        <div style={styles.copyright}>
          © {new Date().getFullYear()} Shri Raj Child Care Clinic. All rights reserved.
        </div>
      </footer>
    </div>
  );

//   return (
//     <div style={{ padding: 20 }}>
//     <h1>Shri Raj Child Care Clinic, Rustumpur, Gorakhpur</h1>
//     <hr />
//       <h2>Admin Login</h2>

//       <form onSubmit={handleLogin}>
//         <input
//           placeholder="Email"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//         /><br /><br />

//         <input
//           type="password"
//           placeholder="Password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//         /><br /><br />

//         <button>Login</button>
//       </form>

//       {error && <p style={{ color: 'red' }}>{error}</p>}
//     </div>
//   );
}