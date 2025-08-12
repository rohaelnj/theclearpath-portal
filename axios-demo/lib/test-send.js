require('dotenv').config({ path: '../../.env' }); // <-- add this at the very top

const sendWelcomeEmail = require('./sendBrandedEmail');

sendWelcomeEmail('rohaelnaeem1995@gmail.com', 'Rohael');
