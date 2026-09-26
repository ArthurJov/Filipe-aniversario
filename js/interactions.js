(() => {
  "use strict";

  window.FilipeApp?.register({
    init(app) {
      const body = document.body;
      const intro = document.querySelector("#intro-screen");
      const enterButton = document.querySelector("#enter-button");
      const grave = document.querySelector("#grave");
      const placedFlowers = document.querySelector("#placed-flowers");
      const candles = [...document.querySelectorAll("[data-candle]")];
      const candleStatus = document.querySelector("#candle-status");
      const modal = document.querySelector("#condolence-modal");
      const form = document.querySelector("#condolence-form");
      const list = document.querySelector("#condolence-list");
      let graveClicks = 0;
      let secretClicks = 0;
      let lastSecretClick = 0;
      let previousFocus = null;

      const cue = (name) => window.FilipeAudio?.cue?.(name);

      const triggerSecret = (message) => {
        body.classList.add("secret-active");
        app.showNotice(message);
        cue("glitch");
        window.setTimeout(() => body.classList.remove("secret-active"), 1200);
      };

      const handleSecretNumber = () => {
        const now = Date.now();
        secretClicks = now - lastSecretClick > 1200 ? 1 : secretClicks + 1;
        lastSecretClick = now;
        if (secretClicks >= 3) {
          secretClicks = 0;
          triggerSecret("666 reconhecido. O arquivo não deveria responder.");
        }
      };

      document.querySelectorAll("[data-secret-number]").forEach((element) => {
        element.setAttribute("role", "button");
        element.setAttribute("tabindex", "0");
        element.addEventListener("click", handleSecretNumber);
        element.addEventListener("keydown", (event) => {
          if (event.key !== "Enter" && event.key !== " ") return;
          event.preventDefault();
          handleSecretNumber();
        });
      });

      grave?.addEventListener("click", () => {
        graveClicks += 1;
        grave.classList.remove("is-shaking");
        window.requestAnimationFrame(() => grave.classList.add("is-shaking"));
        grave.classList.toggle("is-revealed", graveClicks > 0);
        app.burst?.(window.innerWidth / 2, window.innerHeight * 0.62, 8);
        cue("stone");

        if (graveClicks === 3) triggerSecret("A lápide ouviu você. Isso é preocupante.");
        if (graveClicks >= 6) {
          grave.classList.add("is-glitching");
          app.showNotice("Easter egg liberado: a lápide pediu um intervalo.");
        }
      });

      candles.forEach((candle) => {
        candle.addEventListener("click", () => {
          if (candle.disabled) return;
          candle.disabled = true;
          candle.classList.add("is-extinguished");
          app.state.candlesExtinguished += 1;
          const remaining = candles.length - app.state.candlesExtinguished;
          candle.setAttribute("aria-label", "Vela apagada");
          if (candleStatus) candleStatus.textContent = remaining ? `${remaining} vela${remaining === 1 ? "" : "s"} ainda acesa${remaining === 1 ? "" : "s"}.` : "Todas apagadas. Agora faça um pedido estranho.";
          cue("candle");
          app.burst?.(candle.getBoundingClientRect().left, candle.getBoundingClientRect().top, 10);
          if (!remaining) {
            body.classList.add("candles-out");
            app.showNotice("As velas se foram. O aniversário pode começar.");
            cue("bell");
          }
        });
      });

      document.querySelectorAll("[data-flower]").forEach((flower) => {
        flower.addEventListener("click", () => {
          if (app.state.flowersPlaced >= 9) {
            app.showNotice("A lápide já está recebendo flores demais.");
            return;
          }
          app.state.flowersPlaced += 1;
          const placed = document.createElement("span");
          placed.className = "placed-flower";
          placed.textContent = flower.textContent.trim();
          placed.style.left = `${12 + Math.random() * 72}%`;
          placed.style.setProperty("--flower-rotation", `${Math.random() * 32 - 16}deg`);
          placedFlowers?.appendChild(placed);
          app.burst?.(flower.getBoundingClientRect().left, flower.getBoundingClientRect().top, 9);
          cue("flower");
        });
      });

      const readCondolences = () => {
        try {
          return JSON.parse(app.safeStorage.get("filipe-condolences", "[]")) || [];
        } catch {
          return [];
        }
      };

      const renderCondolences = () => {
        if (!list) return;
        list.querySelectorAll(".user-note").forEach((note) => note.remove());
        readCondolences().forEach((entry, index) => {
          const article = document.createElement("article");
          article.className = "condolence-note user-note";
          article.dataset.reveal = "up";
          const top = document.createElement("div");
          top.className = "note-topline";
          const number = document.createElement("span");
          number.textContent = String(index + 4).padStart(2, "0");
          const date = document.createElement("time");
          date.textContent = entry.date;
          top.append(number, date);
          const title = document.createElement("h3");
          title.textContent = entry.name;
          const message = document.createElement("p");
          message.textContent = `“${entry.message}”`;
          article.append(top, title, message);
          list.appendChild(article);
        });
      };

      const closeModal = () => {
        if (!modal) return;
        modal.hidden = true;
        body.classList.remove("is-modal-open");
        previousFocus?.focus();
      };

      const openModal = () => {
        if (!modal) return;
        previousFocus = document.activeElement;
        modal.hidden = false;
        body.classList.add("is-modal-open");
        document.querySelector("#condolence-name")?.focus();
      };

      document.querySelector("#open-condolence")?.addEventListener("click", openModal);
      document.querySelector("#close-condolence")?.addEventListener("click", closeModal);
      modal?.querySelector("[data-close-modal]")?.addEventListener("click", closeModal);

      form?.addEventListener("submit", (event) => {
        event.preventDefault();
        const formData = new FormData(form);
        const name = String(formData.get("name") || "").trim();
        const message = String(formData.get("message") || "").trim();
        const error = document.querySelector("#form-error");
        if (!name || !message) {
          if (error) error.hidden = false;
          return;
        }
        const entries = readCondolences();
        entries.push({ name, message, date: new Date().toLocaleDateString("pt-BR") });
        app.safeStorage.set("filipe-condolences", JSON.stringify(entries));
        form.reset();
        if (error) error.hidden = true;
        renderCondolences();
        closeModal();
        app.showNotice("Sua mensagem foi guardada neste dispositivo.");
      });

      window.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closeModal();
        if (event.key === "Tab" && modal && !modal.hidden) {
          const focusable = [...modal.querySelectorAll("button, input, textarea")];
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
          }
        }
      });

      const hiddenSecrets = [...document.querySelectorAll("[data-hidden-27]"), document.querySelector("#footer-secret")].filter(Boolean);
      hiddenSecrets.forEach((element, index) => {
        const findSecret = () => {
          if (!app.state.hidden27Found.includes(index)) app.state.hidden27Found.push(index);
          element.classList.add("is-found");
          if (app.state.hidden27Found.length === hiddenSecrets.length) triggerSecret("Você encontrou todos os 27. O arquivo está satisfeito.");
        };
        element.addEventListener("click", findSecret);
        element.addEventListener("keydown", (event) => {
          if (event.key !== "Enter" && event.key !== " ") return;
          event.preventDefault();
          findSecret();
        });
      });

      const konami = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
      let konamiIndex = 0;
      window.addEventListener("keydown", (event) => {
        const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
        konamiIndex = key === konami[konamiIndex] ? konamiIndex + 1 : 0;
        if (konamiIndex === konami.length) {
          konamiIndex = 0;
          triggerSecret("Código secreto aceito. O modo festa foi autorizado.");
          app.confetti?.(2200);
        }
      });

      const photo = document.querySelector(".portrait-image-wrap");
      let photoClicks = 0;
      photo?.addEventListener("click", () => {
        photoClicks += 1;
        if (photoClicks >= 3) {
          photoClicks = 0;
          app.showNotice("Filipe percebeu a câmera. Ou foi só o contraste.");
        }
      });

      const cursorMain = document.querySelector(".cursor-main");
      const cursorRing = document.querySelector(".cursor-ring");
      if (cursorMain && cursorRing && window.matchMedia("(pointer: fine)").matches && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        body.classList.add("has-custom-cursor");
        let ringX = -100;
        let ringY = -100;
        let pointerX = -100;
        let pointerY = -100;
        const moveCursor = () => {
          ringX += (pointerX - ringX) * 0.15;
          ringY += (pointerY - ringY) * 0.15;
          cursorMain.style.transform = `translate3d(${pointerX - 2}px, ${pointerY - 2}px, 0)`;
          cursorRing.style.transform = `translate3d(${ringX - 17}px, ${ringY - 17}px, 0)`;
          window.requestAnimationFrame(moveCursor);
        };
        window.addEventListener("pointermove", (event) => { pointerX = event.clientX; pointerY = event.clientY; }, { passive: true });
        document.querySelectorAll("a, button, input, textarea").forEach((element) => {
          element.addEventListener("mouseenter", () => cursorRing.classList.add("is-hovering"));
          element.addEventListener("mouseleave", () => cursorRing.classList.remove("is-hovering"));
        });
        moveCursor();
      }

      app.replayExperience = () => {
        app.resetTemporaryState();
        body.classList.remove("is-finale", "secret-active", "candles-out");
        document.querySelector("#finale-overlay")?.classList.remove("is-visible");
        document.querySelector("#finale-overlay")?.setAttribute("aria-hidden", "true");
        intro?.removeAttribute("hidden");
        intro?.classList.remove("is-leaving");
        intro?.setAttribute("aria-hidden", "false");
        enterButton?.removeAttribute("disabled");
        body.classList.add("is-locked");
        window.scrollTo({ top: 0, behavior: "auto" });
      };

      document.querySelector("#replay-button")?.addEventListener("click", () => app.replayExperience?.());
      renderCondolences();

      app.onReset(() => {
        graveClicks = 0;
        photoClicks = 0;
        candles.forEach((candle) => {
          candle.disabled = false;
          candle.classList.remove("is-extinguished");
          candle.setAttribute("aria-label", `Apagar vela ${candles.indexOf(candle) + 1}`);
        });
        if (candleStatus) candleStatus.textContent = "3 velas acesas. Uma homenagem por vez.";
        grave?.classList.remove("is-revealed", "is-shaking", "is-glitching");
        if (placedFlowers) placedFlowers.replaceChildren();
      });
    }
  });
})();
