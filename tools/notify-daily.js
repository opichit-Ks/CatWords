#!/usr/bin/env node
/* CatWords daily word notification — free alternative to Cloud Functions.
   Runs hourly via GitHub Actions cron. Mirrors firebase/functions/index.js
   sendDailyWordNotification: fetch content, pick today's lesson, match each
   opted-in user's reminderUtcHour, send FCM multicast, prune dead tokens.

   Setup:
   1. Firebase Console → Project settings → Service accounts → Generate key
      (download JSON, base64 it:  base64 -w0 <key.json>)
   2. Add as GitHub secret  FIREBASE_SERVICE_ACCOUNT  (paste the base64)
   3. Optional secret APP_URL if you deploy elsewhere than GitHub Pages.
   Run locally (dry-run, no sending):  node tools/notify-daily.js --dry-run
*/
const fs = require('fs');
const APP_URL = process.env.APP_URL || 'https://opichit-Ks.github.io/CatWords';
const CONTENT_URL = process.env.CONTENT_URL || APP_URL + '/data/content-library.json';
const SERVICE_ACCOUNT_B64 = process.env.FIREBASE_SERVICE_ACCOUNT || '';
const DRY_RUN = process.argv.includes('--dry-run');

const CATEGORY_LABEL = {
  'daily-life': 'ชีวิตประจำวัน',
  restaurant: 'อาหาร',
  travel: 'ท่องเที่ยว',
  medical: 'สุขภาพ',
  'law-citizenship': 'กฎหมาย',
  science: 'วิทยาศาสตร์'
};

const localDate = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Mirror ของ pickLesson ในแอป — บทเรียนของวันต้องตรงกับที่ผู้เรียนเห็น
function pickLesson(content, level) {
  const approved = (content.lessons || []).filter((lesson) => lesson.status === 'approved');
  if (!approved.length) throw new Error('no lessons');
  const preferred = level ? approved.filter((lesson) => lesson.level === level) : [];
  const pool = preferred.length ? preferred : approved;
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now - start) / 86400000);
  return pool[((dayOfYear % pool.length) + pool.length) % pool.length];
}

async function main() {
  const now = new Date();
  const hour = now.getUTCHours();
  const today = localDate(now);
  console.log(`[${today} ${String(hour).padStart(2, '0')}:00 UTC] starting`);

  if (!SERVICE_ACCOUNT_B64 && !DRY_RUN) {
    console.error('FIREBASE_SERVICE_ACCOUNT not set — add it as a GitHub secret (see tools/notify-daily.js header).');
    process.exit(1);
  }

  // ---- load content + pick today's lesson ----
  const response = await fetch(CONTENT_URL);
  if (!response.ok) throw new Error(`content fetch failed: ${response.status}`);
  const content = await response.json();
  const lesson = pickLesson(content, null);
  const words = lesson.wordIds
    .map((id) => content.words.find((word) => word.id === id))
    .filter(Boolean);
  console.log(`lesson: ${CATEGORY_LABEL[lesson.category] || lesson.category} (${lesson.id}) — ${words.length} words`);
  if (!words.length) throw new Error('no words for today');

  if (DRY_RUN) {
    console.log('[dry-run] content + pickLesson OK. Words:', words.map((w) => w.word).join(', '));
    console.log('[dry-run] skip Firestore/FCM (no service account needed for this check)');
    return;
  }

  // ---- admin SDK ----
  const admin = require('firebase-admin');
  const serviceAccount = JSON.parse(Buffer.from(SERVICE_ACCOUNT_B64, 'base64').toString('utf8'));
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  const db = admin.firestore();

  const snapshot = await db.collection('users').where('pushEnabled', '==', true).get();
  if (snapshot.empty) {
    console.log('no opted-in users — nothing to send');
    return;
  }

  const title = `🐱 คำศัพท์วันนี้ (${CATEGORY_LABEL[lesson.category] || lesson.category})`;
  const body = words.map((word) => word.word).join(', ');
  const url = `${APP_URL}/daily-lesson.html`;

  let sent = 0;
  const pruneMap = new Map(); // uid -> { ref, tokens[] }

  for (const doc of snapshot.docs) {
    const user = doc.data();
    const expectedHour = typeof user.reminderUtcHour === 'number' ? user.reminderUtcHour : 0;
    if (expectedHour !== hour) continue;
    if (user.lastPushDate === today) continue;

    const tokens = Array.isArray(user.fcmTokens) ? user.fcmTokens.filter((t) => typeof t === 'string' && t) : [];
    if (!tokens.length) continue;

    try {
      const result = await admin.messaging().sendEachForMulticast({
        tokens,
        notification: { title, body },
        data: { title, body, url }
      });
      await doc.ref.update({
        lastPushDate: today,
        lastPushAt: admin.firestore.FieldValue.serverTimestamp()
      });
      sent += 1;
      const invalid = tokens.filter((_, index) => !result.responses[index] || !result.responses[index].success);
      if (invalid.length) pruneMap.set(doc.id, { ref: doc.ref, tokens: invalid });
    } catch (error) {
      console.error('send failed for', doc.id, error.message);
    }
  }

  await Promise.all(
    [...pruneMap.values()].map(({ ref, tokens }) =>
      ref.update({ fcmTokens: admin.firestore.FieldValue.arrayRemove(...tokens) })
    )
  );

  console.log(`hour ${hour}: sent to ${sent} users, pruned ${[...pruneMap.keys()].length} user(s)`);
}

main().catch((error) => {
  console.error('FATAL:', error.message);
  process.exit(1);
});
