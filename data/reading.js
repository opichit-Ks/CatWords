// CatWords Reading Practice — today's short story matched to today's lesson.
// The story reuses the exact 5 words from the daily lesson, highlights them,
// offers listen buttons + Thai translation, then a 3-question comprehension check.
(async function () {
  const root = document.querySelector('#reading-root');
  if (!root) return;

  const escape = (value) => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
  const toast = (message) => {
    let element = document.querySelector('.toast');
    if (!element) { element = document.createElement('div'); element.className = 'toast'; document.body.append(element); }
    element.textContent = message;
    element.classList.add('show');
    window.setTimeout(() => element.classList.remove('show'), 1800);
  };
  const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const CATEGORY_LABEL = {
    'daily-life': 'หมวดชีวิตประจำวัน',
    'restaurant': 'หมวดอาหาร',
    'travel': 'หมวดท่องเที่ยว',
    'medical': 'หมวดสุขภาพ',
    'law-citizenship': 'หมวดกฎหมาย',
    'science': 'หมวดวิทยาศาสตร์'
  };

  const sheet = document.querySelector('#word-sheet');
  const backdrop = document.querySelector('#sheet-backdrop');
  const openSheet = (word) => {
    if (!sheet || !word) return;
    sheet.innerHTML = `<div class="sheet-head"><span class="pill">VOCABULARY FROM TODAY'S STORY</span><button class="sheet-close" type="button">✕ ปิด</button></div>
      <h3>${escape(word.word)}</h3>
      <p class="pronounce">${escape(word.phonetic)} <span class="sound-group"><button class="sound" data-lang="en-US" data-text="${escape(word.word)}"></button><button class="sound" data-lang="en-UK" data-text="${escape(word.word)}"></button></span></p>
      <span class="part">${escape(word.partOfSpeech.toUpperCase())}</span>
      <p class="meaning">${escape(word.thaiMeaning)}</p>
      <div class="info example"><small>ตัวอย่างประโยค</small><p>“${escape(word.exampleSentence)}”</p><span>${escape(word.exampleThai)}</span></div>
      <p class="hint">💡 คำนี้อยู่ในเรื่องสั้นวันนี้ ลองหามันเจอในเนื้อเรื่องดูนะ</p>`;
    sheet.querySelector('.sheet-close').onclick = closeSheet;
    sheet.classList.add('open');
    backdrop.classList.add('show');
    document.body.style.overflow = 'hidden';
  };
  const closeSheet = () => {
    if (!sheet) return;
    sheet.classList.remove('open');
    backdrop.classList.remove('show');
    document.body.style.overflow = '';
  };
  if (backdrop) backdrop.addEventListener('click', closeSheet);
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeSheet(); });

  try {
    const content = await window.CatWordsContent.load();
    const lesson = window.CatWordsContent.pickLesson(content);
    const story = (content.stories || []).find((item) => item.lessonId === lesson.id) || (content.stories || [])[0];
    if (!story) throw new Error('No story for today.');

    const words = lesson.wordIds
      .map((id) => content.words.find((word) => word.id === id))
      .filter(Boolean);
    const wordMap = new Map(words.map((word) => [word.word.toLowerCase(), word]));

    // Build a variant map so inflected forms (-ed/-ing/-s/-ly…) still highlight
    // to the dictionary entry of the base word (e.g. arrived → arrive).
    const SUFFIXES = ['', 's', 'es', 'ed', 'd', 'ing', 'ly', 'er', 'est'];
    const variantMap = new Map();
    words.forEach((word) => {
      SUFFIXES.forEach((suffix) => {
        const key = word.word.toLowerCase() + suffix;
        if (!variantMap.has(key)) variantMap.set(key, word);
      });
    });

    // Wrap today's lesson words in the story paragraphs with a highlight.
    const highlight = (text) => text
      .split(/(\s+)/)
      .map((part) => {
        if (!/[A-Za-z]/.test(part)) return escape(part);
        const prefix = part.match(/^[^A-Za-z]*/)[0];
        const suffix = part.match(/[^A-Za-z]*$/)[0];
        const core = part.slice(prefix.length, suffix ? part.length - suffix.length : part.length);
        const match = variantMap.get(core.toLowerCase());
        return match
          ? `${escape(prefix)}<b class="story-word" data-word="${escape(match.word)}" role="button" tabindex="0" aria-label="${escape(match.word)} — ${escape(match.thaiMeaning)}">${escape(core)}</b>${escape(suffix)}`
          : escape(part);
      })
      .join('');

    const teacher = (window.CatWordsCharacters && window.CatWordsCharacters.get(story.teacher)) || window.CatWordsCharacters.get('mochi');
    const levelLabel = story.level === 'intermediate' ? 'กลาง' : story.level === 'advanced' ? 'สูง' : 'ง่าย';
    const state = window.CatWordsProgress.read();

    const chipMarkup = (word) => `<button class="chip" type="button" data-word="${escape(word.word)}" aria-label="${escape(word.word)} — ${escape(word.thaiMeaning)}"><b>${escape(word.word)}</b><small>${escape(word.thaiMeaning)}</small></button>`;

    root.innerHTML = `
      <section class="panel story-meta">
        <img src="${teacher ? teacher.pose : ''}" alt="${teacher ? teacher.name : 'ครูประจำเรื่อง'}">
        <div class="meta-info">
          <span class="eyebrow">TODAY'S STORY · ${(CATEGORY_LABEL[story.category] || story.category).toUpperCase()}</span>
          <h2>${escape(story.title)}</h2>
          <p class="title-th">${escape(story.titleThai)}</p>
          <div class="meta-tags"><span>${teacher ? teacher.name : ''}</span><span class="level">ระดับ ${levelLabel}</span><span>5 คำจากบทเรียนวันนี้</span></div>
        </div>
      </section>

      <section class="panel" style="margin-top:16px">
        <h2>คำศัพท์จากเรื่องนี้</h2>
        <p class="muted">แตะคำเพื่อดูความหมายและฟังการออกเสียง</p>
        <div class="chips" id="word-chips">${words.map(chipMarkup).join('')}</div>
      </section>

      ${state.readingCompleted
        ? `<div class="reading-done"><span class="rd-icon">🎉</span><div><b>วันนี้คุณอ่านเรื่องนี้แล้ว!</b><small>ทำความเข้าใจได้ ${state.readingScore}/3 ข้อ · อ่านซ้ำได้อีกเท่าไหร่ก็ได้</small></div></div>`
        : ''}

      <section class="panel story-box" style="margin-top:16px">
        <div class="story-head">
          <h2>${escape(story.title)}</h2>
          <button class="toggle-translation" id="toggle-translation" type="button">แสดงคำแปลไทย 🇹🇭</button>
        </div>
        <p class="muted">🔊 ฟังเสียงได้ทุกย่อหน้า · แตะคำสีเขียวเพื่อดูความหมาย</p>
        <div id="story-body">${story.paragraphs.map((paragraph, index) => `
          <p class="story-para">${highlight(paragraph)}</p>
          ${story.translation && story.translation[index] ? `<p class="translation-para">${escape(story.translation[index])}</p>` : ''}
        `).join('')}</div>
      </section>

      <section class="panel" id="comprehension" style="margin-top:16px">
        <h2>ตรวจความเข้าใจ</h2>
        <p class="muted">ตอบคำถาม 3 ข้อจากเรื่องที่เพิ่งอ่าน</p>
        <div id="questions"></div>
        <div class="cq-actions" id="cq-actions">
          <button class="primary" id="submit-answers" type="button">ส่งคำตอบ</button>
        </div>
      </section>`;

    // Word sheet triggers: chips + highlighted words in the story.
    root.querySelectorAll('[data-word]').forEach((element) => {
      const open = () => openSheet(variantMap.get(element.dataset.word.toLowerCase()) || wordMap.get(element.dataset.word.toLowerCase()));
      element.addEventListener('click', open);
      element.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); open(); }
      });
    });

    // Translation toggle.
    const toggle = document.querySelector('#toggle-translation');
    if (toggle) {
      toggle.addEventListener('click', () => {
        const on = document.querySelector('#story-body').classList.toggle('show-translation');
        toggle.classList.toggle('on', on);
        toggle.textContent = on ? 'ซ่อนคำแปลไทย 🇹🇭' : 'แสดงคำแปลไทย 🇹🇭';
      });
    }

    // Comprehension check (hidden when already completed today).
    const comprehension = document.querySelector('#comprehension');
    if (comprehension && !state.readingCompleted) {
      const questionsBox = document.querySelector('#questions');
      const actionsBox = document.querySelector('#cq-actions');
      const selected = [];

      questionsBox.innerHTML = story.questions.map((question, questionIndex) => `
        <div class="cq" data-q="${questionIndex}">
          <b class="q">ข้อ ${questionIndex + 1}. ${escape(question.question)}</b>
          <div class="cq-options">
            ${question.options.map((option) => `<button type="button" data-answer="${escape(option)}">${escape(option)}</button>`).join('')}
          </div>
          <p class="explain">💡 ${escape(question.explanation)}</p>
        </div>`).join('');

      questionsBox.querySelectorAll('.cq').forEach((block, questionIndex) => {
        block.querySelectorAll('.cq-options button').forEach((button) => {
          button.addEventListener('click', () => {
            block.querySelectorAll('.cq-options button').forEach((item) => { item.classList.remove('selected'); item.dataset.chosen = ''; });
            button.classList.add('selected');
            button.dataset.chosen = 'true';
            selected[questionIndex] = button.dataset.answer;
          });
        });
      });

      const submit = document.querySelector('#submit-answers');
      submit.addEventListener('click', () => {
        if (selected.length < story.questions.length || selected.some((answer) => !answer)) { toast('ตอบครบทั้ง 3 ข้อก่อนส่งนะ ✏️'); return; }
        let score = 0;
        story.questions.forEach((question, questionIndex) => {
          const block = questionsBox.querySelector(`.cq[data-q="${questionIndex}"]`);
          const correct = selected[questionIndex] === question.correctAnswer;
          if (correct) score += 1;
          block.querySelectorAll('.cq-options button').forEach((button) => {
            button.disabled = true;
            if (button.dataset.answer === question.correctAnswer) button.classList.add('correct');
            else if (button.classList.contains('selected')) button.classList.add('wrong');
          });
          block.querySelector('.explain').classList.add('show');
        });

        const reward = window.CatWordsProgress.completeReading(score);
        actionsBox.innerHTML = `
          <div class="reward-card">
            <div class="reward-xp">+${reward.earnedXP} XP · +${reward.earnedCoins} 🐟<small>ตอบถูก ${score}/3 ข้อ · อ่านเรื่องได้วันละ 1 รอบเพื่อรับรางวัล</small></div>
            <div class="reward-links"><a class="secondary" href="daily-lesson.html">← บทเรียนวันนี้</a><a class="primary" href="index.html">กลับหน้าหลัก →</a></div>
          </div>`;
        toast(reward.changed ? `เก่งมาก! อ่านจบ +${reward.earnedXP} XP ✨` : 'อ่านเรื่องวันนี้เรียบร้อยแล้ว 🎉');
      });
    } else if (comprehension) {
      comprehension.querySelector('#cq-actions').innerHTML = `
        <div class="reward-card">
          <div class="reward-xp">อ่านจบแล้ว 🎉<small>รับรางวัลได้วันละ 1 ครั้ง · พรุ่งนี้มีเรื่องใหม่</small></div>
          <div class="reward-links"><a class="primary" href="index.html">กลับหน้าหลัก →</a></div>
        </div>`;
    }
  } catch (error) {
    root.innerHTML = '<div class="panel"><div class="info"><small>ยังเปิดเรื่องสั้นไม่ได้</small><p>ลองรีเฟรชอีกครั้งเมื่อการเชื่อมต่อพร้อมนะ</p></div></div>';
  }
})();
