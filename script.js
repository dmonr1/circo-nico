const enterTentButton = document.querySelector("#enterTent");
const scene = document.querySelector(".scene");
const toggleSkyButton = document.querySelector("#toggleSky");
const loader = document.querySelector("#loader");
const loaderSpiral = document.querySelector("#loaderSpiral");
const loaderNumber = document.querySelector("#loaderNumber");
const storyText = document.querySelector("#storyText");
const continueButton = document.querySelector("#continueButton");
const walkingBeba = document.querySelector(".walking-beba");
const magicDialogText = document.querySelector("#magicDialogText");
const magicCards = document.querySelectorAll(".magic-card");
const cardResult = document.querySelector("#cardResult");

let bebaReachedDoor = false;
let hasEnteredTent = false;
let magicDialogStarted = false;
let cardWasPicked = false;
let magicTypingTimer = 0;

function startLoaderSpiral() {
  const context = loaderSpiral.getContext("2d");
  const size = 1200;
  loaderSpiral.width = size;
  loaderSpiral.height = size;

  const imageData = context.createImageData(size, size);
  const data = imageData.data;
  const centerX = size / 2;
  const centerY = size / 2;
  const red = [163, 27, 30];
  const cream = [222, 202, 168];
  const arms = 10;
  const tightness = 22;

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const dx = x - centerX;
      const dy = y - centerY;
      const radius = Math.sqrt(dx * dx + dy * dy);
      const theta = Math.atan2(dy, dx);
      const value = theta * (arms / (2 * Math.PI)) + radius / tightness;
      const phase = value - Math.floor(value);
      const index = (y * size + x) * 4;
      const color = phase < 0.5 ? red : cream;

      data[index] = color[0];
      data[index + 1] = color[1];
      data[index + 2] = color[2];
      data[index + 3] = 255;
    }
  }

  context.putImageData(imageData, 0, 0);
}

function typeStoryText() {
  const text = storyText.dataset.text;
  let index = 0;

  storyText.textContent = "";

  function typeNextCharacter() {
    storyText.textContent += text[index];
    index += 1;

    if (index >= text.length) {
      loader.classList.add("text-complete");
      return;
    }

    const previousCharacter = text[index - 1];
    const delay = previousCharacter === "." ? 520 : previousCharacter === "," ? 260 : 105;

    window.setTimeout(typeNextCharacter, delay);
  }

  window.setTimeout(typeNextCharacter, 420);
}

function typeMagicDialog() {
  if (magicDialogStarted) {
    return;
  }

  magicDialogStarted = true;
  typeMagicText(magicDialogText.dataset.text, () => {
    scene.classList.add("magic-dialog-complete");
  });
}

function typeMagicText(text, onComplete) {
  let index = 0;

  window.clearTimeout(magicTypingTimer);
  magicDialogText.textContent = "";

  function typeNextCharacter() {
    magicDialogText.textContent += text[index];
    index += 1;

    if (index >= text.length) {
      onComplete();
      return;
    }

    const previousCharacter = text[index - 1];
    const delay = previousCharacter === "." ? 470 : previousCharacter === "," ? 230 : 72;

    magicTypingTimer = window.setTimeout(typeNextCharacter, delay);
  }

  magicTypingTimer = window.setTimeout(typeNextCharacter, 900);
}

function runLoader() {
  let progress = 1;

  window.setTimeout(() => {
    loaderNumber.textContent = `${progress}%`;

    const interval = window.setInterval(() => {
      progress += Math.ceil(Math.random() * 4);

      if (progress >= 100) {
        progress = 100;
        window.clearInterval(interval);
        window.setTimeout(() => loader.classList.add("is-black"), 300);
        window.setTimeout(() => loader.classList.add("show-light-left"), 1200);
        window.setTimeout(() => loader.classList.add("show-light-right"), 2500);
        window.setTimeout(() => loader.classList.add("show-poster"), 3900);
        window.setTimeout(() => loader.classList.add("show-title"), 5200);
        window.setTimeout(() => {
          loader.classList.add("show-message");
          typeStoryText();
        }, 6800);
      }

      loaderNumber.textContent = `${progress}%`;
    }, 42);
  }, 520);
}

function enterTent() {
  if (hasEnteredTent) {
    return;
  }

  hasEnteredTent = true;
  scene.classList.add("beba-entering");
  enterTentButton.classList.add("is-opening");

  window.setTimeout(() => {
    scene.classList.add("is-entering-tent");
  }, 450);

  window.setTimeout(() => {
    scene.classList.add("is-inside-tent");
    typeMagicDialog();
  }, 1200);
}

function pickMagicCard(card) {
  if (!scene.classList.contains("magic-dialog-complete") || cardWasPicked) {
    return;
  }

  cardWasPicked = true;
  card.classList.add("is-picked");
  magicCards.forEach((magicCard) => {
    magicCard.disabled = true;
  });

  cardResult.textContent = "Memoriza tu carta...";
  cardResult.classList.add("is-visible");

  window.setTimeout(() => {
    scene.classList.add("cards-hidden");
    cardResult.textContent = "Ahora las cartas se voltean...";
  }, 900);

  window.setTimeout(() => {
    scene.classList.add("cards-mixing");
    cardResult.textContent = "Se mezclan en la magia de la carpa...";
  }, 1800);

  window.setTimeout(() => {
    scene.classList.remove("cards-mixing");
    scene.classList.add("cards-revealed");
    card.classList.add("is-revealed");
    cardResult.textContent = `Tu carta era: ${card.dataset.card}.`;
  }, 4300);

  window.setTimeout(() => {
    cardResult.classList.remove("is-visible");
    scene.classList.remove("magic-dialog-complete");
    typeMagicText(`Guau guau, adivine tu carta, no? Como ganaste, este es tu premio.`, () => {
      scene.classList.add("show-prize-ticket");
    });
  }, 5700);
}

enterTentButton.addEventListener("click", enterTent);
magicCards.forEach((card) => {
  card.addEventListener("click", () => pickMagicCard(card));
});
toggleSkyButton.addEventListener("click", () => {
  scene.classList.toggle("is-day");
});
continueButton.addEventListener("click", () => {
  loader.classList.add("is-done");
});
walkingBeba.addEventListener("animationend", (event) => {
  if (event.animationName !== "bebaWalkToDoor") {
    return;
  }

  bebaReachedDoor = true;
  scene.classList.add("beba-arrived");
});

startLoaderSpiral();
runLoader();

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    enterTentButton.classList.remove("is-opening");
    scene.classList.remove("beba-entering", "is-entering-tent", "is-inside-tent", "magic-dialog-complete");
    scene.classList.remove("cards-hidden", "cards-mixing", "cards-revealed", "show-prize-ticket");
    hasEnteredTent = false;
    magicDialogStarted = false;
    cardWasPicked = false;
    window.clearTimeout(magicTypingTimer);
    magicDialogText.textContent = "";
    cardResult.textContent = "";
    cardResult.classList.remove("is-visible");
    magicCards.forEach((card) => {
      card.disabled = false;
      card.classList.remove("is-picked", "is-revealed");
    });
  }
});
