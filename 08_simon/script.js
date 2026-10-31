const pads = document.querySelectorAll(".pad");
const startBtn = document.getElementById("startBtn");
const statusText = document.getElementById("status");
const levelElement = document.getElementById("level");
const bestElement = document.getElementById("best");

const FREQUENCIES = [329.63, 261.63, 220.0, 164.81]; // E4, C4, A3, E3
const KEYS = { q: 0, w: 1, a: 2, s: 3 };

let audioCtx = null;
let sequence = [];
let playerIndex = 0;
let acceptingInput = false;
let best = parseInt(localStorage.getItem("neonSimonBest")) || 0;
bestElement.textContent = best;

function getAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === "suspended") audioCtx.resume();
    return audioCtx;
}

function playTone(freq, duration, type = "sine") {
    const ctx = getAudio();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
}

function flashPad(index, duration = 400) {
    const pad = pads[index];
    pad.classList.add("active");
    playTone(FREQUENCIES[index], duration / 1000);
    return new Promise(resolve => {
        setTimeout(() => {
            pad.classList.remove("active");
            resolve();
        }, duration);
    });
}

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function startGame() {
    getAudio();
    sequence = [];
    startBtn.disabled = true;
    nextRound();
}

async function nextRound() {
    acceptingInput = false;
    playerIndex = 0;
    sequence.push(Math.floor(Math.random() * 4));
    levelElement.textContent = sequence.length;
    statusText.textContent = "Watch...";

    // Speed up as levels increase
    const speed = Math.max(180, 450 - sequence.length * 15);

    await wait(700);
    for (const index of sequence) {
        await flashPad(index, speed);
        await wait(speed / 3);
    }

    statusText.textContent = "Your turn!";
    acceptingInput = true;
}

async function handleInput(index) {
    if (!acceptingInput) return;

    flashPad(index, 250);

    if (index !== sequence[playerIndex]) {
        gameOver();
        return;
    }

    playerIndex++;

    if (playerIndex === sequence.length) {
        acceptingInput = false;
        statusText.textContent = "Nice!";
        nextRound();
    }
}

function gameOver() {
    acceptingInput = false;
    const score = sequence.length - 1;
    playTone(110, 0.8, "sawtooth");

    if (score > best) {
        best = score;
        localStorage.setItem("neonSimonBest", best);
        bestElement.textContent = best;
        statusText.textContent = `New record: ${score}! Press START`;
    } else {
        statusText.textContent = `Game Over! Score: ${score}`;
    }

    pads.forEach(p => p.classList.add("active"));
    setTimeout(() => pads.forEach(p => p.classList.remove("active")), 400);

    startBtn.disabled = false;
}

pads.forEach(pad => {
    pad.addEventListener("click", () => handleInput(parseInt(pad.dataset.color)));
});

document.addEventListener("keydown", e => {
    const index = KEYS[e.key.toLowerCase()];
    if (index !== undefined) handleInput(index);
});

startBtn.addEventListener("click", startGame);
