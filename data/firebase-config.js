// Firebase client configuration — ค่าจาก Firebase Console (Project settings → Your apps → Web app)
// ค่าเหล่านี้เป็น PUBLIC (เผยแพร่ได้ตามดีไซน์ของ Firebase) — ห้ามใส่ secret เด็ดขาด
// เก็บไว้ใน globalThis เพื่อให้ใช้ได้ทั้งในหน้าเว็บ (window) และ service worker (self)

globalThis.CatWordsFirebaseConfig = {
  apiKey: 'AIzaSyAVtrGcM3YeFBxz0NPLiETEBcoOOMSdsHg',
  authDomain: 'catwords.firebaseapp.com',
  projectId: 'catwords',
  storageBucket: 'catwords.firebasestorage.app',
  messagingSenderId: '660626339329',
  appId: '1:660626339329:web:e9e6e8fc27c7bb3a3af200',
  measurementId: 'G-WK6M8YTTER',

  // ⚠️ ยังต้องกรอก — ไปที่ Firebase Console → Cloud Messaging → Web configuration
  // → ก๊อปค่า "Web push certificates > Key pair" มาใส่ตรงนี้ (ต้องมีถึงจะส่ง Web Push ได้)
  vapidKey: 'BJcMz8GK66WN-BvfY-X7HZBbuXNAvqhqcSzske1iF-pbdDEUqECN19Z_qh-fwdTgUhfZdUHKKLEGXlOMLooBGuY'
};
