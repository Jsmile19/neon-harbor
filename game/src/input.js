// One keyboard snapshot per frame; releases and focus changes cannot leave controls stuck.
export function createInput() {
  const down = new Set();
  let dragging = false, lastX = 0, delta = 0;
  window.addEventListener('keydown', e => {
    down.add(e.code);
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space','Enter'].includes(e.code)) e.preventDefault();
  });
  window.addEventListener('keyup', e => down.delete(e.code));
  window.addEventListener('blur', () => { down.clear(); dragging = false; });
  window.addEventListener('pointerdown', e => { dragging = true; lastX = e.clientX; });
  window.addEventListener('pointerup', () => dragging = false);
  window.addEventListener('pointercancel', () => dragging = false);
  window.addEventListener('pointermove', e => {
    if (dragging) { delta += (e.clientX-lastX)*.004; lastX = e.clientX; }
  });
  const has = (...codes) => codes.some(code => down.has(code));
  return { read() {
    const orbit = delta; delta = 0;
    return {
      up: has('KeyW','ArrowUp'), down: has('KeyS','ArrowDown'),
      left: has('KeyA','ArrowLeft'), right: has('KeyD','ArrowRight'),
      sprint: has('ShiftLeft','ShiftRight'), hand: has('Space'),
      interact: has('KeyE'), confirm: has('Enter'), pause: has('Escape'),
      mute: has('KeyM'), reset: has('KeyR'), help: has('KeyH'), fresh: has('KeyN'), orbit
    };
  }};
}
