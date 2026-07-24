/* ========================================================================== */
/* PART 3 — INTERACTIONS FOR PAGES 1–4                                        */
/* Keep this file in the same folder as index.html.                           */
/* ========================================================================== */

"use strict";

/* ========================================================================== */
/* CHANGE THE PASSCODE HERE                                                    */
/* Use exactly six numbers because the lock screen accepts six digits.         */
/* ========================================================================== */
const PASSCODE = "240324";

/* ========================================================================== */
/* PUZZLE STARTING ORDER                                                       */
/* 0–8 represent the correct pieces from left to right, top to bottom.        */
/* Do not change this unless you want to customise how scrambled it starts.   */
/* ========================================================================== */
const CORRECT_PUZZLE_ORDER = [0, 1, 2, 3, 4, 5, 6, 7, 8];
const STARTING_PUZZLE_ORDER = [5, 0, 6, 1, 8, 2, 7, 3, 4];

const screens = document.querySelectorAll("main > .screen");
const lockForm = document.getElementById("passcode-form");
const passcodeInput = document.getElementById("passcode");
const passcodeMessage = document.getElementById("passcode-message");
const lockCard = document.getElementById("lock-card");
const unlockButton = document.getElementById("unlock-button");
const heartBurst = document.getElementById("heart-burst");

const puzzleGrid = document.getElementById("puzzle-grid");
const puzzleStage = document.getElementById("puzzle-stage");
const puzzleMessage = document.getElementById("puzzle-message");

let puzzleOrder = [...STARTING_PUZZLE_ORDER];
let selectedPuzzleIndex = null;

/* ========================================================================== */
/* SHOW ONE FULL PAGE                                                          */
/* ========================================================================== */
function showScreen(screenId) {
  screens.forEach((screen) => {
    screen.hidden = screen.id !== screenId;
  });

  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ========================================================================== */
/* LOCK SCREEN                                                                */
/* ========================================================================== */
lockForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const enteredCode = passcodeInput.value.trim();

  if (enteredCode === PASSCODE) {
    passcodeMessage.textContent = "Yayyy, you got it ♡";
    passcodeMessage.style.color = "#4f7a59";
    heartBurst.hidden = false;
    unlockButton.hidden = false;
    passcodeInput.disabled = true;
    document.getElementById("check-passcode").hidden = true;
    window.setTimeout(() => { heartBurst.hidden = true; }, 850);
    return;
  }

  passcodeMessage.textContent = "Nopeee 😝 Try again shonaa";
  passcodeMessage.style.color = "";
  lockCard.classList.remove("is-shaking");
  // Restart the shake animation every time a wrong code is entered.
  void lockCard.offsetWidth;
  lockCard.classList.add("is-shaking");
});

unlockButton?.addEventListener("click", () => showScreen("scrapbook"));

passcodeInput?.addEventListener("input", () => {
  // Keeps non-number characters out when someone types or pastes.
  passcodeInput.value = passcodeInput.value.replace(/\D/g, "").slice(0, 6);
  if (passcodeMessage.textContent) passcodeMessage.textContent = "";
});

/* ========================================================================== */
/* FLIPPABLE POLAROIDS                                                        */
/* ========================================================================== */
function bindFlippableCard(card) {
  card.addEventListener("click", () => {
    card.classList.toggle("is-flipped");
    card.setAttribute("aria-expanded", String(card.classList.contains("is-flipped")));
  });
}

document.querySelectorAll(".polaroid").forEach(bindFlippableCard);

/* ========================================================================== */
/* PAGE 3 — 3x3 PUZZLE                                                        */
/* ========================================================================== */
function getPuzzleImage() {
  return puzzleStage?.dataset.puzzleImage || "images/puzzle-placeholder.jpg";
}

function drawPuzzle() {
  if (!puzzleGrid) return;

  const photoPath = getPuzzleImage();
  puzzleGrid.innerHTML = "";

  puzzleOrder.forEach((pieceNumber, puzzleIndex) => {
    const row = Math.floor(pieceNumber / 3);
    const column = pieceNumber % 3;
    const piece = document.createElement("button");

    piece.type = "button";
    piece.className = "puzzle-piece";
    piece.setAttribute("aria-label", `Puzzle piece ${puzzleIndex + 1}`);
    piece.style.backgroundImage = `url("${photoPath}")`;
    piece.style.backgroundPosition = `${column * 50}% ${row * 50}%`;
    piece.style.animationDelay = `${puzzleIndex * 45}ms`;

    if (puzzleIndex === selectedPuzzleIndex) {
      piece.classList.add("is-selected");
      piece.setAttribute("aria-pressed", "true");
    } else {
      piece.setAttribute("aria-pressed", "false");
    }

    piece.addEventListener("click", () => selectPuzzlePiece(puzzleIndex));
    puzzleGrid.appendChild(piece);
  });
}

function selectPuzzlePiece(index) {
  if (selectedPuzzleIndex === null) {
    selectedPuzzleIndex = index;
    puzzleMessage.textContent = "Now tap one more piece to swap them.";
    drawPuzzle();
    return;
  }

  if (selectedPuzzleIndex === index) {
    selectedPuzzleIndex = null;
    puzzleMessage.textContent = "Pick two different pieces, shonaa.";
    drawPuzzle();
    return;
  }

  [puzzleOrder[selectedPuzzleIndex], puzzleOrder[index]] = [puzzleOrder[index], puzzleOrder[selectedPuzzleIndex]];
  selectedPuzzleIndex = null;
  drawPuzzle();

  if (puzzleOrder.every((piece, indexInOrder) => piece === CORRECT_PUZZLE_ORDER[indexInOrder])) {
    puzzleMessage.textContent = "You solved itttt! I knew you could ♡";
    window.setTimeout(showTestIntro, 700);
  } else {
    puzzleMessage.textContent = "Almost… keep going hehehe.";
  }
}

function resetPuzzle() {
  puzzleOrder = [...STARTING_PUZZLE_ORDER];
  selectedPuzzleIndex = null;
  if (puzzleStage) puzzleStage.hidden = false;
  puzzleMessage.textContent = "One tiny memory, nine little pieces.";
  drawPuzzle();
}

function showTestIntro() {
  puzzleStage.hidden = true;
  document.getElementById("test-intro").hidden = false;
  window.setTimeout(() => showOnlyChallengePart("quiz-one"), 2200);
}

document.getElementById("continue-to-puzzle")?.addEventListener("click", () => {
  showScreen("challenge");
  resetChallenge();
});

/* ========================================================================== */
/* PAGE 3 — QUIZ                                                              */
/* ========================================================================== */
function showOnlyChallengePart(partId) {
  ["puzzle-stage", "test-intro", "quiz-one", "quiz-two", "last-question", "wrong-love-answer", "love-success"].forEach((id) => {
    const part = document.getElementById(id);
    if (part) part.hidden = id !== partId;
  });
}

function resetQuizCard(cardId) {
  const card = document.getElementById(cardId);
  if (!card) return;

  card.querySelectorAll(".answer-button").forEach((button) => {
    button.disabled = false;
    button.classList.remove("is-wrong", "is-correct");
  });

  const message = card.querySelector(".quiz-message");
  if (message) message.textContent = "";
}

function resetChallenge() {
  resetQuizCard("quiz-one");
  resetQuizCard("quiz-two");
  showOnlyChallengePart("puzzle-stage");
  resetPuzzle();
}

document.getElementById("start-quiz")?.addEventListener("click", () => {
  showOnlyChallengePart("quiz-one");
});

function setUpQuizCard(cardId, nextPartId) {
  const card = document.getElementById(cardId);
  if (!card) return;

  const message = card.querySelector(".quiz-message");
  card.querySelectorAll(".answer-button").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.correct === "true") {
        card.querySelectorAll(".answer-button").forEach((answer) => { answer.disabled = true; });
        button.classList.add("is-correct");
        message.textContent = "Yayyy, correct answer ♡";
        window.setTimeout(() => showOnlyChallengePart(nextPartId), 500);
      } else {
        button.classList.add("is-wrong");
        message.textContent = "Try Again shonaa hehehe";
      }
    });
  });
}

setUpQuizCard("quiz-one", "quiz-two");
setUpQuizCard("quiz-two", "last-question");

document.querySelectorAll(".love-answer").forEach((button) => {
  button.addEventListener("click", () => {
    const saidYes = button.dataset.loveAnswer === "yes";
    showOnlyChallengePart(saidYes ? "love-success" : "wrong-love-answer");
    if (saidYes) launchConfetti();
  });
});

document.getElementById("try-love-again")?.addEventListener("click", () => {
  showOnlyChallengePart("last-question");
});

/* ========================================================================== */
/* PAGE 4 — VINTAGE LETTER                                                    */
/* ========================================================================== */
document.getElementById("continue-to-letter")?.addEventListener("click", () => {
  showScreen("letter-page");
});

const vintageEnvelope = document.getElementById("vintage-envelope");
const loveLetter = document.getElementById("love-letter");
const envelopeHint = document.getElementById("envelope-hint");
const archiveInvitation = document.getElementById("archive-invitation");

vintageEnvelope?.addEventListener("click", () => {
  if (vintageEnvelope.classList.contains("is-open")) return;

  vintageEnvelope.classList.add("is-open");
  vintageEnvelope.setAttribute("aria-expanded", "true");
  envelopeHint.hidden = true;

  window.setTimeout(() => {
    loveLetter.hidden = false;
    archiveInvitation.hidden = false;
    loveLetter.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 550);
});

document.getElementById("continue-to-archive")?.addEventListener("click", () => {
  showScreen("archive");
});

/* ========================================================================== */
/* PAGE 6 — OUR LITTLE MUSEUM                                                  */
/* Change the photo path, date, title, caption, note, and hidden message here. */
/* ========================================================================== */
const ARCHIVE_MEMORIES = [
  // ========= ARCHIVE MEMORY 01 =========
  { photo: "images/start.jpg", date: "The beginning", title: "The Yes", caption: "The day our story started.", note: "LOVEEE", hidden: "Never Gonna forget how much i made you walk nor the moment you said yes to mee." },
  // ========= ARCHIVE MEMORY 02 =========
  { photo: "images/rrr.jpg", date: "A favorite day", title: "That first meet at younar basha", caption: "A little nervous kintu a lot happy.", note: "never gonna forget", hidden: "I Love how nervous we were yet how sparked we were." },
  // ========= ARCHIVE MEMORY 03 =========
  { photo: "images/c.jpg", date: "The 1st Pic that melted mee", title: "Delulu me", caption: "A Time I will never forget.", note: "♡", hidden: "Wasent even for me but i realised how down bad i was for this girl" },
  // ========= ARCHIVE MEMORY 04 =========
  { photo: "images/oo.jpg", date: "Crush khawa ami", title: "Crush 2", caption: "The time i had to use other phones to capture this.", note: "Dadir phone e tula", hidden: "I just came back from meeting you but i melted seeing you in the snap." },
  // ========= ARCHIVE MEMORY 05 =========
  { photo: "images/pp.jpg", date: "New Dates", title: "Started going to random dates", caption: "The light was pretty. You were prettier.", note: "wow", hidden: "I just cant get over you in that dresss." },
  // ========= ARCHIVE MEMORY 06 =========
  { photo: "images/ee.jpg", date: "Our 1st far Date", title: "Adventure Day", caption: "I much I loved exploring the new with youu.", note: "AMI HARAI NAII", hidden: "Cant forget those BRACU students thoo TwT." },
  // ========= ARCHIVE MEMORY 07 =========
  { photo: "images/uu.jpg", date: "Food date fail", title: "TOMATO ATTACK", caption: "The day i knew how much you hated tomatoes.", note: "TwT", hidden: "Somehow every random item i ordered were made of Tomatoes." },
  // ========= ARCHIVE MEMORY 08 =========
  { photo: "images/ALU.jpg", date: "Eid Date", title: "Amar Babuu", caption: "Cant Fail to Annoy You.", note: "nskrbsrbv", hidden: "Hehehe my fev hobby is definitely to annoy you" },
  // ========= ARCHIVE MEMORY 09 =========
  { photo: "images/po.jpg", date: "SNAPP", title: "Our chaos", caption: "Being weird together is USS.", note: "hehe", hidden: "Will Definitely have raw wasabi more" },
  // ========= ARCHIVE MEMORY 10 =========
  { photo: "images/gg.jpg", date: "One special date", title: "Lalala", caption: "We both know what happened.", note: "Lalala", hidden: "I know your Lip Gloss Flavour hehehe." },
  // ========= ARCHIVE MEMORY 11 =========
  { photo: "images/ht.jpg", date: "A soft day", title: "Home is you", caption: "You make my world gentler jaan.", note: "home", hidden: "I miss taking you to dates." },
  // ========= ARCHIVE MEMORY 12 =========
  { photo: "images/vv.jpg", date: "Random day", title: "Adreable", caption: "You look so cutee.", note: "go!", hidden: "Somehow you look this cute even in Uniformm." },
  // ========= ARCHIVE MEMORY 13 =========
  { photo: "images/ll.jpg", date: "Suprise", title: "Your birthday", caption: "Your Smile Literally Made that day.", note: "2x cake", hidden: "Your Dress, Your Laugh and your Happiness Melted me that day jaan." },
  // ========= ARCHIVE MEMORY 14 =========
  { photo: "images/mm.jpg", date: "Movie day", title: "Bonolota Express", caption: "Made Me want to watch every new movie with you.", note: "next?", hidden: " Made me add the train scene to do with you in my bucket list." },
  // ========= ARCHIVE MEMORY 15 =========
  { photo: "images/kk.jpg", date: "My Birthday", title: "You remembered", caption: "You Managed to get all my friends akshathee.", note: "awww", hidden: "LITERALLY CTG THEKE ESHE SUPRISE DISOOO" },
  // ========= ARCHIVE MEMORY 16 =========
  { photo: "images/YY.jpg", date: "Random Winter", title: "The day you met Labi", caption: "Youna took the perfect Picture.", note: "🌙", hidden: "Hehehe You were wearing my hoodiee." },
  // ========= ARCHIVE MEMORY 17 =========
  { photo: "images/io.jpg", date: "A win", title: "We did it", caption: "Our First Anneversary.", note: "yay", hidden: "Tho time was short that day and couldnt celebrate properly. but im glad that we were able to spend time akshathe jaan." },
  // ========= ARCHIVE MEMORY 18 =========
  { photo: "images/kl.jpg", date: "A photo dump", title: "Just us", caption: "No special occasion.", note: "camera roll", hidden: "Ilove just being with you." },
  // ========= ARCHIVE MEMORY 19 =========
  { photo: "images/nn.jpg", date: "Arka", title: "Being Akshathe", caption: "A small habit that became ours.", note: "always", hidden: "As long as i have you with me, I feel like i can do anythingg." },
  // ========= ARCHIVE MEMORY 20 =========
  { photo: "images/tt.jpg", date: "Winter", title: "Being with you even when im far", caption: "My Hoodies definitely suit you more than they do me.", note: "warm", hidden: "I cant be happer enough to see my hoodies giving you the warm hug i couldnt give yet being there." },
  // ========= ARCHIVE MEMORY 21 =========
  { photo: "images/lolo.jpg", date: "A brave day", title: "I got exposed", caption: "I believe you know what i am saying", note: "hehehehe", hidden: "Still cant get over them legs TwT." },
  // ========= ARCHIVE MEMORY 22 =========
  { photo: "images/POP.jpg", date: "Exam time", title: "Like a star always shinning bright", caption: "You never fail to make my jaw drop with you snaps.", note: "Pakhiiii", hidden: "PLSSSS REMOVE THE TIMER FOR MEE." },
  // ========= ARCHIVE MEMORY 23 =========
  { photo: "images/FF.jpg", date: "Rickshaw Trip", title: "Your Dedication", caption: "Icant ever get over how passionate you are.", note: "Baking Bosss", hidden: "You can literally go to the ends of earth for your orders. yet that is the very thing that makes you youu." },
  // ========= ARCHIVE MEMORY 24 =========
  { photo: "images/ww.jpg", date: "Hehehe", title: "BOSSMAN", caption: "I Love je ik you might kill me if i annoy you too muchh TwT.", note: "TwT", hidden: "Pls Dont Kill Jannn." },
  // ========= ARCHIVE MEMORY 25 =========
  { photo: "images/poll.jpg", date: "Always", title: "i Love how good are you with babiess", caption: "Babies Love you cuz they know how kind and nice you are(laddu might disagree mair khawar por).", note: "TOO ADOREABLEE", hidden: "I Think i should get babies privilage too from youu.." }
];

// ========= CHANGE REASONS I LOVE YOU HERE =========
const LOVE_REASONS = [
  ["Your heart", "You care very deeply about the people you love."],
  ["Your laugh", "Definitely my fev sound in the entire world."],
  ["Your love", "You my hard days feel all worth it."],
  ["Your Dedication", "Inspires me everytime to be my best too"],
  ["Your smile", "makes my day lit up without fail jaan"],
  ["Your passion", "You keep going, even when things are hard and odds are againt you."],
  ["Your little habits", "All the tiny things that make you completely you."],
  ["Just you", "No explanation needed. It has always been just you jaan."],
];

// ========= CHANGE RANDOM MEMORIES HERE =========
const RANDOM_MEMORIES = [
  ["images/blue.jpeg", "You in Blue"],
  ["images/diva.jpeg", "You being my Diva"],
  ["images/snack.jpeg", "My favourite snack"],
  ["images/boba.jpeg", "Your Love for Bobaa"],
  ["images/val.jpeg", "Our 14th Feb"],
  ["images/smile.jpeg", "That GODDAMN SMILEEEE"],
  ["images/KURTI.jpeg", "You in Kurtiii"],
  ["images/best.jpeg", "This couldnt be better"],
  ["images/yo.jpeg", "Amar yo babesss"],
];

function renderArchive() {
  const timeline = document.getElementById("archive-timeline");
  const reasonsGrid = document.getElementById("reasons-grid");
  const randomGrid = document.getElementById("random-memory-grid");
  if (!timeline || !reasonsGrid || !randomGrid) return;

  timeline.innerHTML = ARCHIVE_MEMORIES.map((memory, index) => `
    <article class="archive-memory">
      <div class="archive-memory__cluster">
        <button class="polaroid archive-polaroid" type="button" aria-expanded="false" aria-label="Flip archive memory ${index + 1}">
          <span class="polaroid__inner">
            <span class="polaroid__front"><span class="tape ${index % 3 === 0 ? "tape--rose" : index % 3 === 1 ? "tape--sage" : "tape--cream"}" aria-hidden="true"></span><img src="${memory.photo}" alt="Replace archive photo ${index + 1}"><span class="polaroid__caption handwritten">${memory.title}<span class="archive-date">${memory.date}</span><span class="archive-caption">${memory.caption}</span></span></span>
            <span class="polaroid__back"><span class="polaroid__back-title handwritten">${memory.title}</span><span>${memory.hidden}</span><span class="polaroid__back-hint">tap to flip back ↺</span></span>
          </span>
        </button>
        <aside class="archive-note handwritten">${memory.note}</aside>
      </div>
      <div class="archive-memory__marker" aria-hidden="true">${index + 1}</div>
    </article>`).join("");

  reasonsGrid.innerHTML = LOVE_REASONS.map(([front, back]) => `<button class="reason-card" type="button" data-front="${front}" data-back="${back}" aria-label="Reveal why I love you: ${front}"><span>${front}</span></button>`).join("");
  randomGrid.innerHTML = RANDOM_MEMORIES.map(([photo, caption], index) => `<article class="mini-memory"><img src="${photo}" alt="Replace random memory photo ${index + 1}"><p class="handwritten">${caption}</p></article>`).join("");

  timeline.querySelectorAll(".polaroid").forEach(bindFlippableCard);
  reasonsGrid.querySelectorAll(".reason-card").forEach((card) => {
    card.addEventListener("click", () => {
      card.classList.toggle("is-flipped");
      card.querySelector("span").textContent = card.classList.contains("is-flipped") ? card.dataset.back : card.dataset.front;
    });
  });
}

function launchConfetti() {
  const colors = ["#c97981", "#f4d9d8", "#f2d181", "#b9cdbd", "#fffaf4"];
  for (let index = 0; index < 42; index += 1) {
    const piece = document.createElement("span");
    piece.className = "confetti-piece";
    piece.style.left = `${42 + Math.random() * 16}%`;
    piece.style.top = `${35 + Math.random() * 18}%`;
    piece.style.backgroundColor = colors[index % colors.length];
    piece.style.setProperty("--confetti-x", `${-240 + Math.random() * 480}px`);
    piece.style.setProperty("--confetti-y", `${-240 + Math.random() * 350}px`);
    piece.style.animationDelay = `${Math.random() * 150}ms`;
    document.body.appendChild(piece);
    window.setTimeout(() => piece.remove(), 1250);
  }
}

function setUpScrollAnimations() {
  const elements = document.querySelectorAll(".memory-cluster, .archive-section, .archive-hero");
  if (!("IntersectionObserver" in window)) {
    elements.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });
  elements.forEach((element) => observer.observe(element));
}

/* Draw content once so every page is ready when it opens. */
drawPuzzle();
renderArchive();
setUpScrollAnimations();
