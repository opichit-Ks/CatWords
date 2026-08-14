(async function () {
  const card = document.querySelector('.word-card');
  if (!card) return;

  const escape = (value) => String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);
  const toast = (message) => {
    let element = document.querySelector('.toast');
    if (!element) {
      element = document.createElement('div');
      element.className = 'toast';
      document.body.append(element);
    }
    element.textContent = message;
    element.classList.add('show');
    window.setTimeout(() => element.classList.remove('show'), 1800);
  };
  const shuffle = (items) => [...items].sort(() => Math.random() - 0.5);

  const TEACHER_QUOTES = {
    'daily-life': { quote: 'ทุกคำใหม่คือก้าวเล็ก ๆ ของนักผจญภัยนะ!' },
    'restaurant': { quote: 'คำศัพท์อร่อย ๆ รอเราอยู่ในเมนูวันนี้!' },
    'travel': { quote: 'เตรียมกระเป๋าให้พร้อม แล้วออกเดินทางไปกับคำศัพท์กัน!' },
    'medical': { quote: 'ดูแลสุขภาพไปพร้อมกับคำศัพท์ใหม่ ๆ ทุกวันนะ!' },
    'law-citizenship': { quote: 'เรียนรู้กฎอย่างเป็นธรรม แล้วเราจะอยู่ร่วมกันได้อย่างสงบสุข' },
    'science': { quote: 'ทุกคำถามคือจุดเริ่มต้นของการค้นพบ!' }
  };

  try {
    card.innerHTML = '<p class="pronounce">กำลังเตรียมบทเรียนของวันนี้…</p>';
    const content = await window.CatWordsContent.load();
    const lesson = window.CatWordsContent.pickLesson(content);
    const words = lesson.wordIds.map((id) => content.words.find((word) => word.id === id));
    const quizzes = lesson.quizIds.map((id) => content.quizzes.find((quiz) => quiz.id === id));
    if (words.length !== 5 || words.some(Boolean) === false || quizzes.length !== 5 || quizzes.some(Boolean) === false) {
      throw new Error('Today\'s lesson is not ready.');
    }

    // Coach panel: show today's teacher (fall back to Mochi).
    const coachImg = document.querySelector('.coach img');
    const coachPill = document.querySelector('.coach .pill');
    const coachQuote = document.querySelector('.coach h3');
    const coachList = document.querySelector('.word-list');
    const teacher = (window.CatWordsCharacters && window.CatWordsCharacters.get(lesson.teacher)) || window.CatWordsCharacters.get('mochi');
    const quote = TEACHER_QUOTES[lesson.category] || TEACHER_QUOTES['daily-life'];
    if (coachImg) coachImg.src = teacher.pose;
    if (coachImg) coachImg.alt = `${teacher.name} ให้กำลังใจ`;
    if (coachPill) coachPill.textContent = `${teacher.name.toUpperCase()} SAYS`;
    if (coachQuote) coachQuote.textContent = `“${quote.quote}”`;
    if (coachList) {
      coachList.innerHTML = words
        .map((word, index) => `<div data-word-index="${index}"><b>${index + 1}</b> ${escape(word.word)}</div>`)
        .join('');
    }

    const markCurrentWord = (index) => {
      if (!coachList) return;
      coachList.querySelectorAll('[data-word-index]').forEach((item) => {
        item.classList.toggle('current', Number(item.dataset.wordIndex) === index);
      });
    };

    const applyVoicePreference = () => {
      const settings = window.CatWordsSettings ? window.CatWordsSettings.read() : null;
      if (!settings || settings.voice === 'auto') return;
      const button = card.querySelector(`.sound[data-lang="${settings.voice}"]`);
      if (button) button.classList.add('selected');
    };

    let index = Math.min(window.CatWordsProgress.read().word, words.length - 1);

    const renderWord = () => {
      const word = words[index];
      const state = window.CatWordsProgress.read();
      card.innerHTML = `<div class="progress-row"><span>คำที่ ${index + 1} จาก 5</span><div class="bar"><span style="width:${((index + 1) / words.length) * 100}%"></span></div></div><div class="word-icon">🌱</div><h2>${escape(word.word)}</h2><p class="pronounce">${escape(word.phonetic)} <span class="sound-group"><button class="sound" data-lang="en-US">🇺🇸 US</button><button class="sound" data-lang="en-UK">🇬🇧 UK</button></span></p><span class="tag">${escape(word.partOfSpeech.toUpperCase())} · คำ${word.partOfSpeech === 'verb' ? 'กริยา' : word.partOfSpeech === 'noun' ? 'นาม' : 'คุณศัพท์'}</span><div class="info"><small>ความหมาย</small><p>${escape(word.thaiMeaning)}</p></div><div class="info example"><small>ตัวอย่างประโยค</small><p>“${escape(word.exampleSentence)}”</p><span>${escape(word.exampleThai)}</span></div><div class="actions"><button class="secondary" ${index === 0 ? 'disabled' : ''}>← ย้อนกลับ</button><button class="primary">${index === words.length - 1 ? 'เริ่ม Daily Quiz →' : 'เข้าใจแล้ว →'}</button></div>`;

      card.querySelector('.secondary').onclick = () => {
        if (index > 0) {
          index -= 1;
          renderWord();
        }
      };
      card.querySelector('.primary').onclick = () => {
        const result = window.CatWordsProgress.recordWord(index);
        if (result.changed) toast(`เก่งมาก! +${result.earnedXP} XP ✨`);
        if (index < words.length - 1) {
          index += 1;
          renderWord();
        } else {
          renderQuiz();
        }
      };

      markCurrentWord(index);
      applyVoicePreference();

      if (state.lessonCompleted && !state.quizCompleted && index === words.length - 1) {
        card.querySelector('.primary').textContent = 'เริ่ม Daily Quiz →';
      }
    };

    const renderQuiz = () => {
      if (coachList) coachList.querySelectorAll('[data-word-index]').forEach((item) => item.classList.remove('current'));
      let questionIndex = 0;
      let score = 0;
      const answers = [];
      card.innerHTML = '<div class="progress-row"><span>Quiz ข้อ 1 จาก 5</span><div class="bar"><span style="width:20%"></span></div></div><div class="word-icon">🧠</div><h2 style="font-family:var(--font-sans)">Daily Quiz</h2><p class="pronounce" style="font-family:var(--font-sans)">ทบทวนคำศัพท์วันนี้ไปพร้อมกับ Mochi</p><div class="info"><small id="quiz-question"></small><div id="quiz-options"></div></div><div class="actions"><button class="secondary" id="quiz-back">← กลับไปทบทวน</button><button class="primary" id="quiz-next" disabled>เลือกคำตอบก่อน</button></div>';
      const question = card.querySelector('#quiz-question');
      const options = card.querySelector('#quiz-options');
      const next = card.querySelector('#quiz-next');

      const paintQuestion = () => {
        const quiz = quizzes[questionIndex];
        question.textContent = quiz.question;
        options.innerHTML = shuffle([quiz.correctAnswer, ...quiz.options.filter((option) => option !== quiz.correctAnswer).slice(0, 2)])
          .map((option) => `<button class="quiz-option" type="button" data-answer="${escape(option)}">${escape(option)}</button>`)
          .join('');
        next.disabled = true;
        next.textContent = questionIndex === quizzes.length - 1 ? 'ดูผลลัพธ์' : 'ข้อต่อไป →';
        options.querySelectorAll('button').forEach((button) => {
          button.onclick = () => {
            options.querySelectorAll('button').forEach((item) => { item.disabled = true; });
            const correct = button.dataset.answer === quiz.correctAnswer;
            answers[questionIndex] = { word: words[questionIndex].word, selected: button.dataset.answer, correctAnswer: quiz.correctAnswer, correct };
            button.classList.add(correct ? 'correct' : 'wrong');
            if (correct) {
              score += 1;
              toast('ถูกต้อง! ✨');
            } else {
              toast(`คำตอบคือ “${quiz.correctAnswer}”`);
            }
            next.disabled = false;
          };
        });
      };

      next.onclick = () => {
        if (next.disabled) return;
        if (questionIndex < quizzes.length - 1) {
          questionIndex += 1;
          card.querySelector('.progress-row span').textContent = `Quiz ข้อ ${questionIndex + 1} จาก 5`;
          card.querySelector('.bar span').style.width = `${((questionIndex + 1) / quizzes.length) * 100}%`;
          paintQuestion();
        } else {
          renderResult(answers, window.CatWordsProgress.submitQuiz(score));
        }
      };
      card.querySelector('#quiz-back').onclick = () => {
        index = words.length - 1;
        renderWord();
      };
      paintQuestion();
    };

    const renderResult = (answers, reward) => {
      const state = reward.state;
      const answerCards = answers.length
        ? answers.map((answer, answerIndex) => `<div class="answer-card ${answer.correct ? 'ok' : 'no'}"><b>ข้อ ${answerIndex + 1} · ${escape(answer.word)}</b><small>${answer.correct ? '✅ ตอบถูก' : '❌ ตอบผิด'}</small><span>คำตอบของคุณ: ${escape(answer.selected)}</span>${answer.correct ? '' : `<span class="correct-answer">คำตอบที่ถูกต้อง: ${escape(answer.correctAnswer)}</span>`}</div>`).join('')
        : '<div class="answer-card ok"><b>ทำ Quiz วันนี้เรียบร้อยแล้ว 🎉</b><small>กลับมาเรียนคำใหม่พรุ่งนี้นะ</small></div>';
      card.innerHTML = `<div class="word-icon">🏆</div><h2 style="font-family:var(--font-sans)">สรุปผล Daily Quiz</h2><p class="pronounce" style="font-family:var(--font-sans)">คุณตอบถูก ${state.quizScore} จาก 5 ข้อ</p><div id="answer-cards" style="display:grid;gap:10px;margin-top:18px">${answerCards}</div><div class="actions"><span>+${reward.earnedXP} XP · +${reward.earnedCoins} 🐟</span><div style="display:flex;gap:10px;align-items:center"><a class="secondary" href="index.html">← กลับหน้าหลัก</a><a class="primary" href="reading.html">อ่านเรื่องสั้นวันนี้ →</a></div></div>`;
    };

    const initialState = window.CatWordsProgress.read();
    if (initialState.quizCompleted) renderResult([], { state: initialState, earnedXP: 0, earnedCoins: 0 });
    else if (initialState.lessonCompleted) renderQuiz();
    else renderWord();
  } catch (error) {
    card.innerHTML = '<div class="info"><small>ยังเปิดบทเรียนไม่ได้</small><p>ลองรีเฟรชอีกครั้งเมื่อการเชื่อมต่อพร้อมนะ</p></div>';
  }
})();
