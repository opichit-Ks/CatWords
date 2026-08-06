# CatWords — Firebase Integration Setup

## Prerequisites

- Firebase project 1 project สำหรับ development
- เปิด Authentication และ provider ที่ต้องการ
- เปิด Cloud Firestore ใน production mode
- เปิด Storage เมื่อเริ่มใช้ audio/character assets
- ติดตั้ง Firebase SDK ใน frontend framework ที่เลือก

## Required services

### Authentication

เปิด Email/Password สำหรับ MVP และกำหนด authorized domains ให้ตรงกับ localhost และ GitHub Pages/Hosting ที่ใช้งานจริง

### Firestore

เริ่มจาก collections ใน `SYSTEM_ARCHITECTURE.md` และ seed vocabulary/lessons ผ่าน admin-only script ไม่ให้ผู้ใช้ทั่วไปเขียนเนื้อหาหลัก

### Storage

ใช้เก็บ character assets และเสียงคำศัพท์ แยก public read assets ออกจาก private user uploads

## Environment variables

คัดลอก `.env.example` เป็น `.env.local` แล้วเติมค่าจาก Firebase Console ห้าม commit `.env.local`

## Integration order

1. สร้าง typed Firebase client และตรวจสอบ environment ตอน startup
2. ทำ Auth state provider และ protected app shell
3. สร้าง repository interface สำหรับ user profile และ daily progress
4. เชื่อม Dashboard กับ user profile และ progress จริง
5. เชื่อม vocabulary/lesson read path
6. ส่งผล quiz ผ่าน trusted backend function ก่อนมอบ reward
7. เพิ่ม offline cache และ retry สำหรับการเชื่อมต่อที่ไม่เสถียร

## Local development checklist

- ใช้ Firebase Emulator Suite สำหรับ Auth/Firestore ก่อน production
- ไม่ใช้ production data ในการทดสอบ
- ตรวจ rules ด้วย test user อย่างน้อย 2 บัญชี
- ทดสอบ sign in, sign out, refresh session และ permission denied

## Release checklist

- ตรวจว่าไม่มี `.env.local`, token หรือ private key ใน Git
- Deploy rules และ indexes แยกจาก frontend
- ตั้ง Firebase App Check เมื่อระบบเริ่มรับผู้ใช้จริง
- ตรวจ authorized domains และ CORS
- ตรวจ backup/export policy ของ Firestore
