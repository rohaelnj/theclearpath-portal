const axios = require('axios');
const sendWelcomeEmail = require('./sendBrandedEmail');

jest.mock('axios');

describe('sendWelcomeEmail', () => {
  it('calls axios.post with the expected payload', async () => {
    process.env.BREVO_API_KEY = 'test-api-key';
    axios.post.mockResolvedValue({ data: {} });

    const toEmail = 'dummy@example.com';
    const firstName = 'Dummy';

    await sendWelcomeEmail(toEmail, firstName);

    expect(axios.post).toHaveBeenCalledWith(
      'https://api.brevo.com/v3/smtp/email',
      expect.objectContaining({
        sender: { name: 'The Clear Path', email: 'noreply@theclearpath.ae' },
        to: [{ email: toEmail, name: firstName }],
        subject: 'Welcome to The Clear Path!',
      }),
      expect.objectContaining({
        headers: expect.objectContaining({
          'api-key': 'test-api-key',
          'Content-Type': 'application/json',
        }),
      })
    );
  });
});
