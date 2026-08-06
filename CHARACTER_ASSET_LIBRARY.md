# CatWords Character Asset Library

## Master reference

ไฟล์อ้างอิงหลักของแก๊ง CatWords อยู่ที่:

`public/assets/characters/catwords-character-master-sheet.png`

ภาพนี้เป็น source of truth สำหรับหน้าตา สัดส่วน โทนสี เครื่องแต่งกาย และบุคลิกของ Mochi, Doctor Paws, Chef Momo, Pixel, Captain Whiskers, Professor Ink, Luna, Nova และ Loffy

## Current asset

| Asset | Path | Usage |
|---|---|---|
| Character Master Sheet | `public/assets/characters/catwords-character-master-sheet.png` | Design reference, collection overview, review with designer |

## Production asset plan

เมื่อเริ่มแยกภาพสำหรับใช้งานจริง ให้ใช้โครงสร้างนี้:

```text
public/assets/characters/
  master/
  avatars/
  full-body/
  poses/
  expressions/
  stickers/
  seasonal/
```

## Naming convention

`{character}_{asset-type}_{pose-or-expression}_{variant}.{ext}`

ตัวอย่าง:

- `mochi_avatar_happy_default.webp`
- `loffy_fullbody_serious_default.webp`
- `loffy_pose_advice_default.webp`
- `mochi_expression_cheering_default.webp`

## Character usage map

- Mochi: Dashboard hero, onboarding, lesson coach, empty states
- Doctor Paws: Medical district and medical vocabulary
- Chef Momo: Restaurant district and food vocabulary
- Pixel: Technology Lab and AI vocabulary
- Captain Whiskers: Airport district and travel vocabulary
- Professor Ink: Reading, grammar and library states
- Luna: Creative vocabulary and celebration states
- Nova: Science district and progress insights
- Loffy: Law & Citizenship, policy notices and serious-but-cute guidance

## Usage rules

- ห้ามยืดหรือบีบสัดส่วนตัวละคร
- รักษาขอบโปร่งใสเมื่อ export เป็น asset แยก
- ใช้ภาพในขนาดที่คมชัดและสร้าง responsive variant เมื่อจำเป็น
- ห้ามเปลี่ยนสีขน เครื่องแต่งกาย หรืออุปกรณ์ประจำตัวโดยไม่มีการอัปเดต Character Bible
- ภาพ master sheet ใช้สำหรับอ้างอิงและ collection overview; UI production ควรใช้ asset แยกเมื่อพร้อม
