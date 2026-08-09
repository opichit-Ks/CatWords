(function(){
  const key='catwords-mvp-progress';
  const saved=JSON.parse(localStorage.getItem(key)||'{"word":0,"xp":0,"coins":0,"completed":false}');
  const words=window.CATWORDS_CONTENT.words;
  let index=Math.min(saved.word,4);
  const card=document.querySelector('.word-card');
  if(!card||!words.length)return;
  const next=card.querySelector('.primary');
  const back=card.querySelector('.secondary');
  function persist(){localStorage.setItem(key,JSON.stringify(saved));}
  function render(){const item=words[index];card.querySelector('.progress-row span').textContent=`คำที่ ${index+1} จาก ${words.length}`;card.querySelector('.bar span').style.width=`${(index+1)/words.length*100}%`;card.querySelector('.word-card h2')?.replaceChildren(document.createTextNode(item.word));card.querySelector('h2').textContent=item.word;card.querySelector('.pronounce').firstChild.textContent=item.phonetic+' ';card.querySelector('.tag').textContent=item.type;card.querySelector('.info p').textContent=item.meaning;card.querySelector('.example p').innerHTML=`“${item.example.replace(item.word,`<b>${item.word}</b>`)}”`;card.querySelector('.example span').textContent=item.thai;next.textContent=index===words.length-1?'จบบทเรียน →':'เข้าใจแล้ว →';}
  function toast(message){let t=document.querySelector('.toast');if(!t){t=document.createElement('div');t.className='toast';document.body.append(t)}t.textContent=message;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1800)}
  back.addEventListener('click',()=>{if(index>0){index--;render()}});
  next.addEventListener('click',()=>{saved.xp+=6;if(index<words.length-1){index++;saved.word=index;persist();render();toast('เก่งมาก! +6 XP ✨')}else{saved.completed=true;saved.word=0;saved.xp+=30;saved.coins+=10;persist();toast('เรียนครบ 5 คำแล้ว! +30 XP · +10 🐟');setTimeout(()=>{next.textContent='เรียนซ้ำอีกครั้ง ↻'},900)}});
  render();
})();
