import{W,H,MISSIONS,carspec}from'./world.js';
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export function createRenderer(canvas,world){
 const ctx=canvas.getContext('2d',{alpha:false});let dpr=1,vw=0,vh=0,cam={x:520,y:560,z:1},stars=Array.from({length:100},(_,i)=>({x:(i*137)%1600,y:(i*83)%520,r:(i%3)*.45+.4}));
 function resize(){dpr=Math.min(devicePixelRatio||1,1.6);vw=innerWidth;vh=innerHeight;canvas.width=vw*dpr;canvas.height=vh*dpr;ctx.setTransform(dpr,0,0,dpr,0,0)}addEventListener('resize',resize);resize();
 function line(x,y,x2,y2,color,width=1){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x2,y2);ctx.stroke()}
 function rounded(x,y,w,h,r,fill,stroke){ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1;ctx.stroke()}}
 function worldScene(s,now,shot){let p=s.player,targetX=p.x+Math.sin(s.orbit)*110,targetY=p.y+(1-Math.cos(s.orbit))*60;if(shot){targetX=shot.x;targetY=shot.y}let zoom=p.car?1.04:1;cam.x+=(targetX-cam.x)*.075;cam.y+=(targetY-cam.y)*.075;cam.z+=(zoom-cam.z)*.03;const scale=Math.min(vw/1120,vh/710)*cam.z*(shot?.overview?0.78:1);const ox=vw/2-cam.x*scale,oy=vh*.56-cam.y*scale;
 const sx=x=>ox+x*scale,sy=y=>oy+y*scale;
 ctx.save();ctx.beginPath();ctx.rect(0,0,vw,vh);ctx.clip();
 let grad=ctx.createLinearGradient(0,0,0,vh);grad.addColorStop(0,s.night?'#111b39':'#a8c5d0');grad.addColorStop(.48,s.night?'#38475e':'#f1c1a0');grad.addColorStop(1,'#14263a');ctx.fillStyle=grad;ctx.fillRect(0,0,vw,vh);
 // far skyline across the bay
 for(let i=0;i<38;i++){let x=(i*71+17)%vw,y=vh*.28+(i%5)*6,h=35+(i*37%100),w=16+(i*13%28);ctx.fillStyle=['#24384a','#304051','#394654'][i%3];ctx.fillRect(x,y-h,w,h);if(s.night&&i%3===0){for(let j=0;j<3;j++){ctx.fillStyle='#ffd17e';ctx.globalAlpha=.35;ctx.fillRect(x+4+j*6,y-h+9,2,2)}ctx.globalAlpha=1}}
 // coastal water on eastern edge, boardwalk/pier
 const coastX=sx(1470);let ocean=ctx.createLinearGradient(coastX,0,vw,0);ocean.addColorStop(0,'#145168');ocean.addColorStop(.45,'#0c3a55');ocean.addColorStop(1,'#071d37');ctx.fillStyle=ocean;ctx.fillRect(coastX,0,vw,vh);ctx.fillStyle='#d7b98e';ctx.fillRect(coastX-12,0,14,vh);for(let k=0;k<22;k++){const yy=(k*61+now*.006)%vh;line(coastX+20,yy,Math.min(vw,coastX+120+(k%4)*27),yy+2,'rgba(107,220,219,.18)',1)}
 // city ground and district tone
 ctx.fillStyle='#374250';ctx.fillRect(sx(0),sy(0),1464*scale,H*scale);
 // boulevards; regular crossings create readable city blocks
 for(let x=30;x<1464;x+=195){ctx.fillStyle='#747579';ctx.fillRect(sx(x-17),sy(0),34*scale,H*scale);ctx.fillStyle='#222c37';ctx.fillRect(sx(x-13),sy(0),26*scale,H*scale);for(let y=18;y<H;y+=56)line(sx(x),sy(y),sx(x),sy(y+25),'rgba(232,208,153,.68)',Math.max(.7,scale*1.3))}
 for(let y=24;y<H;y+=180){ctx.fillStyle='#777678';ctx.fillRect(sx(0),sy(y-17),1464*scale,34*scale);ctx.fillStyle='#252f3b';ctx.fillRect(sx(0),sy(y-13),1464*scale,26*scale);for(let x=20;x<W;x+=56)line(sx(x),sy(y),sx(x+25),sy(y),'rgba(232,208,153,.68)',Math.max(.7,scale*1.3))}
 // piers, beach bands, boardwalk and marina lamps
 ctx.fillStyle='#c4a57b';ctx.fillRect(sx(1452),sy(570),20*scale,380*scale);ctx.fillStyle='#8c715e';ctx.fillRect(sx(1390),sy(725),82*scale,9*scale);for(let x=1392;x<1470;x+=22){ctx.fillStyle='#bc9c74';ctx.fillRect(sx(x),sy(730),4*scale,62*scale)}
 // The east pier is both visible and physically reachable.
 ctx.fillStyle='#97745d';ctx.fillRect(sx(1430),sy(906),140*scale,36*scale);
 for(let x=1430;x<1570;x+=7)line(sx(x),sy(907),sx(x),sy(941),'rgba(237,207,159,.25)',scale);
 // Harbor cranes, stacked freight, and street furniture identify the neighborhoods.
 for(let i=0;i<3;i++){const x=sx(1300+i*52),y=sy(850);ctx.fillStyle=['#a85f51','#477c87','#9f8c57'][i];ctx.fillRect(x,y,43*scale,18*scale);for(let j=1;j<6;j++)line(x+j*7*scale,y,x+j*7*scale,y+18*scale,'rgba(0,0,0,.2)',scale)}
 line(sx(1380),sy(810),sx(1380),sy(678),'#dab16b',4*scale);line(sx(1310),sy(678),sx(1435),sy(678),'#dab16b',4*scale);line(sx(1340),sy(678),sx(1340),sy(730),'#b7b4a4',scale);
 for(let x=30;x<1400;x+=195)for(let y=204;y<1150;y+=180){
  const px=sx(x+20),py=sy(y+20),green=world.lightGreen(x,Math.round(y/180));
  line(px,py,px,py-18*scale,'#91a0a7',2*scale);
  ctx.fillStyle=green?'#72f5b5':'#fa6678';ctx.beginPath();ctx.arc(px,py-19*scale,2.7*scale,0,7);ctx.fill();
  if(s.night){const glow=ctx.createRadialGradient(px,py,0,px,py,28*scale);glow.addColorStop(0,'rgba(255,217,148,.15)');glow.addColorStop(1,'rgba(255,217,148,0)');ctx.fillStyle=glow;ctx.fillRect(px-28*scale,py-28*scale,56*scale,56*scale);}
  ctx.fillStyle='#c66558';ctx.fillRect(sx(x-21),sy(y+33),3*scale,5*scale);
 }
 // road intersection motifs/crosswalks
 for(let x=30;x<1464;x+=195)for(let y=24;y<H;y+=180){ctx.fillStyle='rgba(238,227,202,.5)';for(let k=0;k<4;k++){ctx.fillRect(sx(x-12+k*6),sy(y-26),Math.max(1,3*scale),Math.max(1,14*scale));ctx.fillRect(sx(x-12+k*6),sy(y+13),Math.max(1,3*scale),Math.max(1,14*scale))}}
 // buildings with extruded faces, window grids and rooftop details
 const buildings=s.buildings;for(const b of buildings){if(sx(b.x+b.w)<-80||sx(b.x)>vw+80||sy(b.y+b.d)<-300||sy(b.y)>vh+100)continue;let x=sx(b.x),y=sy(b.y),w=b.w*scale,d=b.d*scale,h=Math.min(220,b.h)*scale;ctx.fillStyle='rgba(4,10,21,.34)';ctx.beginPath();ctx.ellipse(x+w*.65,y+d*.74,w*.7,d*.55,0,0,Math.PI*2);ctx.fill();ctx.fillStyle=b.color;ctx.beginPath();ctx.moveTo(x,y-h);ctx.lineTo(x+w,y-h);ctx.lineTo(x+w,y+d-h);ctx.lineTo(x,y+d-h);ctx.closePath();ctx.fill();ctx.fillStyle='rgba(3,9,20,.32)';ctx.beginPath();ctx.moveTo(x+w,y-h);ctx.lineTo(x+w+10*scale,y-h-7*scale);ctx.lineTo(x+w+10*scale,y+d-h-7*scale);ctx.lineTo(x+w,y+d-h);ctx.closePath();ctx.fill();ctx.fillStyle='rgba(145,187,195,.13)';ctx.beginPath();ctx.moveTo(x,y-h);ctx.lineTo(x+w,y-h);ctx.lineTo(x+w+10*scale,y-h-7*scale);ctx.lineTo(x+10*scale,y-h-7*scale);ctx.fill();
 const cols=Math.max(2,Math.floor(b.w/14)),rows=Math.max(2,Math.floor(b.d/14));for(let ix=0;ix<cols;ix++)for(let iy=0;iy<rows;iy++){let lit=s.night&&((ix*3+iy*7+Math.floor(b.lit*10))%5<2);ctx.fillStyle=lit?'rgba(255,203,126,.84)':'rgba(128,196,215,.28)';ctx.fillRect(x+(5+ix*(w-10*scale)/cols),y-h+(5+iy*(d-9*scale)/rows),Math.max(1,2.7*scale),Math.max(1,3.2*scale))}
 if(b.sign&&scale>.45){ctx.shadowColor='#ff4d9a';ctx.shadowBlur=10;ctx.fillStyle='#fb508f';ctx.fillRect(x+w*.2,y-h-5*scale,w*.6,3*scale);ctx.shadowBlur=0}
 }
 // palms in beachfront
 for(let i=0;i<12;i++){let x=1320+(i%3)*38,y=180+i*65,px=sx(x),py=sy(y);ctx.strokeStyle='#654d40';ctx.lineWidth=Math.max(2,scale*3);ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px,py-24*scale);ctx.stroke();ctx.strokeStyle='#42bca7';for(let j=0;j<5;j++){let a=j*1.25;ctx.beginPath();ctx.moveTo(px,py-23*scale);ctx.lineTo(px+Math.cos(a)*15*scale,py-23*scale+Math.sin(a)*7*scale);ctx.stroke()}}
 // decorative district plaques
 const plaques=[['DOWNTOWN',500,205],['OLD TOWN',260,1020],['DOCKS',1320,820],['SOUTH BEACH',1370,230]];for(const [label,x,y]of plaques){if(sx(x)<-130||sx(x)>vw+50)continue;rounded(sx(x),sy(y),84*scale,17*scale,4*scale,'rgba(9,18,31,.78)');ctx.fillStyle='#dfc89e';ctx.font=`${Math.max(7,8*scale)}px system-ui`;ctx.fillText(label,sx(x)+5*scale,sy(y)+12*scale)}
 // recognizable service stops and a moving fare callout
 for(const q of s.shops){const x=sx(q.x),y=sy(q.y);ctx.fillStyle='rgba(8,18,29,.86)';ctx.beginPath();ctx.arc(x,y,11*scale,0,Math.PI*2);ctx.fill();ctx.strokeStyle=q.type==='HOSPITAL'?'#77e1bc':q.type==='GARAGE'?'#72d8ed':'#f3c86f';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,8*scale,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#fff';ctx.font=`bold ${Math.max(8,9*scale)}px system-ui`;ctx.textAlign='center';ctx.fillText(q.type==='HOSPITAL'?'H':q.type==='GARAGE'?'G':'$',x,y+3*scale);ctx.textAlign='left'}
 if(s.taxiTarget){const x=sx(s.taxiTarget[0]),y=sy(s.taxiTarget[1]);ctx.strokeStyle='#ffcf67';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,13*scale,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#ffcf67';ctx.font='bold 9px system-ui';ctx.fillText('FARE',x+10*scale,y-10*scale)}
 // collectibles and ramps
 for(const q of s.collectibles){if(q.got)continue;let pulse=1+Math.sin(now*.004+q.phase)*.18,x=sx(q.x),y=sy(q.y);ctx.shadowColor='#43fff2';ctx.shadowBlur=14;ctx.fillStyle='#5bf4e4';ctx.beginPath();ctx.arc(x,y,5*scale*pulse,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;ctx.fillStyle='#d9fff9';ctx.fillRect(x-1,y-7*scale,2,14*scale)}
 for(const r of s.ramps){ctx.save();ctx.translate(sx(r.x),sy(r.y));ctx.rotate(r.a);ctx.fillStyle='#d4814f';ctx.beginPath();ctx.moveTo(-22*scale,9*scale);ctx.lineTo(22*scale,9*scale);ctx.lineTo(13*scale,-9*scale);ctx.lineTo(-13*scale,-9*scale);ctx.closePath();ctx.fill();ctx.restore()}
 // vehicles
 for(const c of [...s.cars,...s.policeCars]){if(!c.active)continue;vehicle(c,sx(c.x),sy(c.y)-(c.z||0)*scale,scale,now,s.night)}
 for(const r of s.roadblocks){vehicle({type:0,a:Math.PI/2,police:true},sx(r.x),sy(r.y),scale,now,s.night)}
 // pedestrians
 for(const q of s.peds){let x=sx(q.x),y=sy(q.y);ctx.fillStyle='rgba(0,0,0,.23)';ctx.beginPath();ctx.ellipse(x,y+4*scale,4*scale,2*scale,0,0,Math.PI*2);ctx.fill();ctx.fillStyle=q.color;ctx.beginPath();ctx.arc(x,y-3*scale,2.4*scale,0,Math.PI*2);ctx.fill();ctx.fillRect(x-2*scale,y,4*scale,5*scale)}
 // player silhouette
 if(!p.car){ctx.fillStyle='rgba(0,0,0,.4)';ctx.beginPath();ctx.ellipse(sx(p.x),sy(p.y)+5*scale,8*scale,4*scale,0,0,Math.PI*2);ctx.fill();ctx.save();ctx.translate(sx(p.x),sy(p.y)-p.z*scale);ctx.rotate(p.a);ctx.fillStyle='#f4dcbd';ctx.beginPath();ctx.arc(0,-7*scale,4*scale,0,Math.PI*2);ctx.fill();ctx.fillStyle='#ff695f';ctx.fillRect(-4*scale,-4*scale,8*scale,12*scale);ctx.fillStyle='#26334a';ctx.fillRect(-5*scale,7*scale,4*scale,6*scale);ctx.fillRect(1*scale,7*scale,4*scale,6*scale);ctx.restore()}
 // objective beacon
 if(s.active&&!s.complete&&!s.failed){const [tx,ty]=world.objective(),x=sx(tx),y=sy(ty),pulse=1+Math.sin(now*.006)*.13;ctx.strokeStyle='#ffcf6a';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,19*scale*pulse,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.arc(x,y,9*scale,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#ffcf6a';ctx.font='bold 10px system-ui';ctx.fillText(`${Math.round(Math.hypot(tx-p.x,ty-p.y))} M`,x+14*scale,y-17*scale)}
 ctx.restore();
 if(s.night){ctx.fillStyle='rgba(7,12,29,.17)';ctx.fillRect(0,0,vw,vh)}
 }
 function vehicle(c,x,y,scale,now,night){const type=c.type||0,col=c.police?'#e9f0ed':carspec[type][3],w=(type===4?14:22)*scale,h=(type===4?27:38)*scale;ctx.save();ctx.translate(x,y);ctx.rotate(c.a);if(night){const beam=ctx.createLinearGradient(0,-h/2,0,-h*2.8);beam.addColorStop(0,'rgba(255,242,191,.24)');beam.addColorStop(1,'rgba(255,242,191,0)');ctx.fillStyle=beam;ctx.beginPath();ctx.moveTo(-w*.4,-h*.4);ctx.lineTo(-w*1.4,-h*2.8);ctx.lineTo(w*1.4,-h*2.8);ctx.lineTo(w*.4,-h*.4);ctx.fill();}ctx.fillStyle='rgba(0,0,0,.42)';ctx.beginPath();ctx.ellipse(2*scale,5*scale,w*.78,h*.66,0,0,Math.PI*2);ctx.fill();ctx.fillStyle=col;ctx.beginPath();ctx.roundRect(-w/2,-h/2,w,h,4*scale);ctx.fill();if(type!==4){ctx.fillStyle=c.police?'#a8c7cf':'#273948';ctx.beginPath();ctx.roundRect(-w*.35,-h*.27,w*.7,h*.34,3*scale);ctx.fill();ctx.fillStyle='#f8dea1';ctx.fillRect(-w*.4,-h*.47,w*.24,2.4*scale);ctx.fillRect(w*.16,-h*.47,w*.24,2.4*scale);ctx.fillStyle='#e95e58';ctx.fillRect(-w*.4,h*.39,w*.24,2.2*scale);ctx.fillRect(w*.16,h*.39,w*.24,2.2*scale);if(c.police){ctx.fillStyle=now%600<300?'#fa4564':'#49d8ff';ctx.fillRect(-4*scale,-h*.1,8*scale,3*scale)}}else{ctx.fillStyle='#162533';ctx.fillRect(-w*.38,-h*.27,w*.76,h*.32);ctx.fillStyle='#69e4ed';ctx.fillRect(-w*.45,-h*.47,w*.25,2*scale)}ctx.restore()}
 function hud(s,now){const p=s.player;rounded(22,20,310,86,13,'rgba(8,15,29,.78)','rgba(255,255,255,.12)');ctx.fillStyle='#f0cf91';ctx.font='700 11px system-ui';ctx.fillText('NEON HARBOR  /  '+district(p.x,p.y),40,42);ctx.fillStyle='#f4f2ee';ctx.font='700 23px system-ui';ctx.fillText('$'+p.cash.toLocaleString(),40,75);ctx.fillStyle='#abb9cb';ctx.font='11px system-ui';ctx.fillText('NIGHT SHIFT  ·  '+timeStr(s.time),40,94);
 // health bar
 rounded(24,119,196,8,4,'rgba(255,255,255,.15)');rounded(24,119,196*p.health/100,8,4,p.health<30?'#fa5969':'#66dfbd');ctx.fillStyle='#c7d4e2';ctx.font='10px system-ui';ctx.fillText(`VITALS  ${Math.ceil(p.health)}`,229,127);
 // objective card
 const m=MISSIONS[Math.min(s.mission,7)];rounded(vw/2-165,20,330,68,13,'rgba(8,15,29,.78)','rgba(255,255,255,.12)');ctx.textAlign='center';ctx.fillStyle='#f4c76d';ctx.font='700 10px system-ui';ctx.fillText(s.active?'ACTIVE JOB  /  '+String(s.mission+1).padStart(2,'0'):'HARBOR CONTRACTS',vw/2,42);ctx.fillStyle='#fff';ctx.font='600 16px system-ui';ctx.fillText(s.active?m.name:s.mission>=8?'Harbor legend':'Press Enter to start',vw/2,65);ctx.fillStyle='#a6b5c8';ctx.font='10px system-ui';ctx.fillText(s.active?world.instruction():'Eight runs · one city · your own rules',vw/2,79);ctx.textAlign='left';
 // minimap
 const mx=vw-204,my=22,mw=180,mh=132;rounded(mx-9,my-7,mw+18,mh+45,13,'rgba(8,15,29,.83)','rgba(255,255,255,.13)');ctx.save();ctx.beginPath();ctx.roundRect(mx,my,mw,mh,7);ctx.clip();ctx.fillStyle='#263c48';ctx.fillRect(mx,my,mw,mh);for(let x=0;x<8;x++){ctx.fillStyle='#141f2d';ctx.fillRect(mx+x*mw/8-1,my,3,mh)}for(let y=0;y<7;y++){ctx.fillStyle='#141f2d';ctx.fillRect(mx,my+y*mh/7-1,mw,3)}ctx.fillStyle='#15506a';ctx.fillRect(mx+mw*.91,my,mw*.09,mh);for(const b of s.buildings){ctx.fillStyle=b.district==='DOWNTOWN'?'#506273':'#45535c';ctx.fillRect(mx+b.x/W*mw,my+b.y/H*mh,Math.max(1,b.w/W*mw),Math.max(1,b.d/H*mh))}for(const c of [...s.cars,...s.policeCars]){if(!c.active)continue;ctx.fillStyle=c.police?'#fc4d69':'#e6b86e';ctx.fillRect(mx+c.x/W*mw-1.5,my+c.y/H*mh-1.5,3,3)}for(const q of s.shops){ctx.fillStyle=q.type==='HOSPITAL'?'#77e1bc':'#e5d4ae';ctx.fillRect(mx+q.x/W*mw-2,my+q.y/H*mh-2,4,4)}if(s.taxiTarget){ctx.fillStyle='#ffae50';ctx.fillRect(mx+s.taxiTarget[0]/W*mw-2,my+s.taxiTarget[1]/H*mh-2,4,4)}if(s.active){let [tx,ty]=world.objective();ctx.strokeStyle='rgba(255,211,108,.65)';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(mx+p.x/W*mw,my+p.y/H*mh);const junction=Math.round((p.y-24)/180)*180+24;ctx.lineTo(mx+p.x/W*mw,my+junction/H*mh);ctx.lineTo(mx+tx/W*mw,my+junction/H*mh);ctx.lineTo(mx+tx/W*mw,my+ty/H*mh);ctx.stroke();ctx.fillStyle='#ffd36c';ctx.beginPath();ctx.arc(mx+tx/W*mw,my+ty/H*mh,4,0,7);ctx.fill()}ctx.fillStyle='#5bffff';ctx.beginPath();ctx.arc(mx+p.x/W*mw,my+p.y/H*mh,4,0,7);ctx.fill();ctx.restore();ctx.fillStyle='#bac9d5';ctx.font='9px system-ui';ctx.fillText('HARBOR GRID',mx,my+mh+17);
 // A small stats strip makes side activity progress visible.
 ctx.fillStyle='#a6b5c8';ctx.font='10px system-ui';ctx.fillText(`CACHES ${s.collectibles.filter(q=>q.got).length}/20  ·  STUNTS ${s.jumped.size}/5  ·  STYLE ${Math.floor(s.style)}`,24,146);
 // Direction arrow remains on screen even when the beacon is off camera.
 if(s.active&&!world.escaping()){const [tx,ty]=world.objective();ctx.save();ctx.translate(vw/2,103);ctx.rotate(Math.atan2(ty-p.y,tx-p.x));ctx.fillStyle='#ffd36c';ctx.beginPath();ctx.moveTo(10,0);ctx.lineTo(-7,-5);ctx.lineTo(-4,0);ctx.lineTo(-7,5);ctx.closePath();ctx.fill();ctx.restore();}
 // wanted stars / speed
 ctx.textAlign='right';ctx.font='20px system-ui';ctx.fillStyle='#ffd768';let starStr='';for(let i=0;i<5;i++)starStr+=i<s.wanted?'★':'☆';ctx.fillText(starStr,vw-29,190);ctx.font='700 10px system-ui';ctx.fillStyle=s.wanted?'#ff8390':'#9fb3c4';ctx.fillText(s.wanted?'PATROL ALERT':'CLEAR',vw-30,205);ctx.textAlign='left';
 if(p.car){rounded(24,vh-88,200,60,12,'rgba(8,15,29,.8)','rgba(255,255,255,.13)');ctx.fillStyle='#f4c76d';ctx.font='700 10px system-ui';ctx.fillText(carspec[p.car.type][0].toUpperCase(),40,vh-65);ctx.fillStyle='#fff';ctx.font='700 24px system-ui';ctx.fillText(String(Math.round(Math.abs(p.car.speed)*1.35)).padStart(3,'0'),40,vh-39);ctx.fillStyle='#a6b5c8';ctx.font='10px system-ui';ctx.fillText('KM/H',104,vh-40)}
 if(s.active){rounded(vw/2-100,vh-54,200,35,10,'rgba(8,15,29,.75)');ctx.textAlign='center';ctx.fillStyle='#eadab8';ctx.font='11px system-ui';ctx.fillText(s.timer>0?`TIME  ${Math.ceil(s.timer)} s`:`OBJECTIVE  ·  ${Math.round(Math.hypot(world.objective()[0]-p.x,world.objective()[1]-p.y))} m`,vw/2,vh-32);ctx.textAlign='left'}
 if(s.toastTime>0){rounded(vw/2-245,106,490,44,12,'rgba(10,18,32,.87)','rgba(245,205,119,.36)');ctx.textAlign='center';ctx.fillStyle='#f7dfb5';ctx.font='600 13px system-ui';ctx.fillText(s.toast,vw/2,133,470);ctx.textAlign='left'}
 }
 function district(x,y){if(x>1050&&y>340)return'DOCKS';if(y>760&&x<650)return'OLD TOWN';if(x>1200)return'BEACHFRONT';return'DOWNTOWN'}function timeStr(t){let total=(19*60+Math.floor(t*3))%1440,minute=total%60,hour=Math.floor(total/60);return`${String(hour).padStart(2,'0')}:${String(minute).padStart(2,'0')}`}
 function menu(s,screen){
  if(screen==='game')return;
  ctx.fillStyle='rgba(5,10,22,.76)';ctx.fillRect(0,0,vw,vh);ctx.textAlign='center';
  const text=(value,y,size=14,color='#bfccda')=>{ctx.fillStyle=color;ctx.font=`${size>=30?'800':'500'} ${size}px system-ui`;ctx.fillText(value,vw/2,y,Math.max(200,vw-48))};
  if(screen==='title'){
   text('WELCOME TO THE COAST',vh*.24,12,'#f3cc82');
   text('NEON HARBOR',vh*.37,Math.min(86,vw*.09),'#f6f2e9');
   text('NIGHT SHIFT  /  AN OPEN CITY STORY',vh*.42,15,'#68ebdc');
   text('The city never asks who owns the road.',vh*.52,15);
   rounded(vw/2-125,vh*.62,250,50,16,'#efbd67');
   text(s.hasSave?'ENTER · CONTINUE':'ENTER · START YOUR STORY',vh*.62+31,14,'#152033');
   text('H controls & city guide  ·  N clear save and start fresh',vh*.76,12);
   text('8 STORY RUNS  ·  4 DISTRICTS  ·  20 HARBOR CACHES',vh*.88,11);
  }else if(screen==='help'){
   text('YOUR CITY GUIDE',vh*.17,32,'#f3cc82');
   const lines=[
    'WASD / arrows · move, accelerate, steer, brake / reverse',
    'E · enter / exit a nearby car, use a service stop on foot',
    'Space · handbrake / jump on foot     Shift · sprint',
    'Mouse drag · look around     R · recover to nearest junction',
    'Esc · pause     M · mute audio     Enter · next contract / retry',
    'Gold beacon + route · contract     Amber FARE · taxi pickup / drop',
    'H · free clinic     G · $450 upgrades     $ · dealership',
    'Lose police by outrunning them or hiding behind city blocks.',
    'Garage installs engine, brakes, then armor; three levels of each.',
    'Collect 20 cyan caches; hit five east-facing ramps at speed.'
   ];
   lines.forEach((line,i)=>text(line,vh*.27+i*Math.min(31,vh*.046),13));
   text('H / ESC / ENTER · RETURN',vh*.89,12,'#68ebdc');
  }else{
   text(screen==='paused'?'HARBOR PAUSED':screen==='complete'?'RUN COMPLETE':'SIGNAL LOST',vh*.32,12,'#f2c878');
   text(screen==='paused'?'Take a breath':screen==='complete'?(s.mission===8?'You own the night.':'Good work, driver.'):'The night goes on.',vh*.44,Math.min(44,vw*.055),'#f7f3ec');
   text(screen==='paused'?'Progress saved locally. H opens controls.':s.result||'',vh*.52,15);
   text(s.mission===8?'All eight contracts complete · the city is still yours.':'',vh*.59,14,'#68ebdc');
   text('ENTER · '+(screen==='failed'?'RETRY':screen==='complete'&&s.mission<8?'NEXT CONTRACT':'RESUME')+'    /    ESC · FREE ROAM',vh*.68,13,'#f3cc82');
  }
  ctx.textAlign='left';
 }
 function draw(state,now,screen='game',shot){worldScene(state,now,shot);hud(state,now);menu(state,screen)}
 return{draw,resize};
}
