(function(){
  const button=document.querySelector('.sound');
  if(!button||!('speechSynthesis' in window))return;
  button.type='button';
  button.setAttribute('aria-label','ฟังการออกเสียงคำศัพท์');
  button.addEventListener('click',()=>{
    if(window.speechSynthesis.speaking){window.speechSynthesis.cancel();button.textContent='🔊';return}
    const word=document.querySelector('.word-card h2')?.textContent?.trim();
    if(!word)return;
    const utterance=new SpeechSynthesisUtterance(word);
    utterance.lang='en-US';utterance.rate=.82;utterance.pitch=1;
    utterance.onstart=()=>{button.textContent='⏹️'};
    utterance.onend=()=>{button.textContent='🔊'};
    window.speechSynthesis.speak(utterance);
  });
})();
