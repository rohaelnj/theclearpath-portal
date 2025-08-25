// functions/index.js
// Purpose: disable duplicate Welcome emails sent from Cloud Functions.
// Welcome is sent ONLY by Next.js when a verified user first lands on /portal.

const functions = require("firebase-functions");

// Keep the trigger to avoid missing export errors, but do nothing.
exports.sendWelcomeEmail = functions.auth.user().onCreate(async () => {
  console.log("[sendWelcomeEmail] Disabled. Welcome is handled by Next.js /portal.");
  return null;
});
