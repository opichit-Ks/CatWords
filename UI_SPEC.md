# CatWords — High-fidelity UI Specification v1.0

เอกสารนี้แปลง User Flow และ Design System ให้เป็นข้อกำหนดระดับหน้าจอสำหรับการพัฒนา UI จริง

## Screen map

| Screen | ผู้ใช้ต้องทำอะไร | Mascot | Primary action |
|---|---|---|---|
| Welcome | เข้าใจแนวคิดของ CatWords | Mochi | เริ่มต้นใช้งาน |
| Sign in | เข้าสู่ระบบ | Mochi | เข้าสู่ระบบ |
| Dashboard | เห็นภารกิจวันนี้และสถานะ | Mochi | เริ่มเรียนวันนี้ |
| Daily Lesson | เรียนคำศัพท์ 5 คำ | Mochi | เข้าใจแล้ว / คำถัดไป |
| Daily Quiz | ทบทวนคำศัพท์ | Mochi | เลือกคำตอบ |
| Progress | ดู streak, XP และ achievement | Nova | ดูรายละเอียด |
| Collection | สำรวจแก๊ง CatWords | ทุกตัวละคร | ดูตัวละคร |
| Character detail | รู้จักบทบาทครู | ตัวละครที่เลือก | เริ่มบทเรียน |
| Settings | จัดการบัญชีและการแสดงผล | Loffy | บันทึกการตั้งค่า |

## Dashboard layout

1. Header: greeting, notification และ profile
2. Welcome row: วันที่, ชื่อผู้ใช้ และ streak
3. Daily mission hero: จำนวนคำ, คำอธิบายสั้น และ CTA หลัก
4. Today overview: XP, Fish Coins และบทเรียนสำเร็จ
5. Meowville districts: Academy Hall เป็น active district ส่วนที่เหลือแสดง unlock state

CTA หลักต้องอยู่เหนือ fold บน mobile และ desktop

## Daily Lesson layout

- Progress: “คำที่ n จาก 5” พร้อม progress bar
- Word focus: icon, word, phonetic และ audio button
- Meaning card: ความหมายภาษาไทย
- Example card: ประโยคภาษาอังกฤษและคำแปล
- Footer actions: ย้อนกลับ และ เข้าใจแล้ว
- Coach panel: Mochi quote บน desktop; ซ่อนได้บน mobile เพื่อรักษาพื้นที่อ่าน

## Quiz interaction

- หนึ่งคำถามต่อหนึ่งหน้าจอ
- มีคำตอบ 3 ตัวเลือก
- เมื่อเลือกแล้ว lock คำตอบและแสดง feedback
- ใช้ success state สี mint และ wrong state สี coral พร้อมคำอธิบายสั้น
- ผลลัพธ์แสดงคะแนน, XP และ Fish Coins ก่อนกลับ Dashboard

## Responsive behavior

### Desktop ≥ 901px

- Sidebar กว้างประมาณ 250px
- Lesson ใช้สองคอลัมน์: content และ coach panel
- Stats และ district ใช้ grid หลายคอลัมน์

### Tablet 651–900px

- Sidebar แคบลงและ grid ลดจำนวนคอลัมน์
- รักษา hero และ content width ให้มีพื้นที่หายใจ

### Mobile ≤ 650px

- ซ่อน sidebar ใช้ compact header และ mobile navigation
- ทุกหน้าหลักเป็น single column
- ลด illustration ให้ไม่บังข้อความ
- ปุ่ม action หลักต้องกดได้ง่ายด้วยมือเดียว

## Motion

- Card hover: ยกขึ้นเล็กน้อย 2–3px
- Completion: แสดง toast หรือ mascot reaction สั้น ๆ
- Page transition: fade/slide ขนาดเล็ก
- เคารพ `prefers-reduced-motion` และไม่ใช้ animation เป็นข้อมูลเพียงอย่างเดียว

## UI acceptance checklist

- ผู้ใช้เห็นภารกิจหลักได้ทันทีเมื่อเปิด Dashboard
- ผู้ใช้รู้เสมอว่าตนอยู่ขั้นตอนใดของบทเรียน
- ทุก action มีผลตอบกลับที่มองเห็นได้
- หน้าจอไม่พึ่งพาสีอย่างเดียวในการสื่อสถานะ
- Layout อ่านได้บนหน้าจอมือถือโดยไม่ต้อง zoom
