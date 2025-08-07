'use client';
import { Suspense, useEffect, useState } from 'react';
import Image from 'next/image';
import Head from 'next/head';
import { applyActionCode, checkActionCode } from 'firebase/auth';
import { useSearchParams, useRouter } from 'next/navigation';
import { auth } from '@/firebaseConfig';
import { FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode');
  const oobCode = searchParams.get('oobCode');
  const [status, setStatus] = useState<'waiting' | 'checking' | 'success' | 'error'>('waiting');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (mode === 'verifyEmail' && oobCode) {
      setStatus('checking');
      setTimeout(() => {
        checkActionCode(auth, oobCode)
          .then(() => {
            applyActionCode(auth, oobCode)
              .then(() => {
                setStatus('success');
                setMessage('Your email has been successfully verified! You can now log in.');
              })
              .catch(() => {
                setStatus('error');
                setMessage('Invalid or expired verification link. Please request a new one.');
              });
          })
          .catch(() => {
            setStatus('error');
            setMessage('Invalid or expired verification link. Please request a new one.');
          });
      }, 900);
    }
  }, [mode, oobCode]);

  if (!mode || !oobCode) {
    return (
      <>
        <Head>
          <title>Email Verification | The Clear Path</title>
          <meta name="description" content="Verify your email to start your journey with The Clear Path. We offer professional online therapy and counseling in Dubai and the UAE." />
          <meta name="keywords" content="online therapy Dubai, online counseling Dubai, online therapy UAE, mental health Dubai" />
          <meta name="robots" content="noindex, nofollow" />
        </Head>
        <main style={{
          backgroundColor: '#DFD6C7', minHeight: '100vh', display: 'flex',
          flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'Playfair Display', serif", padding: '2rem', textAlign: 'center',
        }}>
          <Image src="/logo.png" alt="The Clear Path Logo" width={120} height={120} style={{ marginBottom: '1.5rem' }} />
          <FaCheckCircle style={{ color: '#1F4142', fontSize: '2.5rem', marginBottom: '1rem' }} />
          <h1 style={{ color: '#1F4142', fontSize: '2.5rem', fontWeight: 700, marginBottom: '1rem' }}>
            One Last Step
          </h1>
          <p style={{ color: '#1F4140', fontSize: '1.15rem', maxWidth: '480px', lineHeight: 1.7 }}>
            We've sent a verification link to your email. Please check your inbox and click the link to activate your account.
          </p>
          <p style={{ marginTop: '2rem', color: '#1F4140', fontSize: '1rem' }}>
            Didn’t receive the email? Check your spam folder or{' '}
            <a href="/login" style={{ color: '#1F4142', textDecoration: 'underline', fontWeight: 600 }}>
              try logging in again
            </a>{' '}
            to resend it.
          </p>
          <p style={{ color: "#888", marginTop: "2rem", fontSize: "0.95rem" }}>
            Already verified? <a href="/login" style={{ color: "#1F4142", textDecoration: "underline" }}>Log in</a>.
          </p>
        </main>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Email Verification | The Clear Path</title>
        <meta name="description" content="Verify your email to start your journey with The Clear Path. We offer professional online therapy and counseling in Dubai and the UAE." />
        <meta name="keywords" content="online therapy Dubai, online counseling Dubai, online therapy UAE, mental health Dubai" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <main style={{
        backgroundColor: '#DFD6C7', minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', fontFamily: "'Playfair Display', serif",
        padding: '2rem', textAlign: 'center',
      }}>
        <Image src="/logo.png" alt="The Clear Path Logo" width={120} height={120} style={{ marginBottom: '1.5rem' }} />
        {status === 'checking' && (
          <>
            <div style={{
              width: 48, height: 48, border: '5px solid #1F4142', borderTop: '5px solid #DFD6C7',
              borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1.5rem auto'
            }} />
            <h1 style={{ color: '#1F4142', fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>
              Verifying your email...
            </h1>
            <p style={{ color: '#1F4140', fontSize: '1.15rem' }}>Please wait a moment.</p>
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg);}
                100% { transform: rotate(360deg);}
              }
            `}</style>
          </>
        )}
        {status === 'success' && (
          <>
            <FaCheckCircle style={{ color: '#1F4142', fontSize: '2.5rem', marginBottom: '1rem' }} />
            <h1 style={{ color: '#1F4142', fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>
              Email Verified!
            </h1>
            <p style={{ color: '#1F4140', fontSize: '1.15rem', marginBottom: '2rem' }}>{message}</p>
            <a href="/login" style={{
              display: 'inline-block', marginTop: '1rem', padding: '0.75rem 2rem',
              backgroundColor: '#1F4142', color: '#DFD6C7', borderRadius: 8, fontWeight: 700,
              fontSize: '1rem', textDecoration: 'none'
            }}>
              Log in now
            </a>
          </>
        )}
        {status === 'error' && (
          <>
            <FaExclamationCircle style={{ color: 'darkred', fontSize: '2.5rem', marginBottom: '1rem' }} />
            <h1 style={{ color: '#1F4142', fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>
              Verification Failed
            </h1>
            <p style={{ color: '#1F4140', fontSize: '1.15rem', marginBottom: '2rem' }}>{message}</p>
            <a href="/signup" style={{
              display: 'inline-block', marginTop: '1rem', padding: '0.75rem 2rem',
              backgroundColor: '#1F4142', color: '#DFD6C7', borderRadius: 8, fontWeight: 700,
              fontSize: '1rem', textDecoration: 'none'
            }}>
              Try signing up again
            </a>
          </>
        )}
      </main>
    </>
  );
}

export default function Wrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailPage />
    </Suspense>
  );
}
