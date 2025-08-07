import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  auth: {
    user: '938547001@smtp-brevo.com',
    pass: '1amPTpgh9dz32rRv', // replace if you've changed the password
  },
});

transporter.sendMail({
  from: '"The Clear Path" <noreply@theclearpath.ae>',
  to: 'rohael1995@gmail.com', // change this to any real test email
  subject: '✅ Brevo SMTP Test from The Clear Path',
  text: 'Success! This test email confirms that Brevo SMTP is working perfectly.',
}).then(info => {
  console.log('✅ Email sent:', info.messageId);
}).catch(err => {
  console.error('❌ Error:', err.message);
});
