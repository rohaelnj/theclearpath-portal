'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { signOut, onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { getAuthClient } from '@/lib/firebase';

export default function PortalPage() {
  const router = useRouter();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 430);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const auth = getAuthClient();
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading || !user) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#DFD6C7',
          fontFamily: "'Poppins', sans-serif",
          color: '#1F4142',
        }}
      >
        Loading…
      </div>
    );
  }

  const color = {
    background: '#DFD6C7',
    text: '#1F4142',
    button: '#DFD6C7',
    buttonHover: '#DED4C8',
    darkText: '#2b2b2b',
    white: '#FFF',
    border: '#ddd5c6',
  };
  const fontFamily = "'Poppins', sans-serif";

  const handleLogout = async () => {
    const auth = getAuthClient();
    await signOut(auth);
    router.push('/login');
  };

  return (
    <div style={{ background: color.background, minHeight: '100vh', fontFamily }}>
      {/* header */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.8rem 4vw 0.8rem 2vw',
          background: color.background,
          borderBottom: `1px solid ${color.border}`,
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', minWidth: 0 }}>
          <img
            src="/logo.png"
            alt="The Clear Path Logo"
            style={{
              height: 36,
              width: 36,
              minWidth: 36,
              minHeight: 36,
              borderRadius: 8,
              background: '#fff',
              boxShadow: '0 1px 8px #ececec',
            }}
          />
          <span
            style={{
              fontWeight: 700,
              fontSize: '1.1rem',
              color: color.darkText,
              letterSpacing: '1px',
              whiteSpace: 'nowrap',
            }}
          >
            The Clear Path
          </span>
        </div>

        {isMobile ? (
          <span
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: '#e9e9e9',
              border: '1.5px solid #ddd5c6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 4px',
            }}
            aria-label="User avatar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="#7a868b" viewBox="0 0 24 24" width="18" height="18">
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8V22h19.2v-2.8c0-3.2-6.4-4.8-9.6-4.8z" />
            </svg>
          </span>
        ) : (
          <span
            style={{
              color: color.text,
              fontSize: '0.98rem',
              maxWidth: 180,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              margin: '0 0.5rem',
              flex: '1 1 0%',
            }}
          >
            {user.email}
          </span>
        )}

        <button
          onClick={handleLogout}
          style={{
            background: color.button,
            color: color.text,
            fontWeight: 700,
            padding: '8px 19px',
            borderRadius: '20px',
            fontSize: '0.97rem',
            border: `1.5px solid ${color.border}`,
            cursor: 'pointer',
            textTransform: 'uppercase',
            transition: 'background .2s, color .2s, box-shadow .2s',
            boxShadow: '0 2px 8px rgba(31,65,66,0.07)',
            marginLeft: 'auto',
            minWidth: 85,
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = color.buttonHover)}
          onMouseOut={(e) => (e.currentTarget.style.background = color.button)}
        >
          LOG OUT
        </button>
      </header>

      {/* body */}
      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '3rem 1rem 2rem' }}>
        <section
          style={{
            background: color.white,
            borderRadius: 20,
            boxShadow: '0 2px 18px 0 rgba(0,0,0,0.07)',
            padding: '2.5rem 2rem 2rem',
            marginBottom: '2.5rem',
            textAlign: 'center',
            border: `1.5px solid ${color.border}`,
          }}
        >
          <h1
            style={{
              color: color.darkText,
              fontSize: '2.3rem',
              fontWeight: 800,
              marginBottom: 12,
              letterSpacing: '0.5px',
            }}
          >
            Welcome back, {user.displayName || user.email?.split('@')[0]}!
          </h1>
          <p style={{ color: color.text, margin: '1.1rem 0 0.5rem', fontSize: '1.17rem', lineHeight: 1.7 }}>
            Here’s your personal therapy dashboard.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2
            style={{
              color: color.darkText,
              fontSize: '1.55rem',
              fontWeight: 700,
              marginBottom: '1rem',
              textAlign: 'left',
            }}
          >
            Book or View Your Sessions
          </h2>
          <div
            style={{
              background: color.background,
              borderRadius: 16,
              border: `1.5px solid ${color.border}`,
              minHeight: 120,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.1rem',
              color: color.text,
              fontStyle: 'italic',
            }}
          >
            Booking calendar coming soon...
          </div>
        </section>

        <section>
          <h2 style={{ color: color.darkText, fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.7rem' }}>
            What’s coming soon
          </h2>
          <ul style={{ color: color.text, fontSize: '1rem', lineHeight: 2, paddingLeft: 24, margin: 0 }}>
            <li>📅 Session Booking & Reminders</li>
            <li>💳 Online Payments</li>
            <li>📹 Secure Video Therapy</li>
            <li>💬 Therapist Messaging</li>
            <li>📁 Private Notes / History</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
