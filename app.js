const cnv = document.getElementById('fx');
const ctx = cnv.getContext('2d');
let w, h, dpr;
function resize(){ dpr = Math.min(window.devicePixelRatio || 1, 2); w = cnv.width = Math.floor(innerWidth * dpr); h = cnv.height = Math.floor(innerHeight * dpr); cnv.style.width = innerWidth + 'px'; cnv.style.height = innerHeight + 'px'; }
addEventListener('resize', resize, {passive:true}); resize();

const N = 90;
const pts = Array.from({length:N}, () => ({ x: Math.random()*w, y: Math.random()*h, vx: (Math.random()-0.5)*0.25, vy: (Math.random()-0.5)*0.25, r: Math.random()*2 + 0.6 }));
function step(){
  ctx.clearRect(0,0,w,h);
  for(const p of pts){ p.x += p.vx; p.y += p.vy; if(p.x < 0 || p.x > w) p.vx *= -1; if(p.y < 0 || p.y > h) p.vy *= -1; }
  ctx.globalAlpha = .35; ctx.strokeStyle = 'rgba(124,58,237,.45)';
  for(let i=0;i<N;i++){ for(let j=i+1;j<N;j++){ const dx=pts[i].x-pts[j].x, dy=pts[i].y-pts[j].y, dist=Math.hypot(dx,dy); if(dist<140){ ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); ctx.stroke(); } } }
  ctx.globalAlpha = 1;
  for(const p of pts){ const g = ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*3); g.addColorStop(0,'rgba(34,211,238,.9)'); g.addColorStop(1,'rgba(34,211,238,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x,p.y,p.r*3,0,Math.PI*2); ctx.fill(); }
  requestAnimationFrame(step);
}
step();

const cursor = document.getElementById('cursor');
addEventListener('mousemove', (e)=>{ cursor.style.left = e.clientX + 'px'; cursor.style.top = e.clientY + 'px'; });
addEventListener('mousedown', ()=> cursor.classList.add('click'));
addEventListener('mouseup', ()=> cursor.classList.remove('click'));
addEventListener('mouseover', (e)=>{ if(e.target.closest('a, button, .btn, .card')) cursor.classList.add('hover'); });
addEventListener('mouseout',  (e)=>{ if(e.target.closest && e.target.closest('a, button, .btn, .card')) cursor.classList.remove('hover'); });

document.querySelectorAll('.spotlight').forEach(sec => {
  sec.addEventListener('mousemove', (e)=>{ const rect = sec.getBoundingClientRect(); sec.style.setProperty('--mx', (e.clientX - rect.left) + 'px'); sec.style.setProperty('--my', (e.clientY - rect.top) + 'px'); });
});
document.querySelectorAll('.magnet').forEach(el => {
  const strength = 12;
  el.addEventListener('mousemove', (e)=>{ const r = el.getBoundingClientRect(); const x = e.clientX - (r.left + r.width/2); const y = e.clientY - (r.top + r.height/2); el.style.transform = `translate(${(x/r.width)*strength}px, ${(y/r.height)*strength}px)`; });
  el.addEventListener('mouseleave', ()=>{ el.style.transform = 'translate(0,0)'; });
});

const io = new IntersectionObserver((entries)=>{ for(const e of entries){ if(e.isIntersecting) e.target.classList.add('show'); } }, { threshold:.08 });
document.querySelectorAll('.reveal, .card').forEach(el=> io.observe(el));

const audio = document.getElementById('bgm');
const musicBtn = document.getElementById('musicBtn');
const musicTip = document.getElementById('musicTip');
audio.volume = 0.65; audio.muted = true;
function fadeInAudio(target = 0.65, ms = 1500) { audio.muted = false; const steps = 30, step = target / steps, interval = ms / steps; let i = 0; audio.volume = 0; const t = setInterval(()=>{ i++; audio.volume = Math.min(target, audio.volume + step); if(i>=steps) clearInterval(t); }, interval); }
audio.play().then(()=> setTimeout(()=> fadeInAudio(), 300)).catch(()=>{});
if(musicBtn){ musicBtn.addEventListener('click', async ()=>{ if(audio.paused){ await audio.play(); fadeInAudio(); musicBtn.textContent = '⏸️'; musicTip.textContent = 'music on'; } else { audio.pause(); musicBtn.textContent = '▶️'; musicTip.textContent = 'music off'; } }); }

document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click',(e)=>{ const id = a.getAttribute('href').slice(1); const el = document.getElementById(id); if(el){ e.preventDefault(); el.scrollIntoView({behavior:'smooth', block:'start'}); } });
});

const themeBtn = document.getElementById('themeBtn');
if(themeBtn){ themeBtn.addEventListener('click', ()=>{ const t = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'; document.documentElement.setAttribute('data-theme', t); }); }

/* toast */
function showToast(msg){
  const t = document.createElement('div');
  t.textContent = msg;
  t.style.position='fixed'; t.style.right='18px'; t.style.bottom='18px';
  t.style.padding='10px 14px'; t.style.fontWeight='700';
  t.style.background='rgba(0,0,0,.75)'; t.style.color='#fff';
  t.style.border='1px solid rgba(255,255,255,.2)'; t.style.borderRadius='12px';
  t.style.zIndex='300';
  document.body.appendChild(t);
  setTimeout(()=>{ t.style.opacity='0'; t.style.transition='opacity .3s'; setTimeout(()=> t.remove(), 300); }, 1400);
}

/* auth modal */
const loginBtn = document.getElementById('loginBtn');
const loginModal = document.getElementById('loginModal');
const loginClose = document.getElementById('loginClose');
const authUser = document.getElementById('authUser');
const authPass = document.getElementById('authPass');
const authSubmit = document.getElementById('authSubmit');
const authError = document.getElementById('authError');

const AUTH_USER = 'CHAPARI07';
const AUTH_PASS = 'atmkbfjg';
let authed = false;

function openLogin(){ if(loginModal){ loginModal.classList.add('show'); authError.textContent = ''; setTimeout(()=> authUser && authUser.focus(), 50); } }
function closeLogin(){ loginModal && loginModal.classList.remove('show'); }
function setAuthed(state){ authed = state; document.body.classList.toggle('authed', authed); }

if(loginBtn){ loginBtn.addEventListener('click', openLogin); }
if(loginClose){ loginClose.addEventListener('click', closeLogin); }
if(loginModal){ loginModal.addEventListener('click', (e)=>{ if(e.target === loginModal) closeLogin(); }); }
addEventListener('keydown', (e)=>{ if(e.key === 'Escape' && loginModal && loginModal.classList.contains('show')) closeLogin(); });

function tryLogin(){
  const u = (authUser && authUser.value.trim()) || '';
  const p = (authPass && authPass.value) || '';
  if(u === AUTH_USER && p === AUTH_PASS){
    setAuthed(true);
    closeLogin();
    showToast('Login successful');
    if(document.body.getAttribute('data-page') === 'exclusive'){
      /* stay on page and reveal content */
    }else{
      setTimeout(()=>{ location.href = 'exclusive.html'; }, 450);
    }
    if(authUser) authUser.value=''; if(authPass) authPass.value='';
  } else {
    if(authError) authError.textContent = 'Incorrect username or password.';
  }
}
if(authSubmit){ authSubmit.addEventListener('click', tryLogin); }
if(authPass){ authPass.addEventListener('keydown', (e)=>{ if(e.key === 'Enter') tryLogin(); }); }

/* exclusive page behavior: force login every load */
addEventListener('load', ()=>{
  if(document.body.getAttribute('data-page') === 'exclusive'){
    setAuthed(false);
    openLogin();
    const backHome = document.getElementById('backHome');
    if(backHome){ backHome.addEventListener('click', (e)=>{}); }
    const goBack = document.getElementById('goBack');
    if(goBack){ goBack.addEventListener('click', ()=>{ if(history.length>1) history.back(); else location.href='index.html'; }); }
  } else {
    setAuthed(false);
  }
});

/* copy link on index footer */
const copyLink = document.getElementById('copy-link');
if(copyLink){
  copyLink.addEventListener('click',(e)=>{
    e.preventDefault();
    navigator.clipboard.writeText(location.href).then(()=> showToast('Link copied ✅'));
  });
}
