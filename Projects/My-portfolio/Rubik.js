/* =============================================
   3D RUBIK'S CUBE — Fixed & Polished
   Pure CSS 3D, no libraries
   ============================================= */
(function(){
  const wrap = document.getElementById('rubik-wrap');
  if(!wrap) return;

  // ── Config ──
  const CUBIE_SIZE = 80;   // px per cubie
  const GAP        = 4;    // gap between cubies
  const STEP       = CUBIE_SIZE + GAP;

  // Face colors — site palette
  const FACE_COLORS = {
    U: '#a8f0e8', // top    — ice teal
    D: '#1a1f35', // bottom — deep navy
    F: '#e4eaf5', // front  — snow white
    B: '#2d3350', // back   — ghost
    R: '#a8f0e8', // right  — ice teal
    L: '#6b7490', // left   — mist grey
  };
  const INNER = '#080b14';

  // ── Build scene ──
  const scene = document.createElement('div');
  scene.id = 'rubik-scene';
  scene.style.cssText = `
    width:${STEP*3}px;
    height:${STEP*3}px;
    transform-style:preserve-3d;
    position:relative;
  `;
  wrap.appendChild(scene);

  // ── Create all 27 cubies ──
  // positions: -1, 0, 1 on each axis
  const cubies = [];

  for(let xi=0; xi<3; xi++){
    for(let yi=0; yi<3; yi++){
      for(let zi=0; zi<3; zi++){
        const lx = xi-1, ly = yi-1, lz = zi-1; // logical: -1,0,1

        const cubie = document.createElement('div');
        cubie.style.cssText = `
          position:absolute;
          width:${CUBIE_SIZE}px;
          height:${CUBIE_SIZE}px;
          transform-style:preserve-3d;
          transform: translate3d(
            ${xi*STEP}px,
            ${yi*STEP}px,
            ${lz*STEP}px
          );
        `;

        // ── 6 faces ──
        const faceDefs = [
          // name, transform,                          show condition, color key
          ['F', `translateZ(${CUBIE_SIZE/2}px)`,                         lz===1,  'F'],
          ['B', `translateZ(-${CUBIE_SIZE/2}px) rotateY(180deg)`,        lz===-1, 'B'],
          ['R', `translateX(${CUBIE_SIZE/2}px) rotateY(90deg)`,          lx===1,  'R'],
          ['L', `translateX(-${CUBIE_SIZE/2}px) rotateY(-90deg)`,        lx===-1, 'L'],
          ['U', `translateY(-${CUBIE_SIZE/2}px) rotateX(90deg)`,         ly===-1, 'U'],
          ['D', `translateY(${CUBIE_SIZE/2}px) rotateX(-90deg)`,         ly===1,  'D'],
        ];

        faceDefs.forEach(([name, tr, visible, colorKey])=>{
          const face = document.createElement('div');
          const bg = visible ? FACE_COLORS[colorKey] : INNER;
          face.style.cssText = `
            position:absolute;
            width:${CUBIE_SIZE}px;
            height:${CUBIE_SIZE}px;
            background:${bg};
            transform:${tr};
            backface-visibility:hidden;
            border: 2px solid rgba(0,0,0,0.55);
            border-radius: 3px;
            ${visible ? `box-shadow: inset 0 0 0 3px rgba(255,255,255,0.08);` : ''}
          `;
          cubie.appendChild(face);
        });

        scene.appendChild(cubie);
        cubies.push({ el:cubie, lx, ly, lz });
      }
    }
  }

  // ── Overall cube rotation ──
  let rotX = -28, rotY = 38;
  let velX =  0.10, velY = 0.22;

  function applySceneRotation(){
    scene.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
  }

  // ── Render loop ──
  function tick(){
    rotX += velX;
    rotY += velY;
    applySceneRotation();
    requestAnimationFrame(tick);
  }
  tick();

  // ── Drag to rotate ──
  let dragging=false, dragX=0, dragY=0;
  wrap.style.cursor='grab';
  wrap.addEventListener('mousedown', e=>{
    dragging=true; dragX=e.clientX; dragY=e.clientY;
    velX=0; velY=0;
    wrap.style.cursor='grabbing';
    e.preventDefault();
  });
  window.addEventListener('mouseup',()=>{
    if(dragging){ dragging=false; velX=0.10; velY=0.22; wrap.style.cursor='grab'; }
  });
  window.addEventListener('mousemove',e=>{
    if(!dragging) return;
    rotY += (e.clientX-dragX)*0.45;
    rotX -= (e.clientY-dragY)*0.45;
    dragX=e.clientX; dragY=e.clientY;
  });

  // ── Shuffle moves ──
  // We rotate groups of cubies by animating a wrapper div
  let isAnimating = false;
  const moveQueue = [];

  // Possible moves: {axis:'x'|'y'|'z', layer:-1|0|1, dir:1|-1}
  function queueRandomMoves(count){
    const axes=['x','y','z'], layers=[-1,0,1], dirs=[1,-1];
    for(let i=0;i<count;i++){
      moveQueue.push({
        axis:   axes[Math.floor(Math.random()*3)],
        layer:  layers[Math.floor(Math.random()*3)],
        dir:    dirs[Math.floor(Math.random()*2)]
      });
    }
    if(!isAnimating) runNextMove();
  }

  function runNextMove(){
    if(moveQueue.length===0){ isAnimating=false; return; }
    isAnimating=true;
    const {axis, layer, dir} = moveQueue.shift();

    // Find affected cubies
    const affected = cubies.filter(c=>{
      if(axis==='x') return c.lx===layer;
      if(axis==='y') return c.ly===layer;
      return c.lz===layer;
    });

    // Create a temporary pivot wrapper
    const pivot = document.createElement('div');
    pivot.style.cssText = `
      position:absolute;
      width:${CUBIE_SIZE}px;
      height:${CUBIE_SIZE}px;
      transform-style:preserve-3d;
      transform: translate3d(${STEP}px,${STEP}px,0px);
      transition: transform 0.42s cubic-bezier(0.22,1,0.36,1);
    `;
    scene.appendChild(pivot);

    // Reparent affected cubies into pivot
    affected.forEach(c=>{
      const el = c.el;
      // Get current translate values
      const m = el.style.transform.match(/translate3d\(([^)]+)\)/);
      if(!m) return;
      const [tx,ty,tz] = m[1].split(',').map(v=>parseFloat(v));
      // Offset by pivot origin
      el.style.transform = `translate3d(${tx-STEP}px,${ty-STEP}px,${tz}px)`;
      pivot.appendChild(el);
    });

    // Force reflow
    pivot.getBoundingClientRect();

    // Apply rotation
    const deg = dir * 90;
    let rx=0,ry=0,rz=0;
    if(axis==='x') rx=deg;
    if(axis==='y') ry=deg;
    if(axis==='z') rz=deg;
    pivot.style.transform = `translate3d(${STEP}px,${STEP}px,0px) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg)`;

    // After transition: update positions and reparent back
    setTimeout(()=>{
      affected.forEach(c=>{
        const el = c.el;
        // Get world position from pivot
        const m = el.style.transform.match(/translate3d\(([^)]+)\)/);
        if(!m) return;
        const [tx,ty,tz] = m[1].split(',').map(v=>parseFloat(v));

        // Compute new logical position after rotation
        const [lx,ly,lz] = [c.lx, c.ly, c.lz];
        if(axis==='x'){ c.ly = dir===1 ? -lz : lz;  c.lz = dir===1 ? ly  : -ly; }
        if(axis==='y'){ c.lx = dir===1 ? lz  : -lz; c.lz = dir===1 ? -lx : lx;  }
        if(axis==='z'){ c.lx = dir===1 ? -ly : ly;  c.ly = dir===1 ? lx  : -lx; }

        // Restore world position
        const nx = (c.lx+1)*STEP, ny = (c.ly+1)*STEP, nz = c.lz*STEP;
        el.style.transform = `translate3d(${nx}px,${ny}px,${nz}px)`;
        el.style.transition = '';
        scene.appendChild(el);
      });

      scene.removeChild(pivot);
      setTimeout(runNextMove, 80);
    }, 460);
  }

  // Kick off shuffling after boot
  setTimeout(()=>{
    queueRandomMoves(4);
    setInterval(()=> queueRandomMoves(2+Math.floor(Math.random()*2)), 2200);
  }, 5000);

})();