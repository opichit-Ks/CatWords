# CatWords — System Architecture v1.0

## Architecture goals

- แยก UI, domain logic และ data access เพื่อดูแลระยะยาวได้ง่าย
- ใช้ Firebase เป็น managed backend สำหรับ MVP
- ป้องกันข้อมูลผู้ใช้ด้วย Authentication และ Firestore Security Rules
- ออกแบบให้เริ่มจาก local prototype แล้วต่อ backend ได้โดยไม่ต้องรื้อ UI

## Runtime layers

```text
Browser / PWA
  ├─ Presentation: screens, components, design tokens
  ├─ Application: lesson, quiz, progress and reward use cases
  ├─ Domain: vocabulary, lesson, streak, XP and achievement rules
  └─ Data: Firebase repositories and local cache

Firebase
  ├─ Authentication
  ├─ Cloud Firestore
  ├─ Cloud Storage
  ├─ Cloud Functions
  └─ Hosting / Analytics / Remote Config
```

## Frontend boundaries

เมื่อเปลี่ยนจาก static prototype ไป framework ให้แบ่งโครงสร้างดังนี้:

```text
src/
  app/                 routes and layouts
  components/          reusable UI and mascot components
  features/
    auth/              sign in and onboarding
    lessons/           daily lesson and vocabulary cards
    quiz/              questions, answers and results
    progress/          XP, streak and achievements
    collection/        characters and districts
  domain/              pure business rules and types
  lib/                 firebase client, analytics and utilities
```

## Firestore collections

### `users/{userId}`

```text
displayName, email, level, xp, fishCoins, currentStreak,
longestStreak, createdAt, updatedAt
```

### `users/{userId}/dailyProgress/{date}`

```text
lessonId, wordsCompleted, quizScore, xpEarned,
coinsEarned, completedAt, lastActivityAt
```

### `vocabulary/{wordId}`

```text
word, phonetic, partOfSpeech, thaiMeaning,
exampleSentence, exampleThai, level, category, audioPath
```

### `lessons/{lessonId}`

```text
date, level, wordIds[], readingText, status
```

### `achievements/{achievementId}`

```text
title, description, icon, requirementType, requirementValue
```

## Authentication

MVP รองรับ email/password เป็นหลัก การสร้าง user profile ต้องเกิดหลัง authentication สำเร็จ และไม่เก็บ password ใน Firestore

## Security rules principles

- ผู้ใช้ read/write ได้เฉพาะ `users/{ตัวเอง}` และ subcollections ของตัวเอง
- Vocabulary, lessons และ achievements เป็น read-only สำหรับ client
- การมอบ XP, Fish Coins และ achievement ที่เชื่อถือได้ควรตรวจผ่าน Cloud Functions
- ห้ามให้ client เขียนยอดสะสมโดยตรงใน production
- Storage จำกัดการเขียนไว้ที่ไฟล์ของ user หรือ administrator ที่ได้รับสิทธิ์

## Cloud Functions candidates

- `completeDailyLesson`: ตรวจ completion และคำนวณ reward
- `submitDailyQuiz`: ตรวจคำตอบและบันทึก score
- `updateStreak`: คำนวณ streak ตาม timezone ของผู้ใช้
- `grantAchievement`: ตรวจเงื่อนไขและมอบ achievement

## Storage structure

```text
characters/{characterId}/avatar.webp
characters/{characterId}/poses/{poseId}.webp
audio/vocabulary/{wordId}.mp3
users/{userId}/avatars/{fileName}
```

## Environment configuration

ห้าม commit secret หรือ private key ลง GitHub ใช้ `.env.local` ในเครื่อง และเก็บเฉพาะตัวอย่างชื่อค่าใน `.env.example` เช่น Firebase public client config, project ID และ API endpoint

## Migration from current prototype

1. คง UI และ interaction ปัจจุบันไว้เป็น presentation layer
2. ย้าย vocabulary array ไปเป็น typed domain model
3. แยก localStorage เป็น `LocalProgressRepository`
4. สร้าง `FirebaseProgressRepository` ที่ใช้ interface เดียวกัน
5. เพิ่ม Authentication ก่อนเปิดใช้ข้อมูลส่วนตัว
6. ย้าย reward calculation ไป Cloud Functions ก่อน production

## Observability

เก็บ event ที่ไม่เป็นข้อมูลส่วนตัว เช่น `lesson_started`, `word_completed`, `quiz_completed`, `streak_continued` และติดตาม error สำคัญโดยไม่บันทึกคำตอบหรือข้อมูลส่วนตัวเกินจำเป็น
