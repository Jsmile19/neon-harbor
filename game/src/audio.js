// Entire soundtrack is synthesized locally after a user gesture.
export function createAudio() {
  let context, engine, engineGain, siren, sirenGain, bass, bassGain;
  let muted = false, beat = -1;
  function start() {
    if (context) { if (context.state === 'suspended') context.resume().catch(() => {}); return; }
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!Audio) return;
    context = new Audio();
    function voice(type, frequency) {
      const osc = context.createOscillator(), gain = context.createGain();
      osc.type = type; osc.frequency.value = frequency; gain.gain.value = 0;
      osc.connect(gain).connect(context.destination); osc.start();
      return [osc,gain];
    }
    [engine,engineGain] = voice('sawtooth',44);
    [siren,sirenGain] = voice('triangle',520);
    [bass,bassGain] = voice('triangle',55);
  }
  function tone(freq=440, duration=.12, wave='sine') {
    if (!context || muted) return;
    const osc=context.createOscillator(), gain=context.createGain(), now=context.currentTime;
    osc.type=wave; osc.frequency.setValueAtTime(freq,now);
    gain.gain.setValueAtTime(.045,now); gain.gain.exponentialRampToValueAtTime(.001,now+duration);
    osc.connect(gain).connect(context.destination); osc.start(now); osc.stop(now+duration);
    osc.onended=()=>{osc.disconnect();gain.disconnect();};
  }
  return {
    start,tone,
    setMuted(value) { muted=Boolean(value); },
    toggle() { muted=!muted; return muted; },
    get muted() { return muted; },
    update(state, playing=true) {
      if (!context) return;
      const now=context.currentTime, speed=Math.abs(state.player.car?.speed||0), audible=!muted&&playing;
      engine.frequency.setTargetAtTime(44+speed*.72,now,.08);
      engineGain.gain.setTargetAtTime(audible&&state.player.car ? .014+speed*.00016 : 0,now,.12);
      siren.frequency.setTargetAtTime(520+Math.sin(now*9)*200,now,.04);
      sirenGain.gain.setTargetAtTime(audible&&state.wanted ? .016 : 0,now,.2);
      const step=Math.floor(now/.3);
      if (step!==beat) {
        beat=step;
        bass.frequency.setTargetAtTime([55,55,82.41,65.41,55,73.42,65.41,49][step%8],now,.025);
      }
      bassGain.gain.setTargetAtTime(audible ? .012*(.6+.4*Math.exp(-(now%.3)*12)) : 0,now,.025);
      for (const event of state.events.splice(0)) {
        if (!audible) continue;
        if (event==='crash') tone(54,.22,'triangle');
        else { tone(659,.12); tone(988,.23); }
      }
    }
  };
}
