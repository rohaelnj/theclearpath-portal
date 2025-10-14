// Usage:
//   node scripts/create_intro_slots.mjs --tid t2 --start 2025-10-20T11:00:00+04:00 --start 2025-10-27T11:00:00+04:00 --repeat-weeks 4 --commit
// Options:
//   --tid <therapistId>            Required therapist id (e.g., t2)
//   --start <ISO string>           Session start time; repeatable for multiple base times
//   --duration <minutes>           Slot length in minutes (default: 40)
//   --status <status>              Slot status (default: open)
//   --repeat-weeks <count>         Number of weekly repeats per start (default: 1)
//   --label <value>                Optional label stored as sessionType (default: intro)
//   --commit                       Actually write to Firestore (omit for dry-run preview)
//
// Required env vars (same as other admin scripts):
//   FIREBASE_ADMIN_PROJECT_ID | FIREBASE_PROJECT_ID
//   FIREBASE_ADMIN_CLIENT_EMAIL
//   FIREBASE_ADMIN_PRIVATE_KEY_B64

import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore';

const {
  FIREBASE_ADMIN_PROJECT_ID,
  FIREBASE_PROJECT_ID,
  FIREBASE_ADMIN_CLIENT_EMAIL,
  FIREBASE_ADMIN_PRIVATE_KEY_B64,
} = process.env;

function reqEnv(name, value) {
  if (!value) {
    console.error(`Missing env ${name}`);
    process.exit(1);
  }
}

reqEnv('FIREBASE_ADMIN_CLIENT_EMAIL', FIREBASE_ADMIN_CLIENT_EMAIL);
reqEnv('FIREBASE_ADMIN_PRIVATE_KEY_B64', FIREBASE_ADMIN_PRIVATE_KEY_B64);

const PROJECT_ID = FIREBASE_ADMIN_PROJECT_ID || FIREBASE_PROJECT_ID;
reqEnv('FIREBASE_ADMIN_PROJECT_ID|FIREBASE_PROJECT_ID', PROJECT_ID);

function parseArgs(argv) {
  const result = {
    tid: null,
    starts: [],
    duration: 40,
    status: 'open',
    repeatWeeks: 1,
    label: 'intro',
    commit: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const key = argv[i];
    if (!key?.startsWith('--')) continue;
    const value = argv[i + 1];

    switch (key) {
      case '--tid':
        result.tid = value;
        i += 1;
        break;
      case '--start':
        if (!value) {
          console.error('Missing value after --start');
          process.exit(1);
        }
        result.starts.push(value);
        i += 1;
        break;
      case '--duration':
        result.duration = Number(value ?? 'NaN');
        i += 1;
        break;
      case '--status':
        result.status = value || 'open';
        i += 1;
        break;
      case '--repeat-weeks':
        result.repeatWeeks = Number(value ?? 'NaN');
        i += 1;
        break;
      case '--label':
        result.label = value || 'intro';
        i += 1;
        break;
      case '--commit':
        result.commit = true;
        break;
      default:
        console.warn(`Ignoring unknown option ${key}`);
        break;
    }
  }

  return result;
}

const args = parseArgs(process.argv.slice(2));

if (!args.tid) {
  console.error('Missing required --tid <therapistId>');
  process.exit(1);
}

if (!args.starts.length) {
  console.error('Provide at least one --start <ISO}');
  process.exit(1);
}

if (!Number.isFinite(args.duration) || args.duration <= 0) {
  console.error(`Invalid --duration ${args.duration}`);
  process.exit(1);
}

if (!Number.isFinite(args.repeatWeeks) || args.repeatWeeks <= 0) {
  console.error(`Invalid --repeat-weeks ${args.repeatWeeks}`);
  process.exit(1);
}

function parseIso(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid ISO timestamp: ${iso}`);
  }
  return date;
}

function slotId(tid, startIso) {
  return `${tid}_${startIso.replace(/[:.]/g, '-')}`;
}

const pk = Buffer.from(FIREBASE_ADMIN_PRIVATE_KEY_B64, 'base64').toString('utf8');
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: PROJECT_ID,
      clientEmail: FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: pk,
    }),
  });
}
const db = getFirestore();

const msPerMinute = 60 * 1000;
const msPerWeek = 7 * 24 * 60 * 60 * 1000;

const desiredSlots = [];
for (const startIso of args.starts) {
  let baseDate;
  try {
    baseDate = parseIso(startIso);
  } catch (error) {
    console.error(error instanceof Error ? error.message : `Failed to parse ${startIso}`);
    process.exit(1);
  }

  for (let week = 0; week < args.repeatWeeks; week += 1) {
    const startDate = new Date(baseDate.getTime() + week * msPerWeek);
    const endDate = new Date(startDate.getTime() + args.duration * msPerMinute);
    desiredSlots.push({ startDate, endDate, weekOffset: week, baseIso: startIso });
  }
}

const results = [];

for (const slot of desiredSlots) {
  const startIso = slot.startDate.toISOString();
  const endIso = slot.endDate.toISOString();
  const id = slotId(args.tid, startIso);

  const ref = db.collection('slots').doc(id);
  const existing = await ref.get();

  if (existing.exists) {
    results.push({ slotId: id, startIso, status: 'skip_exists' });
    continue;
  }

  results.push({ slotId: id, startIso, status: args.commit ? 'create' : 'dry-run' });

  if (!args.commit) continue;

  await ref.set({
    slotId: id,
    tid: args.tid,
    therapistId: args.tid,
    status: args.status,
    start: Timestamp.fromDate(slot.startDate),
    end: Timestamp.fromDate(slot.endDate),
    minutes: args.duration,
    durationMinutes: args.duration,
    isIntro: args.label === 'intro',
    sessionType: args.label,
    source: 'script:create_intro_slots',
    heldUntil: null,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
}

console.table(results);

if (!args.commit) {
  console.log('Dry run only. Re-run with --commit to write slots.');
} else {
  console.log(`Created ${results.filter((r) => r.status === 'create').length} slots for therapist ${args.tid}.`);
}
