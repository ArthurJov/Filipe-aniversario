(() => {
  "use strict";

  window.FilipeApp?.register({
    init(app) {
      const number = document.querySelector("#age-number");
      const ageSection = document.querySelector("#idade");
      const action = document.querySelector("#resurrection-action");
      const progress = document.querySelector("#resurrection-progress");
      const percent = document.querySelector("#resurrection-percent");
      const progressTrack = document.querySelector(".progress-track");
      const status = document.querySelector("#resurrection-status");
      const finale = document.querySelector("#finale-overlay");
      let counterStarted = false;

      const animateAge = () => {
        if (!number || counterStarted) return;
        counterStarted = true;
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (reducedMotion) {
          number.textContent = "20";
          return;
        }
        const start = performance.now();
        const duration = 1400;
        const tick = (now) => {
          const progressValue = Math.min((now - start) / duration, 1);
          number.textContent = String(Math.floor(progressValue * 20));
          if (progressValue < 1) window.requestAnimationFrame(tick);
        };
        window.requestAnimationFrame(tick);
      };

      if (ageSection && "IntersectionObserver" in window) {
        const observer = new IntersectionObserver((entries, instance) => {
          if (!entries[0].isIntersecting) return;
          animateAge();
          instance.disconnect();
        }, { threshold: 0.3 });
        observer.observe(ageSection);
      } else {
        animateAge();
      }

      const updateProgress = () => {
        const value = Math.round(app.state.resurrectionProgress);
        if (progress) progress.style.width = `${value}%`;
        if (percent) percent.textContent = `${value}%`;
        progressTrack?.setAttribute("aria-valuenow", String(value));
        if (value < 25) {
          if (status) status.textContent = "A lápide ainda está quieta.";
        } else if (value < 50) {
          if (status) status.textContent = "Alguma coisa se mexeu lá embaixo.";
        } else if (value < 75) {
          if (status) status.textContent = "O arquivo está apresentando interferência.";
          document.body.classList.add("resurrection-shaking");
        } else if (value < 100) {
          if (status) status.textContent = "Não pare agora. A situação já ficou ridícula.";
          document.body.classList.add("resurrection-chaos");
        }
      };

      const complete = () => {
        if (app.state.resurrectionCompleted) return;
        app.state.resurrectionCompleted = true;
        app.state.resurrectionProgress = 100;
        updateProgress();
        action?.classList.add("is-complete");
        if (action) {
          action.disabled = true;
          action.querySelector("span:nth-child(2)").textContent = "Ressurreição confirmada";
        }
        document.body.classList.add("is-finale");
        finale?.classList.add("is-visible");
        finale?.setAttribute("aria-hidden", "false");
        if (status) status.textContent = "Filipe voltou. A festa pode começar.";
        app.confetti?.(4800);
        window.FilipeAudio?.cue?.("resurrection");
      };

      action?.addEventListener("click", () => {
        if (app.state.resurrectionCompleted) return;
        app.state.resurrectionProgress = Math.min(100, app.state.resurrectionProgress + 3.4);
        action.classList.remove("is-shaking");
        window.requestAnimationFrame(() => action.classList.add("is-shaking"));
        app.burst?.(window.innerWidth / 2, window.innerHeight / 2, 10, app.state.resurrectionProgress > 75);
        window.FilipeAudio?.intensity?.(app.state.resurrectionProgress / 100);
        updateProgress();
        if (app.state.resurrectionProgress >= 100) complete();
      });

      app.onReset(() => {
        app.state.resurrectionProgress = 0;
        app.state.resurrectionCompleted = false;
        counterStarted = false;
        if (number) number.textContent = "0";
        if (action) {
          action.disabled = false;
          action.classList.remove("is-complete", "is-shaking");
          action.querySelector("span:nth-child(2)").textContent = "Clicar para ressuscitar";
        }
        document.body.classList.remove("resurrection-shaking", "resurrection-chaos");
        updateProgress();
      });
    }
  });
})();
