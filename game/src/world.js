export const W=1600,H=1240;
export const MISSIONS=[
 {name:'First Wheels',brief:'A borrowed set of keys and one clean exit. Take the sedan to the marina overlook.',target:[810,384],reward:450},
 {name:'Courier Run',brief:'Three parcels. Three stops. Keep the engine warm.',stops:[[1005,384],[1200,744],[615,924]],time:94,reward:900},
 {name:'Getaway Driver',brief:'Nia is waiting in Old Town. Pick her up, then shake the tail.',target:[420,924],wanted:1,reward:1100},
 {name:'Dockside Deal',brief:'The package is under the crane. Keep the patrols guessing.',target:[1340,744],reward:1400},
 {name:'Night Chase',brief:'Blue lights across the whole city. Lose three stars and call it even.',target:[225,384],wanted:3,reward:2100},
 {name:'The Exchange',brief:'A fragile case and a very short window. No hard hits.',target:[1005,744],time:85,reward:2600},
 {name:'Harbor Heist',brief:'Take the red Vesper from the guarded lot, then bring it to the pier.',target:[1395,564],reward:3200},
 {name:'King of the Harbor',brief:'One last run. Break contact, make the drop, vanish into the lights.',target:[615,384],wanted:4,reward:5000}
];
export const carspec=[['Morrow Sedan',3.1,.045,'#e6e6df'],['Sunline Taxi',2.8,.037,'#f4c846'],['Brackett Pickup',2.55,.032,'#93a08a'],['Vesper GT',4.5,.061,'#ff385b'],['Kestrel Moto',4.8,.067,'#65e8ee']];
function rng(seed){return ()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296}}
export function createWorld(){
 const random=rng(84921), cars=[],peds=[],buildings=[],collectibles=[],ramps=[];
 // Dense parcels between a legible grid of boulevards.
 for(let gy=0;gy<6;gy++)for(let gx=0;gx<7;gx++){
  const x=45+gx*195,y=45+gy*180, district=(gx>=5&&gy>=2)?'DOCKS':gy>=4?'OLD TOWN':gx>=5?'BEACHFRONT':'DOWNTOWN';
  for(let j=0;j<4;j++){
   const bw=48+random()*37,bh=42+random()*40,bx=x+14+(j%2)*70+random()*5,by=y+10+Math.floor(j/2)*68+random()*5;
   let h=(district==='DOWNTOWN'?75+random()*190:district==='DOCKS'?22+random()*35:district==='OLD TOWN'?26+random()*42:38+random()*65);
   const palette=district==='DOWNTOWN'?['#172943','#20354c','#26364c','#302d48']:district==='DOCKS'?['#5a5145','#74634d','#4b5960']:district==='OLD TOWN'?['#775b53','#806c5a','#515761']:['#31505b','#485b60','#465260'];
   buildings.push({x:bx,y:by,w:Math.min(bw,200+gx*195-bx),d:Math.min(bh,179+gy*180-by),h,color:palette[Math.floor(random()*palette.length)],lit:random(),district,sign:district==='DOWNTOWN'&&random()>.55});
  }
 }
 const roadX=Array.from({length:8},(_,i)=>30+i*195);
 const roadY=Array.from({length:7},(_,i)=>24+i*180);
 const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
 const clampTo=(v,min,max)=>Math.min(max,Math.max(min,v));
 const onPier=(x,y)=>x>1430&&x<1570&&Math.abs(y-924)<20;
 const blocked=(x,y,r=5)=>x<12||y<10||y>H-15||(x>1464&&!onPier(x,y))||
  buildings.some(b=>x+r>b.x&&x-r<b.x+b.w&&y+r>b.y&&y-r<b.y+b.d);
 const clampAngle=a=>Math.atan2(Math.sin(a),Math.cos(a));
 const addCar=(x,y,a,type,extra={})=>{
  const car={x,y,a,type,home:{x,y,a},speed:0,active:true,...extra};cars.push(car);return car;
 };
 const starter=addCar(615,550,0,0,{owned:true});
 const heist=addCar(1395,564,Math.PI,3,{guarded:true});
 [[670,564,1.57,1],[725,564,1.57,2],[770,564,1.57,3],[820,564,1.57,4],[1355,744,1.57,1]].forEach(row=>addCar(...row));
 for(let i=0;i<18;i++){
  const row=1+i%5, dir=i%2?1:-1;
  addCar(60+i*76,roadY[row]+dir*6,dir*1.57,i%5,{traffic:true,dir});
 }
 for(let i=0;i<40;i++)peds.push({x:55+random()*1325,y:roadY[1+i%6]+(i%2?17:-17),a:0,dir:i%4<2?1:-1,
  speed:10+random()*9,panic:0,color:['#f0ae79','#9bc4ce','#d9a4bf','#a3bd91'][i%4]});
 for(let i=0;i<20;i++)collectibles.push({x:roadX[(i*3+2)%8]+(i%2?18:-17),y:roadY[1+Math.floor(i/7)*2]+40+(i%7)*12,got:false,phase:random()*6});
 for(let i=0;i<5;i++)ramps.push({x:240+i*240,y:roadY[i+1]+6,a:Math.PI/2});
 const fares=[[870,564,225,924],[1290,744,1005,204],[420,924,1375,384]];
 const player={x:615,y:528,a:0,health:100,cash:1250,car:null,z:0,vz:0};
 const state={player,cars,peds,buildings,collectibles,ramps,shops:[
  {x:420,y:384,type:'DEALERSHIP'},{x:615,y:1104,type:'GARAGE'},{x:1200,y:204,type:'HOSPITAL'}],
  jumped:new Set(),time:0,wanted:0,heat:0,mission:0,stage:0,active:false,complete:false,failed:false,
  timer:0,damageCooldown:0,style:0,owned:['Morrow Sedan'],upgrades:{engine:0,brakes:0,armor:0},
  hasSave:false,mute:false,night:false,toast:'',toastTime:0,policeCars:[{x:225,y:204,a:Math.PI/2,type:0,speed:35,active:true,police:true},{x:1200,y:744,a:-Math.PI/2,type:0,speed:35,active:true,police:true}],roadblocks:[],taxiTarget:null,fare:0,passenger:false,orbit:0,events:[]};
 const taxi=()=>{const [x,y,u,v]=fares[state.fare%fares.length];state.taxiTarget=state.passenger?[u,v]:[x,y]};
 taxi();
 function say(message,seconds=3){state.toast=message;state.toastTime=seconds}
 function objective(){
  const m=MISSIONS[state.mission];
  if(!m)return [615,564];
  if(state.mission===3&&state.stage===1)return [1360,924];
  if(state.mission===6&&state.stage===1)return [1535,924];
  if(state.mission===7&&state.stage===1)return [1200,924];
  return m.stops?.[state.stage]??m.target;
 }
 function escaping(){return state.active&&((state.mission===2&&state.stage===1)||(state.mission===4&&state.stage===1)||(state.mission===7&&state.stage===2))}
 function instruction(){
  if(escaping())return 'BREAK CONTACT · KEEP MOVING';
  if(state.mission===1)return 'DELIVERY '+(state.stage+1)+' / 3';
  return [
   ['DRIVE TO THE OVERLOOK'],[''],['PICK UP NIA','LOSE THE TAIL'],['COLLECT THE CRANE PACKAGE','REACH THE SAFE DROP'],
   ['REACH THE WEST GATE'],['DELIVER THE CASE · AVOID IMPACTS'],['ENTER THE MARKED VESPER GT','DELIVER THE VESPER TO THE PIER'],
   ['BREAK THROUGH THE CHECKPOINT','MAKE THE HARBOR DROP','VANISH FROM PATROL']
  ][state.mission]?.[state.stage]??'ALL CONTRACTS COMPLETE';
 }
 function clearHeat(){state.wanted=0;state.heat=0;state.policeCars.length=0;state.roadblocks.length=0}
 function resetVehicle(){
  const p=player,c=p.car;
  const x=roadX.reduce((a,b)=>Math.abs(a-p.x)<Math.abs(b-p.x)?a:b);
  const y=roadY.reduce((a,b)=>Math.abs(a-p.y)<Math.abs(b-p.y)?a:b);
  Object.assign(p,{x,y,z:0,vz:0,a:0});
  if(c)Object.assign(c,{x,y,a:0,speed:0,z:0,travelAngle:0,stunt:null});
  say(c?'Vehicle recovered to the nearest junction':'Returned to the nearest junction');
 }
 function start(){
  state.complete=state.failed=false;
  const m=MISSIONS[state.mission];
  if(!m)return;
  if(state.mission===0&&!player.car&&dist(player,starter)>100){player.x=starter.x;player.y=starter.y-24}
  if(state.mission===6&&state.stage===1){if(player.car===heist)player.car=null;Object.assign(heist,heist.home,{speed:0,guarded:true});}
  state.stage=0;state.active=true;state.timer=m.time??0;
  if(state.mission===4||state.mission===7)crime(m.wanted);
  if(state.mission===4)state.time=400;
  if(state.mission===5&&!player.car)say('Get a vehicle before the timer runs out');
  say(m.brief,6);
 }
 function finish(ok,reason=''){
  state.active=false;state.complete=ok;state.failed=!ok;
  if(ok){
   if(state.mission===6)heist.guarded=false;
   const m=MISSIONS[state.mission++];player.cash+=m.reward;
   state.result=m.name+'  /  +$'+m.reward.toLocaleString();
   state.events.push('pickup');
  }else{
   state.result=reason;
   clearHeat();
   if(player.health<=0){player.car=null;Object.assign(player,{x:1200,y:204,health:100,z:0,vz:0});}
  }
 }
 function crime(min=1,escalate=false){
  state.wanted=Math.min(5,Math.max(min,state.wanted+(escalate&&state.heat<5.5?1:0)));
  state.heat=8;
 }
 function useCar(){
  const p=player;
  if(p.car){
   if(Math.abs(p.car.speed)>35||p.car.z>0)return say('Slow down before getting out');
   const c=p.car;p.car=null;c.speed=0;
   for(const sign of [1,-1]){
    const x=c.x+Math.cos(c.a)*18*sign,y=c.y+Math.sin(c.a)*18*sign;
    if(!blocked(x,y)){p.x=x;p.y=y;break}
   }
   if(state.passenger){state.passenger=false;taxi();say('The fare has left the cab')}else say('On foot');
   return;
  }
  for(const shop of state.shops){
   if(dist(p,shop)>34)continue;
   if(shop.type==='HOSPITAL'){p.health=100;say('Harbor clinic · fully restored');return}
   if(shop.type==='GARAGE'){
    const key=['engine','brakes','armor'].find(k=>state.upgrades[k]<3);
    if(!key)return say('All upgrades installed');
    if(p.cash<450)return say('Garage · each upgrade costs $450');
    p.cash-=450;state.upgrades[key]++;say(key.toUpperCase()+' tuned · level '+state.upgrades[key]);return;
   }
   const prices=[0,650,1800,4400,3000];
   const type=prices.findIndex((_,i)=>!state.owned.includes(carspec[i][0]));
   if(type<0)return say('All models owned');
   if(p.cash<prices[type])return say(carspec[type][0]+' costs $'+prices[type].toLocaleString());
   p.cash-=prices[type];state.owned.push(carspec[type][0]);
   addCar(420+22*type,389,Math.PI/2,type,{owned:true});
   say('Purchased '+carspec[type][0]+' · parked outside');return;
  }
  let best=null,bestDist=44;
  for(const c of cars){const d=dist(c,p);if(c.active&&d<bestDist){best=c;bestDist=d}}
  if(!best)return say('Move closer to a vehicle or service stop');
  if(best.guarded&&!(state.active&&state.mission===6&&state.stage===0))return say('This car is under guard');
  p.car=best;best.speed=0;best.traffic=false;best.travelAngle=best.a;p.x=best.x;p.y=best.y;p.z=p.vz=0;
  if(!best.owned)crime(best.guarded?3:1,true);
  say('Entered '+carspec[best.type][0]+(best.owned?'':' · patrol alerted'));
 }
 function impact(speed,illegal=false){
  if(speed<18||state.damageCooldown>0)return;
  player.health=Math.max(0,player.health-speed*.16/(1+state.upgrades.armor*.35));
  state.damageCooldown=.65;state.events.push('crash');
  if(illegal)crime(1,true);
  if(speed>65&&state.active&&state.mission===5)finish(false,'The case broke on impact.');
 }
 function movePlayer(dt,k){
  const p=player,c=p.car;
  if(c){
   const spec=carspec[c.type],engine=1+state.upgrades.engine*.12;
   if(k.up)c.speed+=110*dt*engine;
   if(k.down)c.speed-=(c.speed>0?180+state.upgrades.brakes*32:80)*dt;
   if(!k.up&&!k.down)c.speed*=Math.exp(-.95*dt);
   if(k.hand)c.speed*=Math.exp(-1.8*dt);
   c.speed=clampTo(c.speed,-46,spec[1]*43*engine);
   c.a+=((k.right?1:0)-(k.left?1:0))*spec[2]*60*dt*Math.min(1,Math.abs(c.speed)/30)*(k.hand?1.5:1)*Math.sign(c.speed);
   c.travelAngle+=clampAngle(c.a-c.travelAngle)*Math.min(1,dt*(k.hand?3:13));
   if(k.hand&&Math.abs(c.speed)>65)state.style+=dt*15;
   const nx=c.x+Math.sin(c.travelAngle)*c.speed*dt,ny=c.y-Math.cos(c.travelAngle)*c.speed*dt;
   const hitCar=!c.z&&cars.some(q=>q!==c&&q.active&&Math.hypot(q.x-nx,q.y-ny)<17&&Math.hypot(q.x-c.x,q.y-c.y)>Math.hypot(q.x-nx,q.y-ny));
   if(blocked(nx,ny,9)||hitCar||state.roadblocks.some(r=>Math.hypot(nx-r.x,ny-r.y)<14)){
    impact(Math.abs(c.speed),hitCar);c.speed*=-.22;
   }else{c.x=nx;c.y=ny}
   if(!c.z&&c.speed>82){
    const i=ramps.findIndex(r=>dist(r,c)<17&&Math.abs(clampAngle(c.a-r.a))<.72);
    if(i>=0){c.stunt=i;c.vz=115;c.z=1;c.takeoff=c.speed}
   }
   if(c.z){
    c.z+=c.vz*dt;c.vz-=245*dt;
    if(c.z<=0){
     c.z=0;
     if(c.speed>32&&!state.jumped.has(c.stunt)){
      state.jumped.add(c.stunt);state.style+=250;p.cash+=300;state.events.push('pickup');say('STUNT LANDED · +$300 / +250 STYLE');
     }else if(c.speed<32)impact(c.takeoff*.66);
    }
   }
   p.x=c.x;p.y=c.y;p.a=c.a;
  }else{
   const dx=+k.right-+k.left,dy=+k.down-+k.up,n=Math.hypot(dx,dy)||1,step=(k.sprint?112:75)*dt/n;
   if(dx||dy)p.a=Math.atan2(dx,-dy);
   if(k.hand&&!p.z){p.z=1;p.vz=100}
   if(p.z){p.z=Math.max(0,p.z+p.vz*dt);p.vz-=290*dt}
   if(!blocked(p.x+dx*step,p.y))p.x+=dx*step;
   if(!blocked(p.x,p.y+dy*step))p.y+=dy*step;
  }
 }
 function advance(){
  if(!state.active)return;
  const p=player,m=MISSIONS[state.mission],[x,y]=objective();
  if(escaping()){if(!state.wanted)finish(true);return}
  if(Math.hypot(p.x-x,p.y-y)>36)return;
  const i=state.mission;
  if(i===0){if(p.car)finish(true)}
  if(i===1&&p.car&&Math.abs(p.car.speed)<54){if(state.stage===2)finish(true);else{state.stage++;say('Parcel delivered · next stop marked')}}
  if(i===2&&p.car&&Math.abs(p.car.speed)<42){state.stage=1;crime(1);say('Nia is aboard · get out of sight')}
  if(i===3){
   if(!state.stage&&!p.car){state.stage=1;crime(1);say('Package secured · patrol inbound')}
   else if(state.stage&&p.car)finish(true);
  }
  if(i===4&&p.car){state.stage=1;crime(3);say('West gate cleared · break contact')}
  if(i===5&&p.car)finish(true);
  if(i===6){
   if(!state.stage&&p.car===heist){state.stage=1;say('Vesper secured · take it to the pier')}
   else if(state.stage&&p.car===heist)finish(true);
  }
  if(i===7&&p.car){
   if(!state.stage){state.stage=1;say('Checkpoint cleared · make the drop')}
   else{state.stage=2;crime(4);say('Drop confirmed · lose the patrol')}
  }
 }
 function patrol(dt){
  if(!state.wanted){
   for(const c of state.policeCars){c.x+=Math.sin(c.a)*30*dt;if(c.x>1420){c.x=1420;c.a=-Math.PI/2}if(c.x<30){c.x=30;c.a=Math.PI/2}}
   return;
  }
  const p=player;
  while(state.policeCars.length<state.wanted){
   const x=roadX.reduce((a,b)=>Math.abs(a-p.x)<Math.abs(b-p.x)?a:b),y=clampTo(p.y+(p.y>620?-180:180),50,1150);
   state.policeCars.push({x,y,a:0,type:0,speed:66,active:true,police:true});
  }
  state.policeCars.length=state.wanted;
  if(state.wanted===5&&!state.roadblocks.length){
   const y=roadY.reduce((a,b)=>Math.abs(a-p.y)<Math.abs(b-p.y)?a:b);
   const x=clampTo(p.x+(p.a>0?125:-125),60,1360);
   state.roadblocks=[{x,y:y-9},{x,y:y+9}];
  }
  let nearest=Infinity;
  for(const c of state.policeCars){
   const d=dist(c,p);
   let tx=p.x,ty=p.y;
   const obstructed=buildings.some(b=>{for(let t=.1;t<1;t+=.1){const x=c.x+(p.x-c.x)*t,y=c.y+(p.y-c.y)*t;if(x>b.x-9&&x<b.x+b.w+9&&y>b.y-9&&y<b.y+b.d+9)return true}return false});
   if(obstructed){
    const rx=roadX.reduce((a,b)=>Math.abs(a-c.x)<Math.abs(b-c.x)?a:b),ry=roadY.reduce((a,b)=>Math.abs(a-c.y)<Math.abs(b-c.y)?a:b);
    if(Math.abs(c.x-rx)>12){tx=c.x;ty=ry;if(Math.abs(c.y-ry)<10){tx=p.x;ty=ry}}
    else {tx=rx;ty=p.y;if(Math.abs(c.y-ry)<12&&Math.abs(p.x-rx)>100){tx=p.x;ty=ry}}
   }
   const a=Math.atan2(tx-c.x,c.y-ty);
   c.a+=clampTo(clampAngle(a-c.a),-dt*2.3,dt*2.3);
   c.speed=Math.min(c.speed+45*dt,(p.car?88:66)+state.wanted*4);
   const nx=clampTo(c.x+Math.sin(c.a)*c.speed*dt,15,1450),ny=clampTo(c.y-Math.cos(c.a)*c.speed*dt,15,H-20);
   if(!blocked(nx,ny,7)){c.x=nx;c.y=ny}else{if(!blocked(nx,c.y,7))c.x=nx;if(!blocked(c.x,ny,7))c.y=ny;c.a+=dt*2;c.speed*=.96}
   nearest=Math.min(nearest,d);
   if(d<25&&!p.car?.z&&state.damageCooldown===0){impact(45+state.wanted*4);if(p.car)p.car.speed*=.72}
  }
  const hidden=state.policeCars.every(c=>buildings.some(b=>{for(let t=.1;t<1;t+=.1){const x=c.x+(p.x-c.x)*t,y=c.y+(p.y-c.y)*t;if(x>b.x&&x<b.x+b.w&&y>b.y&&y<b.y+b.d)return true}return false}));
  if(nearest>85||hidden)state.heat-=dt*(nearest>170?2.3:1);
  else state.heat=Math.max(state.heat,.8);
  if(state.heat<=0){state.wanted--;state.heat=2.5;if(!state.wanted){clearHeat();say('Patrol lost · all clear')}else state.roadblocks.length=0}
 }
 function lightGreen(x,row){return (Math.floor(state.time/5)+Math.round(x/195)+row)%2===0}
 function update(dt,k){
  state.time+=dt;
  const hour=(19+state.time/20)%24;
  state.night=hour>=19||hour<6;
  state.toastTime=Math.max(0,state.toastTime-dt);state.damageCooldown=Math.max(0,state.damageCooldown-dt);
  const p=player;
  movePlayer(dt,k);
  if(state.active&&MISSIONS[state.mission].time){
   state.timer-=dt;if(state.timer<=0)finish(false,'The delivery window closed.');
  }
  for(const c of cars){
   if(!c.traffic||c===p.car)continue;
   const next=roadX.find(x=>c.dir>0?x>c.x&&x-c.x<24:x<c.x&&c.x-x<24);
   const stop=next!==undefined&&!lightGreen(next,Math.round(c.y/180));
   c.speed=clampTo(c.speed+(stop?-180:45)*dt,0,51);
   c.x+=c.dir*c.speed*dt;if(c.x>1440)c.x=35;if(c.x<24)c.x=1425;
  }
  for(const q of peds){
   const danger=p.car&&Math.abs(p.car.speed)>28&&dist(p,q)<45;
   if(danger&&dist(p,q)<15&&!p.car.z&&state.damageCooldown===0){crime(2,true);impact(25)}
   if(danger)q.panic=1.8;else q.panic=Math.max(0,q.panic-dt);
   q.x+=(q.panic?Math.sign(q.x-p.x)*2:q.dir)*q.speed*dt;
   if(q.x<45||q.x>1430){q.dir*=-1;q.x=clampTo(q.x,45,1430)}
  }
  if(p.car&&Math.abs(p.car.speed)>118&&state.wanted===0&&
     (dist(p,{x:1200,y:744})<93||dist(p,{x:225,y:204})<93)){crime(1);say('Speed trap · patrol alerted')}
  if(p.car?.type===1&&dist(p,{x:state.taxiTarget[0],y:state.taxiTarget[1]})<32&&Math.abs(p.car.speed)<32){
   if(state.passenger){p.cash+=400;state.fare++;say('Fare delivered · +$400');state.events.push('pickup')}
   else say('Passenger aboard · follow the amber fare marker');
   state.passenger=!state.passenger;taxi();
  }
  for(const q of collectibles)if(!q.got&&dist(p,q)<19){q.got=true;p.cash+=250;state.events.push('pickup');say('HARBOR CACHE · +$250')}
  patrol(dt);
  if(p.health<=0)finish(false,'You woke up at Harbor Clinic.');
  else{advance();if(!state.wanted&&state.damageCooldown===0)p.health=Math.min(100,p.health+dt*1.3)}
 }
 function restoreOwned(){
  state.owned.forEach(name=>{const type=carspec.findIndex(c=>c[0]===name);if(type>0)addCar(420+22*type,389,Math.PI/2,type,{owned:true})});
 }
 return {state,restoreOwned,update,start,useCar,crime,objective,instruction,escaping,say,resetVehicle,lightGreen};
}
