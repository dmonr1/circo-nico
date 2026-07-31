const enterTentButton = document.querySelector("#enterTent");
const returnShowButton = document.querySelector("#returnShowButton");
const scene = document.querySelector(".scene");
const toggleSkyButton = document.querySelector("#toggleSky");
const loader = document.querySelector("#loader");
const loaderSpiral = document.querySelector("#loaderSpiral");
const loaderNumber = document.querySelector("#loaderNumber");
const presentationConfetti = document.querySelector("#presentationConfetti");
const storyText = document.querySelector("#storyText");
const continueButton = document.querySelector("#continueButton");
const skipSceneButton = document.querySelector("#skipSceneButton");
const walkingBeba = document.querySelector(".walking-beba");
const walkingBebaImage = walkingBeba.querySelector("img");
const stageBeba = document.querySelector(".stage-beba");
const magicDialogText = document.querySelector("#magicDialogText");
const magicCards = document.querySelectorAll(".magic-card");
const cardResult = document.querySelector("#cardResult");
const prizeButton = document.querySelector("#prizeButton");
const numberStepButton = document.querySelector("#numberStepButton");
const acceptTicketButton = document.querySelector("#acceptTicketButton");
const declineTicketButton = document.querySelector("#declineTicketButton");
const farewellConfetti = document.querySelector("#farewellConfetti");

let bebaReachedDoor = false;
let hasEnteredTent = false;
let magicDialogStarted = false;
let cardWasPicked = false;
let numberTrickReady = false;
let numberStepIndex = 0;
let magicTypingTimer = 0;
let magicDialogSequenceTimer = 0;
let cardTrickTimers = [];
let numberTrickTimers = [];
let tentVisits = 0;

function createPresentationConfetti() {
  const colors = ["#f7c65a", "#f45b2c", "#1fb6a6", "#fff3d3", "#b91f42"];

  for (let index = 0; index < 52; index += 1) {
    const piece = document.createElement("i");
    piece.style.setProperty("--confetti-x", `${Math.random() * 100}%`);
    piece.style.setProperty("--confetti-delay", `${Math.random() * 0.9}s`);
    piece.style.setProperty("--confetti-duration", `${2.2 + Math.random() * 1.5}s`);
    piece.style.setProperty("--confetti-turn", `${360 + Math.random() * 720}deg`);
    piece.style.setProperty("--confetti-color", colors[index % colors.length]);
    presentationConfetti.appendChild(piece);
  }
}

function createFarewellConfetti() {
  const colors = ["#f7c65a", "#f45b2c", "#1fb6a6", "#fff3d3", "#b91f42"];

  for (let index = 0; index < 64; index += 1) {
    const piece = document.createElement("i");
    piece.style.setProperty("--farewell-x", `${Math.random() * 100}%`);
    piece.style.setProperty("--farewell-delay", `${Math.random() * 0.8}s`);
    piece.style.setProperty("--farewell-drift", `${-5 + Math.random() * 10}rem`);
    piece.style.setProperty("--farewell-color", colors[index % colors.length]);
    farewellConfetti.appendChild(piece);
  }
}

function burstMagicConfetti(x = window.innerWidth / 2, y = window.innerHeight / 2) {
  const colors = ["#f7c65a", "#f45b2c", "#1fb6a6", "#fff3d3", "#1fb6a6", "#b91f42"];

  for (let index = 0; index < 34; index += 1) {
    const piece = document.createElement("i");
    const angle = (Math.PI * 2 * index) / 34 + Math.random() * 0.35;
    const distance = 3.8 + Math.random() * 5.5;

    piece.className = "magic-confetti";
    piece.style.setProperty("--burst-x", `${x}px`);
    piece.style.setProperty("--burst-y", `${y}px`);
    piece.style.setProperty("--burst-dx", `${Math.cos(angle) * distance}rem`);
    piece.style.setProperty("--burst-dy", `${Math.sin(angle) * distance}rem`);
    piece.style.setProperty("--burst-rotate", `${240 + Math.random() * 620}deg`);
    piece.style.setProperty("--burst-color", colors[index % colors.length]);

    document.body.appendChild(piece);
    piece.addEventListener("animationend", () => piece.remove());
  }
}

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
  const welcomeText = tentVisits > 1
    ? "¡Qué bueno volver a verte! Bienvenida otra vez a mi función."
    : "¡Bienvenidos a mi función de hoy! Hoy les tengo un súper truco.";

  typeMagicText(welcomeText, () => {
    magicDialogSequenceTimer = window.setTimeout(() => {
      typeMagicText("Para mi primer truco tendrás que elegir una carta. Memorízala muy bien.", () => {
        scene.classList.add("magic-dialog-complete");
      });
    }, 1200);
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

function hidePrizeTicket() {
  scene.classList.remove("show-prize-ticket", "farewell-active");
}

function startNumberTrick() {
  scene.classList.add("number-trick-active");
  scene.classList.remove("magic-dialog-complete", "number-ready", "number-step-ready");
  hidePrizeTicket();
  cardResult.classList.remove("is-visible");
  cardResult.classList.remove("number-result");
  stageBeba.src = "imgs/beba_haceindo_un_truco.png";
  stageBeba.alt = "Beba haciendo un truco de numeros";

  numberStepIndex = 0;
  showNumberStep();
}

function showNumberStep() {
  const numberSteps = [
    "Ahora va mi segundo truco.",
    "Piensa un numero del 1 al 10.",
    "Multiplicalo por 2.",
    "Sumale 8.",
    "Divide el resultado entre 2.",
    "Ahora resta el numero que pensaste al inicio."
  ];

  scene.classList.remove("number-step-ready");
  numberStepButton.textContent = "OK";

  typeMagicText(numberSteps[numberStepIndex], () => {
    scene.classList.add("number-step-ready");
  });
}

function continueNumberTrick() {
  if (!scene.classList.contains("number-step-ready")) {
    return;
  }

  scene.classList.remove("number-step-ready");
  numberStepIndex += 1;

  if (numberStepIndex < 6) {
    showNumberStep();
    return;
  }

  cardResult.innerHTML = "<span>Tu numero es</span><strong>4</strong>";
  cardResult.classList.add("is-visible", "number-result");
  burstMagicConfetti(window.innerWidth / 2, window.innerHeight * 0.72);
  typeMagicText("Si adivine tu numero, acepta el premio.", () => {
    numberTrickReady = true;
    prizeButton.textContent = "Ver premio";
    scene.classList.add("number-ready");
  });
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

function enterTent(isReturning = false) {
  if (hasEnteredTent || (!bebaReachedDoor && !isReturning)) {
    return;
  }

  hidePrizeTicket();
  hasEnteredTent = true;
  tentVisits += 1;
  scene.classList.remove("show-return-sign");
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
  stageBeba.src = "imgs/beba_haceindo_un_truco.png";
  stageBeba.alt = "Beba haciendo un truco de magia";
  magicDialogText.textContent = "...";

  const gameBounds = document.querySelector("#cardGame").getBoundingClientRect();
  const stackCenterX = gameBounds.left + gameBounds.width / 2;
  const stackCenterY = gameBounds.top + gameBounds.height / 2;

  magicCards.forEach((magicCard, index) => {
    const cardBounds = magicCard.getBoundingClientRect();
    const cardCenterX = cardBounds.left + cardBounds.width / 2;
    const cardCenterY = cardBounds.top + cardBounds.height / 2;

    magicCard.style.setProperty("--stack-x", `${stackCenterX - cardCenterX}px`);
    magicCard.style.setProperty("--stack-y", `${stackCenterY - cardCenterY}px`);
    magicCard.style.setProperty("--stack-tilt", `${(index - 2.5) * 0.7}deg`);
    magicCard.style.setProperty("--card-order", index);
  });

  card.classList.add("is-picked");

  magicCards.forEach((magicCard) => {
    magicCard.disabled = true;
  });

  cardTrickTimers.push(window.setTimeout(() => {
    scene.classList.add("cards-hidden");
    magicDialogText.textContent = "Guau guau...";
  }, 800));

  cardTrickTimers.push(window.setTimeout(() => {
    scene.classList.add("cards-stacked");
    magicDialogText.textContent = "...";
  }, 1550));

  cardTrickTimers.push(window.setTimeout(() => {
    scene.classList.add("cards-mixing");
    scene.classList.add("magic-thinking");
    magicDialogText.textContent = "Pensando...";
  }, 2600));

  cardTrickTimers.push(window.setTimeout(() => {
    scene.classList.remove("cards-mixing");
  }, 5100));

  cardTrickTimers.push(window.setTimeout(() => {
    scene.classList.remove("magic-thinking");
    scene.classList.add("cards-suspense");
    card.disabled = false;
    magicDialogText.textContent = "Prepárate... Haz clic en tu carta para revelarla.";
  }, 6500));
}

function revealMagicCard(card) {
  if (!scene.classList.contains("cards-suspense") || !card.classList.contains("is-picked")) {
    return;
  }

  card.disabled = true;
  scene.classList.remove("cards-suspense");
  magicDialogText.textContent = "...";
  stageBeba.classList.add("is-changing");

  cardTrickTimers.push(window.setTimeout(() => {
    stageBeba.src = "imgs/beba_mirando_al_lado.png";
    stageBeba.alt = "Beba mirando al lado";
    stageBeba.classList.remove("is-changing");
    scene.classList.remove("magic-thinking");
    scene.classList.add("cards-revealed");
    card.classList.add("is-revealed");
    const cardBounds = card.getBoundingClientRect();
    burstMagicConfetti(cardBounds.left + cardBounds.width / 2, cardBounds.top + cardBounds.height / 2);
    magicDialogText.textContent = "¡La encontré!";
  }, 140));

  cardTrickTimers.push(window.setTimeout(() => {
    typeMagicText(`Guau guau, adivine tu carta. Pero antes del premio falta un ultimo truco.`, startNumberTrick);
  }, 2800));
}

enterTentButton.addEventListener("click", () => enterTent());
returnShowButton.addEventListener("click", () => enterTent(true));
magicCards.forEach((card) => {
  card.addEventListener("click", () => {
    if (scene.classList.contains("cards-suspense")) {
      revealMagicCard(card);
      return;
    }

    pickMagicCard(card);
  });
});
numberStepButton.addEventListener("click", () => {
  if (scene.classList.contains("number-step-ready")) {
    continueNumberTrick();
  }
});

prizeButton.addEventListener("click", () => {
  if (!numberTrickReady || !scene.classList.contains("number-ready")) {
    return;
  }

  numberTrickReady = false;
  scene.classList.remove("number-ready", "number-step-ready", "prize-ready");
  scene.classList.add("show-prize-ticket");
});
acceptTicketButton.addEventListener("click", () => {
  scene.classList.add("farewell-active");
});
declineTicketButton.addEventListener("mouseenter", () => {
  declineTicketButton.textContent = "Sí";
});
declineTicketButton.addEventListener("mouseleave", () => {
  declineTicketButton.textContent = "No";
});
declineTicketButton.addEventListener("focus", () => {
  declineTicketButton.textContent = "Sí";
});
declineTicketButton.addEventListener("blur", () => {
  declineTicketButton.textContent = "No";
});
declineTicketButton.addEventListener("click", () => {
  scene.classList.add("farewell-active");
});
toggleSkyButton.addEventListener("click", () => {
  scene.classList.toggle("is-day");
});
continueButton.addEventListener("click", () => {
  loader.classList.add("is-done");
});
skipSceneButton.addEventListener("click", () => {
  loader.classList.add("is-done", "text-complete");

  if (hasEnteredTent) {
    scene.classList.add("show-prize-ticket");
    return;
  }

  bebaReachedDoor = true;
  hasEnteredTent = true;
  tentVisits += 1;
  enterTentButton.disabled = false;
  enterTentButton.classList.add("is-opening");
  scene.classList.remove("show-return-sign");
  scene.classList.add("beba-arrived", "beba-entering", "is-entering-tent", "is-inside-tent", "show-prize-ticket");
});
walkingBeba.addEventListener("animationend", (event) => {
  if (event.animationName !== "bebaWalkToDoor") {
    return;
  }

  bebaReachedDoor = true;
  walkingBebaImage.src = "imgs/caminando_beba_invertida.png";
  scene.classList.add("beba-arrived");
  enterTentButton.disabled = false;
});

createPresentationConfetti();
createFarewellConfetti();
startLoaderSpiral();
runLoader();

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && hasEnteredTent) {
    enterTentButton.classList.remove("is-opening");
    scene.classList.remove("beba-entering", "is-entering-tent", "is-inside-tent", "magic-dialog-complete");
    scene.classList.remove("cards-hidden", "cards-stacked", "cards-mixing", "cards-revealed", "cards-suspense", "magic-thinking", "number-trick-active", "number-step-ready", "number-ready", "prize-ready", "show-prize-ticket", "farewell-active");
    hasEnteredTent = false;
    bebaReachedDoor = false;
    enterTentButton.disabled = true;
    scene.classList.add("show-return-sign");
    magicDialogStarted = false;
    cardWasPicked = false;
    numberTrickReady = false;
    numberStepIndex = 0;
    prizeButton.textContent = "Ver mi premio";
    numberStepButton.textContent = "OK";
    cardTrickTimers.forEach((timer) => window.clearTimeout(timer));
    cardTrickTimers = [];
    numberTrickTimers.forEach((timer) => window.clearTimeout(timer));
    numberTrickTimers = [];
    window.clearTimeout(magicTypingTimer);
    window.clearTimeout(magicDialogSequenceTimer);
    magicDialogText.textContent = "";
    stageBeba.src = "imgs/beba_mirando_al_lado.png";
    stageBeba.alt = "Beba mirando al lado";
    stageBeba.classList.remove("is-changing");
    cardResult.textContent = "";
    cardResult.classList.remove("is-visible", "number-result");
    declineTicketButton.textContent = "No";
    magicCards.forEach((card) => {
      card.disabled = false;
      card.classList.remove("is-picked", "is-revealed");
      card.style.removeProperty("--stack-x");
      card.style.removeProperty("--stack-y");
      card.style.removeProperty("--stack-tilt");
      card.style.removeProperty("--card-order");
    });

    scene.classList.remove("beba-arrived");
  }
});
