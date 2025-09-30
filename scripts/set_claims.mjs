import admin from 'firebase-admin';

const {
  FIREBASE_ADMIN_PROJECT_ID,
  FIREBASE_ADMIN_CLIENT_EMAIL,
  FIREBASE_ADMIN_PRIVATE_KEY_B64,
  TARGET_UID,
  ROLE,
  THERAPIST_TID,
} = process.env;

if (!TARGET_UID || !ROLE) {
  console.error('Required env vars: TARGET_UID and ROLE (admin|therapist|patient).');
  process.exit(1);
}

if (!FIREBASE_ADMIN_PROJECT_ID || !FIREBASE_ADMIN_CLIENT_EMAIL || !FIREBASE_ADMIN_PRIVATE_KEY_B64) {
  console.error('Missing Firebase admin credentials envs.');
  process.exit(1);
}

const privateKey = Buffer.from(FIREBASE_ADMIN_PRIVATE_KEY_B64, 'base64').toString('utf8');

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey,
  }),
  projectId: FIREBASE_ADMIN_PROJECT_ID,
});

const claims = { role: ROLE };
if (ROLE === 'therapist') {
  claims.tid = THERAPIST_TID || 't1';
}

try {
  await admin.auth().setCustomUserClaims(TARGET_UID, claims);
  console.log(JSON.stringify({ ok: true, uid: TARGET_UID, claims }));
  process.exit(0);
} catch (error) {
  console.error(JSON.stringify({ ok: false, error: error?.message || 'Failed to set claims' }));
  process.exit(1);
}
