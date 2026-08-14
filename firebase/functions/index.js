// CatWords Cloud Functions
//  1. sendDailyWordNotification — hourly scheduled job that pushes the day's
//     vocabulary to opted-in users (matched by their reminder hour).
//  2. generateContent — AI (Gemini) content generator for words/stories, used
//     by the content pipeline; falls back gracefully when no key is set.
//
// Set secrets (no code changes needed):
//   firebase functions:secrets:set GEMINI_API_KEY
//   firebase functions:secrets:set ADMIN_API_KEY
// Runtime env (functions .env or defaults below):
//   APP_URL      → base URL used in notification deep links
//   CONTENT_URL  → where the static content-library.json lives

const { onSchedule } = require('firebase-functions/v2/scheduler');
const { onRequest } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const admin = require('firebase-admin');

admin.initializeApp();

const db = admin.firestore();
const messaging = admin.messaging();

const APP_URL = process.env.APP_URL || 'https://opichit-Ks.github.io/CatWords';
const CONTENT_URL = process.env.CONTENT_URL || APP_URL + '/data/content-library.json';

const GEMINI_KEY = defineSecret('GEMINI_API_KEY');
const ADMIN_KEY = defineSecret('ADMIN_API_KEY');

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

async function fetchContent() {
  const response = await fetch(CONTENT_URL);
  if (!response.ok) throw new Error(`content fetch failed: ${response.status}`);
  return response.json();
}

// Mirrors the app's pickLesson so notifications match what the learner sees.
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

// ---- 1. Daily word notification (runs hourly, matches each user's hour) ----

exports.sendDailyWordNotification = onSchedule({ schedule: 'every hour', timeZone: 'UTC' }, async () => {
  const now = new Date();
  const hour = now.getUTCHours();
  const today = localDate(now);

  const snapshot = await db.collection('users').where('pushEnabled', '==', true).get();
  if (snapshot.empty) {
    console.log('no opted-in users');
    return;
  }

  let content = null;
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
      content = content || (await fetchContent());
      const lesson = pickLesson(content, user.learningLevel);
      const words = lesson.wordIds
        .map((id) => content.words.find((word) => word.id === id))
        .filter(Boolean);
      if (!words.length) continue;

      const title = `🐱 คำศัพท์วันนี้ (${CATEGORY_LABEL[lesson.category] || lesson.category})`;
      const body = words.map((word) => word.word).join(', ');
      const url = `${APP_URL}/daily-lesson.html`;

      const result = await messaging.sendEachForMulticast({
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

  // Remove tokens that are no longer registered with FCM.
  await Promise.all(
    [...pruneMap.values()].map(({ ref, tokens }) =>
      ref.update({ fcmTokens: admin.firestore.FieldValue.arrayRemove(...tokens) })
    )
  );

  console.log(`hour ${hour}: sent to ${sent} users, pruned ${[...pruneMap.keys()].length} user(s)`);
});

// ---- 2. AI content generator (words or stories) ----

const WORDS_PROMPT = (category, level, count) => `
You are a vocabulary content writer for "CatWords", a Thai kids' English app.
Generate exactly ${count} English vocabulary words for Thai learners.
Category: ${category}. Level: ${level}.
Rules:
- words must be common, useful and level-appropriate
- example sentences must be short and use the word naturally
- thaiMeaning and exampleThai must be accurate, friendly Thai
Return ONLY valid JSON, an array of objects with keys:
word, phonetic, partOfSpeech (noun|verb|adjective), thaiMeaning, exampleSentence, exampleThai
No markdown, no extra text.`;

const STORY_PROMPT = (category, level, words) => `
You are a story writer for "CatWords", a Thai kids' English app.
Write ONE short English story for ${level}-level Thai learners, category ${category},
that naturally uses exactly these words: ${words}.
- 4-5 short paragraphs, simple vocabulary
- title: short and fun; titleThai: Thai translation of the title
- translation: Thai translation of each paragraph (same array length)
- questions: exactly 3 comprehension questions with 3 options each,
  correctAnswer must match one option, explanation in Thai
Return ONLY valid JSON with keys:
title, titleThai, paragraphs, translation, questions
questions items: { question, options, correctAnswer, explanation }
No markdown, no extra text.`;

exports.generateContent = onRequest({ secrets: [GEMINI_KEY, ADMIN_KEY], cors: false }, async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'POST only' });
    return;
  }
  const adminKey = ADMIN_KEY.value();
  if (adminKey && req.get('x-api-key') !== adminKey) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }
  const geminiKey = GEMINI_KEY.value();
  if (!geminiKey) {
    res.status(503).json({ error: 'GEMINI_API_KEY secret not set' });
    return;
  }

  const { type = 'words', category = 'daily-life', level = 'easy', count = 5, words = [] } = req.body || {};
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const prompt = type === 'story' ? STORY_PROMPT(category, level, words.join(', ')) : WORDS_PROMPT(category, level, count);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json', temperature: 0.7 }
        })
      }
    );
    const data = await response.json();
    if (!response.ok) {
      res.status(502).json({ error: (data.error && data.error.message) || 'Gemini request failed' });
      return;
    }
    const text = ((data.candidates || [])[0] || {}).content || {};
    const parts = text.parts || [];
    const raw = parts.map((part) => part.text || '').join('');
    const parsed = JSON.parse(raw);

    // Store AI stories under dailyContent/{date} so the notifier can reuse them.
    if (type === 'story' && parsed.paragraphs) {
      await db.collection('dailyContent').doc(localDate()).set({
        category,
        level,
        words,
        ...parsed,
        generatedAt: admin.firestore.FieldValue.serverTimestamp(),
        model
      }, { merge: true });
    }

    res.json({ ok: true, model, result: parsed });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
