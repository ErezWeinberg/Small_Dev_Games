const cells = document.querySelectorAll(".cell");
const statusText = document.getElementById("status");
const restartBtn = document.getElementById("restartBtn");
const scoreXElement = document.getElementById("score-x");
const scoreOElement = document.getElementById("score-o");

let board = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X";
let isGameActive = true;
let scoreX = 0;
let scoreO = 0;

const winningConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

function initializeGame() {
    cells.forEach(cell => cell.addEventListener("click", cellClicked));
    restartBtn.addEventListener("click", restartGame);
    statusText.textContent = "Your Turn!";
}

function cellClicked() {
    const cellIndex = this.getAttribute("data-index");

    if (board[cellIndex] !== "" || !isGameActive || currentPlayer !== "X") {
        return;
    }

    updateCell(this, cellIndex);
    checkWinner();

    if(isGameActive) {
        currentPlayer = "O";
        statusText.textContent = "AI is thinking...";
        setTimeout(aiMove, 600);
    }
}

function updateCell(cell, index) {
    board[index] = currentPlayer;
    cell.textContent = currentPlayer;
    cell.classList.add(currentPlayer.toLowerCase());
}

function aiMove() {
    if (!isGameActive) return;

    // 1. Try to win
    let move = findBestMove("O");
    
    // 2. Try to block X
    if (move === -1) {
        move = findBestMove("X");
    }

    // 3. Take center
    if (move === -1 && board[4] === "") {
        move = 4;
    }

    // 4. Random move
    if (move === -1) {
        let available = [];
        board.forEach((cell, index) => {
            if (cell === "") available.push(index);
        });
        if(available.length > 0) {
            move = available[Math.floor(Math.random() * available.length)];
        }
    }

    if (move !== -1) {
        const cell = document.querySelector(`.cell[data-index="${move}"]`);
        updateCell(cell, move);
        checkWinner();
    }
    
    if(isGameActive) {
        currentPlayer = "X";
        statusText.textContent = "Your Turn!";
    }
}

function findBestMove(playerSymbol) {
    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        if (board[a] === playerSymbol && board[b] === playerSymbol && board[c] === "") return c;
        if (board[a] === playerSymbol && board[c] === playerSymbol && board[b] === "") return b;
        if (board[b] === playerSymbol && board[c] === playerSymbol && board[a] === "") return a;
    }
    return -1;
}

function checkWinner() {
    let roundWon = false;

    for (let i = 0; i < winningConditions.length; i++) {
        const condition = winningConditions[i];
        const cellA = board[condition[0]];
        const cellB = board[condition[1]];
        const cellC = board[condition[2]];

        if (cellA === "" || cellB === "" || cellC === "") {
            continue;
        }
        if (cellA === cellB && cellB === cellC) {
            roundWon = true;
            break;
        }
    }

    if (roundWon) {
        statusText.textContent = currentPlayer === "X" ? "You Win!" : "AI Wins!";
        isGameActive = false;
        if(currentPlayer === "X") {
            scoreX++;
            scoreXElement.textContent = scoreX;
        } else {
            scoreO++;
            scoreOElement.textContent = scoreO;
        }
    } else if (!board.includes("")) {
        statusText.textContent = "Draw!";
        isGameActive = false;
    }
}

function restartGame() {
    currentPlayer = "X";
    board = ["", "", "", "", "", "", "", "", ""];
    statusText.textContent = "Your Turn!";
    cells.forEach(cell => {
        cell.textContent = "";
        cell.classList.remove("x", "o");
    });
    isGameActive = true;
}

initializeGame();
