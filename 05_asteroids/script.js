const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreElement = document.getElementById("score");
const livesElement = document.getElementById("lives");

let score = 0;
let lives = 3;

const FPS = 60;
const FRICTION = 0.7; // friction coefficient of space (0 = no friction, 1 = lots)
const SHIP_THRUST = 5; // acceleration
const SHIP_SIZE = 20; // ship height
const TURN_SPEED = 360; // turn speed in deg per sec
const ASTEROID_NUM = 5;
const ASTEROID_SIZE = 80;
const ASTEROID_SPD = 50;
const LASER_MAX = 10;
const LASER_SPD = 500; // px per sec
const LASER_DIST = 0.6; // max distance laser can travel as fraction of screen width

let ship = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    r: SHIP_SIZE / 2,
    a: 90 / 180 * Math.PI, // convert to radians
    rot: 0,
    thrusting: false,
    thrust: { x: 0, y: 0 },
    lasers: []
};

let asteroids = [];

function createAsteroids() {
    asteroids = [];
    let x, y;
    for (let i = 0; i < ASTEROID_NUM; i++) {
        do {
            x = Math.floor(Math.random() * canvas.width);
            y = Math.floor(Math.random() * canvas.height);
        } while (distBetweenPoints(ship.x, ship.y, x, y) < ASTEROID_SIZE * 2 + ship.r);
        asteroids.push(newAsteroid(x, y, Math.ceil(ASTEROID_SIZE / 2)));
    }
}

function newAsteroid(x, y, r) {
    let lvlMult = 1 + 0.1 * score/100;
    let roff = {
        x: x,
        y: y,
        xv: Math.random() * ASTEROID_SPD * lvlMult / FPS * (Math.random() < 0.5 ? 1 : -1),
        yv: Math.random() * ASTEROID_SPD * lvlMult / FPS * (Math.random() < 0.5 ? 1 : -1),
        r: r,
        a: Math.random() * Math.PI * 2,
        vert: Math.floor(Math.random() * (10 + 1) + 5),
        offs: []
    };
    for(let i=0; i<roff.vert; i++){
        roff.offs.push(Math.random() * 0.4 + 0.8);
    }
    return roff;
}

function distBetweenPoints(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

createAsteroids();

document.addEventListener("keydown", keyDown);
document.addEventListener("keyup", keyUp);

function keyDown(e) {
    if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"," "].includes(e.key)){
        e.preventDefault();
    }
    switch (e.key) {
        case "ArrowLeft":
            ship.rot = TURN_SPEED / 180 * Math.PI / FPS;
            break;
        case "ArrowRight":
            ship.rot = -TURN_SPEED / 180 * Math.PI / FPS;
            break;
        case "ArrowUp":
            ship.thrusting = true;
            break;
        case " ":
            shootLaser();
            break;
    }
}

function keyUp(e) {
    switch (e.key) {
        case "ArrowLeft":
        case "ArrowRight":
            ship.rot = 0;
            break;
        case "ArrowUp":
            ship.thrusting = false;
            break;
    }
}

function shootLaser() {
    if (ship.lasers.length < LASER_MAX) {
        ship.lasers.push({
            x: ship.x + 4 / 3 * ship.r * Math.cos(ship.a),
            y: ship.y - 4 / 3 * ship.r * Math.sin(ship.a),
            xv: LASER_SPD * Math.cos(ship.a) / FPS,
            yv: -LASER_SPD * Math.sin(ship.a) / FPS,
            dist: 0
        });
    }
}

function resetShip() {
    ship.x = canvas.width / 2;
    ship.y = canvas.height / 2;
    ship.a = 90 / 180 * Math.PI;
    ship.thrust.x = 0;
    ship.thrust.y = 0;
}

function update() {
    // Ship thrust
    if (ship.thrusting) {
        ship.thrust.x += SHIP_THRUST * Math.cos(ship.a) / FPS;
        ship.thrust.y -= SHIP_THRUST * Math.sin(ship.a) / FPS;
    } else {
        ship.thrust.x -= FRICTION * ship.thrust.x / FPS;
        ship.thrust.y -= FRICTION * ship.thrust.y / FPS;
    }

    // Ship move
    ship.x += ship.thrust.x;
    ship.y += ship.thrust.y;
    ship.a += ship.rot;

    // Screen wrap ship
    if (ship.x < 0 - ship.r) ship.x = canvas.width + ship.r;
    else if (ship.x > canvas.width + ship.r) ship.x = 0 - ship.r;
    
    if (ship.y < 0 - ship.r) ship.y = canvas.height + ship.r;
    else if (ship.y > canvas.height + ship.r) ship.y = 0 - ship.r;

    // Move lasers
    for (let i = ship.lasers.length - 1; i >= 0; i--) {
        ship.lasers[i].x += ship.lasers[i].xv;
        ship.lasers[i].y += ship.lasers[i].yv;
        ship.lasers[i].dist += Math.sqrt(Math.pow(ship.lasers[i].xv, 2) + Math.pow(ship.lasers[i].yv, 2));

        if (ship.lasers[i].x < 0) ship.lasers[i].x = canvas.width;
        else if (ship.lasers[i].x > canvas.width) ship.lasers[i].x = 0;
        if (ship.lasers[i].y < 0) ship.lasers[i].y = canvas.height;
        else if (ship.lasers[i].y > canvas.height) ship.lasers[i].y = 0;

        if (ship.lasers[i].dist > canvas.width * LASER_DIST) {
            ship.lasers.splice(i, 1);
            continue;
        }
    }

    // Move asteroids
    let a, b, ax, ay, ar, lx, ly;
    for (let i = asteroids.length - 1; i >= 0; i--) {
        a = asteroids[i];
        a.x += a.xv;
        a.y += a.yv;

        // screen wrap asteroids
        if (a.x < 0 - a.r) a.x = canvas.width + a.r;
        else if (a.x > canvas.width + a.r) a.x = 0 - a.r;
        if (a.y < 0 - a.r) a.y = canvas.height + a.r;
        else if (a.y > canvas.height + a.r) a.y = 0 - a.r;

        // Collision: laser hits asteroid
        for(let j = ship.lasers.length - 1; j >= 0; j--) {
            lx = ship.lasers[j].x;
            ly = ship.lasers[j].y;
            if (distBetweenPoints(a.x, a.y, lx, ly) < a.r) {
                // Destroy asteroid
                ship.lasers.splice(j, 1);
                
                score += 20;
                scoreElement.textContent = score;

                let r = a.r;
                let x = a.x;
                let y = a.y;
                asteroids.splice(i, 1);

                // Split if large enough
                if(r > Math.ceil(ASTEROID_SIZE / 4)) {
                    asteroids.push(newAsteroid(x, y, r / 2));
                    asteroids.push(newAsteroid(x, y, r / 2));
                }
                
                if(asteroids.length == 0){
                    createAsteroids();
                }

                break;
            }
        }
        
        // Collision: ship hits asteroid
        if (distBetweenPoints(ship.x, ship.y, a.x, a.y) < ship.r + a.r) {
            lives--;
            livesElement.textContent = lives;
            if (lives <= 0) {
                alert("GAME OVER!");
                document.location.reload();
            } else {
                resetShip();
                createAsteroids(); // reset asteroids as well
                break;
            }
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw asteroids
    ctx.strokeStyle = "#ffaa00";
    ctx.lineWidth = 2;
    ctx.shadowColor = "#ffaa00";
    ctx.shadowBlur = 10;
    
    let a, x, y, r, a_angle, vert, offs;
    for (let i = 0; i < asteroids.length; i++) {
        a = asteroids[i];
        x = a.x;
        y = a.y;
        r = a.r;
        a_angle = a.a;
        vert = a.vert;
        offs = a.offs;
        
        ctx.beginPath();
        for (let j = 0; j < vert; j++) {
            ctx.lineTo(
                x + r * offs[j] * Math.cos(a_angle + j * Math.PI * 2 / vert),
                y + r * offs[j] * Math.sin(a_angle + j * Math.PI * 2 / vert)
            );
        }
        ctx.closePath();
        ctx.stroke();
    }

    // Draw ship
    ctx.strokeStyle = "#00ffcc";
    ctx.shadowColor = "#00ffcc";
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.moveTo(
        ship.x + 4 / 3 * ship.r * Math.cos(ship.a),
        ship.y - 4 / 3 * ship.r * Math.sin(ship.a)
    );
    ctx.lineTo(
        ship.x - ship.r * (2 / 3 * Math.cos(ship.a) + Math.sin(ship.a)),
        ship.y + ship.r * (2 / 3 * Math.sin(ship.a) - Math.cos(ship.a))
    );
    ctx.lineTo(
        ship.x - ship.r * (2 / 3 * Math.cos(ship.a) - Math.sin(ship.a)),
        ship.y + ship.r * (2 / 3 * Math.sin(ship.a) + Math.cos(ship.a))
    );
    ctx.closePath();
    ctx.stroke();

    // Draw thruster
    if (ship.thrusting) {
        ctx.fillStyle = "#ffaa00";
        ctx.shadowColor = "#ff0000";
        ctx.beginPath();
        ctx.moveTo(
            ship.x - ship.r * (2 / 3 * Math.cos(ship.a) + 0.5 * Math.sin(ship.a)),
            ship.y + ship.r * (2 / 3 * Math.sin(ship.a) - 0.5 * Math.cos(ship.a))
        );
        ctx.lineTo(
            ship.x - ship.r * 5 / 3 * Math.cos(ship.a),
            ship.y + ship.r * 5 / 3 * Math.sin(ship.a)
        );
        ctx.lineTo(
            ship.x - ship.r * (2 / 3 * Math.cos(ship.a) - 0.5 * Math.sin(ship.a)),
            ship.y + ship.r * (2 / 3 * Math.sin(ship.a) + 0.5 * Math.cos(ship.a))
        );
        ctx.closePath();
        ctx.fill();
    }

    // Draw lasers
    ctx.fillStyle = "#ff00ff";
    ctx.shadowColor = "#ff00ff";
    ctx.shadowBlur = 10;
    for (let i = 0; i < ship.lasers.length; i++) {
        ctx.beginPath();
        ctx.arc(ship.lasers[i].x, ship.lasers[i].y, 3, 0, Math.PI * 2, false);
        ctx.fill();
    }

    ctx.shadowBlur = 0; // reset
}

function gameLoop() {
    update();
    draw();
    setTimeout(gameLoop, 1000 / FPS);
}

gameLoop();
