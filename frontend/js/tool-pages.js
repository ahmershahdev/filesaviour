document.querySelectorAll("[data-typed]").forEach((target) => {
  const phrases = JSON.parse(target.dataset.typed);
  let phraseIndex = 0;
  let charIndex = 0;
  let deleting = false;

  const type = () => {
    const phrase = phrases[phraseIndex];
    target.textContent = phrase.slice(0, charIndex);

    if (!deleting && charIndex < phrase.length) {
      charIndex += 1;
      window.setTimeout(type, 52);
      return;
    }

    if (!deleting && charIndex === phrase.length) {
      deleting = true;
      window.setTimeout(type, 1400);
      return;
    }

    if (deleting && charIndex > 0) {
      charIndex -= 1;
      window.setTimeout(type, 28);
      return;
    }

    deleting = false;
    phraseIndex = (phraseIndex + 1) % phrases.length;
    window.setTimeout(type, 220);
  };

  type();
});

document.querySelectorAll("[data-carousel]").forEach((carousel) => {
  const slides = Array.from(carousel.querySelectorAll(".carousel-slide"));
  const dotsContainer = carousel.querySelector("[data-carousel-dots]");
  const previousButton = carousel.querySelector("[data-carousel-prev]");
  const nextButton = carousel.querySelector("[data-carousel-next]");
  let activeIndex = 0;
  let timer;

  const dots = slides.map((_, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "carousel-dot";
    dot.setAttribute("aria-label", `Go to slide ${index + 1}`);
    dot.addEventListener("click", () => {
      showSlide(index);
      restart();
    });
    dotsContainer.appendChild(dot);
    return dot;
  });

  const showSlide = (index) => {
    activeIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === activeIndex);
      dots[slideIndex].classList.toggle("is-active", slideIndex === activeIndex);
    });
  };

  const next = () => showSlide(activeIndex + 1);
  const previous = () => showSlide(activeIndex - 1);
  const restart = () => {
    window.clearInterval(timer);
    timer = window.setInterval(next, 5200);
  };

  previousButton.addEventListener("click", () => {
    previous();
    restart();
  });

  nextButton.addEventListener("click", () => {
    next();
    restart();
  });

  showSlide(0);
  restart();
});

document.querySelectorAll("[data-range-label]").forEach((range) => {
  const label = document.querySelector(range.dataset.rangeLabel);
  if (!label) return;

  const update = () => {
    label.textContent = range.value;
  };

  range.addEventListener("input", update);
  update();
});

document.querySelectorAll("input[type='file']").forEach((input) => {
  input.addEventListener("change", () => {
    const target = document.querySelector(input.dataset.fileLabel || "");
    if (!target) return;

    if (!input.files.length) {
      target.textContent = "No file selected yet";
      return;
    }

    if (input.files.length === 1) {
      target.textContent = input.files[0].name;
      return;
    }

    target.textContent = `${input.files.length} files selected`;
  });
});

const wordCounterInput = document.querySelector("[data-word-counter]");
if (wordCounterInput) {
  const updateWordStats = () => {
    const text = wordCounterInput.value.trim();
    const words = text ? text.split(/\s+/).filter(Boolean) : [];
    const characters = wordCounterInput.value.length;
    const charactersNoSpaces = wordCounterInput.value.replace(/\s/g, "").length;
    const sentences = text ? text.split(/[.!?]+/).filter((sentence) => sentence.trim().length).length : 0;
    const paragraphs = text ? text.split(/\n+/).filter((paragraph) => paragraph.trim().length).length : 0;
    const readingTime = Math.max(0, Math.ceil(words.length / 200));
    const speakingTime = Math.max(0, Math.ceil(words.length / 150));

    const values = {
      words: words.length,
      characters,
      charactersNoSpaces,
      sentences,
      paragraphs,
      readingTime: `${readingTime} min`,
      speakingTime: `${speakingTime} min`,
    };

    Object.entries(values).forEach(([key, value]) => {
      document.querySelectorAll(`[data-stat='${key}']`).forEach((node) => {
        node.textContent = value;
      });
    });
  };

  wordCounterInput.addEventListener("input", updateWordStats);
  updateWordStats();
}
