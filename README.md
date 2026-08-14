# CatWords Academy 🐱

เรียนภาษาอังกฤษวันละ 5 คำ ไปกับแก๊งน้องแมวผู้เป็นครู — สนุก ไม่กดดัน และทำต่อเนื่องได้จริง

## 🌍 Live site

<https://opichit-Ks.github.io/CatWords/>

## ✨ Features

- Daily Lesson 5 คำ/วัน + Daily Quiz พร้อมเสียงออกเสียง (US/UK) ผ่าน Web Speech API
- คลังเนื้อหา 6 หมวด (daily-life, restaurant, travel, medical, law, science) หมุนเวียนตามวันที่
- ระบบ XP, Fish Coins, Daily Streak, Achievement และตัวละครปลดล็อกตาม Level
- แผนที่ย่าน Meowville + คอลเลกชันครูทั้ง 9 คน พร้อมภาพ portrait จริง
- Onboarding เลือกระดับการเรียน, Settings (ธีมสว่าง/มืด, เสียง, รีเซ็ตข้อมูล)
- Mobile-first, responsive, PWA-ready

## 🛠️ Dev

```bash
npm install        # ติดตั้ง dependencies (Tailwind)
npm run serve      # รัน local server ที่ http://127.0.0.1:8000
npm run buildCss   # build Tailwind (เมื่อใช้งานในอนาคต)
```

โครงสร้าง: หน้า HTML อยู่ที่ root, สไตล์กลางที่ `data/catwords.css`, เนื้อหาบทเรียนที่ `data/content-library.json`, ข้อมูลตัวละครที่ `data/characters.js`, ข้อมูลผู้เรียนเก็บใน localStorage (`catwords-mvp-progress`, `catwords-settings`)

## 🚀 Deploy

Push ไปที่ branch `main` — GitHub Pages จะ deploy อัตโนมัติจาก root ของ repo

## 📚 Docs

ดู `PROJECT_BIBLE.md`, `DESIGN_SYSTEM.md`, `UI_SPEC.md`, `USER_FLOWS.md`, `SYSTEM_ARCHITECTURE.md` สำหรับวิสัยทัศน์และสถาปัตยกรรม
