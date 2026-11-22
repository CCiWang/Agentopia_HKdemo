'use strict';
(()=>{
 const avatar=document.getElementById('player');const keys=new Set();let x=1320,y=475,path=[],last=0,pressOrigin=null;
 const CELL=20,R=10,SPEED=155;const cols=Math.ceil(originalData.width/CELL),rows=Math.ceil(originalData.height/CELL);
 let cachedData=null,obstacles=[];
 function blocked(px,py){
  if(cachedData!==data){cachedData=data;obstacles=[...data.shops,{x:950,y:362,w:310,h:190},...[...document.querySelectorAll('#scenery>div')].map(el=>({x:parseFloat(el.style.left),y:parseFloat(el.style.top),w:el.offsetWidth,h:el.offsetHeight}))];}
  if(px<35||py<35||px>originalData.width-75||py>originalData.height-75)return true;
  const hit=b=>px+R>b.x&&px-R<b.x+b.w&&py+R>b.y&&py-R<b.y+b.h;
  if(obstacles.some(hit))return true;
  return false;
 }
 function render(){avatar.style.left=(x-17)+'px';avatar.style.top=(y-45)+'px';avatar.dataset.x=x.toFixed(1);avatar.dataset.y=y.toFixed(1);avatar.dataset.floor=currentFloor;}
 function follow(force=false){const cx=(x+20)*zoom,cy=(y+20)*zoom;const margin=Math.min(100,viewport.clientWidth/3);if(force||cx<viewport.scrollLeft+margin||cx>viewport.scrollLeft+viewport.clientWidth-margin||cy<viewport.scrollTop+80||cy>viewport.scrollTop+viewport.clientHeight-110){viewport.scrollLeft=cx-viewport.clientWidth/2;viewport.scrollTop=cy-viewport.clientHeight/2;}}
 function move(dx,dy){const oldx=x,oldy=y;const steps=Math.ceil(Math.max(Math.abs(dx),Math.abs(dy))/5)||1;for(let i=0;i<steps;i++){if(!blocked(x+dx/steps,y))x+=dx/steps;if(!blocked(x,y+dy/steps))y+=dy/steps;}return Math.hypot(x-oldx,y-oldy)>0.1;}
 function nearest(px,py){let best=null,d=Infinity;const cx=Math.floor(px/CELL),cy=Math.floor(py/CELL);for(let yy=Math.max(0,cy-8);yy<Math.min(rows,cy+9);yy++)for(let xx=Math.max(0,cx-8);xx<Math.min(cols,cx+9);xx++){const nx=xx*CELL+10,ny=yy*CELL+10,dd=(nx-px)**2+(ny-py)**2;if(dd<d&&!blocked(nx,ny)){d=dd;best=yy*cols+xx;}}return best;}
 function walkTo(px,py){const start=nearest(x,y),goal=nearest(px,py);if(start===null||goal===null)return;const parents=new Int32Array(cols*rows).fill(-1),queue=[start];parents[start]=start;let index=0;while(index<queue.length&&parents[goal]===-1){const cell=queue[index++],cx=cell%cols,cy=Math.floor(cell/cols);for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=cx+dx,ny=cy+dy,n=ny*cols+nx;if(nx<0||ny<0||nx>=cols||ny>=rows||parents[n]!==-1||blocked(nx*CELL+10,ny*CELL+10))continue;parents[n]=cell;queue.push(n);}}
  if(parents[goal]===-1){document.getElementById('movementHint').textContent='这里暂时无法到达，试试附近的通道';return;}path=[];let n=goal;while(n!==start){path.push({x:n%cols*CELL+10,y:Math.floor(n/cols)*CELL+10});n=parents[n];}path.reverse();document.getElementById('movementHint').textContent='正在前往 · 按方向键可接管';
 }
 const directions={w:'up',ArrowUp:'up',s:'down',ArrowDown:'down',a:'left',ArrowLeft:'left',d:'right',ArrowRight:'right'};
 const busy=()=>!!document.querySelector('dialog[open]')||['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName);
 window.addEventListener('keydown',e=>{const k=directions[e.key]||directions[e.key.toLowerCase()];if(!k||busy())return;e.preventDefault();path=[];if(!keys.has(k)){move(k==='right'?8:k==='left'?-8:0,k==='down'?8:k==='up'?-8:0);render();follow();}keys.add(k);});
 window.addEventListener('keyup',e=>keys.delete(directions[e.key]||directions[e.key.toLowerCase()]));
 const clear=()=>{keys.clear();path=[];avatar.classList.remove('walking');};window.addEventListener('blur',clear);document.addEventListener('visibilitychange',()=>{if(document.hidden)clear();});
 for(const b of document.querySelectorAll('[data-move]')){
  b.addEventListener('pointerdown',e=>{e.preventDefault();path=[];const k=b.dataset.move;move(k==='right'?8:k==='left'?-8:0,k==='down'?8:k==='up'?-8:0);render();follow();keys.add(k);b.setPointerCapture(e.pointerId);});
  for(const ev of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(ev,()=>keys.delete(b.dataset.move));
 }
 viewport.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;pressOrigin={x:e.clientX,y:e.clientY,left:viewport.scrollLeft,top:viewport.scrollTop};});
 viewport.addEventListener('pointerup',e=>{if(!pressOrigin)return;const o=pressOrigin;pressOrigin=null;if(Math.hypot(e.clientX-o.x,e.clientY-o.y)>8||Math.abs(viewport.scrollLeft-o.left)+Math.abs(viewport.scrollTop-o.top)>8)return;const r=world.getBoundingClientRect();walkTo((e.clientX-r.left)/zoom-20,(e.clientY-r.top)/zoom-20);});
 viewport.addEventListener('pointercancel',()=>pressOrigin=null);
 document.getElementById('followPlayer').addEventListener('click',()=>follow(true));
 const hint=document.createElement('span');hint.id='movementHint';hint.textContent='WASD / 方向键移动 · 点空地前往';const status=document.querySelector('.map-status>span');status.replaceChildren(hint);
 window.mallMovement={reset(){clear();x=1320;y=475;render();hint.textContent='已到达 '+currentFloor+' · 可自由探索';}};
 function tick(t){const dt=Math.min((t-last)/1000||0,.04);last=t;let moving=false;
  if(busy()){clear();}else{
   let dx=(keys.has('right')?1:0)-(keys.has('left')?1:0),dy=(keys.has('down')?1:0)-(keys.has('up')?1:0);
   if(dx||dy){const len=Math.hypot(dx,dy);moving=move(dx/len*SPEED*dt,dy/len*SPEED*dt);}
   else if(path.length){const target=path[0],vx=target.x-x,vy=target.y-y,len=Math.hypot(vx,vy);if(len<3){path.shift();if(!path.length)hint.textContent='已到达 · 点击店名查看商铺';}else{const speed=Math.min(SPEED*dt,len);moving=move(vx/len*speed,vy/len*speed);if(!moving)path=[];}}
  }
  avatar.classList.toggle('walking',moving);if(moving){render();follow();}requestAnimationFrame(tick);
 }
 render();requestAnimationFrame(tick);
})();
