(() => {
 const $=s=>document.querySelector(s);let ctx,master,muted=false,last=null;
 const foodAudio={noodles:new Audio('assets/noodles-slurp.mp3'),tacos:new Audio('assets/tacos-crunch.mp3'),fries:new Audio('assets/fries-crunch.mp3'),soup:new Audio('assets/soup-sip.mp3'),iced:new Audio('assets/iced-drink.mp3')};
 const labels={noodles:'ramen noodles — slurp, slurp',tacos:'crispy tacos — CRUNCH',soup:'warm soup — sip and slurp',fizz:'fizzy Coke — pssht, fizz',fries:'crispy fries — CRUNCH',iced:'iced drink — ice clink'};
 function audio(){if(!ctx){const C=window.AudioContext||window.webkitAudioContext;if(!C)return false;ctx=new C();master=ctx.createGain();master.gain.value=muted?0:1.8;master.connect(ctx.destination)}if(ctx.state==='suspended')ctx.resume();return true}
 function envGain(start,dur,peak){const g=ctx.createGain();g.gain.setValueAtTime(.0001,start);g.gain.exponentialRampToValueAtTime(Math.max(.0002,peak),start+.008);g.gain.exponentialRampToValueAtTime(.0001,start+dur);g.connect(master);return g}
 function tone(freq,start,dur,peak=.08,type='sine',end=null){const o=ctx.createOscillator(),g=envGain(start,dur,peak);o.type=type;o.frequency.setValueAtTime(freq,start);if(end)o.frequency.exponentialRampToValueAtTime(Math.max(1,end),start+dur);o.connect(g);o.start(start);o.stop(start+dur+.02)}
 function noise(start,dur,peak=.1,cut=1800,filter='bandpass'){const n=Math.max(1,Math.floor(ctx.sampleRate*dur)),b=ctx.createBuffer(1,n,ctx.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++){let fade=Math.min(1,i/(ctx.sampleRate*.012), (n-i)/(ctx.sampleRate*.025));d[i]=(Math.random()*2-1)*Math.max(0,fade)}const s=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=envGain(start,dur,peak);s.buffer=b;f.type=filter;f.frequency.value=cut;f.Q.value=.65;s.connect(f);f.connect(g);s.start(start);s.stop(start+dur+.02)}
 function play(key){
  if(muted)return;
  if(master&&ctx)master.gain.setTargetAtTime(1.8,ctx.currentTime,.02);
  if(foodAudio[key]){
   const track=foodAudio[key];
   if(muted){$('#status').textContent='quiet mode';return}
   track.pause();track.currentTime=0;track.volume=1;
   track.play().catch(()=>{$('#status').textContent='tap again to play sound'});
   $('#status').textContent='listen… '+labels[key];
   const art=$('.table-art');art.classList.remove('playing');void art.offsetWidth;art.classList.add('playing');
   clearTimeout(window._statusTimer);window._statusTimer=setTimeout(()=>$('#status').textContent='the table is waiting for another bite',2400);
   return;
  }
  if(!audio())return;const t=ctx.currentTime+.025;
  if(key==='noodles'){
   // wet, close-mic noodle draw with several short suction pulls and a little broth gulp
   for(let i=0;i<4;i++){let a=t+i*.19;noise(a,.17,.32,850,'lowpass');tone(320,a,.16,.12,'sawtooth',180);tone(190,a+.08,.12,.10,'sine',370)}noise(t+.78,.22,.24,650,'lowpass');tone(145,t+.85,.25,.13,'sine',95);
  }else if(key==='tacos'){
   // sharp shell snap + layered dry crumbs and mouth-chew crunches
   for(let i=0;i<7;i++){let a=t+i*.085;noise(a,.065,.42,3300,'highpass');noise(a+.018,.085,.23,1500,'bandpass');tone(150+Math.random()*90,a,.055,.11,'triangle',48)}noise(t+.65,.2,.22,2600,'highpass');noise(t+.83,.13,.17,1700,'bandpass');
  }else if(key==='soup'){
   noise(t,.25,.26,900,'lowpass');tone(290,t,.25,.11,'sine',170);noise(t+.29,.32,.28,720,'lowpass');tone(210,t+.33,.27,.12,'sine',300);tone(150,t+.68,.23,.11,'sine',110);noise(t+.72,.17,.16,1100,'lowpass');
  }else if(key==='fizz'){
   noise(t,.12,.4,1800,'highpass');tone(110,t,.16,.15,'sawtooth',55);noise(t+.12,.95,.3,5000,'highpass');for(let i=0;i<34;i++){let a=t+.12+Math.random()*.85;tone(500+Math.random()*1800,a,.035,.045,'sine',900+Math.random()*1000)}
  }else if(key==='fries'){
   // dry potato-shell crunches with a few softer chewing sounds
   for(let i=0;i<6;i++){let a=t+i*.09;noise(a,.07,.42,3200,'highpass');noise(a+.02,.1,.24,1700,'bandpass');tone(180+Math.random()*90,a,.06,.09,'triangle',55)}noise(t+.63,.13,.2,2200,'highpass');
  }else if(key==='iced'){
   // light glassy ice clinks, followed by a gentle fizzy tail
   for(let i=0;i<5;i++){let a=t+i*.13;tone(1250+Math.random()*700,a,.22,.18,'sine',700+Math.random()*250);tone(1900+Math.random()*500,a+.015,.12,.09,'triangle',1300)}noise(t+.18,.42,.12,4200,'highpass');
  }
  $('#status').textContent='listen… '+labels[key];const art=$('.table-art');art.classList.remove('playing');void art.offsetWidth;art.classList.add('playing');clearTimeout(window._statusTimer);window._statusTimer=setTimeout(()=>$('#status').textContent='the table is waiting for another bite',2400);
 }
 document.querySelectorAll('.hotspot').forEach(b=>b.addEventListener('click',()=>{last=b.dataset.food;$('#dishName').textContent=labels[last];$('#again').disabled=false;play(last)}));
 $('#again').addEventListener('click',()=>{if(last)play(last)});
 $('#stopSound').addEventListener('click',()=>{
  Object.values(foodAudio).forEach(a=>{a.pause();a.currentTime=0});
  if(master&&ctx)master.gain.setTargetAtTime(0,ctx.currentTime,.01);
  clearTimeout(window._statusTimer);$('.table-art').classList.remove('playing');
  $('#status').textContent='sound stopped';
 });

 function pauseAll(){
  Object.values(foodAudio).forEach(a=>a.pause());
  if(ctx && ctx.state==='running')ctx.suspend();
  clearTimeout(window._statusTimer);
  $('#status').textContent='sound paused';
 }
 function stopAll(){
  Object.values(foodAudio).forEach(a=>{a.pause();a.currentTime=0});
  if(ctx){if(ctx.state==='suspended')ctx.resume();if(master)master.gain.setTargetAtTime(0,ctx.currentTime,.01)}
  clearTimeout(window._statusTimer);$('.table-art').classList.remove('playing');
  $('#status').textContent='sound stopped';
 }
 $('#pauseSound').addEventListener('click',pauseAll);
 $('#stopSoundVisible').addEventListener('click',stopAll);
 $('#soundToggle').addEventListener('click',()=>{muted=!muted;Object.values(foodAudio).forEach(a=>{a.muted=muted;if(muted)a.pause()});if(master&&ctx)master.gain.setTargetAtTime(muted?0:1.8,ctx.currentTime,.02);$('#soundToggle').textContent=muted?'sound off ♫':'sound on ♫';$('#soundToggle').setAttribute('aria-pressed',String(muted));$('#status').textContent=muted?'quiet mode':'sound is back'});
})();
