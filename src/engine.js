/* ============ RIDGEFALL v0.1 — Core Combat Prototype ============
 * Built to the locked v0.1 spec: 10x10 grid, flat terrain (high-ground
 * marked, not layered), exact stats, hit/damage formulas, 4 skills per
 * job, Reaction Points, Classic-Mode reaction rolls. Placeholder art.  */

const cv=document.getElementById('game'), ctx=cv.getContext('2d');
ctx.imageSmoothingEnabled=false;
const VW=560, VH=520; cv.width=VW; cv.height=VH;

// ---- iso projection (flat board; high-ground is a flag, not elevation) ----
const TW=44, TH=22, OX=VW/2, OY=70;
const HG_LIFT=6; // tiny visual lift for high-ground tiles only
// camera: zoom + pan (applied on top of base projection)
const cam={z:1, x:0, y:0, min:0.6, max:2.4};
function iso(gx,gy,lift=0){
  const wx=OX+(gx-gy)*(TW/2), wy=OY+(gx+gy)*(TH/2)-lift;
  return{x:(wx-VW/2)*cam.z+VW/2+cam.x, y:(wy-VH/2)*cam.z+VH/2+cam.y};
}

// ---- Map: 10x10 ----
const N=10;
// terrain codes: 0 normal, 1 cover, 2 high, 3 fire, 4 blocked
const MAP=[
 [0,0,0,0,0,0,0,0,0,0],
 [0,0,0,2,2,0,0,0,0,0],
 [0,0,0,2,2,0,0,1,0,0],
 [0,0,0,0,0,0,0,1,0,0],
 [0,4,0,0,3,3,0,0,0,0],
 [0,4,0,0,3,3,0,0,4,0],
 [0,0,0,1,0,0,0,0,4,0],
 [0,0,0,1,0,0,2,2,0,0],
 [0,0,0,0,0,0,2,2,0,0],
 [0,0,0,0,0,0,0,0,0,0],
];
const TT={
 0:{n:'Normal', top:'#6f8a44',topSh:'#5c7538',side:'#3f4f24'},
 1:{n:'Cover',  top:'#4f7040',topSh:'#3f5a33',side:'#2c421f', cover:true},
 2:{n:'High Ground',top:'#9a9078',topSh:'#847a63',side:'#4d453a', high:true},
 3:{n:'Fire',   top:'#b8502f',topSh:'#9a3f24',side:'#5c2318', fire:true},
 4:{n:'Blocked',top:'#3a352c',topSh:'#2c281f',side:'#1c1812', blocked:true},
};
const tt=(x,y)=>TT[MAP[y][x]];
const inB=(x,y)=>x>=0&&y>=0&&x<N&&y<N;
const passable=(x,y)=>inB(x,y)&&!tt(x,y).blocked;

// ---- Units (exact v0.1 stats) ----
function U(o){return Object.assign({hp:o.HP,max:o.HP,px:o.x,py:o.y,anim:'idle',aframe:0,face:o.foe?-1:1,flash:0,rp:1,acted:false,statuses:{}},o);}
let units=[
 U({id:'war',cid:'warder',name:'Warder',foe:false,x:2,y:9,HP:45,ATK:8,MAG:2,DEF:6,RES:3,ACC:80,EVA:5,SPD:8,MOVE:3,
    skills:['Guard Ally','Shield Bash','Brace','Intercept'], react:'block'}),
 U({id:'due',cid:'duelist',name:'Duelist',foe:false,x:4,y:9,HP:34,ATK:10,MAG:2,DEF:4,RES:3,ACC:85,EVA:12,SPD:11,MOVE:4,
    skills:['Rival Mark','Quick Cut','Hamstring','Riposte Stance'], react:'parry'}),
 U({id:'lan',cid:'lanternist',name:'Lanternist',foe:false,x:6,y:9,HP:30,ATK:3,MAG:9,DEF:3,RES:6,ACC:80,EVA:8,SPD:9,MOVE:4,
    skills:['Warm Light','Place Lantern','Reveal','Guiding Glow'], react:'lightguard'}),
 U({id:'rd1',cid:'raider',name:'Raider',foe:true,x:3,y:1,HP:28,ATK:7,MAG:0,DEF:3,RES:2,ACC:75,EVA:5,SPD:8,MOVE:4,
    skills:['Basic Attack','Heavy Swing'], react:null}),
 U({id:'rd2',cid:'raider',name:'Raider',foe:true,x:6,y:1,HP:28,ATK:7,MAG:0,DEF:3,RES:2,ACC:75,EVA:5,SPD:8,MOVE:4,
    skills:['Basic Attack','Heavy Swing'], react:null}),
 U({id:'arc',cid:'archer',name:'Archer',foe:true,x:8,y:2,HP:22,ATK:6,MAG:0,DEF:2,RES:2,ACC:80,EVA:8,SPD:9,MOVE:4,
    skills:['Basic Shot','Pin Shot'], react:null, proj:'arrow'}),
 U({id:'spk',cid:'spark',name:'Spark Caster',foe:true,x:5,y:0,HP:20,ATK:2,MAG:8,DEF:2,RES:5,ACC:80,EVA:5,SPD:8,MOVE:3,
    skills:['Spark','Fire Tile'], react:null, proj:'bolt'}),
];

// ---- Job & enemy templates for the battle-setup selector ----
const JOB={
 warder:    {cid:'warder',name:'Warder',HP:45,ATK:8,MAG:2,DEF:6,RES:3,ACC:80,EVA:5,SPD:8,MOVE:3, skills:['Guard Ally','Shield Bash','Brace','Intercept'], react:'block'},
 duelist:   {cid:'duelist',name:'Duelist',HP:34,ATK:10,MAG:2,DEF:4,RES:3,ACC:85,EVA:12,SPD:11,MOVE:4, skills:['Rival Mark','Quick Cut','Hamstring','Riposte Stance'], react:'parry'},
 lanternist:{cid:'lanternist',name:'Lanternist',HP:30,ATK:3,MAG:9,DEF:3,RES:6,ACC:80,EVA:8,SPD:9,MOVE:4, skills:['Warm Light','Place Lantern','Reveal','Guiding Glow'], react:'lightguard'},
 bowman:    {cid:'bowman',name:'Bowman',HP:28,ATK:8,MAG:2,DEF:3,RES:3,ACC:82,EVA:8,SPD:9,MOVE:4, skills:['Aimed Shot','High Shot','Pinning Shot','Overwatch'], react:'snap', proj:'arrow'},
 ember:     {cid:'ember',name:'Ember Cantor',HP:27,ATK:3,MAG:10,DEF:2,RES:5,ACC:80,EVA:6,SPD:8,MOVE:4, skills:['Fire Spark','Ember Tile','Smoke Chant','Kindling'], react:'cinder', proj:'bolt'},
 courier:   {cid:'courier',name:'Courier',HP:31,ATK:6,MAG:3,DEF:3,RES:3,ACC:80,EVA:14,SPD:12,MOVE:5, skills:['Quick Item','Sprint','Drag Ally','Supply Toss'], react:'quickstep'},
};
const FOE={
 raider:{cid:'raider',name:'Raider',HP:28,ATK:7,MAG:0,DEF:3,RES:2,ACC:75,EVA:5,SPD:8,MOVE:4, skills:['Basic Attack','Heavy Swing'], react:null},
 archer:{cid:'archer',name:'Archer',HP:22,ATK:6,MAG:0,DEF:2,RES:2,ACC:80,EVA:8,SPD:9,MOVE:4, skills:['Basic Shot','Pin Shot'], react:null, proj:'arrow'},
 spark: {cid:'spark',name:'Spark Caster',HP:20,ATK:2,MAG:8,DEF:2,RES:5,ACC:80,EVA:5,SPD:8,MOVE:3, skills:['Spark','Fire Tile'], react:null, proj:'bolt'},
};
// ---- Equipment (display-only flavor for the View Field inspector; no stat effects yet) ----
const GEAR={
 warder:    {Weapon:'Iron Mace',    Offhand:'Tower Shield',    Armor:'Warden Plate',    Trinket:'Oathbound Sigil'},
 duelist:   {Weapon:'Dueling Saber',Offhand:'Parrying Dagger', Armor:'Studded Leather', Trinket:'Rival’s Token'},
 lanternist:{Weapon:'Lantern Staff',Offhand:'Oil Flask',       Armor:'Pilgrim Robes',   Trinket:'Warm Charm'},
 bowman:    {Weapon:'Yew Longbow',  Offhand:'Quiver',          Armor:'Ranger Jerkin',   Trinket:'Keen Eyepiece'},
 ember:     {Weapon:'Cantor Rod',   Offhand:'Ember Focus',     Armor:'Ash-weave Robes', Trinket:'Cinder Bead'},
 courier:   {Weapon:'Swift Dagger', Offhand:'Supply Satchel',  Armor:'Traveler Garb',   Trinket:'Fleetfoot Band'},
 raider:    {Weapon:'Notched Axe',  Offhand:'Buckler',         Armor:'Hide Vest',       Trinket:'—'},
 archer:    {Weapon:'Short Bow',    Offhand:'Quiver',          Armor:'Leather Vest',    Trinket:'—'},
 spark:     {Weapon:'Spark Wand',   Offhand:'—',               Armor:'Woven Cloak',     Trinket:'Static Charm'},
};
const BATTLES={
 0:{players:['warder','duelist','lanternist'], foes:['raider']},
 1:{players:['warder','duelist','lanternist'], foes:['raider','raider','archer','spark']},
 2:{players:['warder','duelist','lanternist','bowman'], foes:['raider','raider','archer','archer','spark']},
 3:{players:['warder','duelist','lanternist','bowman','ember'], foes:['raider','raider','archer','spark','spark']},
 4:{players:['warder','duelist','lanternist','bowman','ember','courier'], foes:['raider','raider','raider','archer','spark']},
 5:{players:['warder','duelist','lanternist','bowman','ember','courier'], foes:['raider','raider','raider','archer','archer','spark','spark']},
};
const PSTART=[[2,9],[4,9],[6,9],[1,8],[7,8],[3,8]];
const FSTART=[[3,1],[6,1],[8,2],[1,2],[5,0],[4,1],[7,1]];
function loadBattle(n){
  const b=BATTLES[n]; if(!b)return;
  units=[];
  b.players.forEach((j,i)=>{ const t=JOB[j]; const s=PSTART[i]||[i,9];
    units.push(U(Object.assign({},t,{id:'p'+i,foe:false,x:s[0],y:s[1]}))); });
  b.foes.forEach((f,i)=>{ const t=FOE[f]; const s=FSTART[i]||[i,0];
    units.push(U(Object.assign({},t,{id:'e'+i,foe:true,x:s[0],y:s[1]}))); });
  lanterns=[]; lanternTiles=new Set(); fireExtra=new Map(); projectiles=[]; pops=[];
  order=[]; oi=-1; round=0; active=null; mode='idle'; busy=false; selSkill=null; moveUndo=null; pendingCast=null; hiAoe=new Set();
  document.getElementById('overlay').classList.remove('show');
  buildOrder(); nextTurn();
}
window.dbgLoadBattle=(n)=>loadBattle(n);

// ---- Skill definitions (v0.1 slice) ----
// type: melee/ranged/heal/buff/support ; power ; range ; acc(skill accuracy)
const SK={
 // Warder
 'Guard Ally':{type:'support',range:1,acc:0,desc:'Guard an adjacent ally (they take -30% until your next turn).',target:'ally'},
 'Shield Bash':{type:'melee',power:5,range:1,acc:75,desc:'Melee hit, may Expose.',status:'Exposed'},
 'Brace':{type:'self',range:0,acc:0,desc:'Gain Guarded (reduce damage) until next turn.',selfstatus:'Guarded'},
 'Intercept':{type:'self',range:0,acc:0,desc:'Ready: block the next hit on a nearby ally.',selfstatus:'Intercept'},
 // Duelist
 'Rival Mark':{type:'debuff',range:3,acc:90,desc:'Mark a foe: it takes bonus damage from you.',status:'Marked',target:'foe'},
 'Quick Cut':{type:'melee',power:6,range:1,acc:90,desc:'Fast, accurate melee strike.'},
 'Hamstring':{type:'melee',power:3,range:1,acc:85,desc:'Melee hit, applies Slow.',status:'Slow'},
 'Riposte Stance':{type:'self',range:0,acc:0,desc:'Boost parry reaction chance this round.',selfstatus:'Riposte'},
 // Lanternist
 'Warm Light':{type:'heal',power:6,range:3,acc:0,desc:'Heal an ally.',target:'ally'},
 'Place Lantern':{type:'zone',range:2,acc:0,desc:'Create a safe tile (allies on it get Guarded).'},
 'Reveal':{type:'reveal',range:4,acc:0,desc:'Clear smoke (radius 2) and Expose foes there for 1 round.'},
 'Guiding Glow':{type:'buff',range:2,acc:0,desc:'Give an ally +ACC/EVA (Guided).',status:'Guided',target:'ally'},
 // Raider
 'Basic Attack':{type:'melee',power:0,range:1,acc:85,desc:'Standard melee.'},
 'Heavy Swing':{type:'melee',power:6,range:1,acc:70,desc:'Strong but less accurate.'},
 // Archer
 'Basic Shot':{type:'ranged',power:0,range:3,acc:85,desc:'Standard shot.'},
 'Pin Shot':{type:'ranged',power:2,range:3,acc:80,desc:'Shot that Slows.',status:'Slow'},
 // Spark
 'Spark':{type:'magic',power:4,range:3,acc:85,desc:'Magic bolt.'},
 'Fire Tile':{type:'firetile',power:3,range:2,acc:85,desc:'Magic hit; leaves burning ground (test).'},
 // Bowman (ranged 2-5, LoS simplified to range)
 'Aimed Shot':{type:'ranged',power:4,range:5,minr:2,acc:90,desc:'Reliable shot. +2 dmg if Bowman did not move.'},
 'High Shot':{type:'ranged',power:5,range:5,minr:2,acc:80,desc:'+3 dmg if firing from high ground.'},
 'Pinning Shot':{type:'ranged',power:3,range:5,minr:2,acc:75,desc:'Shot that applies Hampered (MOVE -1).',status:'Hampered'},
 'Overwatch':{type:'self',range:0,acc:0,desc:'Stance: shoot the first enemy that enters your range this round.',selfstatus:'Overwatch'},
 // Ember Cantor
 'Fire Spark':{type:'magic',power:5,range:4,acc:85,aoe:'plus',desc:'Fire magic. Bursts in a + (center and the tiles up/down/left/right), hitting every enemy caught.'},
 'Ember Tile':{type:'zonefire',range:4,acc:0,desc:'Create a Fire Tile (2 rounds). Burns anyone standing on it.'},
 'Smoke Chant':{type:'zonesmoke',range:4,acc:0,desc:'Create smoke (radius 1): ranged hit -20% through it.'},
 'Kindling':{type:'magic',power:3,range:4,acc:80,desc:'Fire damage; applies/refreshes Burn.',status:'Burn'},
 // Courier
 'Quick Item':{type:'heal',power:12,range:2,acc:0,desc:'Use Minor Tonic (heal 12) on self or ally within 2.',target:'ally',flatHeal:true},
 'Sprint':{type:'self',range:0,acc:0,desc:'+3 MOVE this turn but cannot attack. Tap self to confirm.',selfstatus:'Sprint'},
 'Drag Ally':{type:'drag',range:1,acc:0,desc:'Pull an adjacent ally to another tile beside you.',target:'ally'},
 'Supply Toss':{type:'buff',range:3,acc:0,desc:'Aid an ally (reduce a cooldown / grant Inspired).',status:'Inspired',target:'ally'},
};

// ---- helpers ----
const dist=(a,b)=>Math.abs(a.x-b.x)+Math.abs(a.y-b.y);
const uAt=(x,y)=>units.find(u=>u.hp>0&&u.x===x&&u.y===y);
const alive=f=>units.filter(u=>u.hp>0&&u.foe===f);

// facing/angle: front/side/back relative to defender facing
function angleBonus(att,def){
  // def.face is -1 (up-left) or 1 (down-right) in our simplified model.
  // Use vector: if attacker is "behind" along facing axis -> back.
  const bx=def.face; // 1 means facing +x/-y (down-right), -1 up-left
  const rel=(att.x-def.x)*bx + (def.y-att.y)*bx;
  if(rel>0) return 20;   // back
  if(rel===0) return 10; // side
  return 0;              // front
}

// ---- Hit & damage (exact v0.1 formulas) ----
function hitChance(att,def,skill){
  let acc=(skill.acc||0)+att.ACC-def.EVA;
  acc+=angleBonus(att,def);
  const ranged=(skill.type==='ranged'||skill.type==='magic');
  if(tt(def.x,def.y).cover && ranged) acc-=15;       // cover vs ranged
  if(ranged && tt(att.x,att.y).high) acc+=10;        // high ground ranged
  if(ranged && (inSmoke(att.x,att.y)||inSmoke(def.x,def.y))) acc-=20; // smoke
  if(def.statuses.Exposed) acc+=15;
  if(att.statuses && att.statuses.Inspired) acc+=10; // Guiding Glow / Inspired helps the attacker
  if(att.statuses && att.statuses.Guided) acc+=5;    // lantern light ACC
  return Math.max(20,Math.min(95,acc));
}
function calcDamage(att,def,skill){
  const pw=skill.power||0;
  let dmg;
  if(skill.type==='magic'||skill.type==='firetile') dmg=pw+att.MAG-def.RES;
  else dmg=pw+att.ATK-def.DEF;
  // Duelist Rival Mark: +3 for the marking Duelist; Quick Cut extra handled via skill
  if(def.statuses.Marked && att.cid==='duelist') dmg+=3;
  if(skill.name==='Quick Cut' && def.statuses.Marked) dmg+=2;
  // Bowman conditional bonuses
  if(skill.name==='Aimed Shot' && !att._moved) dmg+=2;
  if(skill.name==='High Shot' && tt(att.x,att.y).high) dmg+=3;
  // Ember: +2 vs Burned
  if(att.cid==='ember' && def.statuses.Burn) dmg+=2;
  // damage reductions
  if(def.statuses.Guarded) dmg=Math.round(dmg*0.7);
  if(def._guardedBy) dmg=Math.round(dmg*0.7);
  return Math.max(1,dmg);
}

// ---- Reactions (Classic Mode) ----
function tryReaction(def,att,rawDmg,skill){
  if(def.hp<=0||def.rp<=0) return {dmg:rawDmg};
  if(def.statuses.Rooted||def.statuses.Slow && false) {}
  const reactable=(skill.type==='melee'||skill.type==='ranged'||skill.type==='magic'||skill.type==='firetile');
  if(!reactable) return {dmg:rawDmg};
  let r=Math.random()*100;
  if(def.react==='block'){
    if(r<25){ def.rp--; return {dmg:Math.round(rawDmg*0.6),tag:'BLOCK'};}  // -40%
  }else if(def.react==='parry'){
    let dodge=20, parry=15; if(def.statuses.Riposte){dodge+=10;parry+=10;}
    if(skill.type==='melee'){
      if(r<dodge){def.rp--;return{dmg:0,tag:'DODGE'};}
      if(r<dodge+parry){def.rp--;return{dmg:Math.round(rawDmg*0.5),tag:'PARRY'};}
    }
  }else if(def.react==='lightguard'){
    if((skill.type==='magic'||skill.type==='firetile') && r<20){def.rp--;return{dmg:Math.round(rawDmg*0.7),tag:'WARD'};} // -30% magic
  }else if(def.react==='quickstep'){
    // Courier: 20% vs physical (melee/ranged), reduce 25% and hop away
    if((skill.type==='melee'||skill.type==='ranged') && r<20){def.rp--; quickstepMove(def,att); return{dmg:Math.round(rawDmg*0.75),tag:'STEP'};}
  }else if(def.react==='cinder'){
    // Ember: 15% vs melee -> attacker's tile becomes fire (no immediate dmg)
    if(skill.type==='melee' && r<15){def.rp--; if(!(tt(att.x,att.y).fire)) addFire(att.x,att.y,1,def.foe); return{dmg:rawDmg,tag:'CINDER'};}
  }else if(def.react==='snap'){
    // Bowman: reactive shot handled on enemy movement, not here
  }
  return {dmg:rawDmg};
}

// Courier quickstep: hop 1 tile away from attacker if a valid tile exists
function quickstepMove(def,att){
  const dx=Math.sign(def.x-att.x), dy=Math.sign(def.y-att.y);
  const cands=[[def.x+dx,def.y+dy],[def.x+dx,def.y],[def.x,def.y+dy]];
  for(const [nx,ny] of cands){
    if(inB(nx,ny)&&passable(nx,ny)&&!uAt(nx,ny)&&!tt(nx,ny).fire){ def.x=nx;def.y=ny;def.px=nx;def.py=ny; return; }
  }
}

// ================= game state =================
let order=[], oi=-1, active=null, round=1, mode='idle', busy=false;
let hiMove=new Set(), hiTarget=new Set(), hiAoe=new Set(), selSkill=null, pendingCast=null, inspTarget=null;
let projectiles=[], pops=[], shakeT=0, shakeMag=0, hoverTile=null;
let lanternTiles=new Set(), fireExtra=new Map(); // fireExtra: "x,y" -> {r:roundsLeft, foe:placedByEnemy}
let lanterns=[]; // {x,y,radius,life} — area light with strongest effect on center square
let smokeTiles=new Set(); // "x,y:roundsLeft"
let moveUndo=null;   // {u,x,y,face} snapshot for move-only undo
// ---- Debug / playtest cheats ----
const DBG={infMove:false, infActions:false, infHP:false, infMP:false};
function dbgApplyContinuous(){
  // infinite HP: keep player units topped up
  if(DBG.infHP){ for(const u of units){ if(!u.foe && u.hp>0) u.hp=u.max; } }
}
function dbgAfterAction(u){
  // infinite actions: never consume move/main action for players
  if(DBG.infActions && u && !u.foe){ u._moved=false; u._attacked=false; }
}
function reviveUnit(u){
  if(u.hp>0)return; u.hp=Math.round(u.max*0.5); u.anim='idle'; u.aframe=0; u.flash=0; u.statuses={};
  if(!order.includes(u)) buildOrder();
  pops.push(pop(u,'REVIVED','#8ff07a'));
}
function killUnit(u){
  if(u.hp<=0)return; u.hp=0; u.flash=0; u.anim='idle';
  pops.push(pop(u,'✖','#ff6a5a'));
  if(checkEnd())return;
  if(u===active && !busy){ // don't leave a dead unit holding the turn
    actEl.innerHTML=''; setTimeout(()=>{ if(!busy) nextTurn(); },300);
  }
}
const infoEl=document.getElementById('info'), actEl=document.getElementById('actions'),
      tlEl=document.getElementById('timeline'), roundEl=document.getElementById('round');

// sprite imgs
const IMG={}, CELL=SPR.cell, ANIM=SPR.anim; let loaded=0;
for(const cid in SPR.img){const im=new Image();im.onload=()=>{if(++loaded===Object.keys(SPR.img).length)start();};im.src=SPR.img[cid];IMG[cid]=im;}

// ---- movement (rough ground none in v0.1; blocked impassable) ----
function effMove(u){ let m=(DBG.infMove && !u.foe) ? 99 : u.MOVE; if(u._sprint) m+=3; if(u.statuses&&u.statuses.Hampered) m=Math.max(2,m-1); return m; }
function reachable(u){
  const res={},best={};best[u.x+','+u.y]=0;const q=[{x:u.x,y:u.y,c:0}];
  const mv=effMove(u);
  while(q.length){q.sort((a,b)=>a.c-b.c);const cur=q.shift();
    for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=cur.x+dx,ny=cur.y+dy;
      if(!passable(nx,ny)||uAt(nx,ny))continue;
      const c=cur.c+1; if(c>mv)continue; const k=nx+','+ny;
      if(best[k]===undefined||c<best[k]){best[k]=c;res[k]={x:nx,y:ny};q.push({x:nx,y:ny,c});}}}
  return Object.values(res);
}
function bfsPath(u,tx,ty){
  const prev={},best={};best[u.x+','+u.y]=0;const q=[{x:u.x,y:u.y,c:0}];
  const mv=effMove(u);
  while(q.length){q.sort((a,b)=>a.c-b.c);const cur=q.shift();
    for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=cur.x+dx,ny=cur.y+dy;
      if(!passable(nx,ny)||uAt(nx,ny))continue;const c=cur.c+1;if(c>mv)continue;const k=nx+','+ny;
      if(best[k]===undefined||c<best[k]){best[k]=c;prev[k]=cur.x+','+cur.y;q.push({x:nx,y:ny,c});}}}
  const path=[];let k=tx+','+ty;while(k&&k!==u.x+','+u.y){const[x,y]=k.split(',').map(Number);path.unshift({x,y});k=prev[k];}
  return path;
}

// ================= UI =================
function renderTimeline(){
  tlEl.innerHTML=''; roundEl.textContent='Round '+round;
  for(const u of order){const c=document.createElement('div');
    c.className='tl-chip'+(u.foe?' foe':'')+(u===active?' active':'')+(u.hp<=0?' dead':'');
    c.innerHTML=u.name.split(' ')[0]+(u.rp>0?' <span class="rp">◆</span>':'');
    tlEl.appendChild(c);}
}
function renderActions(){
  actEl.innerHTML='';
  if(!active||active.foe||busy)return;
  const mk=(label,fn,cls,dis)=>{const b=document.createElement('button');b.className='act '+(cls||'');b.textContent=label;b.disabled=!!dis;b.onclick=fn;actEl.appendChild(b);};
  if(mode==='skillmenu'){
    for(const s of active.skills){const sk=SK[s];
      mk(s,()=>pickSkill(s), 'skill', false);}
    mk('‹ Back',()=>{mode='idle';infoEl.innerHTML=actionPrompt();renderActions();},'ghost');
    return;
  }
  if(mode==='confirm'){
    // previewing where the skill will land — commit or step back to re-aim
    mk('✓ Confirm',doConfirmedCast,'hot');
    mk('‹ Back',cancelConfirm,'ghost');
    return;
  }
  if(mode==='inspect'){
    // free look — never ends the turn; tap a unit's tile to enable its stat/equipment views
    if(inspTarget){ mk('Stats',()=>showStats(inspTarget),'skill'); mk('Equipment',()=>showGear(inspTarget),'skill'); }
    mk('‹ Done',exitInspect,'hot');
    return;
  }
  if(mode==='flee'){
    mk('✓ Confirm Flee',doFlee,'hot');
    mk('‹ Cancel',()=>{mode='idle';infoEl.innerHTML=actionPrompt();renderActions();},'ghost');
    return;
  }
  if(mode==='target' && selSkill && selSkill!=='__basic'){
    // targeting a command skill: show Back so the player can cancel after reading the tooltip
    mk('‹ Back',()=>{selSkill=null;hiTarget=new Set();hiAoe=new Set();pendingCast=null;mode='skillmenu';infoEl.innerHTML='<b>Skills</b> — choose a command.';renderActions();},'ghost');
    mk('Wait',endUnitTurn,'hot');
    return;
  }
  const canUndo = moveUndo && moveUndo.u===active && active._moved && !active._attacked;
  if(canUndo) mk('↺ Undo Move',undoMove,'ghost');
  mk('Move',enterMove,'',active._moved);
  mk('Attack',()=>{selSkill='__basic';enterTarget();},'',active._attacked);
  mk('Skill',()=>{mode='skillmenu';infoEl.innerHTML='<b>Skills</b> — choose a command.';renderActions();},'',active._attacked);
  mk('View Field',enterInspect,'ghost');
  mk('Flee',askFlee,'ghost');
  mk('Wait',endUnitTurn,'hot');
}
function actionPrompt(){return `<b>${active.name}</b> · HP ${active.hp}/${active.max} · RP ${active.rp} · Round ${round}. Move, Attack, Skill, or Wait.`;}
// which skills may target the caster's own tile
function canSelfTarget(name){
  const sk=SK[name]; if(!sk)return false;
  if(sk.type==='self') return true;                       // Brace, Intercept, Riposte, Overwatch stances
  if(name==='Warm Light'||name==='Guiding Glow') return true; // Lanternist self-heal/buff
  if(name==='Place Lantern') return true;                 // lantern on own tile
  return false;
}
function pickSkill(name){
  selSkill=name; const sk=SK[name];
  // ALWAYS require a confirm tap so the tooltip stays readable — no auto-cast.
  mode='target'; buildTargets(name);
  const selfNote = canSelfTarget(name) ? (sk.type==='self'?` Tap ${active.name} to confirm.`:` Tap an ally or ${active.name} (self).`) : '';
  infoEl.innerHTML=`<b>${name}</b> — ${sk.desc}${selfNote}`;
  renderActions();
}
function enterMove(){
  if(active._moved||busy)return; mode='move'; hiTarget.clear(); hiAoe=new Set(); pendingCast=null; hiMove=new Set();
  reachable(active).forEach(m=>hiMove.add(m.x+','+m.y));
  infoEl.innerHTML=`<b>Move</b> — tap a blue tile (range ${active.MOVE}).`; renderActions();
}
function enterTarget(){ mode='target'; hiAoe=new Set(); pendingCast=null; buildTargets('__basic');
  const n=[...hiTarget].filter(k=>{const[x,y]=k.split(',').map(Number);const e=uAt(x,y);return e&&e.foe;}).length;
  infoEl.innerHTML=`<b>Attack</b> — tap an enemy in range${n?` (${n})`:' — none in range'}.`; renderActions();
}
function buildTargets(skillName){
  hiMove=new Set(); hiTarget=new Set();
  if(skillName==='__basic'){
    const rng=basicRange(active), minr=basicMinRange(active);
    for(let y=0;y<N;y++)for(let x=0;x<N;x++){const d=Math.abs(x-active.x)+Math.abs(y-active.y);
      if(d>=minr&&d<=rng) hiTarget.add(x+','+y);}
    return;
  }
  const sk=SK[skillName]; const rng=sk.range||0; const minr=sk.minr||1;
  // self-only stance skills: only the caster's own tile is a valid confirm target
  if(sk.type==='self'){ hiTarget.add(active.x+','+active.y); return; }
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){
    const d=Math.abs(x-active.x)+Math.abs(y-active.y);
    if(d>=minr&&d<=rng) hiTarget.add(x+','+y);
  }
  // add own tile if this skill may target self
  if(canSelfTarget(skillName)) hiTarget.add(active.x+','+active.y);
}
function basicRange(u){ // melee 1, ranged jobs 3+
  if(u.cid==='bowman') return 5;                 // bow reaches far (min-range handled in targeting)
  if(u.cid==='archer'||u.cid==='spark'||u.cid==='ember') return 3;
  if(u.cid==='lanternist') return 1;
  return 1; // warder, duelist, raider, courier melee
}
function basicMinRange(u){ return u.cid==='bowman'?2:1; } // bow can't hit adjacent

// ================= input =================
function scrToTile(sx,sy){let best=null;
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const lift=tt(x,y).high?HG_LIFT:0;const p=iso(x,y,lift);
    const dx=Math.abs(sx-p.x)/(TW/2*cam.z),dy=Math.abs(sy-p.y)/(TH/2*cam.z);
    if(dx+dy<=1){if(!best)best={x,y};}}
  return best;}
function cpos(ev){const r=cv.getBoundingClientRect();const t=ev.touches?ev.touches[0]:ev;return{x:(t.clientX-r.left)*(VW/r.width),y:(t.clientY-r.top)*(VH/r.height)};}
function rawXY(t){const r=cv.getBoundingClientRect();return{x:(t.clientX-r.left)*(VW/r.width),y:(t.clientY-r.top)*(VH/r.height)};}
function clampZoom(){cam.z=Math.max(cam.min,Math.min(cam.max,cam.z));}
function zoomAt(sx,sy,factor){
  // keep the point under the cursor stable while zooming
  const before={x:(sx-VW/2-cam.x)/cam.z, y:(sy-VH/2-cam.y)/cam.z};
  cam.z*=factor; clampZoom();
  cam.x=sx-VW/2-before.x*cam.z; cam.y=sy-VH/2-before.y*cam.z;
}
cv.addEventListener('mousemove',e=>{const p=cpos(e);hoverTile=scrToTile(p.x,p.y);});
cv.addEventListener('mouseleave',()=>hoverTile=null);
// wheel zoom (desktop)
cv.addEventListener('wheel',e=>{e.preventDefault();const p=cpos(e);zoomAt(p.x,p.y, e.deltaY<0?1.12:0.89);},{passive:false});

// --- touch: 1 finger = tap/pan, 2 fingers = pinch-zoom ---
let touchState=null;
function tdist(a,b){const dx=a.clientX-b.clientX,dy=a.clientY-b.clientY;return Math.hypot(dx,dy);}
function tmid(a,b){return{clientX:(a.clientX+b.clientX)/2,clientY:(a.clientY+b.clientY)/2};}
cv.addEventListener('touchstart',e=>{
  e.preventDefault();
  if(e.touches.length===1){
    const p=rawXY(e.touches[0]);
    touchState={mode:'tap',sx:p.x,sy:p.y,ox:p.x,oy:p.y,moved:false,camx:cam.x,camy:cam.y};
  }else if(e.touches.length===2){
    touchState={mode:'pinch',d0:tdist(e.touches[0],e.touches[1]),z0:cam.z};
  }
},{passive:false});
cv.addEventListener('touchmove',e=>{
  e.preventDefault(); if(!touchState)return;
  if(touchState.mode==='pinch'&&e.touches.length===2){
    const d=tdist(e.touches[0],e.touches[1]);
    const m=rawXY(tmid(e.touches[0],e.touches[1]));
    const targetZ=touchState.z0*(d/touchState.d0);
    const factor=targetZ/cam.z; zoomAt(m.x,m.y,factor);
  }else if(touchState.mode==='tap'&&e.touches.length===1){
    const p=rawXY(e.touches[0]);
    if(Math.hypot(p.x-touchState.ox,p.y-touchState.oy)>10){
      touchState.moved=true; // becomes a pan
      cam.x=touchState.camx+(p.x-touchState.ox);
      cam.y=touchState.camy+(p.y-touchState.oy);
    }
  }
},{passive:false});
cv.addEventListener('touchend',e=>{
  e.preventDefault();
  if(touchState&&touchState.mode==='tap'&&!touchState.moved){
    handleSelect(touchState.sx,touchState.sy);
  }
  touchState=null;
},{passive:false});

// mouse click (desktop select)
cv.addEventListener('click',e=>{const p=cpos(e);handleSelect(p.x,p.y);});

function handleSelect(sx,sy){
  if(busy||!active||active.foe)return;
  const t=scrToTile(sx,sy); if(!t)return; const k=t.x+','+t.y;
  if(mode==='inspect'){ inspectTile(t.x,t.y); return; }
  if(mode==='move'&&hiMove.has(k)){ doMove(active,t.x,t.y); return;}
  if(mode==='confirm'){
    // tapping inside the previewed footprint (or its center) fires; tapping another valid spot re-aims
    if(pendingCast && (k===pendingCast.x+','+pendingCast.y || hiAoe.has(k))){ doConfirmedCast(); return; }
    if(hiTarget.has(k)){ enterConfirm(t.x,t.y); return; }
    return;
  }
  if(mode==='target'&&hiTarget.has(k)){
    // command skills get a preview+confirm step; basic attacks and self stances cast straight away
    if(selSkill && selSkill!=='__basic' && SK[selSkill] && SK[selSkill].type!=='self'){ enterConfirm(t.x,t.y); return; }
    resolveTargeted(t.x,t.y); return;
  }
}
// ================= View Field (free inspection: tiles, effects, unit stats/gear) =================
function enterInspect(){
  if(busy)return;
  mode='inspect'; inspTarget=null;
  hiMove=new Set(); hiTarget=new Set(); hiAoe=new Set(); pendingCast=null; selSkill=null;
  infoEl.innerHTML='<b>View Field</b> — tap any tile to read its terrain & active effects; tap a unit for stats/equipment. This does not use your turn.';
  renderActions();
}
function exitInspect(){ inspTarget=null; mode='idle'; infoEl.innerHTML=actionPrompt(); renderActions(); }
function sideLabel(u){ return u.foe?'Enemy':(u.npc?'Ally':'Player'); }
function reactName(r){ return {block:'Block (vs physical)',parry:'Parry / Dodge (vs melee)',lightguard:'Light Guard (vs magic/fire)',snap:'Snap Aim (reactive shot)',cinder:'Cinder Flare (melee → fire)',quickstep:'Quickstep (hop away)'}[r]||'None'; }
function tileReport(x,y){
  const T=tt(x,y); const eff=[];
  if(T.high) eff.push('High Ground — +10% ranged fired from here');
  if(T.cover) eff.push('Cover — −15% hit vs a unit here from ranged');
  if(T.blocked) eff.push('Blocked — impassable');
  if(T.fire) eff.push('Fire — terrain, persistent (burns anyone standing on it)');
  const fr=fireAt(x,y);
  if(fr) eff.push(`Fire — ${fr.foe?'enemy':'your'}-set, ${fr.r} round${fr.r>1?'s':''} left`);
  if(inSmoke(x,y)) eff.push(`Smoke — ${smokeRoundsAt(x,y)} round(s) left, −20% ranged through it`);
  const le=lanternEffectAt(x,y);
  if(le==='center') eff.push('Lantern (center) — allies here heal 5 + gain ACC');
  else if(le==='aura') eff.push('Lantern light — allies here heal 3 + gain ACC');
  // (concealed enemy traps would be withheld here unless player-owned; none exist in v0.1)
  let html=`<b>Tile ${x},${y}</b> — ${T.n}`;
  html += eff.length ? `<br>${eff.join('<br>')}` : '<br><span style="color:#8a7a55">No active effects.</span>';
  return html;
}
function inspectTile(x,y){
  const u=uAt(x,y); inspTarget=u||null;
  let html=tileReport(x,y);
  if(u) html += `<br><b>${u.name}</b> — ${sideLabel(u)}, HP ${u.hp}/${u.max}. <span style="color:#8fd0ff">Tap Stats or Equipment below.</span>`;
  else html += '<br><span style="color:#8a7a55">Tap another tile, or Done.</span>';
  infoEl.innerHTML=html; renderActions();
}
function showStats(u){
  const st=Object.entries(u.statuses||{}).map(([s,d])=>`${s}(${d})`).join(', ')||'none';
  infoEl.innerHTML=
    `<b>${u.name}</b> · ${sideLabel(u)} · HP ${u.hp}/${u.max} · RP ${u.rp}`+
    `<br>ATK ${u.ATK} · MAG ${u.MAG} · DEF ${u.DEF} · RES ${u.RES}`+
    `<br>ACC ${u.ACC} · EVA ${u.EVA} · SPD ${u.SPD} · MOVE ${effMove(u)}`+
    `<br>Reaction: ${reactName(u.react)}`+
    `<br>Statuses: ${st}`+
    `<br>Skills: ${(u.skills||[]).join(', ')}`;
  renderActions();
}
function showGear(u){
  const g=GEAR[u.cid];
  const body = g ? Object.entries(g).map(([slot,item])=>`${slot}: <b>${item}</b>`).join('<br>')
                 : '<span style="color:#8a7a55">No equipment recorded.</span>';
  infoEl.innerHTML=`<b>${u.name}</b> · ${sideLabel(u)} — Equipment<br>${body}<br><span style="color:#8a7a55">(cosmetic in v0.1 — gear doesn’t change stats yet)</span>`;
  renderActions();
}
// ================= Flee (retreat & end the battle) =================
function askFlee(){
  if(busy)return;
  mode='flee'; hiMove=new Set(); hiTarget=new Set(); hiAoe=new Set(); inspTarget=null; selSkill=null;
  infoEl.innerHTML='<b>Flee?</b> Your party withdraws and the battle ends. This cannot be undone.';
  renderActions();
}
function doFlee(){
  mode='over'; busy=true;
  document.getElementById('ov-t').textContent='Retreat';
  document.getElementById('ov-p').textContent=`Your party withdrew after ${round} round${round>1?'s':''}.`;
  document.getElementById('overlay').classList.add('show');
}
// ---- preview + confirm: show exactly which tiles/units a skill will affect ----
function affectedTiles(name,cx,cy){
  const sk=SK[name]||{}; const out=[];
  const push=(x,y)=>{ if(inB(x,y)&&!tt(x,y).blocked) out.push({x,y}); };
  const plus=()=>[[0,0],[1,0],[-1,0],[0,1],[0,-1]].forEach(([dx,dy])=>push(cx+dx,cy+dy));
  const disc=r=>{ for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++) if(Math.abs(dx)+Math.abs(dy)<=r) push(cx+dx,cy+dy); };
  if(sk.aoe==='plus') plus();
  else if(name==='Place Lantern'||name==='Reveal') disc(2);   // radius-2 light / reveal area
  else if(name==='Smoke Chant') plus();                       // + shaped smoke
  else push(cx,cy);                                           // single tile / single unit
  return out;
}
function confirmInfo(name,cx,cy){
  const sk=SK[name]; const tiles=affectedTiles(name,cx,cy);
  const foes=[],allies=[];
  tiles.forEach(t=>{const u=uAt(t.x,t.y); if(u&&u.hp>0)(u.foe?foes:allies).push(u.name.split(' ')[0]);});
  if(sk.aoe) return foes.length?`will hit ${foes.length} ${foes.length>1?'enemies':'enemy'} — ${foes.join(', ')}`:'catches no one (empty area)';
  if(sk.type==='heal'||sk.type==='buff'||sk.type==='support') return allies.length?`on ${allies[0]}`:'no ally on that tile';
  if(sk.type==='drag') return allies.length?`pull ${allies[0]}`:'no ally to pull';
  if(sk.type==='zone'||sk.type==='zonefire'||sk.type==='zonesmoke'||sk.type==='reveal') return 'placed on the highlighted tiles';
  return foes.length?`on ${foes[0]}`:'no enemy on that tile';
}
function enterConfirm(x,y){
  mode='confirm'; pendingCast={x,y};
  hiAoe=new Set(affectedTiles(selSkill,x,y).map(t=>t.x+','+t.y));
  infoEl.innerHTML=`<b>${selSkill}</b> — ${confirmInfo(selSkill,x,y)}. <b>Tap Confirm</b> (or tap the target again). ‹ Back to re-aim.`;
  renderActions();
}
function cancelConfirm(){
  pendingCast=null; hiAoe=new Set(); mode='target'; buildTargets(selSkill);
  const sk=SK[selSkill];
  infoEl.innerHTML=`<b>${selSkill}</b> — ${sk?sk.desc:''} Tap a highlighted tile to aim.`;
  renderActions();
}
function doConfirmedCast(){
  if(!pendingCast)return; const {x,y}=pendingCast;
  pendingCast=null; hiAoe=new Set();
  resolveTargeted(x,y);
}
// zoom buttons + reset (wired from HTML)
window.zoomIn =()=>{zoomAt(VW/2,VH/2,1.2);};
window.zoomOut=()=>{zoomAt(VW/2,VH/2,0.83);};
window.zoomReset=()=>{cam.z=1;cam.x=0;cam.y=0;};

// ---- debug panel wiring ----
window.dbgToggle=(flag,el)=>{
  DBG[flag]=!DBG[flag];
  if(el) el.classList.toggle('on',DBG[flag]);
  // reflect immediately: if infActions turned on mid-turn, re-enable buttons
  if(flag==='infActions'&&DBG.infActions&&active&&!active.foe){active._moved=false;active._attacked=false;}
  if(flag==='infMP'&&DBG.infMP&&active&&!active.foe){active.rp=99;}
  if(active&&!active.foe&&!busy){ renderActions(); }
};
window.dbgKill=(idx)=>{ const u=units.filter(z=>!z.foe)[idx]; if(u) killUnit(u); };
window.dbgRevive=(idx)=>{ const u=units.filter(z=>!z.foe)[idx]; if(u) reviveUnit(u); if(!busy&&active&&!active.foe) renderActions(); };
window.dbgKillEnemies=()=>{ for(const u of alive(true)) u.hp=0; checkEnd(); };
window.dbgFullHeal=()=>{ for(const u of units){ if(!u.foe&&u.hp>0) u.hp=u.max; } };
window.dbgPlayerNames=()=>units.filter(z=>!z.foe).map(z=>z.name);

// ================= resolve a targeted action =================
function resolveTargeted(x,y){
  const isSelfTile = (x===active.x && y===active.y);
  let sk;
  if(selSkill==='__basic'){
    const r=basicRange(active);
    const type = r>1 ? ((active.cid==='spark'||active.cid==='ember')?'magic':'ranged') : 'melee';
    sk={type,power:0,acc:85,range:r,minr:basicMinRange(active)};
  } else { sk=Object.assign({name:selSkill}, SK[selSkill]); }
  // self-type stance skills: confirm by tapping the caster
  if(sk.type==='self'){ if(isSelfTile) castSelf(active,selSkill); else fizzle(); return; }
  // area skills (e.g. Fire Spark +): resolve against every tile in the footprint
  if(sk.aoe){ castAoe(active,x,y,sk); return; }
  const tgt=uAt(x,y);
  if(sk.type==='heal'){
    const ally = isSelfTile ? active : tgt;
    if(ally&&!ally.foe) castHeal(active,ally,sk); else fizzle(); return;
  }
  if(sk.type==='support'){ // Guard Ally — cannot target self
    if(tgt&&!tgt.foe&&tgt!==active) castGuardAlly(active,tgt); else fizzle(); return;
  }
  if(sk.type==='buff'){
    const ally = isSelfTile ? active : tgt;
    if(ally&&!ally.foe) castBuff(active,ally,sk); else fizzle(); return;
  }
  if(sk.type==='zone'){ castLantern(active,x,y); return; }          // lantern (may be own tile)
  if(sk.type==='zonefire'){ castEmberTile(active,x,y); return; }    // Ember Tile
  if(sk.type==='zonesmoke'){ castSmoke(active,x,y); return; }       // Smoke Chant
  if(sk.type==='reveal'){ castReveal(active,x,y); return; }         // Reveal (clears smoke)
  if(sk.type==='drag'){ if(tgt&&!tgt.foe&&tgt!==active) castDrag(active,tgt); else fizzle(); return; }
  // offensive
  if(!tgt||!tgt.foe){ fizzle(); return; }
  doAttack(active,tgt,sk);
}
function fizzle(){ infoEl.innerHTML='Invalid target. Tap a highlighted tile, or ‹ Back.'; }

// ================= self / support casts =================
function castSelf(u,name){
  const sk=SK[name]; busy=true; mode='idle'; actEl.innerHTML='';
  if(name==='Sprint'){
    // grant +3 MOVE this turn; cannot attack; does not consume main action
    u._sprint=true; u._moved=false; u._attacked=true; // attacked=true disables Attack/Skill offense
    u.statuses.Sprint=1;
    pops.push(pop(u,'SPRINT +3','#8ff0a0'));
    infoEl.innerHTML=`<b>${u.name}</b> sprints (+3 MOVE, no attack this turn).`;
    setTimeout(()=>{busy=false; mode='idle'; renderActions();},350);
    return;
  }
  if(sk.selfstatus) u.statuses[sk.selfstatus]=2;
  pops.push(pop(u,name,'#e8c766'));
  u._attacked=true;
  infoEl.innerHTML=`<b>${u.name}</b> uses ${name}.`;
  setTimeout(()=>{busy=false; afterAct(u);},400);
}
function castGuardAlly(u,ally){
  busy=true;mode='idle';actEl.innerHTML='';
  ally._guardedBy=u.id; ally.statuses.Guarded=2;
  pops.push(pop(ally,'GUARDED','#8fd0ff'));
  u._attacked=true; infoEl.innerHTML=`<b>${u.name}</b> guards ${ally.name}.`;
  setTimeout(()=>{busy=false;afterAct(u);},400);
}
function castHeal(u,ally,sk){
  busy=true;mode='idle';actEl.innerHTML='';
  sk=sk||SK[selSkill];
  let amt;
  if(sk.flatHeal){ amt=sk.power||12; }                        // Courier Quick Item: flat tonic
  else {
    amt=(sk.power||0)+u.MAG;
    if(lanternEffectAt(ally.x,ally.y)) amt+=3;                 // +3 in lantern light
    if(dist(u,ally)===1) amt+=2;                               // Warm Presence
  }
  ally.hp=Math.min(ally.max,ally.hp+amt);
  pops.push(pop(ally,'+'+amt,'#8ff07a'));
  u._attacked=true; infoEl.innerHTML=`<b>${u.name}</b> heals ${ally===u?'itself':ally.name} for ${amt}.`;
  setTimeout(()=>{busy=false;afterAct(u);},400);
}
function castEmberTile(u,x,y){
  const T=tt(x,y); if(T.blocked){ fizzle(); return; }
  busy=true;mode='idle';actEl.innerHTML='';
  addFire(x,y,2,u.foe);
  const en=uAt(x,y);
  if(en){ en.hp=Math.max(0,en.hp-3); en.statuses.Burn=2; pops.push(pop(en,'-3🔥','#ff9a4a')); }
  else pops.push({x,y,txt:'🔥 FIRE',c:'#ff9a4a',t:0,lift:T.high?HG_LIFT:0});
  u._attacked=true; infoEl.innerHTML=`<b>${u.name}</b> ignites a tile.`;
  setTimeout(()=>{busy=false;afterAct(u);},400);
}
let smokeTiles2unused=0;
function castSmoke(u,x,y){
  busy=true;mode='idle';actEl.innerHTML='';
  for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const nx=x+dx,ny=y+dy;
    if(inB(nx,ny)&&Math.abs(dx)+Math.abs(dy)<=1) smokeTiles.add(nx+','+ny+':2');}
  pops.push({x,y,txt:'≈ SMOKE',c:'#c8c8d0',t:0,lift:tt(x,y).high?HG_LIFT:0});
  u._attacked=true; infoEl.innerHTML=`<b>${u.name}</b> conjures smoke.`;
  setTimeout(()=>{busy=false;afterAct(u);},400);
}
function inSmoke(x,y){ for(const s of smokeTiles){ const p=s.split(':'); if(p[0]===x+','+y) return true; } return false; }
function smokeRoundsAt(x,y){ for(const s of smokeTiles){ const p=s.split(':'); if(p[0]===x+','+y) return parseInt(p[1])||0; } return 0; }
// fireExtra tiles carry a remaining-rounds counter and who placed them (owner side)
function addFire(x,y,rounds,foe){ fireExtra.set(x+','+y,{r:rounds,foe:!!foe}); }
function fireAt(x,y){ return fireExtra.get(x+','+y); }
function castReveal(u,x,y){
  busy=true;mode='idle';actEl.innerHTML='';
  let cleared=0;
  for(const s of [...smokeTiles]){ const p=s.split(':'); const c=p[0].split(',').map(Number);
    if(Math.abs(c[0]-x)+Math.abs(c[1]-y)<=2){ smokeTiles.delete(s); cleared++; } }
  for(const e of alive(true)){ if(Math.abs(e.x-x)+Math.abs(e.y-y)<=2) e.statuses.Exposed=2; }
  pops.push({x,y,txt:cleared?'REVEALED':'REVEAL',c:'#ffe08a',t:0,lift:tt(x,y).high?HG_LIFT:0});
  u._attacked=true; infoEl.innerHTML=`<b>${u.name}</b> reveals the area${cleared?' (smoke cleared)':''}.`;
  setTimeout(()=>{busy=false;afterAct(u);},400);
}
function castDrag(u,ally){
  busy=true;mode='idle';actEl.innerHTML='';
  // find a free tile adjacent to Courier to pull ally into
  for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
    const nx=u.x+dx,ny=u.y+dy;
    if(inB(nx,ny)&&passable(nx,ny)&&!uAt(nx,ny)&&!tt(nx,ny).fire){ ally.x=nx;ally.y=ny;ally.px=nx;ally.py=ny; break; }
  }
  pops.push(pop(ally,'DRAGGED','#8fd0ff'));
  u._attacked=true; infoEl.innerHTML=`<b>${u.name}</b> pulls ${ally.name} to safety.`;
  setTimeout(()=>{busy=false;afterAct(u);},400);
}
function castBuff(u,ally,sk){
  busy=true;mode='idle';actEl.innerHTML='';
  if(sk.status) ally.statuses[sk.status]=2;
  pops.push(pop(ally,sk.status||'BUFF','#e8c766'));
  u._attacked=true; infoEl.innerHTML=`<b>${u.name}</b> aids ${ally.name}.`;
  setTimeout(()=>{busy=false;afterAct(u);},400);
}
function castLantern(u,x,y){
  // valid-tile guard: not blocked/fire/objective
  const T=tt(x,y);
  if(T.blocked||T.fire){ fizzle(); return; }
  busy=true;mode='idle';actEl.innerHTML='';
  // one lantern per Lanternist: remove any this caster owns
  lanterns=lanterns.filter(l=>l.owner!==u.id);
  const lan={x,y,radius:2,life:3,owner:u.id};
  lanterns.push(lan);
  rebuildLanternTiles();
  pops.push({x,y,txt:'✦ LANTERN',c:'#ffe08a',t:0,lift:T.high?HG_LIFT:0});
  u._attacked=true; infoEl.innerHTML=`<b>${u.name}</b> places a lantern (radius 2; center square strongest).`;
  setTimeout(()=>{busy=false;afterAct(u);},400);
}
function rebuildLanternTiles(){
  lanternTiles=new Set();
  for(const l of lanterns){
    for(let dy=-l.radius;dy<=l.radius;dy++)for(let dx=-l.radius;dx<=l.radius;dx++){
      if(Math.abs(dx)+Math.abs(dy)>l.radius)continue;
      const nx=l.x+dx,ny=l.y+dy; if(!inB(nx,ny))continue;
      lanternTiles.add(nx+','+ny);
    }
  }
}
// returns 'center' | 'aura' | null for a unit's tile
function lanternEffectAt(x,y){
  let best=null;
  for(const l of lanterns){
    if(x===l.x&&y===l.y) return 'center';
    if(Math.abs(x-l.x)+Math.abs(y-l.y)<=l.radius) best='aura';
  }
  return best;
}

// ================= movement =================
function doMove(u,tx,ty){
  busy=true;mode='idle';hiMove=new Set();actEl.innerHTML='';
  // snapshot for move-undo (players only, and only if they haven't acted)
  if(!u.foe) moveUndo={u, x:u.x, y:u.y, face:u.face};
  const path=bfsPath(u,tx,ty);let i=0;
  (function step(){
    if(i>=path.length){u.px=u.x;u.py=u.y;u._moved=true;busy=false;
      // fire tile damage on stop — if it fired, the move is no longer undoable
      const onFire = tt(u.x,u.y).fire || fireExtra.has(u.x+','+u.y);
      tickFireUnder(u);
      if(onFire) moveUndo=null;   // consequence dealt; don't allow rewind
      infoEl.innerHTML=`<b>${u.name}</b> moved.`; afterAct(u); return;}
    const nx=path[i]; if(nx.x!==u.x)u.face=nx.x>u.x?1:-1;
    tween(u,nx.x,nx.y,()=>{u.x=nx.x;u.y=nx.y;i++;step();});
  })();
}
function undoMove(){
  if(busy||!moveUndo||!active||active.foe)return;
  const s=moveUndo; const u=s.u;
  if(u!==active||!u._moved||u._attacked)return; // only current unit, move not yet committed by an action
  u.x=s.x; u.y=s.y; u.px=s.x; u.py=s.y; u.face=s.face; u._moved=false;
  moveUndo=null; mode='idle';
  infoEl.innerHTML=`Move undone. <b>${u.name}</b> — choose an action.`;
  renderActions();
}
function tween(u,tx,ty,done){const sx=u.px,sy=u.py,t0=performance.now(),dur=150;
  (function fr(now){let k=(now-t0)/dur;if(k>1)k=1;const e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;
    u.px=sx+(tx-sx)*e;u.py=sy+(ty-sy)*e;u.hop=Math.sin(k*Math.PI)*3;
    if(k<1)requestAnimationFrame(fr);else{u.hop=0;done();}})(performance.now());}

// ================= attack =================
function doAttack(att,def,sk){
  busy=true;mode='idle';hiTarget=new Set();actEl.innerHTML='';
  att.face=def.x>att.x?1:(def.x<att.x?-1:att.face);
  att.anim='attack';att.aframe=0;
  const ranged=(sk.type==='ranged'||sk.type==='magic'||sk.type==='firetile');
  const total=340,t0=performance.now();let fired=false;
  (function fr(now){const k=(now-t0)/total;att.aframe=Math.min(ANIM.attack.length-1,Math.floor(k*ANIM.attack.length));
    if(!fired&&k>=0.55){fired=true;
      if(ranged) spawnProj(att,def,sk); else landHit(att,def,sk);}
    if(k<1)requestAnimationFrame(fr);else{att.anim='idle';att.aframe=0; if(!ranged) finishAtk(att,def,sk);}
  })(t0);
}
function spawnProj(att,def,sk){const a=iso(att.px,att.py,tt(att.x,att.y).high?HG_LIFT:0),b=iso(def.px,def.py,tt(def.x,def.y).high?HG_LIFT:0);
  projectiles.push({x:a.x,y:a.y-16,tx:b.x,ty:b.y-16,t:0,kind:att.proj||'arrow',onHit:()=>{landHit(att,def,sk);finishAtk(att,def,sk);}});}
function landHit(att,def,sk){
  const hc=hitChance(att,def,sk); const roll=Math.random()*100;
  if(roll>=hc){ pops.push(pop(def,'MISS','#e8e0c8')); def._lastMiss=true; return; }
  let dmg=calcDamage(att,def,sk);
  // reaction
  const rr=tryReaction(def,att,dmg,sk); dmg=rr.dmg;
  if(rr.tag) pops.push(pop(def,rr.tag,'#8fd0ff'));
  if(dmg>0){ def.hp=Math.max(0,def.hp-dmg); def.flash=1;def.anim='hurt';def.hurtT=performance.now();
    shakeT=1;shakeMag=dmg>10?6:4; pops.push(pop(def,'-'+dmg,'#fff')); }
  else if(!rr.tag){ pops.push(pop(def,'0','#ccc')); }
  // apply status from skill
  if(sk.status && def.hp>0 && Math.random()<0.9) def.statuses[sk.status]=2;
  if(sk.type==='firetile'){ addFire(def.x,def.y,2,att.foe); }
  def._lastMiss=false;
}
function finishAtk(att,def,sk){
  att._attacked=true;
  setTimeout(()=>{
    if(def.hp<=0) pops.push(pop(def,def.name.split(' ')[0]+' down!','#ffcf6b'));
    if(checkEnd()){busy=false;return;}
    busy=false;
    infoEl.innerHTML = att.foe
      ? `<b>${att.name}</b> ${def._lastMiss?'missed':'hit '+def.name}.`
      : `<b>${att.name}</b> ${def._lastMiss?'missed '+def.name:'struck '+def.name}.`;
    if(att.foe) setTimeout(enemyContinue,300);
    else afterAct(att);
  }, def.hp<=0?250:150);
}
// ================= area-of-effect attack (Fire Spark +) =================
function castAoe(att,cx,cy,sk){
  busy=true;mode='idle';hiTarget=new Set();hiAoe=new Set();actEl.innerHTML='';
  att.face=cx>att.x?1:(cx<att.x?-1:att.face);
  att.anim='attack';att.aframe=0;
  const tiles=affectedTiles(sk.name,cx,cy);
  const total=340,t0=performance.now();let fired=false;
  (function fr(now){const k=(now-t0)/total;att.aframe=Math.min(ANIM.attack.length-1,Math.floor(k*ANIM.attack.length));
    if(!fired&&k>=0.55){fired=true;
      const a=iso(att.px,att.py,tt(att.x,att.y).high?HG_LIFT:0),b=iso(cx,cy,tt(cx,cy).high?HG_LIFT:0);
      projectiles.push({x:a.x,y:a.y-16,tx:b.x,ty:b.y-16,t:0,kind:att.proj||'bolt',onHit:()=>resolveAoe(att,tiles,cx,cy,sk)});}
    if(k<1)requestAnimationFrame(fr);else{att.anim='idle';att.aframe=0;}
  })(t0);
}
function resolveAoe(att,tiles,cx,cy,sk){
  shakeT=1;shakeMag=6;
  pops.push({x:cx,y:cy,txt:'✸',c:'#ff9a4a',t:0,lift:tt(cx,cy).high?HG_LIFT:0});
  let anyFoe=false;
  for(const t of tiles){const d=uAt(t.x,t.y); if(d&&d.foe&&d.hp>0){anyFoe=true; landHit(att,d,sk);}}
  att._attacked=true;
  setTimeout(()=>{
    if(checkEnd()){busy=false;return;}
    busy=false;
    infoEl.innerHTML=anyFoe?`<b>${att.name}</b> unleashes ${sk.name}.`:`<b>${att.name}</b>'s ${sk.name} caught no one.`;
    afterAct(att);
  },260);
}

// ================= after a player action =================
function afterAct(u){
  if(u.foe)return;
  dbgAfterAction(u);
  if(u._moved&&u._attacked){ setTimeout(endUnitTurn,300); }
  else { mode='idle'; infoEl.innerHTML=actionPrompt(); renderActions(); }
}
function endUnitTurn(){ if(busy)return; mode='idle'; selSkill=null; nextTurn(); }

// ================= turn order =================
function buildOrder(){ order=[...units].filter(u=>u.hp>0).sort((a,b)=>b.SPD-a.SPD); }
function startRound(){
  round++; roundEl.textContent='Round '+round;
  // reset RP
  for(const u of units){ if(u.hp>0){ u.rp=1; } }
  // lantern lifespan (3 rounds)
  if(lanterns.length){
    for(const l of lanterns) l.life--;
    lanterns=lanterns.filter(l=>l.life>0);
    rebuildLanternTiles();
  }
  // smoke lifespan (stored as "x,y:rounds")
  if(smokeTiles.size){
    const next=new Set();
    for(const s of smokeTiles){ const p=s.split(':'); const r=parseInt(p[1])-1; if(r>0) next.add(p[0]+':'+r); }
    smokeTiles=next;
  }
  // fire-tile lifespan (placed fire lasts a couple of rounds; terrain fire is permanent)
  if(fireExtra.size){
    for(const [k,v] of [...fireExtra]){ v.r--; if(v.r<=0) fireExtra.delete(k); }
  }
}
function nextTurn(){
  if(checkEnd())return;
  // recompute order each turn start to respect Slow/Wait bonuses (simplified: static + wrap)
  let g=0;
  if(oi===-1){ buildOrder(); }
  do{ oi++;
    if(oi>=order.length){ oi=0; buildOrder(); startRound(); }
    g++;
  }while(order[oi] && order[oi].hp<=0 && g<60);
  active=order[oi];
  if(!active){return;}
  active._moved=false; active._attacked=false; active._sprint=false; mode='idle'; selSkill=null; moveUndo=null; pendingCast=null; inspTarget=null;
  // start-of-turn effects
  startOfTurn(active);
  if(active.hp<=0){ return nextTurn(); }
  hiMove=new Set(); hiTarget=new Set(); hiAoe=new Set();
  if(active.foe){ infoEl.innerHTML=`<b>${active.name}</b> (enemy) acts…`; actEl.innerHTML=''; setTimeout(enemyTurn,600); }
  else { infoEl.innerHTML=actionPrompt(); renderActions(); }
}
function startOfTurn(u){
  // Burn / fire tile damage (skipped for players under infinite-HP so they can park in fire)
  if(!(DBG.infHP && !u.foe)) tickFireUnder(u);
  // infinite "mana": keep player reaction points topped
  if(DBG.infMP && !u.foe && u.hp>0) u.rp=99;
  // Lantern aura: allies heal at start of their turn (center square = stronger)
  if(u.hp>0 && !u.foe){
    const eff=lanternEffectAt(u.x,u.y);
    if(eff){ const h=eff==='center'?5:3; u.hp=Math.min(u.max,u.hp+h);
      pops.push(pop(u,'+'+h+'✦','#ffe08a'));
      u.statuses.Guided = Math.max(u.statuses.Guided||0, 2); // +ACC while lit
    }
  }
  // decay statuses
  for(const s in u.statuses){ u.statuses[s]--; if(u.statuses[s]<=0) delete u.statuses[s]; }
  if(!u.statuses.Guarded) u._guardedBy=null;
}
function tickFireUnder(u){
  if(u.hp<=0)return;
  const onFire = tt(u.x,u.y).fire || fireExtra.has(u.x+','+u.y) ;
  if(onFire){ const d=3; u.hp=Math.max(0,u.hp-d); pops.push(pop(u,'-'+d+'🔥','#ff9a4a')); if(u.hp<=0){pops.push(pop(u,u.name.split(' ')[0]+' down!','#ffcf6b'));} }
}

// ================= enemy AI =================
function enemyTurn(){
  if(checkEnd())return; const foe=active;
  const targets=alive(false).sort((a,b)=>a.hp-b.hp||dist(foe,a)-dist(foe,b));
  if(!targets.length)return;
  const tgt=targets[0];
  const rng=basicRange(foe);
  if(dist(foe,tgt)<=rng){ foeAttack(foe,tgt); return; }
  // move toward
  const spots=reachable(foe); let best=null;
  for(const s of spots){ const d=Math.abs(s.x-tgt.x)+Math.abs(s.y-tgt.y);
    const canHit=d<=rng; const hi=tt(s.x,s.y).high?1:0; const fire=tt(s.x,s.y).fire?5:0;
    const score=(canHit?0:100)+d*4 - hi*3 + fire; if(!best||score<best.score)best={...s,score}; }
  if(best){ doMove(foe,best.x,best.y);
    const iv=setInterval(()=>{ if(!busy){clearInterval(iv);
      if(foe.hp<=0){return;} if(dist(foe,tgt)<=rng)foeAttack(foe,tgt);
      else{infoEl.innerHTML=`<b>${foe.name}</b> advances.`;setTimeout(nextTurn,350);} }},50); }
  else setTimeout(nextTurn,250);
}
function foeAttack(foe,tgt){
  const sk={type:basicRange(foe)>1?(foe.cid==='spark'?'magic':'ranged'):'melee',power:foe.cid==='raider'?0:0,acc:85,range:basicRange(foe)};
  doAttack(foe,tgt,sk);
}
function enemyContinue(){ if(checkEnd())return; nextTurn(); }

// ================= end =================
function checkEnd(){
  if(!alive(true).length){end(true);return true;}
  if(!alive(false).length){end(false);return true;}
  return false;
}
function end(win){mode='over';busy=true;
  document.getElementById('ov-t').textContent=win?'Victory':'Defeat';
  document.getElementById('ov-p').textContent=win?`Enemies defeated in ${round} rounds.`:'Your party has fallen.';
  document.getElementById('overlay').classList.add('show');}

// ================= rendering =================
function drawTile(x,y){
  const T=tt(x,y),lift=(T.high?HG_LIFT:0)*cam.z,p=iso(x,y,T.high?HG_LIFT:0),hx=TW/2*cam.z,hy=TH/2*cam.z;
  if(lift>0){ ctx.fillStyle=T.side;
    ctx.beginPath();ctx.moveTo(p.x-hx,p.y);ctx.lineTo(p.x,p.y+hy);ctx.lineTo(p.x,p.y+hy+lift);ctx.lineTo(p.x-hx,p.y+lift);ctx.closePath();ctx.fill();
    ctx.beginPath();ctx.moveTo(p.x+hx,p.y);ctx.lineTo(p.x,p.y+hy);ctx.lineTo(p.x,p.y+hy+lift);ctx.lineTo(p.x+hx,p.y+lift);ctx.closePath();ctx.fill();}
  ctx.fillStyle=T.top; dia(p,hx,hy);
  ctx.fillStyle=T.topSh;ctx.globalAlpha=.3;ctx.beginPath();ctx.moveTo(p.x,p.y-hy);ctx.lineTo(p.x+hx,p.y);ctx.lineTo(p.x,p.y+hy);ctx.closePath();ctx.fill();ctx.globalAlpha=1;
  // terrain glyphs
  ctx.fillStyle='rgba(0,0,0,.5)';ctx.font='9px Georgia';ctx.textAlign='center';
  if(T.cover)ctx.fillText('▲',p.x,p.y+3);
  if(T.high)ctx.fillText('△',p.x,p.y+3);
  if(T.fire){ctx.fillStyle='rgba(255,220,120,.9)';ctx.fillText('🔥',p.x,p.y+4);}
  if(T.blocked){ctx.fillStyle='rgba(0,0,0,.6)';ctx.fillText('✕',p.x,p.y+3);}
  ctx.textAlign='left';
  const k=x+','+y;
  if(lanternTiles.has(k)){
    const isCenter = lanterns.some(l=>l.x===x&&l.y===y);
    ctx.fillStyle = isCenter ? 'rgba(255,220,120,.34)' : 'rgba(255,220,120,.14)';
    dia(p,hx,hy);
    ctx.strokeStyle = isCenter ? 'rgba(255,235,150,.95)' : 'rgba(255,220,120,.55)';
    ctx.lineWidth = isCenter ? 2 : 1; diaStroke(p,hx,hy);
    if(isCenter){ ctx.fillStyle='rgba(255,240,170,.95)'; ctx.font='11px Georgia'; ctx.textAlign='center'; ctx.fillText('✦',p.x,p.y+4); ctx.textAlign='left'; }
  }
  if(fireExtra.has(k)){ctx.fillStyle='rgba(255,90,40,.35)';dia(p,hx,hy);
    ctx.fillStyle='rgba(255,200,120,.9)';ctx.font='10px Georgia';ctx.textAlign='center';ctx.fillText('🔥',p.x,p.y+4);
    const fr=fireExtra.get(k); if(fr){ctx.fillStyle='rgba(255,235,190,.95)';ctx.font='7px Georgia';ctx.fillText(fr.r+'r',p.x,p.y+hy-2);} ctx.textAlign='left';}
  if(inSmoke(x,y)){ctx.fillStyle='rgba(200,200,210,.42)';dia(p,hx,hy);
    ctx.fillStyle='rgba(230,230,240,.7)';ctx.font='11px Georgia';ctx.textAlign='center';ctx.fillText('≈',p.x,p.y+4);ctx.textAlign='left';}
  if(hiMove.has(k)){ctx.fillStyle='rgba(90,170,255,.4)';dia(p,hx,hy);ctx.strokeStyle='rgba(150,210,255,.9)';ctx.lineWidth=1;diaStroke(p,hx,hy);}
  if(hiTarget.has(k)){const e=uAt(x,y);const strong=e&&e.foe;ctx.fillStyle=strong?'rgba(255,70,50,.5)':'rgba(255,100,80,.22)';dia(p,hx,hy);}
  if(hiAoe.has(k)){ctx.fillStyle='rgba(255,150,60,.42)';dia(p,hx,hy);
    const isCtr=pendingCast&&pendingCast.x===x&&pendingCast.y===y;
    ctx.strokeStyle=isCtr?'rgba(255,235,150,.98)':'rgba(255,200,110,.85)';ctx.lineWidth=isCtr?2.5:1.5;diaStroke(p,hx,hy);}
  if(hoverTile&&hoverTile.x===x&&hoverTile.y===y&&(mode==='move'||mode==='target'||mode==='inspect')){ctx.strokeStyle='rgba(255,255,255,.9)';ctx.lineWidth=1.5;diaStroke(p,hx,hy);}
  if(mode==='inspect'&&inspTarget&&inspTarget.x===x&&inspTarget.y===y){ctx.strokeStyle='rgba(140,220,255,.95)';ctx.lineWidth=2;diaStroke(p,hx,hy);}
}
function dia(p,hx,hy){ctx.beginPath();ctx.moveTo(p.x,p.y-hy);ctx.lineTo(p.x+hx,p.y);ctx.lineTo(p.x,p.y+hy);ctx.lineTo(p.x-hx,p.y);ctx.closePath();ctx.fill();}
function diaStroke(p,hx,hy){ctx.beginPath();ctx.moveTo(p.x,p.y-hy);ctx.lineTo(p.x+hx,p.y);ctx.lineTo(p.x,p.y+hy);ctx.lineTo(p.x-hx,p.y);ctx.closePath();ctx.stroke();}

function frameIndex(u){const set=ANIM[u.anim]||ANIM.idle;
  if(u.anim==='idle')return set[Math.floor(performance.now()/450)%set.length];
  if(u.anim==='attack')return set[Math.min(set.length-1,u.aframe||0)];
  return set[0];}
function drawUnit(u){
  if(u.hp<=0&&u.flash<=0)return;
  const lift=tt(u.x,u.y).high?HG_LIFT:0,p=iso(u.px,u.py,lift),img=IMG[u.cid];
  const dw=CELL*1.1*cam.z,dh=CELL*1.1*cam.z,sx=frameIndex(u)*CELL;
  ctx.fillStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.ellipse(p.x,p.y+1,11*cam.z,5*cam.z,0,0,Math.PI*2);ctx.fill();
  const yOff=-dh+TH/2*cam.z+(u.hop?-u.hop*cam.z:0);
  ctx.save();ctx.translate(p.x,p.y);if(u.face===1)ctx.scale(-1,1);
  ctx.drawImage(img,sx,0,CELL,CELL,-dw/2,yOff,dw,dh);
  if(u.flash>0){ctx.globalCompositeOperation='source-atop';ctx.fillStyle=`rgba(255,255,255,${u.flash})`;ctx.fillRect(-dw/2,yOff,dw,dh);ctx.globalCompositeOperation='source-over';}
  ctx.restore();
  // hp bar
  const bw=26*cam.z,bh=3*cam.z,bx=p.x-bw/2,by=p.y+yOff+dh-4*cam.z;
  ctx.fillStyle='#000';ctx.fillRect(bx-1,by-1,bw+2,bh+2);
  ctx.fillStyle=u.foe?'#c0402e':'#4f9a2a';ctx.fillRect(bx,by,bw*(u.hp/u.max),bh);
  // status pips
  let sxx=bx; const st=Object.keys(u.statuses);
  for(const s of st){ctx.fillStyle=statusColor(s);ctx.fillRect(sxx,by-4,3,3);sxx+=4;}
  // RP marker
  if(u.rp>0){ctx.fillStyle='#e8c766';ctx.fillRect(bx+bw-2,by-4,3,3);}
  if(u===active&&!u.foe){ctx.fillStyle='#e8c766';const ay=p.y+yOff-5+Math.sin(performance.now()/300)*2;
    ctx.beginPath();ctx.moveTo(p.x,ay);ctx.lineTo(p.x-4,ay-6);ctx.lineTo(p.x+4,ay-6);ctx.closePath();ctx.fill();}
}
function statusColor(s){return{Burn:'#ff7a3a',Slow:'#7ab0ff',Guarded:'#8fd0ff',Marked:'#ff5a5a',Exposed:'#ffb040',Rooted:'#b08050',Guided:'#e8c766',Riposte:'#d8d0a0',Intercept:'#8fd0ff'}[s]||'#fff';}

function pop(u,txt,c){return{x:u.px,y:u.py,txt,c,t:0,lift:tt(u.x,u.y).high?HG_LIFT:0};}
function drawProj(){for(const pr of projectiles){const x=pr.x+(pr.tx-pr.x)*pr.t,arc=Math.sin(pr.t*Math.PI)*18,y=pr.y+(pr.ty-pr.y)*pr.t-arc;
  if(pr.kind==='arrow'){ctx.strokeStyle='#e8d8a0';ctx.lineWidth=2;const a=Math.atan2(pr.ty-pr.y,pr.tx-pr.x);ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-7*Math.cos(a),y-7*Math.sin(a));ctx.stroke();}
  else{ctx.fillStyle='#e08cf0';ctx.beginPath();ctx.arc(x,y,4,0,Math.PI*2);ctx.fill();ctx.fillStyle='rgba(224,140,240,.4)';ctx.beginPath();ctx.arc(x,y,7,0,Math.PI*2);ctx.fill();}}}
function drawPops(){for(const q of pops){const p=iso(q.x,q.y,q.lift||0);ctx.font='bold 13px Georgia';ctx.textAlign='center';ctx.globalAlpha=Math.max(0,1-q.t);
  ctx.fillStyle='#000';ctx.fillText(q.txt,p.x+1,p.y-26-q.t*22+1);ctx.fillStyle=q.c;ctx.fillText(q.txt,p.x,p.y-26-q.t*22);ctx.globalAlpha=1;ctx.textAlign='left';}}

function update(dt){
  dbgApplyContinuous();
  for(const u of units){if(u.flash>0)u.flash=Math.max(0,u.flash-dt*3);
    if(u.anim==='hurt'&&performance.now()-(u.hurtT||0)>240)u.anim='idle';}
  for(const pr of projectiles){pr.t+=dt*2.4;if(pr.t>=1&&!pr.done){pr.done=true;pr.onHit();}}
  projectiles=projectiles.filter(pr=>pr.t<1.05);
  for(const q of pops)q.t+=dt*0.85; pops=pops.filter(q=>q.t<1);
  if(shakeT>0)shakeT=Math.max(0,shakeT-dt*4);}
function render(){ctx.clearRect(0,0,VW,VH);
  const g=ctx.createLinearGradient(0,0,0,VH);g.addColorStop(0,'#243038');g.addColorStop(.5,'#2b2822');g.addColorStop(1,'#17130f');
  ctx.fillStyle=g;ctx.fillRect(0,0,VW,VH);
  ctx.save();if(shakeT>0){const m=shakeMag*shakeT;ctx.translate((Math.random()-.5)*m,(Math.random()-.5)*m);}
  for(let s=0;s<=(N-1)*2;s++)for(let x=0;x<N;x++){const y=s-x;if(y<0||y>=N)continue;drawTile(x,y);}
  const dl=units.filter(u=>u.hp>0||u.flash>0).sort((a,b)=>(a.px+a.py)-(b.px+b.py));
  for(const u of dl)drawUnit(u);
  drawProj();drawPops();ctx.restore();renderTimeline();}
let last=performance.now();
function loop(now){const dt=Math.min(.05,(now-last)/1000);last=now;update(dt);render();requestAnimationFrame(loop);}

function start(){ buildOrder(); oi=-1; round=0; requestAnimationFrame(loop); nextTurn(); }
