# CatWords — Design System v1.0

## Design principles

1. Cozy first — ลดความเครียดด้วยพื้นที่ว่าง สีอุ่น และภาษาที่เป็นมิตร
2. Clear learning — เนื้อหาคำศัพท์ต้องเด่นและอ่านง่าย
3. Soft delight — ใช้ภาพแมวและ micro-interaction เพื่อให้รางวัลผู้ใช้
4. Consistent world — ทุก component ต้องดูเหมือนอยู่ใน CatWords Academy เดียวกัน

## Color tokens

### Light theme

| Token | Value | ใช้สำหรับ |
|---|---|---|
| `--color-bg` | `#FBFAF7` | พื้นหลังหลัก |
| `--color-surface` | `#FFFFFF` | card และ panel |
| `--color-ink` | `#263238` | ข้อความหลัก |
| `--color-muted` | `#849099` | ข้อความรอง |
| `--color-primary` | `#F59B68` | ปุ่มหลักและ highlight |
| `--color-primary-soft` | `#FFF0E7` | พื้นหลัง orange อ่อน |
| `--color-sky` | `#8CC7DB` | หมวด travel และ info |
| `--color-mint` | `#A9D8C7` | success และ health |
| `--color-yellow` | `#F7D88B` | streak และ reward |
| `--color-coral` | `#E87D70` | error/danger |
| `--color-line` | `#EDF0EF` | border และ divider |

### Dark theme direction

ใช้พื้นหลัง `#1E2729`, surface `#263436`, ink `#F7F4EC`, muted `#AAB8B6` และลดความสว่างของ primary ให้อ่านง่ายโดยไม่ทำลายความอบอุ่นของแบรนด์

## Typography

- English display/body: Poppins, weights 500–800
- Thai display/body: Anuphan, weights 400–700
- Heading: หนา ชัด แต่ไม่ใช้ตัวพิมพ์ใหญ่ทั้งประโยค
- Body: 14–16px บน desktop, 14px บน mobile
- Caption/metadata: 10–12px และใช้สี muted

## Spacing and shape

- Base spacing: 4px
- ระยะหลัก: 8, 12, 16, 24, 32, 48px
- Card radius: 16–22px
- Button radius: 10–12px
- Avatar/mascot circle: 50%
- Shadow: นุ่มและจาง เช่น `0 16px 36px rgba(55,47,38,.08)`

## Components

### Button

- Primary: dark ink background, white text, มี arrow หรือ icon เมื่อเป็น action หลัก
- Secondary: white/transparent พร้อม border สี line
- Text button: ไม่มีพื้นหลัง ใช้ primary color
- ความสูงมาตรฐาน 40–44px และมีพื้นที่กดอย่างน้อย 44px บน mobile

### Card

พื้นผิวขาวบน warm background, border บาง, shadow เบา, padding 16–28px ใช้ card เพื่อจัดกลุ่มข้อมูล ไม่ใช้ card ซ้อนหลายชั้นโดยไม่จำเป็น

### Progress

แสดง label และตัวเลขคู่กัน เส้น progress สูง 5–8px ปลายมน สีตามหมวด และมี feedback ที่ชัดเจนเมื่อทำสำเร็จ

### Mascot panel

ใช้ภาพน้องแมวในพื้นที่ที่ช่วยอธิบายหรือให้กำลังใจ ไม่วางทับข้อความสำคัญ และต้องมี alt text/คำอธิบายสำหรับ accessibility

### Navigation

Desktop ใช้ sidebar, mobile ใช้ bottom navigation หรือ compact menu รายการหลักคือ Home, Learn, Progress และ Collection

## Content tone

ใช้ประโยคสั้น อบอุ่น ให้กำลังใจ และไม่ทำให้รู้สึกผิด เช่น “ค่อย ๆ ไปทีละคำก็เก่งขึ้นได้” หลีกเลี่ยงคำว่า “ผิด”, “ช้า”, “ต้องทำให้ได้” ในข้อความทั่วไป

## Accessibility baseline

- contrast ของข้อความต้องอ่านได้ใน Light/Dark mode
- ทุกปุ่มต้องมี accessible label เมื่อใช้ icon อย่างเดียว
- ไม่ใช้สีเป็นตัวบอกสถานะเพียงอย่างเดียว
- รองรับ keyboard focus และ reduced motion
- ภาพ character ที่มีความหมายต้องมี alt text
