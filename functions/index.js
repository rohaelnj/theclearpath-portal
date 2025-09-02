// functions/index.js  (optional but recommended if Functions are deployed)
require('dotenv').config();
const functions = require('firebase-functions');
const axios = require('axios');

const BREVO_API_KEY = process.env.BREVO_API_KEY || '';
const WELCOME_TEMPLATE_ID = Number(process.env.BREVO_WELCOME_TEMPLATE_ID || '1');
const ENABLE_WELCOME_ON_CREATE = process.env.ENABLE_WELCOME_ON_CREATE === 'true';

exports.sendWelcomeEmail = functions.auth.user().onCreate(async (user) => {
  try {
    if (!ENABLE_WELCOME_ON_CREATE) return null; // OFF by default
    if (!user.emailVerified) return null;
    if (!BREVO_API_KEY || !WELCOME_TEMPLATE_ID || !user.email) return null;

    const firstName = user.displayName?.split(' ')[0] || user.email.split('@')[0];
    await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        to: [{ email: user.email, name: user.displayName || firstName }],
        templateId: WELCOME_TEMPLATE_ID,
        params: {
          displayName: firstName,
          portal_url: 'https://portal.theclearpath.ae/portal',
          logoUrl: 'https://portal.theclearpath.ae/logo.png',
        },
        headers: { 'X-Mail-Tag': 'welcome-email' },
      },
      { headers: { 'api-key': BREVO_API_KEY, 'Content-Type': 'application/json' }, timeout: 15000 }
    );
    return null;
  } catch {
    return null;
  }
});
