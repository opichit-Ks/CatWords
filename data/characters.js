// CatWords Family roster — display data only (unlock logic lives in the pages).
(function (global) {
  const CHARACTERS = [
    {
      slug: 'mochi',
      name: 'Mochi',
      role: 'Head Teacher',
      category: 'English ทั่วไป',
      emoji: '🐱',
      color: 'peach',
      unlockLevel: 1,
      bio: 'หัวหน้าครูใจดี ร่าเริง และคอยให้กำลังใจทุกคน เรียนวันละ 5 คำไปกับ Mochi แล้วคุณจะเก่งขึ้นทุกวัน',
      favorite: '🍣 Sushi',
      pose: 'public/assets/characters/mochi/poses/mochi-holding-book.png',
      portrait: 'public/assets/characters/mochi/poses/mochi-wave.png'
    },
    {
      slug: 'doctor-paws',
      name: 'Doctor Paws',
      role: 'Medical English',
      category: 'หมวดสุขภาพ',
      emoji: '🩺',
      color: 'mint',
      unlockLevel: 2,
      bio: 'ครูแพทย์สุขุม อ่อนโยน และน่าเชื่อถือ พาเราเรียนคำศัพท์เกี่ยวกับสุขภาพและการดูแลตัวเอง',
      favorite: '🩹 Bandage',
      pose: 'public/assets/characters/doctor-paws/poses/doctor-paws-checkup.png',
      portrait: 'public/assets/characters/doctor-paws/poses/doctor-paws-wave.png'
    },
    {
      slug: 'chef-momo',
      name: 'Chef Momo',
      role: 'Restaurant English',
      category: 'หมวดอาหาร',
      emoji: '🍳',
      color: 'peach',
      unlockLevel: 3,
      bio: 'เชฟจอมซน สดใส ทำอาหารเก่ง กินเก่ง และชอบชวนทุกคนมาทำอาหารด้วยกัน',
      favorite: '🍣 Sushi',
      pose: 'public/assets/characters/chef-momo/portrait.png',
      portrait: 'public/assets/characters/chef-momo/portrait.png'
    },
    {
      slug: 'pixel',
      name: 'Pixel',
      role: 'Technology & AI',
      category: 'หมวดเทคโนโลยี',
      emoji: '💻',
      color: 'lav',
      unlockLevel: 4,
      bio: 'นักประดิษฐ์ตัวน้อย ชอบเทคโนโลยีและการเขียนโค้ด อยากสร้างสิ่งใหม่ ๆ เสมอ',
      favorite: '⚡ Electric Fish',
      pose: 'public/assets/characters/pixel/portrait.png',
      portrait: 'public/assets/characters/pixel/portrait.png'
    },
    {
      slug: 'captain-whiskers',
      name: 'Captain Whiskers',
      role: 'Travel English',
      category: 'หมวดท่องเที่ยว',
      emoji: '✈️',
      color: 'mint',
      unlockLevel: 5,
      bio: 'กัปตันนักผจญภัย มั่นใจ และอบอุ่น พาเราเรียนรู้คำศัพท์สำหรับการเดินทางรอบโลก',
      favorite: '🧳 Suitcase',
      pose: 'public/assets/characters/captain-whiskers/portrait.png',
      portrait: 'public/assets/characters/captain-whiskers/portrait.png'
    },
    {
      slug: 'professor-ink',
      name: 'Professor Ink',
      role: 'Reading & Grammar',
      category: 'หมวดการอ่าน',
      emoji: '📚',
      color: 'lav',
      unlockLevel: 6,
      bio: 'ครูห้องสมุดผู้รอบรู้ ชอบหนังสือ ไวยากรณ์ และการอ่านเรื่องยาว ๆ เงียบ ๆ',
      favorite: '📖 Old Book',
      pose: 'public/assets/characters/professor-ink/portrait.png',
      portrait: 'public/assets/characters/professor-ink/portrait.png'
    },
    {
      slug: 'luna',
      name: 'Luna',
      role: 'Creative Vocabulary',
      category: 'หมวดศิลปะ',
      emoji: '🎨',
      color: 'lav',
      unlockLevel: 7,
      bio: 'ครูศิลปะช่างฝัน ใช้สีและจินตนาการเปลี่ยนคำศัพท์ธรรมดาให้กลายเป็นเรื่องราวสนุก ๆ',
      favorite: '🎨 Paint Palette',
      pose: 'public/assets/characters/luna/portrait.png',
      portrait: 'public/assets/characters/luna/portrait.png'
    },
    {
      slug: 'nova',
      name: 'Nova',
      role: 'Science English',
      category: 'หมวดวิทยาศาสตร์',
      emoji: '🔬',
      color: 'mint',
      unlockLevel: 8,
      bio: 'ครูวิทยาศาสตร์ผู้อยากรู้อยากเห็น ชอบทดลองและค้นพบสิ่งใหม่ ๆ ในห้องแล็บ',
      favorite: '🧪 Test Tube',
      pose: 'public/assets/characters/nova/portrait.png',
      portrait: 'public/assets/characters/nova/portrait.png'
    },
    {
      slug: 'loffy',
      name: 'Loffy',
      role: 'Law & Citizenship',
      category: 'หมวดกฎหมาย',
      emoji: '⚖️',
      color: 'peach',
      unlockLevel: 9,
      bio: 'ครูฝ่ายปกครอง เข้มแข็ง ยุติธรรม และรู้กฎหมาย จริงจังแบบน่ารัก คอยดูแลให้ทุกคนเล่นด้วยกันอย่างเป็นธรรม',
      favorite: '⚖️ Scales',
      pose: 'public/assets/characters/loffy/portrait.png',
      portrait: 'public/assets/characters/loffy/portrait.png'
    }
  ];

  const get = (slug) => CHARACTERS.find((character) => character.slug === slug) || null;
  const list = () => CHARACTERS.slice();

  // Meowville districts (dashboard map)
  const DISTRICTS = [
    { slug: 'academy-hall', name: 'Academy Hall', icon: '🏛️', teacher: 'Mochi', unlockLevel: 1, note: 'จุดเริ่มต้น' },
    { slug: 'restaurant', name: 'Restaurant', icon: '🍜', teacher: 'Chef Momo', unlockLevel: 3, note: 'หมวดอาหาร' },
    { slug: 'hospital', name: 'Hospital', icon: '🏥', teacher: 'Doctor Paws', unlockLevel: 2, note: 'หมวดสุขภาพ' },
    { slug: 'library', name: 'Library', icon: '📚', teacher: 'Professor Ink', unlockLevel: 6, note: 'หมวดการอ่าน' },
    { slug: 'airport', name: 'Airport', icon: '✈️', teacher: 'Captain Whiskers', unlockLevel: 5, note: 'หมวดท่องเที่ยว' },
    { slug: 'tech-lab', name: 'Technology Lab', icon: '💻', teacher: 'Pixel', unlockLevel: 4, note: 'หมวดเทคโนโลยี' },
    { slug: 'business-center', name: 'Business Center', icon: '🏢', teacher: 'Loffy', unlockLevel: 9, note: 'หมวดกฎหมาย' }
  ];

  global.CatWordsCharacters = { get, list, DISTRICTS };
})(window);
