spr='const SPR='+open('../src/sprites.json').read()+';'
eng=open('../src/engine.js').read()
html='''<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no">
<title>Ridgefall v0.1 — Core Combat</title>
<style>
:root{--parch:#e8ddc4;--gold:#c8992f;--gold-lt:#e8c766;--blood:#8a2f24;--panel:#241a12;--panel-lt:#3a2b1d;}
*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;}
html,body{height:100%;}
body{background:radial-gradient(circle at 50% -10%,#2a2016,#0f0a06 70%);color:var(--parch);
 font-family:"Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif;display:flex;flex-direction:column;
 align-items:center;min-height:100vh;overflow-x:hidden;user-select:none;}
header{text-align:center;padding:10px 10px 2px;}
header h1{font-size:clamp(18px,5vw,26px);letter-spacing:.14em;font-weight:600;color:var(--gold-lt);
 text-transform:uppercase;text-shadow:0 2px 0 #000,0 0 18px rgba(200,153,47,.35);}
header p{font-size:10px;letter-spacing:.2em;color:#a8946a;text-transform:uppercase;}
#round{font-size:11px;letter-spacing:.12em;color:var(--gold-lt);text-transform:uppercase;padding:4px;}
#timeline{display:flex;gap:5px;padding:4px 10px 6px;flex-wrap:wrap;justify-content:center;max-width:560px;}
.tl-chip{font-size:9px;letter-spacing:.06em;padding:3px 8px;border-radius:2px;background:var(--panel);
 border:1px solid #000;color:#b9a878;text-transform:uppercase;}
.tl-chip .rp{color:var(--gold-lt);}
.tl-chip.active{background:var(--gold);color:#1a1006;box-shadow:0 0 10px rgba(200,153,47,.6);}
.tl-chip.foe{color:#d8988a;} .tl-chip.foe.active{background:var(--blood);color:#f2d9d2;}
.tl-chip.dead{opacity:.3;text-decoration:line-through;}
#wrap{width:100%;max-width:560px;padding:0 8px;position:relative;}
#zoombar{position:absolute;right:14px;bottom:10px;display:flex;flex-direction:column;gap:4px;}
#zoombar button{width:34px;height:34px;font-size:17px;line-height:1;color:var(--parch);
 background:linear-gradient(var(--panel-lt),var(--panel));border:1px solid #000;border-top:1px solid #5a4629;
 border-radius:5px;cursor:pointer;box-shadow:0 2px 0 rgba(0,0,0,.5);font-family:inherit;}
#zoombar button:active{transform:translateY(1px);box-shadow:0 1px 0 rgba(0,0,0,.5);}
canvas#game{width:100%;height:auto;image-rendering:pixelated;display:block;margin:0 auto;border:1px solid #000;
 border-radius:6px;box-shadow:0 8px 30px rgba(0,0,0,.6);background:#17130f;touch-action:manipulation;}
.legend{font-size:9px;color:#8a7a55;letter-spacing:.04em;text-align:center;padding:5px 12px 2px;}
#hud{width:100%;max-width:560px;padding:6px 8px 20px;display:flex;flex-direction:column;gap:7px;}
#info{background:linear-gradient(var(--panel),#160f09);border:1px solid #000;border-top:1px solid #4a3a26;
 border-radius:4px;padding:8px 12px;min-height:46px;font-size:12.5px;line-height:1.4;box-shadow:0 4px 0 rgba(0,0,0,.4);}
#info b{color:var(--gold-lt);}
#actions{display:flex;gap:6px;flex-wrap:wrap;min-height:42px;}
button.act{flex:1 1 auto;min-width:76px;padding:11px 8px;font-family:inherit;font-size:12px;letter-spacing:.08em;
 text-transform:uppercase;color:var(--parch);background:linear-gradient(var(--panel-lt),var(--panel));border:1px solid #000;
 border-top:1px solid #5a4629;border-radius:4px;cursor:pointer;box-shadow:0 3px 0 rgba(0,0,0,.5);}
button.act:active{transform:translateY(2px);box-shadow:0 1px 0 rgba(0,0,0,.5);}
button.act:disabled{opacity:.35;cursor:default;}
button.act.hot{border-top-color:var(--gold-lt);color:var(--gold-lt);}
button.act.skill{background:linear-gradient(#2e2438,#211a2a);border-top-color:#6a5a8a;color:#d8c8f0;font-size:11px;}
button.act.ghost{background:none;box-shadow:none;border-color:#4a3a26;color:#a8946a;}
#overlay{position:fixed;inset:0;background:rgba(10,6,3,.85);display:none;align-items:center;justify-content:center;z-index:50;text-align:center;padding:20px;}
#overlay.show{display:flex;}
#overlay h2{font-size:32px;color:var(--gold-lt);letter-spacing:.1em;margin-bottom:10px;text-shadow:0 0 22px rgba(200,153,47,.5);}
#overlay p{color:#c9b98c;margin-bottom:18px;line-height:1.5;max-width:320px;}
/* debug panel */
#dbgtab{position:fixed;right:0;top:38%;transform:translateY(-50%);z-index:61;writing-mode:vertical-rl;
 padding:10px 4px;font-family:inherit;font-size:10px;letter-spacing:.15em;color:#0f0a06;background:var(--gold);
 border:1px solid #000;border-right:none;border-radius:5px 0 0 5px;cursor:pointer;box-shadow:-2px 2px 6px rgba(0,0,0,.5);transition:right .2s ease;}
#dbgtab.shift{right:210px;}
#dbgclose{float:right;cursor:pointer;color:#e89a8a;font-size:13px;line-height:1;padding:0 2px;}
#dbgpanel{position:fixed;right:-220px;top:50%;transform:translateY(-50%);width:210px;z-index:60;
 background:linear-gradient(#211a12,#140e08);border:1px solid #000;border-right:none;border-radius:8px 0 0 8px;
 padding:10px 12px 14px;box-shadow:-4px 4px 20px rgba(0,0,0,.6);transition:right .2s ease;}
#dbgpanel.open{right:0;}
.dbg-h{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--gold-lt);text-align:center;margin-bottom:8px;}
.dbg-sub{font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:#8a7a55;margin:7px 0 3px;}
.dbg-row{display:flex;gap:5px;margin-bottom:4px;}
.dbg-t{flex:1;padding:8px 4px;font-family:inherit;font-size:10px;letter-spacing:.04em;color:#b9a878;
 background:#2a2016;border:1px solid #000;border-top:1px solid #4a3a26;border-radius:4px;cursor:pointer;}
.dbg-t.on{background:var(--gold);color:#0f0a06;border-top-color:var(--gold-lt);font-weight:bold;}
.dbg-a{flex:1;padding:8px 4px;font-family:inherit;font-size:10px;letter-spacing:.04em;color:var(--parch);
 background:linear-gradient(var(--panel-lt),var(--panel));border:1px solid #000;border-top:1px solid #5a4629;border-radius:4px;cursor:pointer;}
.dbg-a.kill{color:#e89a8a;} .dbg-a.rev{color:#8ff0a0;}
.dbg-b{flex:1;padding:9px 4px;font-family:inherit;font-size:12px;font-weight:bold;color:var(--gold-lt);
 background:linear-gradient(#2e2620,#1c1610);border:1px solid #000;border-top:1px solid #5a4629;border-radius:4px;cursor:pointer;}
.dbg-b:active{transform:translateY(1px);}
.dbg-t:active,.dbg-a:active{transform:translateY(1px);}
</style></head><body>
<header><h1>Ridgefall</h1><p>Core Combat v0.1</p></header>
<div id="round">Round 1</div>
<div id="timeline"></div>
<div id="wrap"><canvas id="game"></canvas>
<div id="zoombar">
 <button onclick="zoomOut()">−</button>
 <button onclick="zoomReset()">⤢</button>
 <button onclick="zoomIn()">+</button>
</div></div>
<div class="legend">△ high ground · ▲ cover · 🔥 fire · ✕ blocked · ◆ = reaction point ready · pinch / scroll to zoom, drag to pan</div>
<div id="hud"><div id="info">Loading…</div><div id="actions"></div></div>
<div id="overlay"><div><h2 id="ov-t"></h2><p id="ov-p"></p><button class="act hot" onclick="location.reload()">Fight Again</button></div></div>
<button id="dbgtab" onclick="var p=document.getElementById('dbgpanel');p.classList.toggle('open');this.classList.toggle('shift',p.classList.contains('open'));this.textContent=p.classList.contains('open')?'CLOSE':'DEBUG';">DEBUG</button>
<div id="dbgpanel">
  <div class="dbg-h">Playtest Controls <span id="dbgclose" onclick="var p=document.getElementById('dbgpanel');p.classList.remove('open');var t=document.getElementById('dbgtab');t.classList.remove('shift');t.textContent='DEBUG';">✕</span></div>
  <div class="dbg-sub">Load Battle (class setups)</div>
  <div class="dbg-row dbg-battles">
    <button class="dbg-b" onclick="dbgLoadBattle(0)" title="Warder/Duelist/Lanternist vs 1 Raider">0</button>
    <button class="dbg-b" onclick="dbgLoadBattle(1)" title="Battle 1: core 3 vs 4">1</button>
    <button class="dbg-b" onclick="dbgLoadBattle(2)" title="Battle 2: +Bowman">2</button>
    <button class="dbg-b" onclick="dbgLoadBattle(3)" title="Battle 3: +Ember Cantor">3</button>
    <button class="dbg-b" onclick="dbgLoadBattle(4)" title="Battle 4: +Courier">4</button>
    <button class="dbg-b" onclick="dbgLoadBattle(5)" title="Battle 5: full party stress">5</button>
  </div>
  <div class="dbg-sub">Toggles</div>
  <div class="dbg-row"><button class="dbg-t" onclick="dbgToggle('infMove',this)">Infinite Move</button>
    <button class="dbg-t" onclick="dbgToggle('infActions',this)">Infinite Actions</button></div>
  <div class="dbg-row"><button class="dbg-t" onclick="dbgToggle('infHP',this)">Infinite Health</button>
    <button class="dbg-t" onclick="dbgToggle('infMP',this)">Infinite RP/Mana</button></div>
  <div class="dbg-sub">Kill / Revive player (by slot)</div>
  <div class="dbg-row"><button class="dbg-a kill" onclick="dbgKill(0)">K1</button><button class="dbg-a rev" onclick="dbgRevive(0)">R1</button><button class="dbg-a kill" onclick="dbgKill(1)">K2</button><button class="dbg-a rev" onclick="dbgRevive(1)">R2</button><button class="dbg-a kill" onclick="dbgKill(2)">K3</button><button class="dbg-a rev" onclick="dbgRevive(2)">R3</button></div>
  <div class="dbg-row"><button class="dbg-a kill" onclick="dbgKill(3)">K4</button><button class="dbg-a rev" onclick="dbgRevive(3)">R4</button><button class="dbg-a kill" onclick="dbgKill(4)">K5</button><button class="dbg-a rev" onclick="dbgRevive(4)">R5</button><button class="dbg-a kill" onclick="dbgKill(5)">K6</button><button class="dbg-a rev" onclick="dbgRevive(5)">R6</button></div>
  <div class="dbg-sub">Battlefield</div>
  <div class="dbg-row"><button class="dbg-a" onclick="dbgFullHeal()">Heal All</button><button class="dbg-a kill" onclick="dbgKillEnemies()">Kill Enemies</button></div>
</div>
<script>
'''+spr+'\n'+eng+'''
</script></body></html>'''
open('../dist/ridgefall_v0_1.html','w').write(html)
print('built',len(html),'bytes')
