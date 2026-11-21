// Simulation state is shared with the renderer and the local-save controller.
export const W = 1600;
export const H = 1240;

export const MISSIONS = [
  {
    name: 'First Wheels',
    brief: 'A borrowed set of keys and one clean exit. Take the sedan to the marina overlook.',
    target: [810, 384], reward: 450
  },
  {
    name: 'Courier Run', brief: 'Three parcels. Three stops. Keep the engine warm.',
    stops: [[1005, 384], [1200, 744], [615, 924]], time: 94, reward: 900
  },
  {
    name: 'Getaway Driver', brief: 'Nia is waiting in Old Town. Pick her up, then shake the tail.',
    target: [420, 924], wanted: 1, reward: 1100
  },
  {
    name: 'Dockside Deal', brief: 'The package is under the crane. Keep the patrols guessing.',
    target: [1340, 744], reward: 1400
  },
  {
    name: 'Night Chase', brief: 'Blue lights across the whole city. Lose three stars and call it even.',
    target: [225, 384], wanted: 3, reward: 2100
  },
  {
    name: 'The Exchange', brief: 'A fragile case and a very short window. No hard hits.',
    target: [1005, 744], time: 85, reward: 2600
  },
  {
    name: 'Harbor Heist', brief: 'Take the red Vesper from the guarded lot, then bring it to the pier.',
    target: [1395, 564], reward: 3200
  },
  {
    name: 'King of the Harbor', brief: 'One last run. Break contact, make the drop, vanish into the lights.',
    target: [615, 384], wanted: 4, reward: 5000
  }
];

export const carspec = [
  ['Morrow Sedan', 3.1, .045, '#e6e6df'],
  ['Sunline Taxi', 2.8, .037, '#f4c846'],
  ['Brackett Pickup', 2.55, .032, '#93a08a'],
  ['Vesper GT', 4.5, .061, '#ff385b'],
  ['Kestrel Moto', 4.8, .067, '#65e8ee']
];

function cityRandom(seed) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

export function createWorld() {
  const random = cityRandom(84921);
  const cars = [], peds = [], buildings = [], collectibles = [], ramps = [];

  // Keep parcel generation deterministic so the city and save indices stay stable.
  for (let row = 0; row < 6; row++) {
    for (let column = 0; column < 7; column++) {
      const originX = 45 + column * 195, originY = 45 + row * 180;
      const district = column >= 5 && row >= 2 ? 'DOCKS'
        : row >= 4 ? 'OLD TOWN' : column >= 5 ? 'BEACHFRONT' : 'DOWNTOWN';
      for (let parcel = 0; parcel < 4; parcel++) {
        const width = 48 + random() * 37, depth = 42 + random() * 40;
        const x = originX + 14 + (parcel % 2) * 70 + random() * 5;
        const y = originY + 10 + Math.floor(parcel / 2) * 68 + random() * 5;
        const height = district === 'DOWNTOWN' ? 75 + random() * 190
          : district === 'DOCKS' ? 22 + random() * 35
          : district === 'OLD TOWN' ? 26 + random() * 42 : 38 + random() * 65;
        const colors = district === 'DOWNTOWN' ? ['#172943', '#20354c', '#26364c', '#302d48']
          : district === 'DOCKS' ? ['#5a5145', '#74634d', '#4b5960']
          : district === 'OLD TOWN' ? ['#775b53', '#806c5a', '#515761']
          : ['#31505b', '#485b60', '#465260'];
        buildings.push({
          x, y,
          w: Math.min(width, 200 + column * 195 - x),
          d: Math.min(depth, 179 + row * 180 - y),
          h: height, color: colors[Math.floor(random() * colors.length)],
          lit: random(), district, sign: district === 'DOWNTOWN' && random() > .55
        });
      }
    }
  }

  const roadX = Array.from({length: 8}, (_, i) => 30 + i * 195);
  const roadY = Array.from({length: 7}, (_, i) => 24 + i * 180);
  const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const limit = (value, low, high) => Math.min(high, Math.max(low, value));
  const angleDelta = angle => Math.atan2(Math.sin(angle), Math.cos(angle));
  const onPier = (x, y) => x > 1430 && x < 1570 && Math.abs(y - 924) < 20;
  function blocked(x, y, radius = 5) {
    return x < 12 || y < 10 || y > H - 15 || (x > 1464 && !onPier(x, y)) ||
      buildings.some(b => x + radius > b.x && x - radius < b.x + b.w &&
        y + radius > b.y && y - radius < b.y + b.d);
  }
  function addCar(x, y, a, type, extra = {}) {
    const car = {x, y, a, type, home: {x, y, a}, speed: 0, active: true, ...extra};
    cars.push(car);
    return car;
  }

  const starter = addCar(615, 550, 0, 0, {owned: true});
  const heistCar = addCar(1395, 564, Math.PI, 3, {guarded: true});
  for (const parked of [[670,564,1.57,1], [725,564,1.57,2], [770,564,1.57,3], [820,564,1.57,4], [1355,744,1.57,1]]) {
    addCar(...parked);
  }
  for (let i = 0; i < 18; i++) {
    const row = 1 + i % 5, direction = i % 2 ? 1 : -1;
    addCar(60 + i * 76, roadY[row] + direction * 6, direction * 1.57, i % 5,
      {traffic: true, dir: direction});
  }
  for (let i = 0; i < 40; i++) {
    peds.push({
      x: 55 + random() * 1325, y: roadY[1 + i % 6] + (i % 2 ? 17 : -17),
      a: 0, dir: i % 4 < 2 ? 1 : -1, speed: 10 + random() * 9, panic: 0,
      color: ['#f0ae79', '#9bc4ce', '#d9a4bf', '#a3bd91'][i % 4]
    });
  }
  for (let i = 0; i < 20; i++) {
    collectibles.push({
      x: roadX[(i * 3 + 2) % 8] + (i % 2 ? 18 : -17),
      y: roadY[1 + Math.floor(i / 7) * 2] + 40 + (i % 7) * 12,
      got: false, phase: random() * 6
    });
  }
  for (let i = 0; i < 5; i++) {
    ramps.push({x: 240 + i * 240, y: roadY[i + 1] + 6, a: Math.PI / 2});
  }

  const fares = [[870,564,225,924], [1290,744,1005,204], [420,924,1375,384]];
  const player = {x: 615, y: 528, a: 0, health: 100, cash: 1250, car: null, z: 0, vz: 0};
  const state = {
    player, cars, peds, buildings, collectibles, ramps,
    shops: [
      {x: 420, y: 384, type: 'DEALERSHIP'},
      {x: 615, y: 1104, type: 'GARAGE'},
      {x: 1200, y: 204, type: 'HOSPITAL'}
    ],
    jumped: new Set(), time: 0, wanted: 0, heat: 0, mission: 0, stage: 0,
    active: false, complete: false, failed: false, timer: 0, damageCooldown: 0,
    style: 0, owned: ['Morrow Sedan'], upgrades: {engine: 0, brakes: 0, armor: 0},
    hasSave: false, mute: false, night: false, toast: '', toastTime: 0,
    policeCars: [
      {x:225, y:204, a:Math.PI/2, type:0, speed:35, active:true, police:true},
      {x:1200, y:744, a:-Math.PI/2, type:0, speed:35, active:true, police:true}
    ],
    roadblocks: [], taxiTarget: null, fare: 0, passenger: false, orbit: 0, events: []
  };

  function selectFare() {
    const [pickupX, pickupY, dropX, dropY] = fares[state.fare % fares.length];
    state.taxiTarget = state.passenger ? [dropX, dropY] : [pickupX, pickupY];
  }
  selectFare();

  function say(message, seconds = 3) {
    state.toast = message;
    state.toastTime = seconds;
  }

  function objective() {
    const contract = MISSIONS[state.mission];
    if (!contract) return [615, 564];
    if (state.mission === 3 && state.stage === 1) return [1360, 924];
    if (state.mission === 6 && state.stage === 1) return [1535, 924];
    if (state.mission === 7 && state.stage === 1) return [1200, 924];
    return contract.stops?.[state.stage] ?? contract.target;
  }

  function escaping() {
    return state.active && (
      (state.mission === 2 && state.stage === 1) ||
      (state.mission === 4 && state.stage === 1) ||
      (state.mission === 7 && state.stage === 2)
    );
  }

  function instruction() {
    if (escaping()) return 'BREAK CONTACT · KEEP MOVING';
    if (state.mission === 1) return 'DELIVERY ' + (state.stage + 1) + ' / 3';
    const stages = [
      ['DRIVE TO THE OVERLOOK'],
      [''],
      ['PICK UP NIA', 'LOSE THE TAIL'],
      ['COLLECT THE CRANE PACKAGE', 'REACH THE SAFE DROP'],
      ['REACH THE WEST GATE'],
      ['DELIVER THE CASE · AVOID IMPACTS'],
      ['ENTER THE MARKED VESPER GT', 'DELIVER THE VESPER TO THE PIER'],
      ['BREAK THROUGH THE CHECKPOINT', 'MAKE THE HARBOR DROP', 'VANISH FROM PATROL']
    ];
    return stages[state.mission]?.[state.stage] ?? 'ALL CONTRACTS COMPLETE';
  }

  function clearHeat() {
    state.wanted = 0;
    state.heat = 0;
    state.policeCars.length = 0;
    state.roadblocks.length = 0;
  }

  function resetVehicle() {
    const car = player.car;
    const x = roadX.reduce((a, b) => Math.abs(a - player.x) < Math.abs(b - player.x) ? a : b);
    const y = roadY.reduce((a, b) => Math.abs(a - player.y) < Math.abs(b - player.y) ? a : b);
    Object.assign(player, {x, y, z: 0, vz: 0, a: 0});
    if (car) Object.assign(car, {x, y, a: 0, speed: 0, z: 0, travelAngle: 0, stunt: null});
    say(car ? 'Vehicle recovered to the nearest junction' : 'Returned to the nearest junction');
  }

  function start() {
    state.complete = state.failed = false;
    const contract = MISSIONS[state.mission];
    if (!contract) return;
    if (state.mission === 0 && !player.car && distance(player, starter) > 100) {
      player.x = starter.x;
      player.y = starter.y - 24;
    }
    if (state.mission === 6 && state.stage === 1) {
      if (player.car === heistCar) player.car = null;
      Object.assign(heistCar, heistCar.home, {speed: 0, guarded: true});
    }
    state.stage = 0;
    state.active = true;
    state.timer = contract.time ?? 0;
    if (state.mission === 4 || state.mission === 7) crime(contract.wanted);
    if (state.mission === 4) state.time = 400;
    if (state.mission === 5 && !player.car) say('Get a vehicle before the timer runs out');
    say(contract.brief, 6);
  }

  function finish(success, reason = '') {
    state.active = false;
    state.complete = success;
    state.failed = !success;
    if (success) {
      if (state.mission === 6) heistCar.guarded = false;
      const contract = MISSIONS[state.mission++];
      player.cash += contract.reward;
      state.result = contract.name + '  /  +$' + contract.reward.toLocaleString();
      state.events.push('pickup');
    } else {
      state.result = reason;
      clearHeat();
      if (player.health <= 0) {
        player.car = null;
        Object.assign(player, {x: 1200, y: 204, health: 100, z: 0, vz: 0});
      }
    }
  }

  function crime(minimum = 1, escalate = false) {
    const increase = escalate && state.heat < 5.5 ? 1 : 0;
    state.wanted = Math.min(5, Math.max(minimum, state.wanted + increase));
    state.heat = 8;
  }

  function advanceContract() {
    if (!state.active) return;
    const [goalX, goalY] = objective();
    if (escaping()) {
      if (!state.wanted) finish(true);
      return;
    }
    if (Math.hypot(player.x - goalX, player.y - goalY) > 36) return;
    const mission = state.mission;
    if (mission === 0 && player.car) finish(true);
    if (mission === 1 && player.car && Math.abs(player.car.speed) < 54) {
      if (state.stage === 2) finish(true);
      else {
        state.stage++;
        say('Parcel delivered · next stop marked');
      }
    }
    if (mission === 2 && player.car && Math.abs(player.car.speed) < 42) {
      state.stage = 1;
      crime(1);
      say('Nia is aboard · get out of sight');
    }
    if (mission === 3) {
      if (!state.stage && !player.car) {
        state.stage = 1;
        crime(1);
        say('Package secured · patrol inbound');
      } else if (state.stage && player.car) finish(true);
    }
    if (mission === 4 && player.car) {
      state.stage = 1;
      crime(3);
      say('West gate cleared · break contact');
    }
    if (mission === 5 && player.car) finish(true);
    if (mission === 6) {
      if (!state.stage && player.car === heistCar) {
        state.stage = 1;
        say('Vesper secured · take it to the pier');
      } else if (state.stage && player.car === heistCar) finish(true);
    }
    if (mission === 7 && player.car) {
      if (!state.stage) {
        state.stage = 1;
        say('Checkpoint cleared · make the drop');
      } else {
        state.stage = 2;
        crime(4);
        say('Drop confirmed · lose the patrol');
      }
    }
  }

  function useCar() {
    if (player.car) {
      if (Math.abs(player.car.speed) > 35 || player.car.z > 0) {
        return say('Slow down before getting out');
      }
      const car = player.car;
      player.car = null;
      car.speed = 0;
      for (const side of [1, -1]) {
        const x = car.x + Math.cos(car.a) * 18 * side;
        const y = car.y + Math.sin(car.a) * 18 * side;
        if (!blocked(x, y)) {
          player.x = x;
          player.y = y;
          break;
        }
      }
      if (state.passenger) {
        state.passenger = false;
        selectFare();
        say('The fare has left the cab');
      } else say('On foot');
      return;
    }

    // Services take priority over a nearby parked car when walking.
    for (const shop of state.shops) {
      if (distance(player, shop) > 34) continue;
      if (shop.type === 'HOSPITAL') {
        player.health = 100;
        say('Harbor clinic · fully restored');
        return;
      }
      if (shop.type === 'GARAGE') {
        const upgrade = ['engine', 'brakes', 'armor'].find(key => state.upgrades[key] < 3);
        if (!upgrade) return say('All upgrades installed');
        if (player.cash < 450) return say('Garage · each upgrade costs $450');
        player.cash -= 450;
        state.upgrades[upgrade]++;
        say(upgrade.toUpperCase() + ' tuned · level ' + state.upgrades[upgrade]);
        return;
      }
      const prices = [0, 650, 1800, 4400, 3000];
      const model = prices.findIndex((_, i) => !state.owned.includes(carspec[i][0]));
      if (model < 0) return say('All models owned');
      if (player.cash < prices[model]) {
        return say(carspec[model][0] + ' costs $' + prices[model].toLocaleString());
      }
      player.cash -= prices[model];
      state.owned.push(carspec[model][0]);
      addCar(420 + 22 * model, 389, Math.PI / 2, model, {owned: true});
      say('Purchased ' + carspec[model][0] + ' · parked outside');
      return;
    }

    let candidate = null, nearest = 44;
    for (const car of cars) {
      const separation = distance(car, player);
      if (car.active && separation < nearest) {
        candidate = car;
        nearest = separation;
      }
    }
    if (!candidate) return say('Move closer to a vehicle or service stop');
    if (candidate.guarded && !(state.active && state.mission === 6 && state.stage === 0)) {
      return say('This car is under guard');
    }
    player.car = candidate;
    candidate.speed = 0;
    candidate.traffic = false;
    candidate.travelAngle = candidate.a;
    player.x = candidate.x;
    player.y = candidate.y;
    player.z = player.vz = 0;
    if (!candidate.owned) crime(candidate.guarded ? 3 : 1, true);
    say('Entered ' + carspec[candidate.type][0] + (candidate.owned ? '' : ' · patrol alerted'));
  }

  function impact(speed, illegal = false) {
    if (speed < 18 || state.damageCooldown > 0) return;
    player.health = Math.max(0, player.health - speed * .16 / (1 + state.upgrades.armor * .35));
    state.damageCooldown = .65;
    state.events.push('crash');
    if (illegal) crime(1, true);
    if (speed > 65 && state.active && state.mission === 5) {
      finish(false, 'The case broke on impact.');
    }
  }

  function movePlayer(dt, keys) {
    const car = player.car;
    if (!car) {
      const dx = +keys.right - +keys.left, dy = +keys.down - +keys.up;
      const length = Math.hypot(dx, dy) || 1;
      const step = (keys.sprint ? 112 : 75) * dt / length;
      if (dx || dy) player.a = Math.atan2(dx, -dy);
      if (keys.hand && !player.z) {
        player.z = 1;
        player.vz = 100;
      }
      if (player.z) {
        player.z = Math.max(0, player.z + player.vz * dt);
        player.vz -= 290 * dt;
      }
      if (!blocked(player.x + dx * step, player.y)) player.x += dx * step;
      if (!blocked(player.x, player.y + dy * step)) player.y += dy * step;
      return;
    }

    const model = carspec[car.type], engine = 1 + state.upgrades.engine * .12;
    if (keys.up) car.speed += 110 * dt * engine;
    if (keys.down) car.speed -= (car.speed > 0 ? 180 + state.upgrades.brakes * 32 : 80) * dt;
    if (!keys.up && !keys.down) car.speed *= Math.exp(-.95 * dt);
    if (keys.hand) car.speed *= Math.exp(-1.8 * dt);
    car.speed = limit(car.speed, -46, model[1] * 43 * engine);
    car.a += ((keys.right ? 1 : 0) - (keys.left ? 1 : 0)) * model[2] * 60 * dt *
      Math.min(1, Math.abs(car.speed) / 30) * (keys.hand ? 1.5 : 1) * Math.sign(car.speed);
    car.travelAngle += angleDelta(car.a - car.travelAngle) * Math.min(1, dt * (keys.hand ? 3 : 13));
    if (keys.hand && Math.abs(car.speed) > 65) state.style += dt * 15;

    const nx = car.x + Math.sin(car.travelAngle) * car.speed * dt;
    const ny = car.y - Math.cos(car.travelAngle) * car.speed * dt;
    const hitCar = !car.z && cars.some(other => other !== car && other.active &&
      Math.hypot(other.x - nx, other.y - ny) < 17 &&
      Math.hypot(other.x - car.x, other.y - car.y) > Math.hypot(other.x - nx, other.y - ny));
    if (blocked(nx, ny, 9) || hitCar || state.roadblocks.some(r => Math.hypot(nx - r.x, ny - r.y) < 14)) {
      impact(Math.abs(car.speed), hitCar);
      car.speed *= -.22;
    } else {
      car.x = nx;
      car.y = ny;
    }

    if (!car.z && car.speed > 82) {
      const ramp = ramps.findIndex(r => distance(r, car) < 17 && Math.abs(angleDelta(car.a - r.a)) < .72);
      if (ramp >= 0) {
        car.stunt = ramp;
        car.vz = 115;
        car.z = 1;
        car.takeoff = car.speed;
      }
    }
    if (car.z) {
      car.z += car.vz * dt;
      car.vz -= 245 * dt;
      if (car.z <= 0) {
        car.z = 0;
        if (car.speed > 32 && !state.jumped.has(car.stunt)) {
          state.jumped.add(car.stunt);
          state.style += 250;
          player.cash += 300;
          state.events.push('pickup');
          say('STUNT LANDED · +$300 / +250 STYLE');
        } else if (car.speed < 32) impact(car.takeoff * .66);
      }
    }
    player.x = car.x;
    player.y = car.y;
    player.a = car.a;
  }

  // Sample the segment between two actors against each parcel footprint.
  function behindBuildings(from, to, margin = 0) {
    return buildings.some(building => {
      for (let part = .1; part < 1; part += .1) {
        const x = from.x + (to.x - from.x) * part;
        const y = from.y + (to.y - from.y) * part;
        if (x > building.x - margin && x < building.x + building.w + margin &&
            y > building.y - margin && y < building.y + building.d + margin) return true;
      }
      return false;
    });
  }

  function patrol(dt) {
    if (!state.wanted) {
      for (const car of state.policeCars) {
        car.x += Math.sin(car.a) * 30 * dt;
        if (car.x > 1420) { car.x = 1420; car.a = -Math.PI / 2; }
        if (car.x < 30) { car.x = 30; car.a = Math.PI / 2; }
      }
      return;
    }

    while (state.policeCars.length < state.wanted) {
      const x = roadX.reduce((a, b) => Math.abs(a - player.x) < Math.abs(b - player.x) ? a : b);
      const y = limit(player.y + (player.y > 620 ? -180 : 180), 50, 1150);
      state.policeCars.push({x, y, a: 0, type: 0, speed: 66, active: true, police: true});
    }
    state.policeCars.length = state.wanted;
    if (state.wanted === 5 && !state.roadblocks.length) {
      const y = roadY.reduce((a, b) => Math.abs(a - player.y) < Math.abs(b - player.y) ? a : b);
      const x = limit(player.x + (player.a > 0 ? 125 : -125), 60, 1360);
      state.roadblocks = [{x, y: y - 9}, {x, y: y + 9}];
    }

    let nearest = Infinity;
    for (const car of state.policeCars) {
      const separation = distance(car, player);
      let targetX = player.x, targetY = player.y;
      if (behindBuildings(car, player, 9)) {
        const junctionX = roadX.reduce((a, b) => Math.abs(a - car.x) < Math.abs(b - car.x) ? a : b);
        const junctionY = roadY.reduce((a, b) => Math.abs(a - car.y) < Math.abs(b - car.y) ? a : b);
        if (Math.abs(car.x - junctionX) > 12) {
          targetX = car.x;
          targetY = junctionY;
          if (Math.abs(car.y - junctionY) < 10) { targetX = player.x; targetY = junctionY; }
        } else {
          targetX = junctionX;
          targetY = player.y;
          if (Math.abs(car.y - junctionY) < 12 && Math.abs(player.x - junctionX) > 100) {
            targetX = player.x;
            targetY = junctionY;
          }
        }
      }
      const heading = Math.atan2(targetX - car.x, car.y - targetY);
      car.a += limit(angleDelta(heading - car.a), -dt * 2.3, dt * 2.3);
      car.speed = Math.min(car.speed + 45 * dt, (player.car ? 88 : 66) + state.wanted * 4);
      const nx = limit(car.x + Math.sin(car.a) * car.speed * dt, 15, 1450);
      const ny = limit(car.y - Math.cos(car.a) * car.speed * dt, 15, H - 20);
      if (!blocked(nx, ny, 7)) {
        car.x = nx;
        car.y = ny;
      } else {
        if (!blocked(nx, car.y, 7)) car.x = nx;
        if (!blocked(car.x, ny, 7)) car.y = ny;
        car.a += dt * 2;
        car.speed *= .96;
      }
      nearest = Math.min(nearest, separation);
      if (separation < 25 && !player.car?.z && state.damageCooldown === 0) {
        impact(45 + state.wanted * 4);
        if (player.car) player.car.speed *= .72;
      }
    }

    const hidden = state.policeCars.every(car => behindBuildings(car, player));
    if (nearest > 85 || hidden) state.heat -= dt * (nearest > 170 ? 2.3 : 1);
    else state.heat = Math.max(state.heat, .8);
    if (state.heat <= 0) {
      state.wanted--;
      state.heat = 2.5;
      if (!state.wanted) { clearHeat(); say('Patrol lost · all clear'); }
      else state.roadblocks.length = 0;
    }
  }

  function lightGreen(x, row) {
    return (Math.floor(state.time / 5) + Math.round(x / 195) + row) % 2 === 0;
  }

  function moveTraffic(dt) {
    for (const car of cars) {
      if (!car.traffic || car === player.car) continue;
      const junction = roadX.find(x => car.dir > 0
        ? x > car.x && x - car.x < 24 : x < car.x && car.x - x < 24);
      const stop = junction !== undefined && !lightGreen(junction, Math.round(car.y / 180));
      car.speed = limit(car.speed + (stop ? -180 : 45) * dt, 0, 51);
      car.x += car.dir * car.speed * dt;
      if (car.x > 1440) car.x = 35;
      if (car.x < 24) car.x = 1425;
    }
    for (const ped of peds) {
      const danger = player.car && Math.abs(player.car.speed) > 28 && distance(player, ped) < 45;
      if (danger && distance(player, ped) < 15 && !player.car.z && state.damageCooldown === 0) {
        crime(2, true);
        impact(25);
      }
      if (danger) ped.panic = 1.8;
      else ped.panic = Math.max(0, ped.panic - dt);
      ped.x += (ped.panic ? Math.sign(ped.x - player.x) * 2 : ped.dir) * ped.speed * dt;
      if (ped.x < 45 || ped.x > 1430) {
        ped.dir *= -1;
        ped.x = limit(ped.x, 45, 1430);
      }
    }
  }

  function checkActivities() {
    if (player.car && Math.abs(player.car.speed) > 118 && state.wanted === 0 &&
        (distance(player, {x:1200, y:744}) < 93 || distance(player, {x:225, y:204}) < 93)) {
      crime(1);
      say('Speed trap · patrol alerted');
    }
    if (player.car?.type === 1 &&
        distance(player, {x:state.taxiTarget[0], y:state.taxiTarget[1]}) < 32 &&
        Math.abs(player.car.speed) < 32) {
      if (state.passenger) {
        player.cash += 400;
        state.fare++;
        say('Fare delivered · +$400');
        state.events.push('pickup');
      } else say('Passenger aboard · follow the amber fare marker');
      state.passenger = !state.passenger;
      selectFare();
    }
    for (const cache of collectibles) {
      if (cache.got || distance(player, cache) >= 19) continue;
      cache.got = true;
      player.cash += 250;
      state.events.push('pickup');
      say('HARBOR CACHE · +$250');
    }
  }

  function update(dt, keys) {
    state.time += dt;
    const hour = (19 + state.time / 20) % 24;
    state.night = hour >= 19 || hour < 6;
    state.toastTime = Math.max(0, state.toastTime - dt);
    state.damageCooldown = Math.max(0, state.damageCooldown - dt);
    movePlayer(dt, keys);
    if (state.active && MISSIONS[state.mission].time) {
      state.timer -= dt;
      if (state.timer <= 0) finish(false, 'The delivery window closed.');
    }
    moveTraffic(dt);
    checkActivities();
    patrol(dt);
    if (player.health <= 0) finish(false, 'You woke up at Harbor Clinic.');
    else {
      advanceContract();
      if (!state.wanted && state.damageCooldown === 0) {
        player.health = Math.min(100, player.health + dt * 1.3);
      }
    }
  }

  // The controller restores saved model names before calling this hook.
  function restoreOwned() {
    state.owned.forEach(name => {
      const model = carspec.findIndex(spec => spec[0] === name);
      if (model > 0) addCar(420 + 22 * model, 389, Math.PI / 2, model, {owned: true});
    });
  }

  return {state, restoreOwned, update, start, useCar, crime, objective, instruction, escaping, say, resetVehicle, lightGreen};
}
