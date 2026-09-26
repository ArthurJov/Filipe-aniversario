(() => {
  "use strict";

  window.FilipeApp?.register({
    init(app) {
      const revealItems = [...document.querySelectorAll("[data-reveal]")];
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      document.body.classList.add("reveal-ready");

      const reveal = (element) => element.classList.add("is-revealed");

      if (reducedMotion || !("IntersectionObserver" in window)) {
        revealItems.forEach(reveal);
      } else {
        const observer = new IntersectionObserver((entries, instance) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            reveal(entry.target);
            instance.unobserve(entry.target);
          });
        }, { threshold: 0.12, rootMargin: "0px 0px -8%" });

        revealItems.forEach((item) => observer.observe(item));
      }

      app.onEntry(() => {
        document.body.classList.add("experience-started");
        document.querySelectorAll("[data-reveal]").forEach((item, index) => {
          if (item.getBoundingClientRect().top < window.innerHeight * 0.9) {
            window.setTimeout(() => reveal(item), reducedMotion ? 0 : index * 70);
          }
        });

        if (window.gsap && window.ScrollTrigger && !reducedMotion) {
          window.gsap.registerPlugin(window.ScrollTrigger);
          window.gsap.utils.toArray("[data-parallax]").forEach((element) => {
            window.gsap.to(element, {
              yPercent: -10,
              ease: "none",
              scrollTrigger: { trigger: element, scrub: true }
            });
          });
        }
      });
    }
  });
})();
