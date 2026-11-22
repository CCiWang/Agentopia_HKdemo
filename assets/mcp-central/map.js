'use strict';
const originalData=window.MCP_MAP;
let data=originalData;
let currentFloor='L1';
const $=id=>document.getElementById(id);
const viewport=$('viewport'),world=$('world'),size=$('mapSize');
let zoom=.75,fitMode=false,selected=null,category='全部';
const rooms=new Map();
const fmt=(n)=>Math.round(n)+'px';
function node(tag,cls,text){const el=document.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=text;return el;}
function renderRooms(){
$('rooms').replaceChildren();rooms.clear();
for(const shop of data.shops){
 const room=node('div','room'+(shop.confirmed?'':' unnamed'));room.dataset.shop=shop.id;room.dataset.door=shop.door;
 Object.assign(room.style,{left:fmt(shop.x),top:fmt(shop.y),width:fmt(shop.w),height:fmt(shop.h)});
 const art=node('div','room-art');art.setAttribute('aria-hidden','true');
 const label=node('button','room-label',shop.name);label.type='button';label.setAttribute('aria-label',shop.name+(shop.confirmed?'，查看商铺':'，待命名铺位'));
 label.append(node('small','',shop.confirmed?currentFloor+' · '+shop.category:'待命名'));
 label.addEventListener('click',()=>openShop(shop));
 const door=node('div','door '+shop.door);door.setAttribute('aria-hidden','true');room.append(art,door,label);$('rooms').append(room);rooms.set(shop.id,room);
}
}
renderRooms();
// Public-space details remain separate from the shop artwork and names.
for(const [x,y] of [[120,370],[840,370],[920,355],[1268,355],[920,540],[1268,540],[1940,370],[2000,620],[80,700],[870,710],[1280,760],[2180,760]]){
 const p=node('div','planter');Object.assign(p.style,{left:fmt(x),top:fmt(y)});$('scenery').append(p);
}
for(const [x,y] of [[560,370],[730,370],[1390,380],[1750,380],[985,550],[1145,550]]){
 const b=node('div','bench');Object.assign(b.style,{left:fmt(x),top:fmt(y)});$('scenery').append(b);
}
for(const [x,y] of [[260,382],[740,392],[1055,265],[1370,388],[1740,288],[2050,300],[1150,760],[2040,620]]){
 const e=node('div','escalator');Object.assign(e.style,{left:fmt(x),top:fmt(y)});$('scenery').append(e);
}
function setZoom(next,anchor){
 const point=anchor||{x:(viewport.scrollLeft+viewport.clientWidth/2)/zoom,y:(viewport.scrollTop+viewport.clientHeight/2)/zoom};
 zoom=Math.max(.18,Math.min(1.6,next));world.style.transform=`scale(${zoom})`;size.style.width=fmt(data.width*zoom);size.style.height=fmt(data.height*zoom);
 $('zoomValue').value=Math.round(zoom*100)+'%';$('zoomIn').disabled=zoom>=1.6;$('zoomOut').disabled=zoom<=.18;
 viewport.scrollLeft=point.x*zoom-viewport.clientWidth/2;viewport.scrollTop=point.y*zoom-viewport.clientHeight/2;
}
function overview(){fitMode=true;setZoom(Math.min((viewport.clientWidth-20)/data.width,(viewport.clientHeight-20)/data.height),{x:data.width/2,y:data.height/2});}
function centerAtrium(){fitMode=false;setZoom(innerWidth<700?.8:.7,{x:1250,y:475});}
function setDirectory(open){$('directory').hidden=!open;$('directoryToggle').setAttribute('aria-expanded',String(open));if(open)$('shopSearch').focus();}
$('directoryToggle').addEventListener('click',()=>setDirectory($('directory').hidden));$('directoryClose').addEventListener('click',()=>setDirectory(false));
$('zoomIn').addEventListener('click',()=>{fitMode=false;setZoom(zoom*1.22);});$('zoomOut').addEventListener('click',()=>{fitMode=false;setZoom(zoom/1.22);});$('fitMap').addEventListener('click',overview);$('centerMap').addEventListener('click',centerAtrium);
function selectShop(shop){selected=shop;rooms.forEach((r,id)=>r.classList.toggle('selected',id===shop.id));}
function locate(shop){selectShop(shop);fitMode=false;setZoom(Math.max(zoom,.85),{x:shop.x+shop.w/2,y:shop.y+shop.h/2});}
function openShop(shop){
 selectShop(shop);$('shopName').textContent=shop.name;$('shopCategory').textContent=shop.confirmed?shop.category.toUpperCase()+' / '+currentFloor:'UNASSIGNED / '+currentFloor;
 $('shopUnit').textContent=shop.unit?(currentFloor==='L1'?'参考铺号 · ':'游戏铺位 · ')+shop.unit:'参考平面图已标注店名';
 $('shopNote').textContent=shop.confirmed?'店名依据官方 L1 参考图；当前内景为通用游戏场景，不代表该品牌真实门店。':'参考图未提供这组铺位的店名，暂以铺号显示；可在商铺数据中独立修改名称。';
 if(currentFloor!=='L1')$('shopNote').textContent='本层尚无官方参考图，当前为临时游戏布局；铺号、店名和位置均待核实。';
 $('shopDialog').showModal();
}
$('shopClose').addEventListener('click',()=>$('shopDialog').close());$('locateShop').addEventListener('click',()=>{$('shopDialog').close();if(innerWidth<700)setDirectory(false);locate(selected);});
for(const dialog of [$('shopDialog'),$('sourceDialog')])dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
const categories=['全部','服饰','餐饮','美妆','珠宝','运动','生活','待命名'];
for(const c of categories){const b=node('button','filter'+(c==='全部'?' active':''),c);b.setAttribute('aria-pressed',String(c==='全部'));b.addEventListener('click',()=>{category=c;for(const f of $('filters').children){f.classList.toggle('active',f===b);f.setAttribute('aria-pressed',String(f===b));}renderList();});$('filters').append(b);}
function renderList(){
 const q=$('shopSearch').value.trim().toLocaleLowerCase();const filtered=data.shops.filter(s=>(category==='全部'||s.category===category)&&`${s.name} ${s.unit}`.toLocaleLowerCase().includes(q));
 $('shopList').replaceChildren();$('resultCount').textContent=`${filtered.length} 个店铺区域 · ${currentFloor==='L1'?'参考图店名':'游戏化示意层'}`;
 rooms.forEach((r,id)=>r.classList.toggle('dim',!filtered.some(s=>s.id===id)));
 for(const shop of filtered){const b=node('button','list-shop');const info=node('span');info.append(node('strong','',shop.name),node('small','',shop.confirmed?shop.category+' · 参考图店名':shop.unit+' · 待命名'));b.append(info,node('span','','↗'));b.addEventListener('click',()=>{if(innerWidth<700)setDirectory(false);locate(shop);});$('shopList').append(b);}
 if(!filtered.length)$('shopList').append(node('p','result-count','没有找到匹配的商铺，试试名称或铺号。'));
}
$('shopSearch').addEventListener('input',renderList);renderList();
$('sourceNotice').textContent=data.notice;$('sourceLink').href=data.source;$('sourceButton').addEventListener('click',()=>$('sourceDialog').showModal());
// Mouse dragging; touch scrolling stays native so phone gestures remain smooth.
let drag=null;
viewport.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'||e.button!==0||e.target.closest('button'))return;drag={x:e.clientX,y:e.clientY,left:viewport.scrollLeft,top:viewport.scrollTop};viewport.setPointerCapture(e.pointerId);viewport.classList.add('dragging');});
viewport.addEventListener('pointermove',e=>{if(!drag)return;viewport.scrollLeft=drag.left+drag.x-e.clientX;viewport.scrollTop=drag.top+drag.y-e.clientY;});
function stopDrag(){drag=null;viewport.classList.remove('dragging');}viewport.addEventListener('pointerup',stopDrag);viewport.addEventListener('pointercancel',stopDrag);

let first=true;new ResizeObserver(()=>{if(first){first=false;centerAtrium();}else if(fitMode)overview();}).observe(viewport);

function prototypeFloor(level){
 const shops=[];let n=0;
 const add=(x,y,w,h,door)=>{const unit=level+'-'+String(++n).padStart(2,'0');shops.push({id:unit,name:'铺位 '+unit,unit,x,y,w,h,door,category:'待命名',confirmed:false});};
 if(level==='G'){
  for(let i=0;i<10;i++)add(100+i*206,120,186,210,'south');
  for(let i=0;i<10;i++)add(100+i*206,780,186,180,'north');
  for(let i=0;i<4;i++){add(100+i*190,545,170,145,'north');add(1450+i*175,545,155,145,'north');}
 }else{
  for(let i=0;i<12;i++)add(95+i*173,100,153,230,'south');
  for(let i=0;i<12;i++)add(95+i*173,800,153,160,'north');
  for(let i=0;i<3;i++){add(150+i*225,550,205,170,'north');add(1500+i*225,550,205,170,'north');}
 }
 return {...originalData,shops,floor:level,notice:level+' 为可探索的游戏化示意布局，尚无该层官方平面图；铺号和店铺位置为临时设计，不代表真实商场。'};
}
const floors={G:prototypeFloor('G'),L1:originalData,L2:prototypeFloor('L2')};
function changeFloor(level){
 if(!floors[level])return;currentFloor=level;data=floors[level];selected=null;category='全部';
 for(const dialog of document.querySelectorAll('dialog[open]'))dialog.close();
 $('shopSearch').value='';for(const f of $('filters').children){const active=f.textContent==='全部';f.classList.toggle('active',active);f.setAttribute('aria-pressed',String(active));}
 renderRooms();renderList();$('floorName').textContent=level;$('floorTitle').textContent=level==='L1'?'天幕广场':level==='G'?'地下迎宾大厅':'二楼空中廊庭';
 $('floorNotice').textContent=level==='L1'?'参考图布局 · 非实时商户目录':'游戏化示意层 · 店名及位置待核实';
 $('levelPill').textContent='LEVEL '+level;$('sourceNotice').textContent=data.notice;
 document.querySelector('.preview-label').textContent=level+' · MCP CENTRAL';
 document.querySelector('.atrium-label strong').textContent=level==='L1'?'天幕广场':level==='G'?'迎宾大厅':'空中廊庭';
 document.querySelector('.atrium-label small').textContent=level==='L1'?'ATRIUM A + B':'CONCEPT FLOOR';
 for(const b of document.querySelectorAll('.floor-switch [data-floor]'))b.setAttribute('aria-pressed',String(b.dataset.floor===level));
 document.querySelectorAll('.bridge span').forEach((b,i)=>b.textContent=level==='L1'?['← 宝林邨 · 英明苑','↑ 欣明苑','↓ 宝琳站 · 三期','↓ 宝琳站 · 一期'][i]:['← 西侧通道','↑ 北侧通道','↓ 南侧通道','↓ 东侧通道'][i]);
 if(window.mallMovement)window.mallMovement.reset();centerAtrium();
}
document.querySelectorAll('.floor-switch [data-floor]').forEach(b=>b.addEventListener('click',()=>changeFloor(b.dataset.floor)));
