import axios from 'axios';

export type EmailAttachment = {
  name: string;
  content: string; // base64 content
  type?: string;
};

export type SendEmailOptions = {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  fromEmail?: string;
  fromName?: string;
  tags?: string[];
  attachments?: EmailAttachment[];
};

const BREVO_ENDPOINT = 'https://api.brevo.com/v3/smtp/email';

export async function sendEmail(options: SendEmailOptions): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) throw new Error('BREVO_API_KEY missing');

  const senderEmail = options.fromEmail || process.env.BREVO_SENDER_EMAIL || 'support@theclearpath.ae';
  const senderName = options.fromName || process.env.BREVO_SENDER_NAME || 'The Clear Path';

  await axios.post(
    BREVO_ENDPOINT,
    {
      sender: { email: senderEmail, name: senderName },
      to: [{ email: options.to }],
      subject: options.subject,
      textContent: options.text,
      htmlContent: options.html,
      attachments: options.attachments?.map(({ name, content, type }) => ({ name, content, type })),
      headers: options.tags?.length ? { 'X-Mailin-Tag': options.tags.join(',') } : undefined,
    },
    {
      headers: {
        'api-key': apiKey,
        'content-type': 'application/json',
      },
      timeout: 15000,
    },
  );
}
