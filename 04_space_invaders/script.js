const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreElement = document.getElementById("score");
const levelElement = document.getElementById("level");

let score = 0;
let level = 1;

// Player
const player = {
    x: canvas.width / 2 - 20,
    y: canvas.height - 40,
    width: 40,
    height: 15,
    color: "#00ffcc",
    speed: 5,
    dx: 0
};

// Bullets
let bullets = [];
const bulletSpeed = 7;
const bulletColor = "#ff00ff";

// Enemies
let enemies = [];
const enemyRowCount = 4;
const enemyColumnCount = 8;
const enemyWidth = 40;
const enemyHeight = 20;
const enemyPadding = 25;
const enemyOffsetTop = 50;
const enemyOffsetLeft = 140;
let enemySpeedX = 2;
let enemySpeedY = 20;
let enemyDirection = 1; // 1 for right, -1 for left

const enemyColors = ["#ff00ff", "#00e5ff", "#00ff00", "#ffff00"];

function initEnemies() {
    enemies = [];
    for (let c = 0; c < enemyColumnCount; c++) {
        for (let r = 0; r < enemyRowCount; r++) {
            enemies.push({
                x: (c * (enemyWidth + enemyPadding)) + enemyOffsetLeft,
                y: (r * (enemyHeight + enemyPadding)) + enemyOffsetTop,
                width: enemyWidth,
                height: enemyHeight,
                color: enemyColors[r % enemyColors.length],
                status: 1
            });
        }
    }
}
initEnemies();

// Controls
document.addEventListener("keydown", keyDownHandler);
document.addEventListener("keyup", keyUpHandler);

function keyDownHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        player.dx = player.speed;
    } else if (e.key === "Left" || e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        player.dx = -player.speed;
    } else if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        shoot();
    }
}

function keyUpHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        if (player.dx === player.speed) player.dx = 0;
    } else if (e.key === "Left" || e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        if (player.dx === -player.speed) player.dx = 0;
    }
}

function shoot() {
    // limit bullets
    if (bullets.length < 5) {
        bullets.push({
            x: player.x + player.width / 2 - 2,
            y: player.y - 10,
            width: 4,
            height: 15
        });
    }
}

function drawRect(x, y, w, h, color, blur = 15) {
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = blur;
    ctx.fill();
    ctx.closePath();
    ctx.shadowBlur = 0;
}

function drawPlayer() {
    drawRect(player.x, player.y, player.width, player.height, player.color);
    // Draw a little cannon
    drawRect(player.x + player.width/2 - 4, player.y - 10, 8, 10, player.color);
}

function drawEnemies() {
    enemies.forEach(enemy => {
        if (enemy.status === 1) {
            drawRect(enemy.x, enemy.y, enemy.width, enemy.height, enemy.color);
        }
    });
}

function drawBullets() {
    bullets.forEach(b => {
        drawRect(b.x, b.y, b.width, b.height, bulletColor, 10);
    });
}

function updateEnemies() {
    let edgeHit = false;
    enemies.forEach(enemy => {
        if (enemy.status === 1) {
            enemy.x += enemySpeedX * enemyDirection;
            if (enemy.x + enemy.width > canvas.width - 20 || enemy.x < 20) {
                edgeHit = true;
            }
        }
    });

    if (edgeHit) {
        enemyDirection *= -1;
        let lowestY = 0;
        enemies.forEach(enemy => {
            if (enemy.status === 1) {
                enemy.y += enemySpeedY;
                if(enemy.y > lowestY) lowestY = enemy.y;
            }
        });
        
        // Game over if enemies reach player
        if(lowestY > player.y - enemyHeight) {
            alert("GAME OVER! Earth was invaded.");
            document.location.reload();
        }
    }
}

function updateBulletsAndCollisions() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        let b = bullets[i];
        b.y -= bulletSpeed;

        // Remove off-screen bullets
        if (b.y < 0) {
            bullets.splice(i, 1);
            continue;
        }

        // Collision with enemies
        for (let j = 0; j < enemies.length; j++) {
            let e = enemies[j];
            if (e.status === 1) {
                if (b.x > e.x && b.x < e.x + e.width && b.y > e.y && b.y < e.y + e.height) {
                    e.status = 0;
                    bullets.splice(i, 1);
                    score += 10;
                    scoreElement.textContent = score;
                    checkLevelClear();
                    break;
                }
            }
        }
    }
}

function checkLevelClear() {
    let allDead = true;
    for(let e of enemies) {
        if(e.status === 1) {
            allDead = false;
            break;
        }
    }
    
    if(allDead) {
        level++;
        levelElement.textContent = level;
        enemySpeedX += 0.5;
        initEnemies();
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    player.x += player.dx;
    if(player.x < 0) player.x = 0;
    if(player.x + player.width > canvas.width) player.x = canvas.width - player.width;

    updateEnemies();
    updateBulletsAndCollisions();

    drawPlayer();
    drawEnemies();
    drawBullets();

    requestAnimationFrame(draw);
}

draw();
