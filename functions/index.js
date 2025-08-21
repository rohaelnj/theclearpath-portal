// Cloud Functions disabled for now. No triggers exported.
require('dotenv').config();
const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp();
}

// Intentionally export nothing to avoid deploying any functions.
