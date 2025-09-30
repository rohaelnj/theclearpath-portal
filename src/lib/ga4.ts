export async function ga4AdminEvent(
  event: 'refund_approved' | 'refund_denied' | 'refund_failed',
  params: Record<string, string | number>,
) {
  const mid = process.env.NEXT_PUBLIC_GA4_ID || process.env.GA4_MEASUREMENT_ID;
  const apiSecret = process.env.GA4_API_SECRET;
  if (!mid || !apiSecret) return;

  const url = `https://www.google-analytics.com/mp/collect?measurement_id=${mid}&api_secret=${apiSecret}`;
  const body = {
    client_id: 'admin-refund-0001',
    events: [{ name: event, params }],
  };

  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    // ignore analytics failures
  }
}
