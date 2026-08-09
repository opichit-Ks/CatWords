# CatWords — Content Library & Reuse Strategy v1.0

## Objective

คำศัพท์และ Quiz ที่สร้างโดย AI ต้องถูกจัดเก็บเป็นเนื้อหากลางของระบบ ไม่สร้างซ้ำให้ผู้ใช้แต่ละคนโดยไม่จำเป็น ผู้ใช้หลายคนสามารถเรียนจากชุดเนื้อหาเดียวกันได้ และระบบจะเรียก AI เมื่อคลังเนื้อหาที่เหมาะสมเริ่มไม่เพียงพอเท่านั้น

## Content layers

### Vocabulary library

เก็บคำศัพท์ทุกคำที่เคยสร้างหรืออนุมัติแล้ว พร้อม:

```text
word, phonetic, partOfSpeech, thaiMeaning,
exampleSentence, exampleThai, level, category,
synonyms, usageNotes, audioPath, source,
contentVersion, status, createdAt, updatedAt
```

### Quiz library

Quiz ทุกข้อที่สัมพันธ์กับคำศัพท์ต้องเก็บแยกเป็น document และอ้างอิง `vocabularyId`:

```text
type, question, options[], correctAnswer,
explanation, vocabularyIds[], level, category,
contentVersion, status, createdAt
```

รองรับ question types เช่น multiple choice, matching, fill in the blank และ true/false

### Lesson sets

บทเรียนประจำวันเป็นชุดที่ประกอบจากคำศัพท์ที่มีอยู่แล้ว:

```text
lessonId, date, level, category, vocabularyIds[], quizIds[], status
```

## Reuse rules

1. ตรวจคำศัพท์ซ้ำด้วย normalized word และความหมายหลัก
2. ตรวจระดับและหมวดหมู่ให้ตรงกับผู้ใช้ก่อนนำกลับมาใช้
3. หลีกเลี่ยงการส่งคำเดิมให้ผู้ใช้คนเดิมเร็วเกินไป โดยอ้างอิงประวัติการเรียน
4. ผู้ใช้หลายคนใช้ content document เดียวกันได้ แต่ progress และ score ต้องแยกอยู่ใต้ user ของแต่ละคน
5. เมื่อคำศัพท์หรือ Quiz ถูกแก้ไข ให้เพิ่ม `contentVersion` แทนการเขียนทับข้อมูลเดิม

## AI generation policy

AI ไม่ควรถูกเรียกทุกครั้งที่มีผู้ใช้ใหม่เข้าระบบ ลำดับการทำงานคือ:

```text
Request lesson
  → Search approved reusable content
  → Filter by level/category/learner history
  → Compose 5-word lesson and quiz
  → If inventory is below threshold, enqueue generation job
  → Validate generated content
  → Save approved content to library
  → Make it available for future users
```

## Inventory thresholds

ระบบควรตรวจคลังแยกตาม `level + category` เช่น:

- Healthy: มีคำที่ยังไม่เคยใช้เพียงพอ
- Low: ต่ำกว่า threshold ให้สร้างงานเตรียมล่วงหน้า
- Empty: ไม่มีชุดที่ผ่านเงื่อนไข ต้องเรียก generation job ก่อนจัดบทเรียน

การสร้างล่วงหน้าควรทำผ่าน background job ไม่ทำให้ผู้ใช้ต้องรอ AI โดยตรงในหน้าเรียน

## Validation pipeline

เนื้อหาที่ AI สร้างต้องผ่าน:

1. schema validation
2. duplicate detection
3. language/translation quality check
4. level and category check
5. profanity and unsafe-content check
6. optional editorial review
7. status transition: `draft → validated → approved → archived`

เนื้อหา `draft` หรือ `rejected` ห้ามนำไปแสดงแก่ผู้ใช้

## Recommended Firestore collections

```text
contentVocabulary/{vocabularyId}
contentQuiz/{quizId}
contentLessons/{lessonId}
contentGenerationJobs/{jobId}
users/{userId}/learningHistory/{historyId}
users/{userId}/dailyProgress/{date}
```

## Benefits

- ลดค่าใช้จ่ายและ latency จากการเรียก AI ซ้ำ
- ผู้ใช้ใหม่เริ่มเรียนได้ทันทีจากคลังที่เตรียมไว้
- คุณภาพคำศัพท์สม่ำเสมอและตรวจสอบย้อนหลังได้
- รองรับผู้ใช้จำนวนมากโดยแยก shared content ออกจาก personal progress
- สามารถนำเนื้อหาเดิมกลับมาทำ SRS และ spaced repetition ในอนาคต
