const boardElement = document.getElementById("board");
const minesLeftElement = document.getElementById("mines-left");
const timerElement = document.getElementById("timer");
const statusText = document.getElementById("status");
const restartBtn = document.getElementById("restartBtn");

const ROWS = 9;
const COLS = 9;
const TOTAL_MINES = 10;

let grid = [];
let gameOver = false;
let flagsPlaced = 0;
let revealedCount = 0;
let timer = 0;
let timerInterval = null;
let firstClick = true;

function initGame() {
    clearInterval(timerInterval);
    timer = 0;
    timerElement.textContent = "0";
    flagsPlaced = 0;
    revealedCount = 0;
    gameOver = false;
    firstClick = true;
    minesLeftElement.textContent = TOTAL_MINES;
    statusText.textContent = "Left-click to reveal, Right-click to flag 🚩";
    boardElement.innerHTML = "";
    grid = [];

    for (let r = 0; r < ROWS; r++) {
        const row = [];
        for (let c = 0; c < COLS; c++) {
            const cellElement = document.createElement("div");
            cellElement.classList.add("cell");
            cellElement.addEventListener("click", () => handleReveal(r, c));
            cellElement.addEventListener("contextmenu", e => {
                e.preventDefault();
                handleFlag(r, c);
            });

            boardElement.appendChild(cellElement);
            row.push({
                r,
                c,
                mine: false,
                revealed: false,
                flagged: false,
                neighborMines: 0,
                element: cellElement
            });
        }
        grid.push(row);
    }
}

function placeMines(safeR, safeC) {
    let placed = 0;
    while (placed < TOTAL_MINES) {
        const r = Math.floor(Math.random() * ROWS);
        const c = Math.floor(Math.random() * COLS);
        if (Math.abs(r - safeR) <= 1 && Math.abs(c - safeC) <= 1) continue;
        if (!grid[r][c].mine) {
            grid[r][c].mine = true;
            placed++;
        }
    }

    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (!grid[r][c].mine) {
                grid[r][c].neighborMines = countNeighborMines(r, c);
            }
        }
    }
}

function countNeighborMines(r, c) {
    let count = 0;
    for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && grid[nr][nc].mine) {
                count++;
            }
        }
    }
    return count;
}

function handleReveal(r, c) {
    if (gameOver) return;
    const cell = grid[r][c];
    if (cell.revealed || cell.flagged) return;

    if (firstClick) {
        firstClick = false;
        placeMines(r, c);
        timerInterval = setInterval(() => {
            timer++;
            timerElement.textContent = timer;
        }, 1000);
    }

    if (cell.mine) {
        triggerGameOver(false);
        return;
    }

    revealCell(r, c);

    if (revealedCount === ROWS * COLS - TOTAL_MINES) {
        triggerGameOver(true);
    }
}

function revealCell(r, c) {
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return;
    const cell = grid[r][c];
    if (cell.revealed || cell.flagged || cell.mine) return;

    cell.revealed = true;
    revealedCount++;
    cell.element.classList.add("revealed");

    if (cell.neighborMines > 0) {
        cell.element.textContent = cell.neighborMines;
        cell.element.classList.add(`n${cell.neighborMines}`);
    } else {
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr !== 0 || dc !== 0) {
                    revealCell(r + dr, c + dc);
                }
            }
        }
    }
}

function handleFlag(r, c) {
    if (gameOver) return;
    const cell = grid[r][c];
    if (cell.revealed) return;

    if (!cell.flagged && flagsPlaced >= TOTAL_MINES) return;

    cell.flagged = !cell.flagged;
    cell.element.classList.toggle("flagged", cell.flagged);
    cell.element.textContent = cell.flagged ? "🚩" : "";
    flagsPlaced += cell.flagged ? 1 : -1;
    minesLeftElement.textContent = TOTAL_MINES - flagsPlaced;
}

function triggerGameOver(won) {
    gameOver = true;
    clearInterval(timerInterval);

    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const cell = grid[r][c];
            if (cell.mine) {
                cell.element.classList.add("revealed", "mine");
                cell.element.textContent = won ? "🚩" : "💣";
            }
        }
    }

    statusText.textContent = won
        ? `🎉 You Cleared the Field in ${timer}s!`
        : "💥 BOOM! Game Over.";
}

restartBtn.addEventListener("click", initGame);

initGame();
