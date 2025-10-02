// src/lib/ics.ts
// Minimal ICS builder for calendar invites.

export type BuildIcsParams = {
  uid: string;
  startIso: string;
  endIso: string;
  summary: string;
  description?: string;
  url?: string;
};

function formatIso(iso: string): string {
  return iso
    .trim()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '')
    .replace('Z', 'Z');
}

export function buildIcs({ uid, startIso, endIso, summary, description, url }: BuildIcsParams): string {
  const dtStart = formatIso(startIso);
  const dtEnd = formatIso(endIso);
  const uidLine = uid && uid.trim().length > 0 ? uid.trim() : `${dtStart}@theclearpath.ae`;
  const now = formatIso(new Date().toISOString());

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//The Clear Path//Portal//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uidLine}`,
    `DTSTAMP:${now}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${summary}`,
    description ? `DESCRIPTION:${description}` : '',
    url ? `URL:${url}` : '',
    'END:VEVENT',
    'END:VCALENDAR',
  ]
    .filter(Boolean)
    .join('\r\n');
}
