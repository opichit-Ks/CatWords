# Mochi — Character Master v1.0

## Role

Mochi คือ Head Teacher และหัวใจของ CatWords Academy ใช้ต้อนรับผู้ใช้ สอน Daily Lesson ให้กำลังใจ และอธิบายสถานะของระบบใน Dashboard, Lesson, Quiz, Achievement และ Notification

## Visual identity

- แมวสี cream และ warm orange
- หัวใหญ่ ตัวเล็ก ดวงตากลมโต อุ้งเท้ากลม
- ชุดครูโทน cream/beige
- โบว์สีน้ำตาลเป็น accessory หลัก
- หางฟูนุ่มและมีท่าทางเป็นมิตร
- silhouette ต้องอ่านออกได้แม้ใน avatar ขนาดเล็ก

## Master asset

`public/assets/characters/mochi/mochi-character-master-sheet.png`

ภายในประกอบด้วย front, side, back, color palette, expressions และ poses สำหรับใช้เป็น production reference รุ่นแรก

## Color palette

| Token | Hex | Usage |
|---|---|---|
| Fur Light | `#FFF0D5` | ขนส่วนสว่าง |
| Fur Warm | `#F2D5A8` | ขนหลัก |
| Fur Accent | `#F7B46C` | ลายและ highlight |
| Inner Ear | `#F5A999` | ด้านในหู |
| Eyes / Bow | `#5D3724` | ดวงตา โบว์ และรองเท้า |
| Outfit Cream | `#F5E5C8` | ชุดครู |
| Shadow | `#CBBDAE` | เงานุ่ม |

## Approved expressions

Happy, Laughing, Thinking, Surprised, Proud, Sleepy และ Encouraging

## Approved poses

Waving, Pointing at Board, Holding Book, Holding Fish Coin และ Celebrating

## UI usage

- Dashboard hero: full-body waving หรือ encouraging
- Daily Lesson coach: pointing at board หรือ holding book
- Quiz result: celebrating
- Empty/loading state: thinking หรือ sleepy
- Achievement: holding Fish Coin หรือ proud
- Mobile avatar: happy face crop แบบ circle

## Animation direction

เริ่มต้นด้วย blink, tail sway, breathing, wave และ reward bounce โดยต้องเคลื่อนไหวสั้น นุ่ม และไม่รบกวนการอ่าน

## Acceptance criteria

- Mochi ดูเป็นตัวเดียวกันในทุกมุมและทุก expression
- สีและ accessory ตรงกับ master sheet
- มีพื้นที่ปลอดภัยรอบตัวละครเมื่อใช้ใน card หรือ hero
- สามารถนำไปแตกเป็น avatar, pose และ sticker asset ได้โดยไม่สูญเสียเอกลักษณ์
