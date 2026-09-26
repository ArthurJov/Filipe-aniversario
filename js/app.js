(() => {
  "use strict";

  const state = {
    introCompleted: false,
    audioEnabled: false,
    candlesExtinguished: 0,
    flowersPlaced: 0,
    resurrectionProgress: 0,
    resurrectionCompleted: false,
    easterEggsFound: [],
    hidden27Found: [],
    performanceMode: "high"
  };

  const modules = [];
  const afterEntry = [];
  const resetCallbacks = [];
  let noticeTimer;

  const safeStorage = {
    get(key, fallback = null) {
      try {
        return window.localStorage.getItem(key) ?? fallback;
      } catch {
        return fallback;
      }
    },
    set(key, value) {
      try {
        window.localStorage.setItem(key, value);
      } catch {
        // A private browsing context can deny localStorage access.
      }
    }
  };

  const app = {
    state,
    safeStorage,
    register(module) {
      modules.push(module);
    },
    onEntry(callback) {
      afterEntry.push(callback);
    },
    onReset(callback) {
      resetCallbacks.push(callback);
    },
    showNotice(message) {
      const notice = document.querySelector("#notice");
      if (!notice) return;
      window.clearTimeout(noticeTimer);
      notice.textContent = message;
      notice.setAttribute("aria-hidden", "false");
      notice.classList.add("is-visible");
      noticeTimer = window.setTimeout(() => {
        notice.classList.remove("is-visible");
        notice.setAttribute("aria-hidden", "true");
      }, 3200);
    },
    enterExperience() {
      if (state.introCompleted) return;

      const intro = document.querySelector("#intro-screen");
      const enterButton = document.querySelector("#enter-button");
      if (!intro || !enterButton) return;

      state.introCompleted = true;
      enterButton.disabled = true;
      if (state.audioEnabled) window.FilipeAudio?.start?.();
      document.body.classList.remove("is-locked");
      document.body.classList.add("is-entered");
      intro.classList.add("is-leaving");
      intro.setAttribute("aria-hidden", "true");

      window.setTimeout(() => {
        intro.hidden = true;
        afterEntry.forEach((callback) => callback());
      }, 1250);
    },
    resetTemporaryState() {
      state.introCompleted = false;
      state.candlesExtinguished = 0;
      state.flowersPlaced = 0;
      state.resurrectionProgress = 0;
      state.resurrectionCompleted = false;
      state.easterEggsFound = [];
      state.hidden27Found = [];
      resetCallbacks.forEach((callback) => callback());
    },
    boot() {
      modules.forEach((module) => module.init?.(app));
      document.querySelector("#enter-button")?.addEventListener("click", () => app.enterExperience());
    }
  };

  window.FilipeApp = app;
  window.FilipeState = state;
  window.addEventListener("DOMContentLoaded", () => app.boot(), { once: true });
})();
