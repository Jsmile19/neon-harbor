import {W, H, MISSIONS, carspec} from './world.js';

// A frame consists of the city, the dashboard, and an optional menu overlay.
export function createRenderer(canvas, world) {
  const ctx = canvas.getContext('2d', {alpha: false});
  let vw = 0, vh = 0, dpr = 1;
  const camera = {x: 520, y: 560, z: 1};

  function resize() {
    dpr = Math.min(devicePixelRatio || 1, 1.6);
    vw = innerWidth;
    vh = innerHeight;
    canvas.width = vw * dpr;
    canvas.height = vh * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  addEventListener('resize', resize);
  resize();

  function line(x, y, endX, endY, color, width = 1) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(endX, endY);
    ctx.stroke();
  }

  function panel(x, y, width, height, radius, fill, stroke) {
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, radius);
    ctx.fillStyle = fill;
    ctx.fill();
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  function drawCity(state, now, shot) {
    const player = state.player;
    let targetX = player.x + Math.sin(state.orbit) * 110;
    let targetY = player.y + (1 - Math.cos(state.orbit)) * 60;
    if (shot) { targetX = shot.x; targetY = shot.y; }
    const zoom = player.car ? 1.04 : 1;
    camera.x += (targetX - camera.x) * .075;
    camera.y += (targetY - camera.y) * .075;
    camera.z += (zoom - camera.z) * .03;
    const scale = Math.min(vw / 1120, vh / 710) * camera.z * (shot?.overview ? .78 : 1);
    const offsetX = vw / 2 - camera.x * scale, offsetY = vh * .56 - camera.y * scale;
    const sx = x => offsetX + x * scale, sy = y => offsetY + y * scale;

    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, vw, vh);
    ctx.clip();
    drawBay(state, now, sx);
    drawStreets(state, sx, sy, scale);
    drawBuildings(state, sx, sy, scale);
    drawStreetLife(state, now, sx, sy, scale);
    ctx.restore();
    if (state.night) {
      ctx.fillStyle = 'rgba(7,12,29,.17)';
      ctx.fillRect(0, 0, vw, vh);
    }
  }

  function drawBay(state, now, sx) {
    const sky = ctx.createLinearGradient(0, 0, 0, vh);
    sky.addColorStop(0, state.night ? '#111b39' : '#a8c5d0');
    sky.addColorStop(.48, state.night ? '#38475e' : '#f1c1a0');
    sky.addColorStop(1, '#14263a');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, vw, vh);
    for (let i = 0; i < 38; i++) {
      const x = (i * 71 + 17) % vw, y = vh * .28 + (i % 5) * 6;
      const height = 35 + (i * 37 % 100), width = 16 + (i * 13 % 28);
      ctx.fillStyle = ['#24384a', '#304051', '#394654'][i % 3];
      ctx.fillRect(x, y - height, width, height);
      if (state.night && i % 3 === 0) {
        for (let window = 0; window < 3; window++) {
          ctx.fillStyle = '#ffd17e';
          ctx.globalAlpha = .35;
          ctx.fillRect(x + 4 + window * 6, y - height + 9, 2, 2);
        }
        ctx.globalAlpha = 1;
      }
    }

    const coast = sx(1470), water = ctx.createLinearGradient(coast, 0, vw, 0);
    water.addColorStop(0, '#145168');
    water.addColorStop(.45, '#0c3a55');
    water.addColorStop(1, '#071d37');
    ctx.fillStyle = water;
    ctx.fillRect(coast, 0, vw, vh);
    ctx.fillStyle = '#d7b98e';
    ctx.fillRect(coast - 12, 0, 14, vh);
    for (let wave = 0; wave < 22; wave++) {
      const y = (wave * 61 + now * .006) % vh;
      line(coast + 20, y, Math.min(vw, coast + 120 + (wave % 4) * 27), y + 2,
        'rgba(107,220,219,.18)', 1);
    }
  }

  function drawStreets(state, sx, sy, scale) {
    ctx.fillStyle = '#374250';
    ctx.fillRect(sx(0), sy(0), 1464 * scale, H * scale);
    for (let x = 30; x < 1464; x += 195) {
      ctx.fillStyle = '#747579';
      ctx.fillRect(sx(x - 17), sy(0), 34 * scale, H * scale);
      ctx.fillStyle = '#222c37';
      ctx.fillRect(sx(x - 13), sy(0), 26 * scale, H * scale);
      for (let y = 18; y < H; y += 56) {
        line(sx(x), sy(y), sx(x), sy(y + 25), 'rgba(232,208,153,.68)', Math.max(.7, scale * 1.3));
      }
    }
    for (let y = 24; y < H; y += 180) {
      ctx.fillStyle = '#777678';
      ctx.fillRect(sx(0), sy(y - 17), 1464 * scale, 34 * scale);
      ctx.fillStyle = '#252f3b';
      ctx.fillRect(sx(0), sy(y - 13), 1464 * scale, 26 * scale);
      for (let x = 20; x < W; x += 56) {
        line(sx(x), sy(y), sx(x + 25), sy(y), 'rgba(232,208,153,.68)', Math.max(.7, scale * 1.3));
      }
    }

    ctx.fillStyle = '#c4a57b';
    ctx.fillRect(sx(1452), sy(570), 20 * scale, 380 * scale);
    ctx.fillStyle = '#8c715e';
    ctx.fillRect(sx(1390), sy(725), 82 * scale, 9 * scale);
    for (let x = 1392; x < 1470; x += 22) {
      ctx.fillStyle = '#bc9c74';
      ctx.fillRect(sx(x), sy(730), 4 * scale, 62 * scale);
    }
    ctx.fillStyle = '#97745d';
    ctx.fillRect(sx(1430), sy(906), 140 * scale, 36 * scale);
    for (let x = 1430; x < 1570; x += 7) {
      line(sx(x), sy(907), sx(x), sy(941), 'rgba(237,207,159,.25)', scale);
    }
    for (let i = 0; i < 3; i++) {
      const x = sx(1300 + i * 52), y = sy(850);
      ctx.fillStyle = ['#a85f51', '#477c87', '#9f8c57'][i];
      ctx.fillRect(x, y, 43 * scale, 18 * scale);
      for (let rib = 1; rib < 6; rib++) {
        line(x + rib * 7 * scale, y, x + rib * 7 * scale, y + 18 * scale, 'rgba(0,0,0,.2)', scale);
      }
    }
    line(sx(1380), sy(810), sx(1380), sy(678), '#dab16b', 4 * scale);
    line(sx(1310), sy(678), sx(1435), sy(678), '#dab16b', 4 * scale);
    line(sx(1340), sy(678), sx(1340), sy(730), '#b7b4a4', scale);

    for (let x = 30; x < 1400; x += 195) {
      for (let y = 204; y < 1150; y += 180) {
        const px = sx(x + 20), py = sy(y + 20);
        const green = world.lightGreen(x, Math.round(y / 180));
        line(px, py, px, py - 18 * scale, '#91a0a7', 2 * scale);
        ctx.fillStyle = green ? '#72f5b5' : '#fa6678';
        ctx.beginPath();
        ctx.arc(px, py - 19 * scale, 2.7 * scale, 0, 7);
        ctx.fill();
        if (state.night) {
          const glow = ctx.createRadialGradient(px, py, 0, px, py, 28 * scale);
          glow.addColorStop(0, 'rgba(255,217,148,.15)');
          glow.addColorStop(1, 'rgba(255,217,148,0)');
          ctx.fillStyle = glow;
          ctx.fillRect(px - 28 * scale, py - 28 * scale, 56 * scale, 56 * scale);
        }
        ctx.fillStyle = '#c66558';
        ctx.fillRect(sx(x - 21), sy(y + 33), 3 * scale, 5 * scale);
      }
    }
    for (let x = 30; x < 1464; x += 195) {
      for (let y = 24; y < H; y += 180) {
        ctx.fillStyle = 'rgba(238,227,202,.5)';
        for (let stripe = 0; stripe < 4; stripe++) {
          ctx.fillRect(sx(x - 12 + stripe * 6), sy(y - 26), Math.max(1, 3 * scale), Math.max(1, 14 * scale));
          ctx.fillRect(sx(x - 12 + stripe * 6), sy(y + 13), Math.max(1, 3 * scale), Math.max(1, 14 * scale));
        }
      }
    }
  }

  function drawBuildings(state, sx, sy, scale) {
    for (const building of state.buildings) {
      if (sx(building.x + building.w) < -80 || sx(building.x) > vw + 80 ||
          sy(building.y + building.d) < -300 || sy(building.y) > vh + 100) continue;
      const x = sx(building.x), y = sy(building.y);
      const width = building.w * scale, depth = building.d * scale;
      const height = Math.min(220, building.h) * scale;
      ctx.fillStyle = 'rgba(4,10,21,.34)';
      ctx.beginPath();
      ctx.ellipse(x + width * .65, y + depth * .74, width * .7, depth * .55, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = building.color;
      ctx.beginPath();
      ctx.moveTo(x, y - height);
      ctx.lineTo(x + width, y - height);
      ctx.lineTo(x + width, y + depth - height);
      ctx.lineTo(x, y + depth - height);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = 'rgba(3,9,20,.32)';
      ctx.beginPath();
      ctx.moveTo(x + width, y - height);
      ctx.lineTo(x + width + 10 * scale, y - height - 7 * scale);
      ctx.lineTo(x + width + 10 * scale, y + depth - height - 7 * scale);
      ctx.lineTo(x + width, y + depth - height);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = 'rgba(145,187,195,.13)';
      ctx.beginPath();
      ctx.moveTo(x, y - height);
      ctx.lineTo(x + width, y - height);
      ctx.lineTo(x + width + 10 * scale, y - height - 7 * scale);
      ctx.lineTo(x + 10 * scale, y - height - 7 * scale);
      ctx.fill();

      const columns = Math.max(2, Math.floor(building.w / 14));
      const rows = Math.max(2, Math.floor(building.d / 14));
      for (let column = 0; column < columns; column++) {
        for (let row = 0; row < rows; row++) {
          const lit = state.night && (column * 3 + row * 7 + Math.floor(building.lit * 10)) % 5 < 2;
          ctx.fillStyle = lit ? 'rgba(255,203,126,.84)' : 'rgba(128,196,215,.28)';
          ctx.fillRect(x + (5 + column * (width - 10 * scale) / columns),
            y - height + (5 + row * (depth - 9 * scale) / rows),
            Math.max(1, 2.7 * scale), Math.max(1, 3.2 * scale));
        }
      }
      if (building.sign && scale > .45) {
        ctx.shadowColor = '#ff4d9a';
        ctx.shadowBlur = 10;
        ctx.fillStyle = '#fb508f';
        ctx.fillRect(x + width * .2, y - height - 5 * scale, width * .6, 3 * scale);
        ctx.shadowBlur = 0;
      }
    }

    for (let i = 0; i < 12; i++) {
      const x = 1320 + (i % 3) * 38, y = 180 + i * 65, px = sx(x), py = sy(y);
      ctx.strokeStyle = '#654d40';
      ctx.lineWidth = Math.max(2, scale * 3);
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px, py - 24 * scale);
      ctx.stroke();
      ctx.strokeStyle = '#42bca7';
      for (let frond = 0; frond < 5; frond++) {
        const angle = frond * 1.25;
        ctx.beginPath();
        ctx.moveTo(px, py - 23 * scale);
        ctx.lineTo(px + Math.cos(angle) * 15 * scale, py - 23 * scale + Math.sin(angle) * 7 * scale);
        ctx.stroke();
      }
    }
    const plaques = [
      ['DOWNTOWN',500,205], ['OLD TOWN',260,1020], ['DOCKS',1320,820], ['SOUTH BEACH',1370,230]
    ];
    for (const [label, x, y] of plaques) {
      if (sx(x) < -130 || sx(x) > vw + 50) continue;
      panel(sx(x), sy(y), 84 * scale, 17 * scale, 4 * scale, 'rgba(9,18,31,.78)');
      ctx.fillStyle = '#dfc89e';
      ctx.font = `${Math.max(7, 8 * scale)}px system-ui`;
      ctx.fillText(label, sx(x) + 5 * scale, sy(y) + 12 * scale);
    }
  }

  function drawStreetLife(state, now, sx, sy, scale) {
    for (const shop of state.shops) {
      const x = sx(shop.x), y = sy(shop.y);
      ctx.fillStyle = 'rgba(8,18,29,.86)';
      ctx.beginPath();
      ctx.arc(x, y, 11 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = shop.type === 'HOSPITAL' ? '#77e1bc' : shop.type === 'GARAGE' ? '#72d8ed' : '#f3c86f';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, 8 * scale, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.font = `bold ${Math.max(8, 9 * scale)}px system-ui`;
      ctx.textAlign = 'center';
      ctx.fillText(shop.type === 'HOSPITAL' ? 'H' : shop.type === 'GARAGE' ? 'G' : '$', x, y + 3 * scale);
      ctx.textAlign = 'left';
    }
    if (state.taxiTarget) {
      const x = sx(state.taxiTarget[0]), y = sy(state.taxiTarget[1]);
      ctx.strokeStyle = '#ffcf67';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, 13 * scale, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#ffcf67';
      ctx.font = 'bold 9px system-ui';
      ctx.fillText('FARE', x + 10 * scale, y - 10 * scale);
    }
    for (const cache of state.collectibles) {
      if (cache.got) continue;
      const pulse = 1 + Math.sin(now * .004 + cache.phase) * .18;
      const x = sx(cache.x), y = sy(cache.y);
      ctx.shadowColor = '#43fff2';
      ctx.shadowBlur = 14;
      ctx.fillStyle = '#5bf4e4';
      ctx.beginPath();
      ctx.arc(x, y, 5 * scale * pulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#d9fff9';
      ctx.fillRect(x - 1, y - 7 * scale, 2, 14 * scale);
    }
    for (const ramp of state.ramps) {
      ctx.save();
      ctx.translate(sx(ramp.x), sy(ramp.y));
      ctx.rotate(ramp.a);
      ctx.fillStyle = '#d4814f';
      ctx.beginPath();
      ctx.moveTo(-22 * scale, 9 * scale);
      ctx.lineTo(22 * scale, 9 * scale);
      ctx.lineTo(13 * scale, -9 * scale);
      ctx.lineTo(-13 * scale, -9 * scale);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    for (const car of [...state.cars, ...state.policeCars]) {
      if (!car.active) continue;
      drawVehicle(car, sx(car.x), sy(car.y) - (car.z || 0) * scale, scale, now, state.night);
    }
    for (const barrier of state.roadblocks) {
      drawVehicle({type: 0, a: Math.PI / 2, police: true}, sx(barrier.x), sy(barrier.y), scale, now, state.night);
    }
    for (const ped of state.peds) {
      const x = sx(ped.x), y = sy(ped.y);
      ctx.fillStyle = 'rgba(0,0,0,.23)';
      ctx.beginPath();
      ctx.ellipse(x, y + 4 * scale, 4 * scale, 2 * scale, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = ped.color;
      ctx.beginPath();
      ctx.arc(x, y - 3 * scale, 2.4 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(x - 2 * scale, y, 4 * scale, 5 * scale);
    }

    const player = state.player;
    if (!player.car) {
      ctx.fillStyle = 'rgba(0,0,0,.4)';
      ctx.beginPath();
      ctx.ellipse(sx(player.x), sy(player.y) + 5 * scale, 8 * scale, 4 * scale, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.save();
      ctx.translate(sx(player.x), sy(player.y) - player.z * scale);
      ctx.rotate(player.a);
      ctx.fillStyle = '#f4dcbd';
      ctx.beginPath();
      ctx.arc(0, -7 * scale, 4 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ff695f';
      ctx.fillRect(-4 * scale, -4 * scale, 8 * scale, 12 * scale);
      ctx.fillStyle = '#26334a';
      ctx.fillRect(-5 * scale, 7 * scale, 4 * scale, 6 * scale);
      ctx.fillRect(1 * scale, 7 * scale, 4 * scale, 6 * scale);
      ctx.restore();
    }
    if (state.active && !state.complete && !state.failed) {
      const [targetX, targetY] = world.objective();
      const x = sx(targetX), y = sy(targetY), pulse = 1 + Math.sin(now * .006) * .13;
      ctx.strokeStyle = '#ffcf6a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, 19 * scale * pulse, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x, y, 9 * scale, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#ffcf6a';
      ctx.font = 'bold 10px system-ui';
      ctx.fillText(`${Math.round(Math.hypot(targetX - player.x, targetY - player.y))} M`, x + 14 * scale, y - 17 * scale);
    }
  }

  function drawVehicle(car, x, y, scale, now, night) {
    const type = car.type || 0, color = car.police ? '#e9f0ed' : carspec[type][3];
    const width = (type === 4 ? 14 : 22) * scale, height = (type === 4 ? 27 : 38) * scale;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(car.a);
    if (night) {
      const beam = ctx.createLinearGradient(0, -height / 2, 0, -height * 2.8);
      beam.addColorStop(0, 'rgba(255,242,191,.24)');
      beam.addColorStop(1, 'rgba(255,242,191,0)');
      ctx.fillStyle = beam;
      ctx.beginPath();
      ctx.moveTo(-width * .4, -height * .4);
      ctx.lineTo(-width * 1.4, -height * 2.8);
      ctx.lineTo(width * 1.4, -height * 2.8);
      ctx.lineTo(width * .4, -height * .4);
      ctx.fill();
    }
    ctx.fillStyle = 'rgba(0,0,0,.42)';
    ctx.beginPath();
    ctx.ellipse(2 * scale, 5 * scale, width * .78, height * .66, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(-width / 2, -height / 2, width, height, 4 * scale);
    ctx.fill();
    if (type !== 4) {
      ctx.fillStyle = car.police ? '#a8c7cf' : '#273948';
      ctx.beginPath();
      ctx.roundRect(-width * .35, -height * .27, width * .7, height * .34, 3 * scale);
      ctx.fill();
      ctx.fillStyle = '#f8dea1';
      ctx.fillRect(-width * .4, -height * .47, width * .24, 2.4 * scale);
      ctx.fillRect(width * .16, -height * .47, width * .24, 2.4 * scale);
      ctx.fillStyle = '#e95e58';
      ctx.fillRect(-width * .4, height * .39, width * .24, 2.2 * scale);
      ctx.fillRect(width * .16, height * .39, width * .24, 2.2 * scale);
      if (car.police) {
        ctx.fillStyle = now % 600 < 300 ? '#fa4564' : '#49d8ff';
        ctx.fillRect(-4 * scale, -height * .1, 8 * scale, 3 * scale);
      }
    } else {
      ctx.fillStyle = '#162533';
      ctx.fillRect(-width * .38, -height * .27, width * .76, height * .32);
      ctx.fillStyle = '#69e4ed';
      ctx.fillRect(-width * .45, -height * .47, width * .25, 2 * scale);
    }
    ctx.restore();
  }

  function district(x, y) {
    if (x > 1050 && y > 340) return 'DOCKS';
    if (y > 760 && x < 650) return 'OLD TOWN';
    if (x > 1200) return 'BEACHFRONT';
    return 'DOWNTOWN';
  }

  function clock(time) {
    const total = (19 * 60 + Math.floor(time * 3)) % 1440;
    const minute = total % 60, hour = Math.floor(total / 60);
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  }

  function drawHud(state) {
    const player = state.player;
    panel(22, 20, 310, 86, 13, 'rgba(8,15,29,.78)', 'rgba(255,255,255,.12)');
    ctx.fillStyle = '#f0cf91';
    ctx.font = '700 11px system-ui';
    ctx.fillText('NEON HARBOR  /  ' + district(player.x, player.y), 40, 42);
    ctx.fillStyle = '#f4f2ee';
    ctx.font = '700 23px system-ui';
    ctx.fillText('$' + player.cash.toLocaleString(), 40, 75);
    ctx.fillStyle = '#abb9cb';
    ctx.font = '11px system-ui';
    ctx.fillText('NIGHT SHIFT  ·  ' + clock(state.time), 40, 94);
    panel(24, 119, 196, 8, 4, 'rgba(255,255,255,.15)');
    panel(24, 119, 196 * player.health / 100, 8, 4, player.health < 30 ? '#fa5969' : '#66dfbd');
    ctx.fillStyle = '#c7d4e2';
    ctx.font = '10px system-ui';
    ctx.fillText(`VITALS  ${Math.ceil(player.health)}`, 229, 127);

    const contract = MISSIONS[Math.min(state.mission, 7)];
    panel(vw / 2 - 165, 20, 330, 68, 13, 'rgba(8,15,29,.78)', 'rgba(255,255,255,.12)');
    ctx.textAlign = 'center';
    ctx.fillStyle = '#f4c76d';
    ctx.font = '700 10px system-ui';
    ctx.fillText(state.active ? 'ACTIVE JOB  /  ' + String(state.mission + 1).padStart(2, '0') : 'HARBOR CONTRACTS', vw / 2, 42);
    ctx.fillStyle = '#fff';
    ctx.font = '600 16px system-ui';
    ctx.fillText(state.active ? contract.name : state.mission >= 8 ? 'Harbor legend' : 'Press Enter to start', vw / 2, 65);
    ctx.fillStyle = '#a6b5c8';
    ctx.font = '10px system-ui';
    ctx.fillText(state.active ? world.instruction() : 'Eight runs · one city · your own rules', vw / 2, 79);
    ctx.textAlign = 'left';

    drawMinimap(state);
    ctx.fillStyle = '#a6b5c8';
    ctx.font = '10px system-ui';
    ctx.fillText(`CACHES ${state.collectibles.filter(cache => cache.got).length}/20  ·  STUNTS ${state.jumped.size}/5  ·  STYLE ${Math.floor(state.style)}`, 24, 146);
    if (state.active && !world.escaping()) {
      const [targetX, targetY] = world.objective();
      ctx.save();
      ctx.translate(vw / 2, 103);
      ctx.rotate(Math.atan2(targetY - player.y, targetX - player.x));
      ctx.fillStyle = '#ffd36c';
      ctx.beginPath();
      ctx.moveTo(10, 0);
      ctx.lineTo(-7, -5);
      ctx.lineTo(-4, 0);
      ctx.lineTo(-7, 5);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    ctx.textAlign = 'right';
    ctx.font = '20px system-ui';
    ctx.fillStyle = '#ffd768';
    let stars = '';
    for (let i = 0; i < 5; i++) stars += i < state.wanted ? '★' : '☆';
    ctx.fillText(stars, vw - 29, 190);
    ctx.font = '700 10px system-ui';
    ctx.fillStyle = state.wanted ? '#ff8390' : '#9fb3c4';
    ctx.fillText(state.wanted ? 'PATROL ALERT' : 'CLEAR', vw - 30, 205);
    ctx.textAlign = 'left';

    if (player.car) {
      panel(24, vh - 88, 200, 60, 12, 'rgba(8,15,29,.8)', 'rgba(255,255,255,.13)');
      ctx.fillStyle = '#f4c76d';
      ctx.font = '700 10px system-ui';
      ctx.fillText(carspec[player.car.type][0].toUpperCase(), 40, vh - 65);
      ctx.fillStyle = '#fff';
      ctx.font = '700 24px system-ui';
      ctx.fillText(String(Math.round(Math.abs(player.car.speed) * 1.35)).padStart(3, '0'), 40, vh - 39);
      ctx.fillStyle = '#a6b5c8';
      ctx.font = '10px system-ui';
      ctx.fillText('KM/H', 104, vh - 40);
    }
    if (state.active) {
      panel(vw / 2 - 100, vh - 54, 200, 35, 10, 'rgba(8,15,29,.75)');
      ctx.textAlign = 'center';
      ctx.fillStyle = '#eadab8';
      ctx.font = '11px system-ui';
      ctx.fillText(state.timer > 0 ? `TIME  ${Math.ceil(state.timer)} s`
        : `OBJECTIVE  ·  ${Math.round(Math.hypot(world.objective()[0] - player.x, world.objective()[1] - player.y))} m`, vw / 2, vh - 32);
      ctx.textAlign = 'left';
    }
    if (state.toastTime > 0) {
      panel(vw / 2 - 245, 106, 490, 44, 12, 'rgba(10,18,32,.87)', 'rgba(245,205,119,.36)');
      ctx.textAlign = 'center';
      ctx.fillStyle = '#f7dfb5';
      ctx.font = '600 13px system-ui';
      ctx.fillText(state.toast, vw / 2, 133, 470);
      ctx.textAlign = 'left';
    }
  }

  function drawMinimap(state) {
    const player = state.player, x = vw - 204, y = 22, width = 180, height = 132;
    panel(x - 9, y - 7, width + 18, height + 45, 13, 'rgba(8,15,29,.83)', 'rgba(255,255,255,.13)');
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, 7);
    ctx.clip();
    ctx.fillStyle = '#263c48';
    ctx.fillRect(x, y, width, height);
    for (let column = 0; column < 8; column++) {
      ctx.fillStyle = '#141f2d';
      ctx.fillRect(x + column * width / 8 - 1, y, 3, height);
    }
    for (let row = 0; row < 7; row++) {
      ctx.fillStyle = '#141f2d';
      ctx.fillRect(x, y + row * height / 7 - 1, width, 3);
    }
    ctx.fillStyle = '#15506a';
    ctx.fillRect(x + width * .91, y, width * .09, height);
    for (const building of state.buildings) {
      ctx.fillStyle = building.district === 'DOWNTOWN' ? '#506273' : '#45535c';
      ctx.fillRect(x + building.x / W * width, y + building.y / H * height,
        Math.max(1, building.w / W * width), Math.max(1, building.d / H * height));
    }
    for (const car of [...state.cars, ...state.policeCars]) {
      if (!car.active) continue;
      ctx.fillStyle = car.police ? '#fc4d69' : '#e6b86e';
      ctx.fillRect(x + car.x / W * width - 1.5, y + car.y / H * height - 1.5, 3, 3);
    }
    for (const shop of state.shops) {
      ctx.fillStyle = shop.type === 'HOSPITAL' ? '#77e1bc' : '#e5d4ae';
      ctx.fillRect(x + shop.x / W * width - 2, y + shop.y / H * height - 2, 4, 4);
    }
    if (state.taxiTarget) {
      ctx.fillStyle = '#ffae50';
      ctx.fillRect(x + state.taxiTarget[0] / W * width - 2, y + state.taxiTarget[1] / H * height - 2, 4, 4);
    }
    if (state.active) {
      const [targetX, targetY] = world.objective();
      ctx.strokeStyle = 'rgba(255,211,108,.65)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x + player.x / W * width, y + player.y / H * height);
      const junction = Math.round((player.y - 24) / 180) * 180 + 24;
      ctx.lineTo(x + player.x / W * width, y + junction / H * height);
      ctx.lineTo(x + targetX / W * width, y + junction / H * height);
      ctx.lineTo(x + targetX / W * width, y + targetY / H * height);
      ctx.stroke();
      ctx.fillStyle = '#ffd36c';
      ctx.beginPath();
      ctx.arc(x + targetX / W * width, y + targetY / H * height, 4, 0, 7);
      ctx.fill();
    }
    ctx.fillStyle = '#5bffff';
    ctx.beginPath();
    ctx.arc(x + player.x / W * width, y + player.y / H * height, 4, 0, 7);
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = '#bac9d5';
    ctx.font = '9px system-ui';
    ctx.fillText('HARBOR GRID', x, y + height + 17);
  }

  function drawMenu(state, screen) {
    if (screen === 'game') return;
    ctx.fillStyle = 'rgba(5,10,22,.76)';
    ctx.fillRect(0, 0, vw, vh);
    ctx.textAlign = 'center';
    const text = (message, y, size = 14, color = '#bfccda') => {
      ctx.fillStyle = color;
      ctx.font = `${size >= 30 ? '800' : '500'} ${size}px system-ui`;
      ctx.fillText(message, vw / 2, y, Math.max(200, vw - 48));
    };

    if (screen === 'title') {
      text('WELCOME TO THE COAST', vh * .24, 12, '#f3cc82');
      text('NEON HARBOR', vh * .37, Math.min(86, vw * .09), '#f6f2e9');
      text('NIGHT SHIFT  /  AN OPEN CITY STORY', vh * .42, 15, '#68ebdc');
      text('The city never asks who owns the road.', vh * .52, 15);
      panel(vw / 2 - 125, vh * .62, 250, 50, 16, '#efbd67');
      text(state.hasSave ? 'ENTER · CONTINUE' : 'ENTER · START YOUR STORY', vh * .62 + 31, 14, '#152033');
      text('H controls & city guide  ·  N clear save and start fresh', vh * .76, 12);
      text('8 STORY RUNS  ·  4 DISTRICTS  ·  20 HARBOR CACHES', vh * .88, 11);
    } else if (screen === 'help') {
      text('YOUR CITY GUIDE', vh * .17, 32, '#f3cc82');
      const guide = [
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
      guide.forEach((message, i) => text(message, vh * .27 + i * Math.min(31, vh * .046), 13));
      text('H / ESC / ENTER · RETURN', vh * .89, 12, '#68ebdc');
    } else {
      const heading = screen === 'paused' ? 'HARBOR PAUSED' : screen === 'complete' ? 'RUN COMPLETE' : 'SIGNAL LOST';
      const message = screen === 'paused' ? 'Take a breath'
        : screen === 'complete' ? (state.mission === 8 ? 'You own the night.' : 'Good work, driver.')
        : 'The night goes on.';
      const action = screen === 'failed' ? 'RETRY'
        : screen === 'complete' && state.mission < 8 ? 'NEXT CONTRACT' : 'RESUME';
      text(heading, vh * .32, 12, '#f2c878');
      text(message, vh * .44, Math.min(44, vw * .055), '#f7f3ec');
      text(screen === 'paused' ? 'Progress saved locally. H opens controls.' : state.result || '', vh * .52, 15);
      text(state.mission === 8 ? 'All eight contracts complete · the city is still yours.' : '', vh * .59, 14, '#68ebdc');
      text('ENTER · ' + action + '    /    ESC · FREE ROAM', vh * .68, 13, '#f3cc82');
    }
    ctx.textAlign = 'left';
  }

  function draw(state, now, screen = 'game', shot) {
    drawCity(state, now, shot);
    drawHud(state);
    drawMenu(state, screen);
  }

  return {draw, resize};
}
