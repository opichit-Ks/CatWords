(function(){
  const button=document.querySelector('.sound');
  if(!button||!('speechSynthesis' in window))return;
  const femaleHints=['female','woman','zira','jenny','samantha','ava','aria','susan','karen','moira','google us english'];
  function chooseVoice(){
    const voices=window.speechSynthesis.getVoices();
    return voices.find(v=>v.lang.toLowerCase().startsWith('en-us')&&femaleHints.some(h=>v.name.toLowerCase().includes(h)))||voices.find(v=>v.lang.toLowerCase().startsWith('en-us'))||voices.find(v=>v.lang.toLowerCase().startsWith('en'));
  }
  button.type='button';button.setAttribute('aria-label','ฟังการออกเสียงคำศัพท์');
  function speak(){
    if(window.speechSynthesis.speaking){window.speechSynthesis.cancel();button.textContent='🔊';return}
    const word=document.querySelector('.word-card h2')?.textContent?.trim();if(!word)return;
    const utterance=new SpeechSynthesisUtterance(word),voice=chooseVoice();
    if(voice)utterance.voice=voice;utterance.lang='en-US';utterance.rate=.82;utterance.pitch=1.08;
    utterance.onstart=()=>{button.textContent='⏹️'};utterance.onend=()=>{button.textContent='🔊'};window.speechSynthesis.speak(utterance);
  }
  button.addEventListener('click',speak);window.speechSynthesis.addEventListener('voiceschanged',chooseVoice);
})();
