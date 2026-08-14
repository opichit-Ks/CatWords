// Daily push notifications — Settings section binding.
// Flow: anonymous sign-in → Notification permission → FCM token → Firestore.
// Works only when a real Firebase config is present; otherwise shows guidance.
(function () {
  const section = document.querySelector('#notify-section');
  if (!section) return;

  const status = section.querySelector('#push-status');
  const toggle = section.querySelector('#push-toggle');
  const time = section.querySelector('#push-time');
  const LOCAL_FLAG = 'catwords-push-enabled';

  const setStatus = (text, tone) => {
    status.textContent = text;
    status.className = 'push-status' + (tone ? ' ' + tone : '');
  };
  const setToggle = (on) => {
    toggle.classList.toggle('selected', on);
    toggle.textContent = on ? 'ปิดการแจ้งเตือน' : 'เปิดการแจ้งเตือน';
  };

  const noConfig = () => {
    toggle.disabled = true;
    time.disabled = true;
    setStatus('ยังไม่ได้เชื่อมต่อ Firebase — เปิดใช้งานตามขั้นตอนในไฟล์ firebase/README.md');
  };
  const unsupported = (message) => {
    toggle.disabled = true;
    setStatus(message);
  };

  let fb = window.CatWordsFirebase || { ready: false, reason: 'loading' };

  const bind = () => {
    if (!fb.ready) {
      if (fb.reason === 'no-config') return noConfig();
      toggle.disabled = true;
      setStatus('กำลังเชื่อมต่อ Firebase…');
      return;
    }
    if (!('Notification' in window)) {
      return unsupported('เบราว์เซอร์นี้ไม่รองรับการแจ้งเตือน (ต้องใช้ Chrome/Edge บน HTTPS)');
    }

    toggle.disabled = false;
    time.disabled = false;

    // VAPID key จำเป็นสำหรับ Web Push — ถ้ายังไม่ได้กรอกให้บอกผู้ใช้ก่อน
    if (!fb.config.vapidKey) {
      toggle.disabled = true;
      setStatus('ยังไม่ได้กรอก VAPID key — ไปที่ Firebase Console → Cloud Messaging → Web configuration แล้วใส่ "Key pair" ลงใน data/firebase-config.js');
      return;
    }

    // Show persisted state instantly, then let Firestore confirm lazily.
    if (localStorage.getItem(LOCAL_FLAG)) setToggle(true);

    const enable = async () => {
      setToggle(true);
      toggle.disabled = true;
      setStatus('กำลังเปิดการแจ้งเตือน…');
      try {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          setToggle(false);
          setStatus('ถูกปฏิเสธ — ไปเปิดสิทธิ์การแจ้งเตือนที่การตั้งค่าเบราว์เซอร์ก่อน แล้วลองใหม่');
          return;
        }
        const registration = await navigator.serviceWorker.ready;
        const token = await fb.messaging.getToken({
          vapidKey: fb.config.vapidKey,
          serviceWorkerRegistration: registration
        });
        const userCredential = await fb.auth.signInAnonymously();
        const settings = (window.CatWordsSettings && window.CatWordsSettings.read()) || {};
        await fb.db.collection('users').doc(userCredential.user.uid).set({
          displayName: settings.displayName || 'คุณนักเรียน',
          pushEnabled: true,
          fcmTokens: firebase.firestore.FieldValue.arrayUnion(token),
          reminderTime: time.value || '07:00',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Bangkok',
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        localStorage.setItem(LOCAL_FLAG, '1');
        setToggle(true);
        setStatus(`เปิดแล้ว — จะส่งคำศัพท์ประจำวันตอน ${time.value || '07:00'} น. ตามเวลาของคุณ 🎉`);
      } catch (error) {
        setToggle(false);
        setStatus('เกิดข้อผิดพลาด: ' + ((error && error.message) || error));
      } finally {
        toggle.disabled = false;
      }
    };

    const disable = async () => {
      toggle.disabled = true;
      setStatus('กำลังปิด…');
      try {
        const user = fb.auth.currentUser;
        if (user) {
          await fb.db.collection('users').doc(user.uid).update({ pushEnabled: false });
        }
        try { await fb.messaging.deleteToken(); } catch (ignored) { /* token may not exist */ }
        localStorage.removeItem(LOCAL_FLAG);
        setToggle(false);
        setStatus('ปิดการแจ้งเตือนแล้ว — มาเปิดใหม่ได้ทุกเมื่อ');
      } catch (error) {
        setStatus('เกิดข้อผิดพลาด: ' + ((error && error.message) || error));
      } finally {
        toggle.disabled = false;
      }
    };

    toggle.addEventListener('click', () => {
      const turningOn = !toggle.classList.contains('selected');
      if (turningOn) enable();
      else disable();
    });
  };

  if (fb.reason === 'no-config') return noConfig();
  if (fb.ready) return bind();
  window.addEventListener('catwords-firebase-init', (event) => {
    fb = event.detail;
    bind();
  }, { once: true });
})();
