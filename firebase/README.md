# CatWords × Firebase

การตั้งค่า Firebase ทั้งชุดสำหรับ CatWords — ใช้กับโปรเจกต์ Spark (ฟรี) ได้เลย

## โครงสร้าง

```
firebase.json              # อยู่ที่ root: hosting + functions + rules
.firebaserc                # ผูกโปรเจกต์เริ่มต้น (catwords)
firebase/
├── firestore.rules        # users เจ้าของอ่านเขียนเอง, เนื้อหาอ่านได้สาธารณะ
└── functions/
    ├── package.json
    └── index.js           # sendDailyWordNotification + generateContent (Gemini)
```

## 1. ตั้งค่า Firebase CLI

```bash
npm install -g firebase-tools
firebase login
firebase use catwords        # โปรเจกต์ที่สร้างไว้ (มีใน .firebaserc แล้ว)
```

> รันคำสั่ง deploy จาก **root ของโปรเจกต์** เสมอ (firebase.json อยู่ที่นั่น)

## 2. ใส่ config ของคุณในเว็บแอป

แก้ `data/firebase-config.js`:

```js
globalThis.CatWordsFirebaseConfig = {
  apiKey: "…",
  authDomain: "…",
  projectId: "…",
  storageBucket: "…",
  messagingSenderId: "…",
  appId: "…",
  vapidKey: "…"   // จาก Cloud Messaging > Web configuration > Key pair
};
```

> ค่าเป็น PUBLIC ตามดีไซน์ของ Firebase (Firestore rules กันคนอื่นเขียนข้อมูล) — ห้ามใส่ secret เช่น service account key

## 3. Deploy

```bash
firebase deploy --only hosting           # เว็บแอป (public = โฟลเดอร์ root)
firebase deploy --only firestore:rules   # rules
firebase deploy --only functions         # functions (ต้องตั้ง secrets ก่อน)
firebase deploy                          # ทั้งหมด
```

> GitHub Pages ยัง serve อยู่ที่ `https://opichit-Ks.github.io/CatWords/` — Firebase Hosting จะอยู่ที่ `https://catwords.web.app` (ทั้งคู่ใช้ relative path จึงใช้ code ชุดเดียวกัน)

### Secrets สำหรับ functions

```bash
firebase functions:secrets:set GEMINI_API_KEY
firebase functions:secrets:set ADMIN_API_KEY
```

- `GEMINI_API_KEY` — key จาก [AI Studio](https://aistudio.google.com/apikey) (free tier เพียงพอ)
- `ADMIN_API_KEY` — key ที่แอป/สคริปต์ใช้เรียก `generateContent` (ไม่ตั้งได้ แต่ endpoint จะเปิดเปล่า)
- `APP_URL` / `CONTENT_URL` — env ใน `firebase/functions/.env` ถ้าอยากชี้ไปที่อื่น (default = GitHub Pages)

## 4. ทดสอบ local

```bash
cd firebase/functions
npm install
firebase emulators:start --only firestore,functions
```

## ⚠️ Cloud Functions ต้องใช้แผน Blaze (มีบัตรเครดิต)

โปรเจกต์ Spark ฟรี deploy ฟังก์ชันไม่ได้ (ต้องอัปเกรดเป็น Blaze ถึงใช้ Cloud Functions ได้ แม้ฟรี tier จะครอบคลุมค่าใช้จ่ายก็ตาม)

### ทางเลือกฟรี 100% — GitHub Actions cron

`.github/workflows/send-daily-word.yml` + `tools/notify-daily.js` — ทำงานแบบเดียวกับ `sendDailyWordNotification` (เลือกบทเรียนของวันตาม `pickLesson`, ส่งเฉพาะผู้ใช้ที่ถึงเวลา `reminderUtcHour`, prune token เสีย) แต่วิ่งบน GitHub Actions ซึ่งฟรีบน repo public:

1. Firebase Console → Project settings → **Service accounts** → Generate new private key (ดาวน์โหลด JSON)
2. base64: `base64 -w0 <key.json>` แล้วเอาไปใส่ GitHub → Settings → **Secrets and variables → Actions → New secret** ชื่อ `FIREBASE_SERVICE_ACCOUNT`
3. (Optional) ตั้ง `APP_URL` ใน repository variables ถ้าไม่ใช้ GitHub Pages
4. Workflow วิ่งทุก 15 นาทีอัตโนมัติ (GitHub มักดีเลย์ run หลายสิบนาที — ถ้ารอรอบเดียวต่อชั่วโมงอาจข้ามเวลาเป้าหมาย; สคริปต์ guard ด้วย lastPushDate กันส่งซ้ำ) หรือกด Actions → Send daily word notification → Run workflow เพื่อเทสต์
5. ทดสอบ local: `node tools/notify-daily.js --dry-run`

## Endpoint (เมื่ออัปเกรดเป็น Blaze)

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
- `users/{uid}`: `{ displayName, pushEnabled, fcmTokens[], reminderTime, timezone, updatedAt }`
- Token ที่ FCM บอกว่า invalid จะถูกลบออกอัตโนมัติตอนส่งรอบถัดไป (ใน `sendDailyWordNotification`)
