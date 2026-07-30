const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreElement = document.getElementById("score");
const highScoreElement = document.getElementById("high-score");

// Grid settings
const gridSize = 20;
const tileCount = canvas.width / gridSize;

// Game state
let snake = [
    { x: 10, y: 10 }
];
let food = { x: 15, y: 15 };
let dx = 0;
let dy = 0;
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
highScoreElement.textContent = highScore;

let gameLoopTimeout;
let speed = 120;
let changingDirection = false;

document.addEventListener("keydown", changeDirection);

function gameLoop() {
    update();
    draw();
    gameLoopTimeout = setTimeout(gameLoop, speed);
}

function update() {
    changingDirection = false;
    
    // If not moving, don't update body
    if (dx === 0 && dy === 0) return;

    // Calculate new head position
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };

    // Wall collision
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        gameOver();
        return;
    }

    // Self collision
    for (let i = 0; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            gameOver();
            return;
        }
    }

    snake.unshift(head); // Add new head

    // Check food collision
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreElement.textContent = score;
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('snakeHighScore', highScore);
            highScoreElement.textContent = highScore;
        }
        spawnFood();
        // Slightly increase speed
        if(speed > 60) speed -= 2; 
    } else {
        snake.pop(); // Remove tail if no food eaten
    }
}

function drawRect(x, y, color, glowColor) {
    ctx.fillStyle = color;
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 10;
    // Draw slightly smaller to see grid lines
    ctx.fillRect(x * gridSize + 1, y * gridSize + 1, gridSize - 2, gridSize - 2);
    ctx.shadowBlur = 0;
}

function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid lines (optional, for cyber feel)
    ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
    for(let i=0; i<=tileCount; i++) {
        ctx.beginPath();
        ctx.moveTo(i*gridSize, 0);
        ctx.lineTo(i*gridSize, canvas.height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i*gridSize);
        ctx.lineTo(canvas.width, i*gridSize);
        ctx.stroke();
    }

    // Draw food first
    drawRect(food.x, food.y, "#00e5ff", "#00e5ff");

    // Draw snake
    snake.forEach((part, index) => {
        // Head is brighter
        const color = index === 0 ? "#b300ff" : "#8000ff";
        const glow = index === 0 ? "#b300ff" : "transparent";
        drawRect(part.x, part.y, color, glow);
    });
}

function spawnFood() {
    let valid = false;
    while (!valid) {
        food = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
        valid = true;
        // Check if food spawned on snake
        for (let part of snake) {
            if (part.x === food.x && part.y === food.y) {
                valid = false;
                break;
            }
        }
    }
}

function changeDirection(event) {
    if (changingDirection) return;
    
    const LEFT_KEY = 37;
    const RIGHT_KEY = 39;
    const UP_KEY = 38;
    const DOWN_KEY = 40;
    
    const W = 87;
    const A = 65;
    const S = 83;
    const D = 68;

    const keyPressed = event.keyCode;
    const goingUp = dy === -1;
    const goingDown = dy === 1;
    const goingRight = dx === 1;
    const goingLeft = dx === -1;

    // Prevent scrolling
    if([37, 38, 39, 40, 32].includes(keyPressed)) {
        event.preventDefault();
    }

    if ((keyPressed === LEFT_KEY || keyPressed === A) && !goingRight) {
        dx = -1;
        dy = 0;
        changingDirection = true;
    }
    if ((keyPressed === UP_KEY || keyPressed === W) && !goingDown) {
        dx = 0;
        dy = -1;
        changingDirection = true;
    }
    if ((keyPressed === RIGHT_KEY || keyPressed === D) && !goingLeft) {
        dx = 1;
        dy = 0;
        changingDirection = true;
    }
    if ((keyPressed === DOWN_KEY || keyPressed === S) && !goingUp) {
        dx = 0;
        dy = 1;
        changingDirection = true;
    }
}

function gameOver() {
    // Reset game
    snake = [{ x: 10, y: 10 }];
    dx = 0;
    dy = 0;
    score = 0;
    speed = 120;
    scoreElement.textContent = score;
    spawnFood();
}

// Init
spawnFood();
gameLoop();
