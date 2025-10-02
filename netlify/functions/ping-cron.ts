import type { Handler } from '@netlify/functions';

export const handler: Handler = async () => {
  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || '').replace(/\/$/, '');
  const sharedKey = process.env.REFUND_SHARED_KEY || '';

  if (!baseUrl || !sharedKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'missing_env' }),
    };
  }

  const endpoint = `${baseUrl}/api/cron/reminders`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'x-shared-key': sharedKey,
      'content-type': 'application/json',
    },
  });

  const text = await response.text();
  return {
    statusCode: 200,
    body: text,
  };
};
