const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreElement = document.getElementById("score");
const livesElement = document.getElementById("lives");

let score = 0;
let lives = 3;

// Paddle
const paddleWidth = 100;
const paddleHeight = 12;
let paddleX = (canvas.width - paddleWidth) / 2;
const paddleColor = "#00e5ff";

// Ball
let ballRadius = 8;
let x = canvas.width / 2;
let y = canvas.height - 30;
let dx = 4;
let dy = -4;
const ballColor = "#ff00ff";

// Bricks
const brickRowCount = 5;
const brickColumnCount = 9;
const brickWidth = 75;
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = 40;
const brickOffsetLeft = 23; // Centered
let bricks = [];

const colors = ["#ff00ff", "#00e5ff", "#00ff00", "#ffff00", "#ff0000"];

function initBricks() {
    bricks = [];
    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRowCount; r++) {
            bricks[c][r] = { x: 0, y: 0, status: 1, color: colors[r] };
        }
    }
}
initBricks();

// Controls
let rightPressed = false;
let leftPressed = false;

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
document.addEventListener("mousemove", mouseMoveHandler, false);

function keyDownHandler(e) {
    if (e.key == "Right" || e.key == "ArrowRight" || e.key == "d" || e.key == "D") {
        rightPressed = true;
    } else if (e.key == "Left" || e.key == "ArrowLeft" || e.key == "a" || e.key == "A") {
        leftPressed = true;
    }
}

function keyUpHandler(e) {
    if (e.key == "Right" || e.key == "ArrowRight" || e.key == "d" || e.key == "D") {
        rightPressed = false;
    } else if (e.key == "Left" || e.key == "ArrowLeft" || e.key == "a" || e.key == "A") {
        leftPressed = false;
    }
}

function mouseMoveHandler(e) {
    const relativeX = e.clientX - canvas.getBoundingClientRect().left;
    // scale to canvas internal width
    const scale = canvas.width / canvas.getBoundingClientRect().width;
    const canvasX = relativeX * scale;
    
    if (canvasX > 0 && canvasX < canvas.width) {
        paddleX = canvasX - paddleWidth / 2;
    }
}

function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            let b = bricks[c][r];
            if (b.status == 1) {
                if (x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {
                    dy = -dy;
                    b.status = 0;
                    score++;
                    scoreElement.textContent = score;
                    
                    // Increase speed slightly
                    dx += Math.sign(dx) * 0.1;
                    dy += Math.sign(dy) * 0.1;

                    if (score === brickRowCount * brickColumnCount) {
                        alert("YOU WIN, CONGRATULATIONS!");
                        document.location.reload();
                    }
                }
            }
        }
    }
}

function drawRect(x, y, w, h, color) {
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 15;
    ctx.fill();
    ctx.closePath();
    ctx.shadowBlur = 0;
}

function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = ballColor;
    ctx.shadowColor = ballColor;
    ctx.shadowBlur = 15;
    ctx.fill();
    ctx.closePath();
    ctx.shadowBlur = 0;
}

function drawPaddle() {
    drawRect(paddleX, canvas.height - paddleHeight - 10, paddleWidth, paddleHeight, paddleColor);
}

function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status == 1) {
                let brickX = (c * (brickWidth + brickPadding)) + brickOffsetLeft;
                let brickY = (r * (brickHeight + brickPadding)) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                drawRect(brickX, brickY, brickWidth, brickHeight, bricks[c][r].color);
            }
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawBall();
    drawPaddle();
    collisionDetection();

    // Wall bounce
    if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
        dx = -dx;
    }
    if (y + dy < ballRadius) {
        dy = -dy;
    } else if (y + dy > canvas.height - ballRadius - 10) {
        if (x > paddleX && x < paddleX + paddleWidth) {
            // Paddle hit logic, change angle based on hit location
            let hitPoint = x - (paddleX + paddleWidth/2);
            dx = hitPoint * 0.15; // adjust angle
            dy = -dy;
        } else if (y + dy > canvas.height - ballRadius) {
            lives--;
            livesElement.textContent = lives;
            if (!lives) {
                alert("GAME OVER");
                document.location.reload();
            } else {
                x = canvas.width / 2;
                y = canvas.height - 30;
                dx = 4 * (Math.random() > 0.5 ? 1 : -1);
                dy = -4;
                paddleX = (canvas.width - paddleWidth) / 2;
            }
        }
    }

    if (rightPressed && paddleX < canvas.width - paddleWidth) {
        paddleX += 7;
    } else if (leftPressed && paddleX > 0) {
        paddleX -= 7;
    }

    x += dx;
    y += dy;
    requestAnimationFrame(draw);
}

draw();
