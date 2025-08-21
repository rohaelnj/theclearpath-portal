require('dotenv').config();
const functions = require('firebase-functions');
const axios = require('axios');
const admin = require('firebase-admin');

admin.initializeApp();

const BREVO_TEMPLATE_ID = 1;
const sender = {
  name: "The Clear Path",
  email: "noreply@theclearpath.ae",
};
const BREVO_API_KEY = process.env.BREVO_API_KEY;

exports.sendWelcomeEmail = functions.auth.user().onCreate(async (user) => {
  const firstName =
    user.displayName?.split(' ')[0] ||
    (user.email ? user.email.split('@')[0] : 'there');
  const email = user.email;
  if (!email) return null;

  let welcomeSent = false;
  let userRecord;
  try {
    userRecord = await admin.auth().getUser(user.uid);
    welcomeSent = userRecord.customClaims?.welcomeSent;
  } catch (err) {
    console.error('Error fetching user claims:', err.message);
  }

  if (!welcomeSent) {
    try {
      const doc = await admin.firestore().collection('users').doc(user.uid).get();
      welcomeSent = doc.exists && doc.data().welcomeSent;
    } catch (err) {
      console.error('Error checking Firestore for welcomeSent:', err.message);
    }
  }

  if (welcomeSent) {
    console.log(`⚠️ Welcome email already sent to ${email}`);
    return null;
  }

  const payload = {
    to: [{ email, name: firstName }],
    templateId: BREVO_TEMPLATE_ID,
    params: { FIRSTNAME: firstName },
    sender,
  };

  try {
    await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      payload,
      {
        headers: {
          'api-key': BREVO_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log(`✅ Welcome email sent to ${email}`);
    await Promise.all([
      admin.auth().setCustomUserClaims(user.uid, {
        ...(userRecord?.customClaims || {}),
        welcomeSent: true,
      }),
      admin
        .firestore()
        .collection('users')
        .doc(user.uid)
        .set({ welcomeSent: true }, { merge: true }),
    ]);
  } catch (error) {
    const response = error.response?.data || error.message;
    console.error(`❌ Failed to send email to ${email}:`, response);
  }

  return null;
});
