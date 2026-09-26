(() => {
  "use strict";

  window.FilipeApp?.register({
    init(app) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      const toggle = document.querySelector("#audio-toggle");
      const volume = document.querySelector("#volume-slider");
      const music = document.querySelector("#site-song");
      const label = toggle?.querySelector(".audio-label");
      const icon = toggle?.querySelector(".audio-icon");
      let context = null;
      let master = null;
      let drone = null;
      let droneGain = null;

      const savedVolume = Number(app.safeStorage.get("filipe-volume", "0.35"));
      const savedEnabled = app.safeStorage.get("filipe-audio", "false") === "true";
      const initialVolume = Number.isFinite(savedVolume) ? savedVolume : 0.35;
      if (volume) volume.value = String(initialVolume);
      if (music) music.volume = initialVolume;
      app.state.audioEnabled = savedEnabled;

      const updateControl = () => {
        const enabled = app.state.audioEnabled;
        toggle?.setAttribute("aria-pressed", String(enabled));
        toggle?.setAttribute("aria-label", enabled ? "Desativar som" : "Ativar som");
        if (label) label.textContent = enabled ? "som ligado" : "som desligado";
        if (icon) icon.textContent = enabled ? "◉" : "◌";
      };

      const ensureContext = () => {
        if (!AudioContextClass) return false;
        if (!context) {
          context = new AudioContextClass();
          master = context.createGain();
          master.gain.value = Number(volume?.value || 0.35);
          master.connect(context.destination);
        }
        if (context.state === "suspended") context.resume();
        return true;
      };

      const start = () => {
        if (music) {
          music.volume = Number(volume?.value || 0.35);
          music.play().catch(() => app.showNotice("O navegador bloqueou o áudio. Clique no botão de som para tentar novamente."));
        }
        if (!ensureContext() || drone) return;
        drone = context.createOscillator();
        droneGain = context.createGain();
        drone.type = "sine";
        drone.frequency.value = 58;
        droneGain.gain.value = 0.012;
        drone.connect(droneGain);
        droneGain.connect(master);
        drone.start();
      };

      const stop = () => {
        if (music) music.pause();
        if (!drone || !context) return;
        const current = drone;
        const currentGain = droneGain;
        currentGain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.25);
        current.stop(context.currentTime + 0.3);
        drone = null;
        droneGain = null;
      };

      const cue = (name) => {
        if (!app.state.audioEnabled || !ensureContext()) return;
        const frequencies = { candle: 240, bell: 420, stone: 90, flower: 320, glitch: 110, resurrection: 620 };
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = name === "glitch" ? "square" : "sine";
        oscillator.frequency.setValueAtTime(frequencies[name] || 260, context.currentTime);
        if (name === "resurrection") oscillator.frequency.exponentialRampToValueAtTime(880, context.currentTime + 0.5);
        gain.gain.setValueAtTime(0.0001, context.currentTime);
        gain.gain.exponentialRampToValueAtTime(name === "glitch" ? 0.045 : 0.09, context.currentTime + 0.025);
        gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + (name === "resurrection" ? 0.8 : 0.25));
        oscillator.connect(gain);
        gain.connect(master);
        oscillator.start();
        oscillator.stop(context.currentTime + (name === "resurrection" ? 0.85 : 0.3));
      };

      const setEnabled = (enabled) => {
        app.state.audioEnabled = enabled;
        app.safeStorage.set("filipe-audio", String(enabled));
        if (enabled) start();
        else stop();
        updateControl();
      };

      app.setAudioEnabled = setEnabled;
      window.FilipeAudio = {
        start,
        stop,
        cue,
        intensity(value) {
          if (droneGain && context) droneGain.gain.setTargetAtTime(0.012 + value * 0.025, context.currentTime, 0.08);
        }
      };

      toggle?.addEventListener("click", () => setEnabled(!app.state.audioEnabled));
      volume?.addEventListener("input", () => {
        const value = Number(volume.value);
        app.safeStorage.set("filipe-volume", String(value));
        if (music) music.volume = value;
        if (master) master.gain.value = value;
      });
      app.onEntry(() => { if (app.state.audioEnabled) start(); });
      updateControl();
    }
  });
})();
