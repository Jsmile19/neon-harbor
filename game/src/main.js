import {createWorld,MISSIONS,carspec} from './world.js';
import {createRenderer} from './render.js';
import {createInput} from './input.js';
import {createAudio} from './audio.js';

const canvas=document.querySelector('#game'), world=createWorld();
const renderer=createRenderer(canvas,world), input=createInput(), audio=createAudio();
const s=world.state, storageKey='neon-harbor-save';
let screen='title', last=0, saveClock=0, held={}, shot=null, helpFrom='title';
function readSave() {
  try { const value=JSON.parse(localStorage.getItem(storageKey)); return value&&typeof value==='object'?value:null; }
  catch { return null; }
}
const saved=readSave();
if (saved) {
  s.hasSave=true;
  s.mission=Number.isInteger(saved.mission)?Math.max(0,Math.min(8,saved.mission)):0;
  s.player.cash=Number.isFinite(saved.cash)?Math.max(0,saved.cash):1250;
  s.owned=Array.isArray(saved.owned)?saved.owned.filter(name=>carspec.some(c=>c[0]===name)):['Morrow Sedan'];
  if (!s.owned.includes('Morrow Sedan')) s.owned.unshift('Morrow Sedan');
  for (const key of ['engine','brakes','armor']) s.upgrades[key]=Math.max(0,Math.min(3,Number(saved.upgrades?.[key])||0));
  s.collectibles.forEach((q,i)=>q.got=Boolean(Array.isArray(saved.collected)&&saved.collected.includes(i)));
  s.jumped=new Set((Array.isArray(saved.jumped)?saved.jumped:[]).filter(i=>Number.isInteger(i)&&i>=0&&i<5));
  s.style=Number(saved.style)||0; s.time=Number(saved.time)||0;
  audio.setMuted(saved.muted); s.mute=audio.muted;
  world.restoreOwned();
}
function save() {
  if (shot) return;
  try {
    localStorage.setItem(storageKey,JSON.stringify({
      mission:s.mission,cash:s.player.cash,owned:s.owned,upgrades:s.upgrades,
      collected:s.collectibles.flatMap((q,i)=>q.got?[i]:[]),jumped:[...s.jumped],
      style:s.style,time:s.time,muted:audio.muted
    }));
    s.hasSave=true;
  } catch { /* Storage may be disabled; this session still remains playable. */ }
}
function play(freq=440) { audio.start(); audio.tone(freq,.12); }
function enterGame() {
  screen='game'; s.paused=false; s.complete=s.failed=false;
  if (!s.active && s.mission<MISSIONS.length) world.start();
  else if (s.mission===MISSIONS.length) world.say('Harbor legend · explore, drive fares, and find every cache',5);
}
function confirm() {
  play(520);
  if (screen==='help') { screen=helpFrom; return; }
  if (screen==='paused') { screen='game';s.paused=false;return; }
  if (screen==='title'||screen==='complete'||screen==='failed') {enterGame();return;}
  if (!s.active) enterGame();
}
// Capture modes use the same renderer and world; normal gameplay never depends on them.
const params=new URLSearchParams(location.search), mode=params.get('shot');
if (mode) {
  shot={x:800,y:600,overview:mode==='overview'};screen='game';
  if (mode!=='overview') {
    const configs={drive:[780,530,0,0,105],mission:[1050,340,1,1,88],night:[890,500,4,0,125]};
    const [x,y,mission,stage,speed]=configs[mode]||configs.drive;
    s.active=true;s.mission=mission;s.stage=stage;s.timer=mode==='mission'?67:52;
    s.player.car=s.cars[mode==='mission'?0:4];
    Object.assign(s.player.car,{x,y,speed,travelAngle:0});Object.assign(s.player,{x,y});
    shot.x=x;shot.y=y;
  }
  s.time=mode==='night'?30:mode==='overview'?470:300;
  s.night=mode==='night';
  if(mode==='night')world.crime(3);
}
canvas.addEventListener('click', e=>{
  if (screen==='title'&&e.clientY>innerHeight*.6&&e.clientY<innerHeight*.71)confirm();
});
window.addEventListener('pagehide',save);
document.addEventListener('visibilitychange',()=>{
  if(document.hidden&&screen==='game'&&!shot){screen='paused';s.paused=true;save();}
});
function frame(t) {
  const dt=Math.min(.05,Math.max(0,(t-last)/1000||0));last=t;
  const keys=input.read(),pressed=key=>keys[key]&&!held[key];
  if (pressed('confirm')) confirm();
  if (pressed('fresh')&&screen==='title') {
    try{localStorage.removeItem(storageKey);}catch{}
    location.href=location.pathname;return;
  }
  if (pressed('help')) {
    if(screen==='help')screen=helpFrom;
    else{helpFrom=screen;screen='help';}
  }
  if (pressed('pause')) {
    if(screen==='game'){screen='paused';s.paused=true;save();}
    else if(screen==='paused'){screen='game';s.paused=false;}
    else if(screen==='help')screen=helpFrom;
    else if(screen==='complete'||screen==='failed'){screen='game';s.complete=s.failed=false;}
  }
  if (pressed('mute')) {audio.start();s.mute=audio.toggle();save();}
  if (screen==='game'&&!shot) {
    if(pressed('interact')){play(230);world.useCar();save();}
    if(pressed('reset'))world.resetVehicle();
    s.orbit+=keys.orbit;
    const previousMission=s.mission;
    world.update(dt,keys);
    if(s.complete)screen='complete';
    if(s.failed)screen='failed';
    saveClock+=dt;
    if(saveClock>=3||s.mission!==previousMission||s.failed){save();saveClock=0;}
  }
  held=keys;
  audio.update(s,screen==='game'&&!shot);
  renderer.draw(s,t,screen,shot);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
