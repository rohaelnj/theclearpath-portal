const axios = require('axios');

async function sendWelcomeEmail(toEmail, firstName) {
  try {
    const response = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: { name: 'The Clear Path', email: 'noreply@theclearpath.ae' },
        to: [{ email: toEmail, name: firstName }],
        subject: 'Welcome to The Clear Path!',
        htmlContent: `
          <html>
            <body style="font-family: Arial, sans-serif; background: #f9f9f9; padding: 40px;">
              <div style="background: #fff; padding: 30px; border-radius: 8px; max-width: 600px; margin: auto;">
                <img src="http://img.mailinblue.com/9667911/images/688b3b476c4a6_1753955143.png" alt="Logo" style="width: 70px; margin-bottom: 10px;" />
                <h2 style="color: #1F4142;">Hi ${firstName},</h2>
                <p>Welcome to <strong>The Clear Path</strong> — where your journey to mental wellness begins.</p>
                <p>Attached to this email is your personalized welcome guide.</p>
                <a href="https://theclearpath.ae" style="display: inline-block; margin-top: 20px; padding: 12px 20px; background: #1F4142; color: white; text-decoration: none; border-radius: 4px;">Login to Your Portal</a>
                <p style="margin-top: 30px;">Warm regards,<br /><strong>The Clear Path Team</strong></p>
              </div>
            </body>
          </html>
        `,
        attachment: [
          {
            url: 'http://img.mailinblue.com/9667911-1/attachments/TheClearPathOnboarding.pdf',
            name: 'TheClearPathOnboarding.pdf'
          }
        ]
      },
      {
        headers: {
          'api-key': process.env.BREVO_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Email sent:', response.data);
  } catch (error) {
    console.error('❌ Failed to send email:', error.response?.data || error.message);
  }
}

module.exports = sendWelcomeEmail;
