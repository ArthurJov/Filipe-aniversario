(() => {
  "use strict";

  window.FilipeApp?.register({
    init(app) {
      const canvas = document.querySelector("#ash-canvas");
      if (!canvas) return;

      const context = canvas.getContext("2d");
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const weakDevice = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
      const touchDevice = navigator.maxTouchPoints > 0;
      const mode = reducedMotion || weakDevice ? "low" : touchDevice ? "medium" : "high";
      app.state.performanceMode = mode;

      const ashes = [];
      const bursts = [];
      let width = 0;
      let height = 0;
      let frame = 0;
      let active = false;
      let pointerX = 0;
      let pointerY = 0;

      const countForMode = { high: 95, medium: 52, low: 18 };

      const resize = () => {
        width = window.innerWidth;
        height = window.innerHeight;
        const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = width * pixelRatio;
        canvas.height = height * pixelRatio;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      };

      const makeAsh = (fromBottom = false) => ({
        x: Math.random() * width,
        y: fromBottom ? height + 8 : Math.random() * height,
        size: Math.random() * 2.3 + 0.5,
        speed: Math.random() * 0.45 + 0.16,
        drift: Math.random() * 1.2 - 0.6,
        phase: Math.random() * Math.PI * 2,
        alpha: Math.random() * 0.48 + 0.12
      });

      const fillAshes = () => {
        ashes.length = 0;
        for (let index = 0; index < countForMode[mode]; index += 1) ashes.push(makeAsh());
      };

      const draw = () => {
        context.clearRect(0, 0, width, height);
        const influence = mode === "low" ? 0 : 0.0008;

        ashes.forEach((ash) => {
          ash.y -= ash.speed;
          ash.phase += 0.01;
          ash.x += Math.sin(ash.phase) * ash.drift * 0.18 + (pointerX - width / 2) * influence;
          if (ash.y < -8) Object.assign(ash, makeAsh(true));

          const distanceX = pointerX - ash.x;
          const distanceY = pointerY - ash.y;
          const distance = Math.hypot(distanceX, distanceY);
          if (distance < 80 && distance > 0) {
            ash.x -= (distanceX / distance) * 0.25;
            ash.y -= (distanceY / distance) * 0.12;
          }

          context.beginPath();
          context.fillStyle = `rgba(245, 245, 245, ${ash.alpha})`;
          context.arc(ash.x, ash.y, ash.size, 0, Math.PI * 2);
          context.fill();
        });

        bursts.forEach((particle, index) => {
          particle.x += particle.velocityX;
          particle.y += particle.velocityY;
          particle.velocityY += 0.035;
          particle.life -= 0.018;
          context.fillStyle = `rgba(${particle.color}, ${Math.max(particle.life, 0)})`;
          context.fillRect(particle.x, particle.y, particle.size, particle.size);
          if (particle.life <= 0) bursts.splice(index, 1);
        });

        if (active || bursts.length) frame = window.requestAnimationFrame(draw);
      };

      app.burst = (x = width / 2, y = height / 2, amount = 14, celebratory = false) => {
        const colors = celebratory ? ["245,245,245", "207,207,207", "119,119,119"] : ["245,245,245", "207,207,207"];
        for (let index = 0; index < amount; index += 1) {
          const angle = Math.random() * Math.PI * 2;
          const velocity = Math.random() * 3 + 1;
          bursts.push({
            x,
            y,
            velocityX: Math.cos(angle) * velocity,
            velocityY: Math.sin(angle) * velocity,
            size: Math.random() * 3 + 1,
            life: 1,
            color: colors[index % colors.length]
          });
        }
        if (!active) {
          active = true;
          window.cancelAnimationFrame(frame);
          draw();
          window.setTimeout(() => { active = false; }, 600);
        }
      };

      app.startParticles = () => {
        if (active) return;
        active = true;
        window.cancelAnimationFrame(frame);
        draw();
      };

      app.stopParticles = () => {
        active = false;
        window.cancelAnimationFrame(frame);
        context.clearRect(0, 0, width, height);
      };

      app.confetti = (duration = 4200) => {
        app.burst(width * 0.2, height * 0.2, 65, true);
        const interval = window.setInterval(() => {
          app.burst(Math.random() * width, -10, 28, true);
        }, 260);
        window.setTimeout(() => window.clearInterval(interval), duration);
      };

      window.addEventListener("resize", resize, { passive: true });
      window.addEventListener("pointermove", (event) => {
        pointerX = event.clientX;
        pointerY = event.clientY;
      }, { passive: true });
      resize();
      fillAshes();
      app.onEntry(() => app.startParticles());
    }
  });
})();
