const canvas = document.getElementById('pong-canvas');
const ctx = canvas.getContext('2d');

const playerScoreElem = document.getElementById('player-score');
const aiScoreElem = document.getElementById('ai-score');

// Game objects
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 8,
    speed: 7,
    velocityX: 7,
    velocityY: 7,
    color: '#fff'
};

const player = {
    x: 20,
    y: canvas.height / 2 - 50,
    width: 10,
    height: 100,
    color: '#00ffcc',
    score: 0,
    dy: 0,
    speed: 8
};

const ai = {
    x: canvas.width - 30,
    y: canvas.height / 2 - 50,
    width: 10,
    height: 100,
    color: '#ff0055',
    score: 0,
    speed: 6.5
};

const net = {
    x: canvas.width / 2 - 1,
    y: 0,
    width: 2,
    height: 15,
    color: 'rgba(255,255,255,0.2)'
};

// Draw functions
function drawRect(x, y, w, h, color, isNeon = false) {
    ctx.fillStyle = color;
    if (isNeon) {
        ctx.shadowColor = color;
        ctx.shadowBlur = 15;
    } else {
        ctx.shadowBlur = 0;
    }
    ctx.fillRect(x, y, w, h);
    ctx.shadowBlur = 0; // reset
}

function drawArc(x, y, r, color) {
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0; // reset
}

function drawNet() {
    for (let i = 0; i <= canvas.height; i += 30) {
        drawRect(net.x, net.y + i, net.width, net.height, net.color);
    }
}

// Controls
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        player.dy = -player.speed;
    } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        player.dy = player.speed;
    }
});

document.addEventListener('keyup', (e) => {
    if (
        e.key === 'ArrowUp' || e.key === 'ArrowDown' || 
        e.key === 'w' || e.key === 'W' || 
        e.key === 's' || e.key === 'S'
    ) {
        player.dy = 0;
    }
});

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.speed = 7;
    ball.velocityX = -Math.sign(ball.velocityX) * ball.speed;
    ball.velocityY = (Math.random() * 2 - 1) * ball.speed;
}

function collision(b, p) {
    b.top = b.y - b.radius;
    b.bottom = b.y + b.radius;
    b.left = b.x - b.radius;
    b.right = b.x + b.radius;

    p.top = p.y;
    p.bottom = p.y + p.height;
    p.left = p.x;
    p.right = p.x + p.width;

    return b.right > p.left && b.bottom > p.top && b.left < p.right && b.top < p.bottom;
}

function update() {
    // Move player
    player.y += player.dy;
    
    // Player boundary
    if(player.y < 0) player.y = 0;
    if(player.y + player.height > canvas.height) player.y = canvas.height - player.height;

    // Simple AI
    let aiLevel = 0.1;
    ai.y += (ball.y - (ai.y + ai.height / 2)) * aiLevel;
    
    // AI boundary
    if(ai.y < 0) ai.y = 0;
    if(ai.y + ai.height > canvas.height) ai.y = canvas.height - ai.height;

    // Move ball
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;

    // Ball wall collision (top and bottom)
    if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
        ball.velocityY = -ball.velocityY;
    }

    // Determine which paddle
    let paddle = (ball.x < canvas.width / 2) ? player : ai;

    // Ball paddle collision
    if (collision(ball, paddle)) {
        // Calculate hit point
        let collidePoint = ball.y - (paddle.y + paddle.height / 2);
        
        // Normalize hit point
        collidePoint = collidePoint / (paddle.height / 2);

        // Calculate angle (max 45 deg)
        let angleRad = collidePoint * Math.PI / 4;

        // Change direction
        let direction = (ball.x < canvas.width / 2) ? 1 : -1;
        
        ball.velocityX = direction * ball.speed * Math.cos(angleRad);
        ball.velocityY = ball.speed * Math.sin(angleRad);

        // Increase speed
        ball.speed += 0.5;
    }

    // Scoring
    if (ball.x - ball.radius < 0) {
        ai.score++;
        aiScoreElem.innerText = ai.score;
        resetBall();
    } else if (ball.x + ball.radius > canvas.width) {
        player.score++;
        playerScoreElem.innerText = player.score;
        resetBall();
    }
}

function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawNet();
    
    // Draw paddles with neon effect
    drawRect(player.x, player.y, player.width, player.height, player.color, true);
    drawRect(ai.x, ai.y, ai.width, ai.height, ai.color, true);
    
    // Draw ball with neon effect
    drawArc(ball.x, ball.y, ball.radius, ball.color);
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start game
gameLoop();
