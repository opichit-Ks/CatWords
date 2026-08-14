# CatWords × Firebase

การตั้งค่า Firebase ทั้งชุดสำหรับ CatWords — ใช้กับโปรเจกต์ Spark (ฟรี) ได้เลย

## โครงสร้าง

```
firebase/
├── firebase.json          # hosting (rewrite → index.html) + functions + rules
├── firestore.rules        # users เจ้าของอ่านเขียนเอง, เนื้อหาอ่านได้สาธารณะ
└── functions/
    ├── package.json
    └── index.js           # sendDailyWordNotification + generateContent (Gemini)
```

## 1. ตั้งค่า Firebase CLI

```bash
npm install -g firebase-tools
firebase login
firebase use <project-id>     # โปรเจกต์ที่สร้างไว้
```

## 2. ใส่ config ของคุณในเว็บแอป

แก้ `data/firebase-config.js` ตัวจริง (ตัวอย่างอยู่ใน `.env.example` และ `data/firebase-config.example.js` ถ้ามี):

```js
window.CATWORDS_FIREBASE_CONFIG = {
  apiKey: "…",
  authDomain: "…",
  projectId: "…",
  storageBucket: "…",
  messagingSenderId: "…",
  appId: "…",
  vapidKey: "…"   // จาก Cloud Messaging > Web configuration
};
```

> ไฟล์นี้เป็น placeholder อยู่ตอนนี้ — แอปยังทำงานปกติ (local-first) โดยไม่ต้องมี Firebase

## 3. Deploy

```bash
firebase deploy --only firestore:rules   # rules ก่อน
firebase deploy --only functions         # functions
firebase deploy --only hosting           # เว็บแอป (แทน/เสริม GitHub Pages)
```

### Secrets สำหรับ functions

```bash
firebase functions:secrets:set GEMINI_API_KEY
firebase functions:secrets:set ADMIN_API_KEY
```

- `GEMINI_API_KEY` — key จาก [AI Studio](https://aistudio.google.com/apikey) (free tier เพียงพอ)
- `ADMIN_API_KEY` — key ที่แอป/สคริปต์ใช้เรียก `generateContent` (ไม่ตั้งได้ แต่ endpoint จะเปิดเปล่า)
- `APP_URL` / `CONTENT_URL` — env ใน `functions/.env` ถ้าอยากชี้ไปที่อื่น (default = GitHub Pages)

## 4. ทดสอบ local

```bash
cd firebase/functions
npm install
npm test                 # ถ้ามี unit test
firebase emulators:start --only firestore,functions
```

## Endpoint

| Endpoint | ใช้ทำอะไร |
|---|---|
| `sendDailyWordNotification` | วิ่งทุกชั่วโมง (scheduler) — ส่ง FCM ถึงผู้เรียนที่เปิดรับ + ถึงเวลา (reminderUtcHour) |
| `generateContent` | `POST` รับ `{type:'words'|'story', category, level, count, words}` → คืน JSON จาก Gemini |

ตัวอย่างเรียก generateContent:

```bash
curl -X POST https://<region>-<project>.cloudfunctions.net/generateContent \
  -H "Content-Type: application/json" \
  -H "x-api-key: <ADMIN_API_KEY>" \
  -d '{"type":"words","category":"travel","level":"easy","count":5}'
```

## ผู้ใช้ / FCM

- ใช้ **Anonymous Auth** — ผู้เรียนกด "รับการแจ้งเตือน" → Firebase สร้าง UID ให้อัตโนมัติ (ไม่ต้องกรอกอีเมล)
- `users/{uid}`: `{ pushEnabled, reminderUtcHour, fcmTokens[], learningLevel, lastPushDate, lastPushAt }`
- Token ที่ FCM บอกว่า invalid จะถูกลบออกอัตโนมัติตอนส่งรอบถัดไป
