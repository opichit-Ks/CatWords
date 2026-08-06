# CatWords — User Flows v1.0

เอกสารนี้กำหนดเส้นทางการใช้งานหลักของ CatWords Academy เพื่อใช้เป็นข้อกำหนดก่อนทำ High-fidelity UI และเชื่อมระบบจริง

## 1. First visit / Onboarding

```text
Landing → Welcome by Mochi → Create account / Sign in → Choose learning level → Academy Hall
```

- ผู้ใช้เห็นแนวคิด “5 New Words. Every Day.” และ Mochi เป็นผู้ต้อนรับ
- สมัครด้วย email/password หรือช่องทางที่ระบบรองรับในอนาคต
- เลือกระดับเริ่มต้น: Easy, Intermediate หรือ Advanced
- ระบบพาเข้าสู่ Academy Hall และแสดงภารกิจวันนี้

## 2. Daily lesson

```text
Dashboard → Start today's lesson → Word 1 → Word 2 → Word 3 → Word 4 → Word 5 → Lesson summary
```

แต่ละคำต้องมี:

- คำศัพท์และชนิดของคำ
- pronunciation และปุ่มฟังเสียง
- ความหมายภาษาไทย
- ตัวอย่างประโยค
- ปุ่ม “เข้าใจแล้ว” และย้อนกลับได้

เมื่อเรียนครบ 5 คำ ระบบแสดง XP ที่ได้รับ, จำนวนคำสะสม และปุ่มไปทำ Daily Quiz

## 3. Daily quiz

```text
Lesson summary → Start quiz → Question 1–5 → Result → Claim reward → Dashboard
```

- Quiz ใช้คำศัพท์จากบทเรียนวันนั้น
- แสดงความคืบหน้าและ feedback ที่ให้กำลังใจ
- ผลลัพธ์แสดงคะแนน จำนวน XP และ Fish Coins
- ผู้ใช้กลับไป Dashboard ได้เสมอ

## 4. Progress and streak

```text
Dashboard → Progress → Weekly summary / XP / Streak / Achievements
```

- แสดงวันที่เรียนในสัปดาห์ปัจจุบัน
- แสดง XP รวม, จำนวนคำศัพท์ และ Daily Streak
- แสดง achievement ที่ได้รับและรายการที่กำลังปลดล็อก
- ข้อมูลต้องอ่านง่ายทั้งบน desktop และ mobile

## 5. Cat collection

```text
Dashboard → Collection → Select a cat → Character detail
```

- แสดงครูและเพื่อนร่วมทางทั้งหมด
- ตัวละครที่พร้อมใช้งานแสดงบทบาทและหมวดการเรียน
- ตัวละครที่ยังไม่ปลดล็อกแสดงเงื่อนไขอย่างชัดเจน
- Loffy อยู่ในหมวด Law & Citizenship และใช้โทน serious-but-cute

## 6. Returning user

```text
Open CatWords → Sign in session → Dashboard → Resume today's mission
```

- หากมีบทเรียนค้าง ให้แสดงปุ่ม Resume
- หากเรียนครบแล้ว ให้แสดง streak และภารกิจถัดไป
- หน้าแรกต้องทำให้ผู้ใช้เข้าใจ action หลักได้ภายในไม่กี่วินาที

## 7. Navigation model

### Desktop

Sidebar: Home, Learn, Progress, Collection, Settings

### Mobile

Compact header และ navigation ที่เข้าถึง Home, Learn, Progress และ Collection ได้ตลอดเวลา

## 8. System states

- Loading: แสดง skeleton หรือ Mochi พร้อมข้อความสั้น ๆ
- Empty: แสดงคำแนะนำถัดไปพร้อม mascot
- Success: แสดง reward และ motion ขนาดเล็ก
- Error: อธิบายสาเหตุและวิธีลองใหม่โดยไม่ใช้ภาษาตำหนิ
- Offline: แจ้งสถานะอย่างชัดเจนและรักษาความคืบหน้าที่บันทึกไว้แล้ว

## 9. Completion criteria

User Flow รุ่นนี้ถือว่าครบเมื่อผู้ใช้สามารถ:

1. เข้าใช้งานและเห็น Dashboard
2. เรียนคำศัพท์ครบ 5 คำ
3. รับ feedback และรางวัล
4. ดู streak และ progress
5. เปิดดู CatWords Family และ Loffy ได้
