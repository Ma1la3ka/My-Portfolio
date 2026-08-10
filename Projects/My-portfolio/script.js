/* =============================================
   CURSOR
   ============================================= */
(function(){
  const c = document.getElementById('cur');
  const r = document.getElementById('cur-ring');
  if(!c||!r) return;
  let mx=-200,my=-200,rx=-200,ry=-200;
  document.addEventListener('mousemove',e=>{ mx=e.clientX; my=e.clientY; c.style.left=mx+'px'; c.style.top=my+'px'; });
  (function loop(){ rx+=(mx-rx)*.13; ry+=(my-ry)*.13; r.style.left=Math.round(rx)+'px'; r.style.top=Math.round(ry)+'px'; requestAnimationFrame(loop); })();
})();

/* =============================================
   BOOT SEQUENCE
   ============================================= */
(function(){
  const bootEl   = document.getElementById('boot');
  const linesEl  = document.getElementById('boot-lines');
  const fillEl   = document.getElementById('boot-fill');
  const lblEl    = document.getElementById('boot-prog-lbl');
  const cornerBR = document.querySelector('.boot-corner.br');
  const cornerBL = document.getElementById('boot-time');
  const siteEl   = document.getElementById('site');

  function updateClock(){
    const n=new Date(), p=v=>String(v).padStart(2,'0');
    cornerBL.textContent = p(n.getHours())+':'+p(n.getMinutes())+':'+p(n.getSeconds());
  }
  setInterval(updateClock,1000); updateClock();

  let memFill=0;
  const memInt = setInterval(()=>{
    memFill = Math.min(memFill + Math.floor(Math.random()*128+64), 4096);
    cornerBR.textContent = 'MEM: '+memFill+'kb / 4096kb';
    if(memFill>=4096) clearInterval(memInt);
  },120);

  const lines = [
    {t:'dim', txt:'NEURAL_OS v4.1.0  —  Copyright (c) 2025 Raji Systems Ltd.', delay:0},
    {t:'dim', txt:'────────────────────────────────────────────────────────────', delay:200},
    {t:'head',txt:'[BOOT] Initializing kernel modules...', delay:450},
    {t:'ok',  txt:'  ✓  ml_core          loaded  (127ms)', delay:680},
    {t:'ok',  txt:'  ✓  vision_pipeline  loaded  (89ms)',  delay:860},
    {t:'ok',  txt:'  ✓  nlp_tokenizer    loaded  (201ms)', delay:1040},
    {t:'ok',  txt:'  ✓  data_io          loaded  (54ms)',  delay:1180},
    {t:'warn',txt:'  ⚠  cuda_runtime     fallback → cpu',  delay:1340},
    {t:'ok',  txt:'  ✓  model_registry   loaded  (312ms)', delay:1500},
    {t:'dim', txt:'', delay:1640},
    {t:'head',txt:'[SYSTEM] Loading identity profile...', delay:1700},
    {t:'dim', txt:'  ENTITY_ID  :  RAJI_ABDULMALIK', delay:1880},
    {t:'dim', txt:'  ROLE       :  AI/ML ENGINEER', delay:2020},
    {t:'dim', txt:'  BASE       :  NIGERIA', delay:2160},
    {t:'dim', txt:'  STATUS     :  ACTIVE / AVAILABLE', delay:2300},
    {t:'dim', txt:'', delay:2420},
    {t:'head',txt:'[NET] Establishing connection...', delay:2480},
    {t:'ok',  txt:'  ✓  github.io         reachable (22ms)', delay:2660},
    {t:'ok',  txt:'  ✓  whatsapp.api      reachable (38ms)', delay:2820},
    {t:'ok',  txt:'  ✓  linkedin.com      reachable (55ms)', delay:2980},
    {t:'dim', txt:'', delay:3100},
    {t:'head',txt:'[RENDER] Compiling portfolio interface...', delay:3160},
    {t:'ok',  txt:'  ✓  hero.canvas       compiled', delay:3320},
    {t:'ok',  txt:'  ✓  projects.cards    compiled', delay:3460},
    {t:'ok',  txt:'  ✓  contact.cta       compiled', delay:3580},
    {t:'dim', txt:'', delay:3700},
  ];

  const progSteps = [
    {pct:5,  lbl:'INITIALIZING...',    at:400},
    {pct:20, lbl:'LOADING MODULES...',  at:900},
    {pct:40, lbl:'LOADING IDENTITY...',at:1750},
    {pct:60, lbl:'CONNECTING...',       at:2500},
    {pct:80, lbl:'COMPILING UI...',     at:3180},
    {pct:95, lbl:'READY.',              at:3800},
    {pct:100,lbl:'LAUNCHING →',         at:4000},
  ];

  progSteps.forEach(s=>{ setTimeout(()=>{ fillEl.style.width=s.pct+'%'; lblEl.textContent=s.lbl; }, s.at); });

  lines.forEach(l=>{
    setTimeout(()=>{
      const div = document.createElement('div');
      div.className = 'boot-line '+l.t+' show';
      div.textContent = l.txt;
      linesEl.appendChild(div);
      linesEl.scrollTop = linesEl.scrollHeight;
    }, l.delay);
  });

  setTimeout(()=>{
    const nameDiv = document.createElement('div');
    nameDiv.className = 'boot-name-reveal';
    nameDiv.textContent = 'RAJI ABDUL MALIK';
    linesEl.appendChild(nameDiv);
    requestAnimationFrame(()=>{ requestAnimationFrame(()=>{ nameDiv.classList.add('show'); }); });
  }, 3600);

  setTimeout(()=>{
    bootEl.classList.add('exiting');
    setTimeout(()=>{
      bootEl.style.display = 'none';
      siteEl.classList.add('visible');
      document.dispatchEvent(new CustomEvent('neuralOSReady')); /* NEW — signals AlphaBot to walk in */
      document.body.classList.add('site-ready');
      document.querySelectorAll('.reveal').forEach(el=>{
        const obs = new IntersectionObserver(entries=>{
          entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); obs.unobserve(e.target); } });
        },{ threshold:0.1, rootMargin:'0px 0px -40px 0px' });
        obs.observe(el);
      });
    }, 1200);
  }, 4400);
})();

/* =============================================
   NAV
   ============================================= */
(function(){
  const nav = document.getElementById('nav');
  window.addEventListener('scroll',()=>nav.classList.toggle('scrolled',scrollY>40),{passive:true});
  const btn = document.getElementById('burger');
  const ul  = document.querySelector('.nav-ul');
  let open = false;
  btn.addEventListener('click',()=>{
    open=!open;
    ul.style.cssText = open
      ? 'display:flex;flex-direction:column;position:fixed;top:60px;left:0;right:0;background:rgba(4,5,10,.97);padding:20px clamp(24px,5vw,72px) 28px;gap:18px;border-bottom:1px solid rgba(255,255,255,.06);backdrop-filter:blur(20px)'
      : '';
  });
  document.querySelectorAll('.nav-ul a').forEach(a=>a.addEventListener('click',()=>{ open=false; ul.style.cssText=''; }));
})();

/* =============================================
   NEURAL NETWORK CANVAS
   ============================================= */
(function(){
  const canvas = document.getElementById('neural-canvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  let W,H,nodes;
  const N=65, MAX=155, REP_D=120, REP_F=0.55, SPD=0.3;
  let mouse={x:-2000,y:-2000};

  function resize(){ W=canvas.width=canvas.offsetWidth; H=canvas.height=canvas.offsetHeight; }

  function init(){
    nodes = Array.from({length:N},()=>({
      x:Math.random()*W, y:Math.random()*H,
      vx:(Math.random()-.5)*SPD, vy:(Math.random()-.5)*SPD,
      r:Math.random()*1.8+1, pulse:Math.random()*Math.PI*2,
      layer:Math.floor(Math.random()*4)
    }));
  }

  const layerColors = ['rgba(168,240,232,','rgba(168,240,232,','rgba(200,220,255,','rgba(168,240,232,'];

  function frame(){
    ctx.clearRect(0,0,W,H);
    nodes.forEach(n=>{
      const dx=n.x-mouse.x, dy=n.y-mouse.y, d=Math.hypot(dx,dy);
      if(d<REP_D&&d>0){ const f=(REP_D-d)/REP_D*REP_F; n.vx+=(dx/d)*f; n.vy+=(dy/d)*f; }
      n.vx*=.985; n.vy*=.985;
      const spd=Math.hypot(n.vx,n.vy);
      if(spd<0.06){ n.vx+=(Math.random()-.5)*.04; n.vy+=(Math.random()-.5)*.04; }
      if(spd>SPD*3){ n.vx*=.88; n.vy*=.88; }
      n.x+=n.vx; n.y+=n.vy; n.pulse+=.022;
      if(n.x<0){n.x=0;n.vx*=-1;} if(n.x>W){n.x=W;n.vx*=-1;}
      if(n.y<0){n.y=0;n.vy*=-1;} if(n.y>H){n.y=H;n.vy*=-1;}
    });
    for(let i=0;i<nodes.length;i++){
      for(let j=i+1;j<nodes.length;j++){
        const a=nodes[i],b=nodes[j], d=Math.hypot(a.x-b.x,a.y-b.y);
        if(d<MAX){ ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.strokeStyle=`rgba(168,240,232,${(1-d/MAX)*0.18})`; ctx.lineWidth=0.5; ctx.stroke(); }
      }
    }
    nodes.forEach(n=>{
      const glow=(Math.sin(n.pulse)*.5+.5)*.5+.2, col=layerColors[n.layer];
      ctx.beginPath(); ctx.arc(n.x,n.y,n.r,0,Math.PI*2); ctx.fillStyle=col+glow+')'; ctx.fill();
      const md=Math.hypot(n.x-mouse.x,n.y-mouse.y);
      if(md<90){ ctx.beginPath(); ctx.arc(n.x,n.y,n.r+2.5,0,Math.PI*2); ctx.strokeStyle=col+((1-md/90)*.55)+')'; ctx.lineWidth=.7; ctx.stroke(); }
    });
    requestAnimationFrame(frame);
  }

  window.addEventListener('mousemove',e=>{ const r=canvas.getBoundingClientRect(); mouse.x=e.clientX-r.left; mouse.y=e.clientY-r.top; });
  window.addEventListener('mouseleave',()=>{ mouse.x=-2000; mouse.y=-2000; });
  new ResizeObserver(()=>{ resize(); init(); }).observe(canvas);
  resize(); init(); frame();
})();


/* =============================================
   SMOOTH SCROLL
   ============================================= */
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click',e=>{
    const t=document.querySelector(a.getAttribute('href'));
    if(t){ e.preventDefault(); t.scrollIntoView({behavior:'smooth',block:'start'}); }
  });
});