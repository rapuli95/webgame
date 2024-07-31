
// game canvas
document.addEventListener('DOMContentLoaded', () => {
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
// menu stuff
const playerNameInput = document.getElementById('playerName');
const startGameButton = document.getElementById('startGame');
const saveGameButton = document.getElementById('saveGame');
const loadGameButton = document.getElementById('loadGame');
const gameInstructions = document.getElementById('gameInstructions');
const timerElement = document.getElementById('timer');
const timeTableBody = document.getElementById('timeTable').querySelector('tbody');
const scoreTableBody = document.getElementById('scoreTable').querySelector('tbody');
const tablesContainer = document.getElementById('tablesContainer');
const introText = document.getElementById('introText');
const cutsceneText = document.getElementById('cutsceneText');
const endGameMessage = document.getElementById('endGameMessage');

// variables
let playerName = '';
let score = 0;
let startTime;
let elapsedTime = 0;
let timerInterval;
let tank = { x: 50, y: 50, size: 30, speed: 4, direction: 'right', alive: true, doubleDamage: false, recovery: false };
let bullets = [];
let enemyBullets = [];
let bossBullets = [];
let collectibles = [];
let enemies = [];
let orbs = [];
let boss = null;
let currentMap = 1;
let lives = 12;
let inCutscene = false;
let gamePaused = false;
let gameFinished = false;
let pausedTime = 0;
let pauseStartTime = 0;

// Load the assets
let tankImage = new Image();
tankImage.src = 'assets/img/tank.png';
// traced out of an image

let bulletImage = new Image();
bulletImage.src = 'assets/img/bullet.png';
// photoshopped image from : 47.100.44.116/sucai/zq9ik74l0.html

let bossBulletImage = new Image();
bossBulletImage.src = 'assets/img/fireball.png';
// photoshopped image from : https://simple.wikipedia.org/wiki/Explosion#/media/File:Explosions.jpg

let enemyImage = new Image();
enemyImage.src = 'assets/img/tank1.png';
// traced out of an image

let bossImage = new Image();
bossImage.src = 'assets/img/bossu.png';
// made on photoshop out of the other tanks

let cutsceneImage1 = new Image();
cutsceneImage1.src = 'assets/img/boss1.jpg';
// background : https://www.selenatravel.com/tours/multi-country-asia-tours/beijing-highlights-mongolian-gobi
// canon: https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Cannon%2C_Ch%C3%A2teau_du_Haut-Koenigsbourg%2C_France.jpg/1000px-Cannon%2C_Ch%C3%A2teau_du_Haut-Koenigsbourg%2C_France.jpg

let cutsceneImage2 = new Image();
cutsceneImage2.src = 'assets/img/boss2.jpg';
// background : https://steam-sauna.com/blog/images/blog/2019/01/How-do-the-Benefits-of-Infrared-Saunas-measure-up-to-Science.jpg

let cutsceneImage3 = new Image();
cutsceneImage3.src = 'assets/img/bigboss2.jpg';
// background:https://www.istockphoto.com/fi/valokuva/simpsonin-aavikkodyyni-gm497600865-42071772

let backgroundImage = new Image();
backgroundImage.src = 'assets/img/bk_ground.jpg';
//background = https://americanlandscapesupply.com/wp-content/uploads/2018/03/fine-sand.jpg

const sounds = {
    shoot: new Audio('assets/sound/piuuh.mp3'),
    hit: new Audio('assets/sound/own_hit.mp3'),
    destroy: new Audio('assets/sound/bum.mp3'),
    collect: new Audio('assets/sound/pop.mp3'),
    goal: new Audio('assets/sound/goal.mp3'),
    bossShoot: new Audio('assets/sound/flame.mp3')
};

// Add functionality to the buttons
startGameButton.addEventListener('click', startGame);
saveGameButton.addEventListener('click', saveGame);
loadGameButton.addEventListener('click', loadGame);

document.addEventListener('keydown', handleKeyDown);
document.addEventListener('keyup', handleKeyUp);

let keys = {};

let gameRunning = false;
let wallsMoving = true;

const tileSize = 100;
const blueTileSize = tank.size;

// Maps
const map1 = [
    [0, 0, 0, 1, 0],
    [1, 1, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 1, 0, 1, 0],
    [0, 0, 0, 0, 0],
];

const map2 = [
    [0, 0, 0, 1, 0],
    [0, 1, 0, 1, 0],
    [0, 0, 0, 0, 0],
    [0, 1, 0, 1, 0],
    [0, 0, 0, 1, 0],
];

const map3 = [
    [0, 0, 0, 1, 0],
    [0, 0, 0, 0, 0],
    [0, 1, 1, 0, 1],
    [0, 0, 0, 0, 0],
    [0, 0, 1, 1, 0],
];

const map4 = [
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
];

function startGame() {
    playerName = playerNameInput.value;
    if (playerName === '') {
        alert('Please enter your name');
        return;
    }
    // dont show extra stuf
    endGameMessage.style.display = 'none';
    tablesContainer.style.display = 'none';
    resetGame();
    gameInstructions.style.display = 'none';
    canvas.style.display = 'block';
    introText.style.display = 'block';
    gamePaused = true;
    if (!gameRunning) {
        gameRunning = true;
        setTimeout(() => {
            introText.style.display = 'none';
            gamePaused = false;
            tablesContainer.style.display = 'block';
            startTime = performance.now();
            timerElement.style.display = 'block';
            timerInterval = setInterval(updateTimer, 100);
            requestAnimationFrame(gameLoop);
        }, 5000);
    }
}

function resetGame() {
    score = 0;
    elapsedTime = 0;
    pausedTime = 0;
    lives = 12;
    tank = { x: 50, y: 50, size: 30, speed: 4, direction: 'right', alive: true, doubleDamage: false, recovery: false };
    currentMap = 1;
    bullets = [];
    enemyBullets = [];
    bossBullets = [];
    enemies = generateEnemies();
    orbs = generateOrbs();
    generateCollectibles();
    boss = null;
    gameFinished = false;
}

// In case of you actually wan to save the game
function saveGame() {
    const gameState = {
        playerName,
        score,
        elapsedTime,
        pausedTime,
        tank,
        currentMap,
        collectibles,
        enemies,
        lives
    };
    localStorage.setItem('tankGameState', JSON.stringify(gameState));
    alert('Game saved!');
}

// Load the saved game
function loadGame() {
    const savedState = localStorage.getItem('tankGameState');
    if (savedState) {
        const gameState = JSON.parse(savedState);
        playerName = gameState.playerName;
        score = gameState.score;
        elapsedTime = gameState.elapsedTime;
        pausedTime = gameState.pausedTime;
        tank = gameState.tank;
        currentMap = gameState.currentMap;
        collectibles = gameState.collectibles;
        enemies = gameState.enemies;
        lives = gameState.lives;
        //drawGame();
        alert('Game loaded!');
    } else {
        alert('No saved game found');
    }
}

// Enter button press
function handleKeyDown(event) {
    keys[event.key] = true;
    if (event.key === 'Enter') {
        event.preventDefault();
        if (inCutscene) {
            hideCutscene();
            startNextLevel();
        } else {
            shootBullet();
        }
    }
    // prevent moving the screen
    if (event.key === ' '){
        event.preventDefault();
    }
}
// key not pushed down
function handleKeyUp(event) {
    keys[event.key] = false;
}

// start in a position and move to directions
// of the wasd
function moveTank() {
    if (!tank.alive || gamePaused) return;
    const oldX = tank.x;
    const oldY = tank.y;

    if (keys['w']) {
        tank.y -= tank.speed;
        tank.direction = 'up';
    }
    if (keys['s']) {
        tank.y += tank.speed;
        tank.direction = 'down';
    }
    if (keys['a']) {
        tank.x -= tank.speed;
        tank.direction = 'left';
    }
    if (keys['d']) {
        tank.x += tank.speed;
        tank.direction = 'right';
    }

    // keep the tank inside the game area
    if (tank.x < 0) tank.x = 0;
    if (tank.x + tank.size > canvas.width) tank.x = canvas.width - tank.size;
    if (tank.y < 0) tank.y = 0;
    if (tank.y + tank.size > canvas.height) tank.y = canvas.height - tank.size;
    // check for collision
    if (checkCollision(tank.x, tank.y, tank.size * 0.82, tank.size * 0.82)) {
        tank.x = oldX;
        tank.y = oldY;
    }

    checkLevelComplete();
}

function checkCollision(x, y, width, height) {
    const map = getCurrentMap();
    const tileX = Math.floor(x / tileSize);
    const tileY = Math.floor(y / tileSize);
    const tile = map[tileY] && map[tileY][tileX];
    return tile === 1;
}

function getCurrentMap() {
    const maps = [map1, map2, map3, map4];
    return maps[currentMap - 1];
}

// reach the right bottom square to advance in the level
// Caution: failing to kill enemies, populates the next
// level with more enemies
function checkLevelComplete() {
    const tileX = Math.floor(tank.x / tileSize);
    const tileY = Math.floor(tank.y / tileSize);
    const rightBottomX = Math.floor((canvas.width - blueTileSize) / tileSize);
    const rightBottomY = Math.floor((canvas.height - blueTileSize) / tileSize);
    // blue tile desactived for the boss level
    if (currentMap === 4) return;
    // otherwise check that the player reaches the square
    if (tileX === rightBottomX && tileY === rightBottomY) {
        currentMap++;
        sounds.goal.play();
        if (currentMap > 4) {
            saveResult();
            endGame('You defeated Wen and his evil plans!');
        } 
        else if (currentMap === 4) {
            // BOSS FIGHT
            alert('Boss Level!');
            tank = { x: 50, y: 50, size: 30, speed: 4, direction: 'right', alive: true, doubleDamage: false, recovery: false };
            boss = {
                x: canvas.width / 2 - 100,
                y: canvas.height / 2 - 100,
                size: 200,
                hp: 30,
                speedX: 2,
                speedY: 2,
                shootInterval: 1000
            };
            showCutscene();
        } 
        else {
            showCutscene();
        }
    }
}

function showCutscene() {
    inCutscene = true;
    gamePaused = true;
    pauseStartTime = performance.now();
    clearInterval(timerInterval);
    clearGameObjects();
    if (currentMap === 2) {
        drawCutscene(cutsceneImage1);
    } else if (currentMap === 3) {
        drawCutscene(cutsceneImage2);
    } else if (currentMap === 4) {
        drawCutscene(cutsceneImage3);
        // the original text was not readable
        // so I had to create a div with a
        // paragraph
        cutsceneText.style.display = 'flex';
        introText.style.display = 'block'; 
    }
}

function drawCutscene(image) {
    // make the screen clean
    // not perfect as for some reason
    // the player tank likes to stay on the screen
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
}

function hideCutscene() {
    inCutscene = false;
    gamePaused = false;
    cutsceneText.style.display = 'none';
    introText.style.display = 'none';
    // pause the time during the cutscenes
    pausedTime += performance.now() - pauseStartTime;
    timerInterval = setInterval(updateTimer, 16);
    requestAnimationFrame(gameLoop);
}

function startNextLevel() {
    enemies = generateEnemies().concat(enemies);
    generateCollectibles()
    orbs = generateOrbs();
    tank = { x: 50, y: 50, size: 30, speed: 4, direction: 'right', alive: true, doubleDamage: false, recovery: false };
}

// wipe out all stuff
function clearGameObjects() {
    bullets = [];
    enemyBullets = [];
    bossBullets = [];
    collectibles = [];
    enemies = [];
    orbs = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function endGame(message) {
    clearInterval(timerInterval);
    gameRunning = false;
    gameFinished = true;
    ctx.save();
    ctx.fillStyle = 'black';
    ctx.globalAlpha = 0.7;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1;
    ctx.fillStyle = 'green';
    ctx.font = '24px Courier New, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(message, canvas.width / 2, canvas.height / 2);
    ctx.restore();
}

function shootBullet() {
    if (!tank.alive || gamePaused) return;
    sounds.shoot.play();
    const bulletSpeed = 5;
    let bullet = {
        x: tank.x + tank.size / 2,
        y: tank.y + tank.size / 2,
        size: 10,
        speed: bulletSpeed,
        direction: tank.direction,
        doubleDamage: tank.doubleDamage
    };
    bullets.push(bullet);
}

function generateEnemies() {
    let enemies = [];
    for (let i = 0; i < 7; i++) {
        let enemy;
        do {
            enemy = {
                x: Math.random() * (canvas.width - 20),
                y: Math.random() * (canvas.height - 20),
                size: 30,
                speed: 4,
                direction: 'down',
                shootInterval: Math.random() * 1000 + 200
            };
        } while (checkCollision(enemy.x, enemy.y, enemy.size * 0.82, enemy.size * 0.82));
        enemies.push(enemy);
        // leaving survivors create more enemies
        //enemies = [...survivors, ...new_enemies];
        //survivors = [];
    }
    return enemies;
}

function generateOrbs() {
    let orbs = [];
    // death orb on stage 3
    if (currentMap === 3) {
        orbs.push({
            x: Math.random() * (canvas.width - 20),
            y: Math.random() * (canvas.height - 20),
            size: 30,
            speed: 3,
            type: 'black',
            directionX: Math.random() < 0.5 ? 1 : -1,
            directionY: Math.random() < 0.5 ? 1 : -1
        });
    }
    for (let i = 0; i < 2; i++) {
        const isBlueOrb = Math.random() < 0.15;
        const isRedOrb = !isBlueOrb && Math.random() < 0.2;
        if (isBlueOrb || isRedOrb ) {
            let orb = {
                x: Math.random() * (canvas.width - 20),
                y: Math.random() * (canvas.height - 20),
                size: 30,
                speed: 2,
                type: isBlueOrb ? 'blue' :  'red',
                directionX: Math.random() < 0.5 ? 1 : -1,
                directionY: Math.random() < 0.5 ? 1 : -1
            };
            orbs.push(orb);
        }
    }
    return orbs;
}

function generateCollectibles() {
    collectibles = [];
    for (let i = 0; i < 5; i++) {
        let collectible;
        do {
            collectible = {
                x: Math.random() * (canvas.width - 20),
                y: Math.random() * (canvas.height - 20),
                size: 20
            };
        } while (checkCollision(collectible.x, collectible.y, collectible.size * 0.82, collectible.size * 0.82) || isOnBlueTile(collectible));
        collectibles.push(collectible);
    }
}

// reached the blue tile to move to another stage
function isOnBlueTile(item) {
    const rightBottomX = Math.floor((canvas.width - blueTileSize) / tileSize);
    const rightBottomY = Math.floor((canvas.height - blueTileSize) / tileSize);
    const tileX = Math.floor(item.x / tileSize);
    const tileY = Math.floor(item.y / tileSize);
    return tileX === rightBottomX && tileY === rightBottomY;
}

function collectItem() {
    collectibles = collectibles.filter(item => {
        // if the collectible is close
        // enough get a score
        if (
            tank.x < item.x + item.size &&
            tank.x + tank.size > item.x &&
            tank.y < item.y + item.size &&
            tank.y + tank.size > item.y
        ) {
            score += 10;
            sounds.collect.play();
            return false;
        }
        return true;
    });
}

function collectOrbs() {
    orbs = orbs.filter(orb => {
        if (
            tank.x < orb.x + orb.size &&
            tank.x + tank.size > orb.x &&
            tank.y < orb.y + orb.size &&
            tank.y + tank.size > orb.y
        ) {
            sounds.collect.play();
            if (orb.type === 'blue') {
                tank.doubleDamage = true;
                //setTimeout(() => { tank.doubleDamage = false; }, 5000);
                lives++;
            } else if (orb.type === 'red') {
                wallsMoving = false;
                setTimeout(() => { wallsMoving = true; }, 4000);
            } else if (orb.type === 'black') {
                saveResult();
                endGame('Game Over! Death ball killed you!');
            }
            return false;
        }
        return true;
    });
}

function updateBullets() {
    bullets.forEach((bullet, index) => {
        switch (bullet.direction) {
            case 'up':
                bullet.y -= bullet.speed;
                break;
            case 'down':
                bullet.y += bullet.speed;
                break;
            case 'left':
                bullet.x -= bullet.speed;
                break;
            case 'right':
                bullet.x += bullet.speed;
                break;
        }
        if (
            bullet.x < 0 ||
            bullet.x > canvas.width ||
            bullet.y < 0 ||
            bullet.y > canvas.height ||
            checkCollision(bullet.x, bullet.y, bullet.size * 0.82, bullet.size * 0.82)
        ) {
            bullets.splice(index, 1);
        }
        // enemies are so small to begin with so no
        // changes
        enemies = enemies.filter((enemy, enemyIndex) => {
            if (
                bullet.x < enemy.x + enemy.size &&
                bullet.x + bullet.size > enemy.x &&
                bullet.y < enemy.y + enemy.size &&
                bullet.y + bullet.size > enemy.y
            ) {
                bullets.splice(index, 1);
                score += bullet.doubleDamage ? 200 : 100;
                sounds.destroy.play();
                return false;
            }
            return true;
        });
        // the boss hitbox
        if (boss && 
            bullet.x < boss.x + boss.size*0.78 &&
            bullet.x + bullet.size > boss.x &&
            bullet.y < boss.y + boss.size*0.78 &&
            bullet.y + bullet.size > boss.y
        ) {
            bullets.splice(index, 1);
            boss.hp -= bullet.doubleDamage ? 2 : 1;
            if (boss.hp <= 0) {
                saveResult();
                endGame('You defeated the Boss!');
            }
        }
    });

    enemyBullets.forEach((bullet, index) => {
        switch (bullet.direction) {
            case 'up':
                bullet.y -= bullet.speed;
                break;
            case 'down':
                bullet.y += bullet.speed;
                break;
            case 'left':
                bullet.x -= bullet.speed;
                break;
            case 'right':
                bullet.x += bullet.speed;
                break;
        }
        // check the collision
        if (
            bullet.x < 0 ||
            bullet.x > canvas.width ||
            bullet.y < 0 ||
            bullet.y > canvas.height ||
            checkCollision(bullet.x, bullet.y, bullet.size * 0.82, bullet.size * 0.82)
        ) {
            enemyBullets.splice(index, 1);
        }

        if (
            bullet.x < tank.x + tank.size &&
            bullet.x + bullet.size > tank.x &&
            bullet.y < tank.y + tank.size &&
            bullet.y + bullet.size > tank.y
        ) {
            enemyBullets.splice(index, 1);
            hitPlayer();
        }
    });

    bossBullets.forEach((bullet, index) => {
        switch (bullet.direction) {
            case 'up':
                bullet.y -= bullet.speed;
                break;
            case 'down':
                bullet.y += bullet.speed;
                break;
            case 'left':
                bullet.x -= bullet.speed;
                break;
            case 'right':
                bullet.x += bullet.speed;
                break;
        }
        // boss bullets collision
        if (
            bullet.x < 0 ||
            bullet.x > canvas.width ||
            bullet.y < 0 ||
            bullet.y > canvas.height ||
            checkCollision(bullet.x, bullet.y, bullet.size * 0.82, bullet.size * 0.82)
        ) {
            bossBullets.splice(index, 1);
        }
        // boss bullet hitbox
        if (
            bullet.x < tank.x + tank.size &&
            bullet.x + bullet.size > tank.x &&
            bullet.y < tank.y + tank.size &&
            bullet.y + bullet.size > tank.y
        ) {
            bossBullets.splice(index, 1);
            hitPlayer();
        }
    });
}
// player gets hit
function hitPlayer() {
    if (!tank.recovery) {
        lives--;
        tank.recovery = true;
        lightUpTank();
        sounds.hit.play();
        if (lives <= 0) {
            tank.alive = false;
            saveResult();
            endGame('Game Over!');
        } else {
            // "safe frames"
            setTimeout(() => {
                tank.recovery = false;
            }, 1000);
        }
    }
}

function lightUpTank() {
    ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
    ctx.fillRect(tank.x, tank.y, tank.size, tank.size);
    setTimeout(() => {
        ctx.clearRect(tank.x, tank.y, tank.size, tank.size);
        //drawGame();
    }, 1000);
}

function updateOrbs() {
    orbs.forEach(orb => {
        orb.x += orb.speed * orb.directionX;
        orb.y += orb.speed * orb.directionY;

        if (orb.x <= 0 || orb.x + orb.size >= canvas.width) {
            orb.directionX *= -1;
        }
        if (orb.y <= 0 || orb.y + orb.size >= canvas.height) {
            orb.directionY *= -1;
        }
    });
}

function updateEnemies() {
    enemies.forEach((enemy, index) => {
        const oldX = enemy.x;
        const oldY = enemy.y;

        switch (enemy.direction) {
            case 'up':
                enemy.y -= enemy.speed;
                break;
            case 'down':
                enemy.y += enemy.speed;
                break;
            case 'left':
                enemy.x -= enemy.speed;
                break;
            case 'right':
                enemy.x += enemy.speed;
                break;
        }

        if (checkCollision(enemy.x, enemy.y, enemy.size * 0.82, enemy.size * 0.82) || isOnBlueTile(enemy)) {
            enemy.x = oldX;
            enemy.y = oldY;
            enemy.direction = ['up', 'down', 'left', 'right'][Math.floor(Math.random() * 4)];
        }

        if (enemy.x < 0) enemy.x = 0;
        if (enemy.x + enemy.size > canvas.width) enemy.x = canvas.width - enemy.size;
        if (enemy.y < 0) enemy.y = 0;
        if (enemy.y + enemy.size > canvas.height) enemy.y = canvas.height - enemy.size;

        if (Math.random() < 0.08) {
            enemy.direction = ['up', 'down', 'left', 'right'][Math.floor(Math.random() * 4)];
        }

        if (enemy.shootInterval <= 0) {
            shootEnemyBullet(enemy);
            enemy.shootInterval = Math.random() * 1000 + 200;
        } else {
            enemy.shootInterval -= 16;
        }
    });

    if (boss) {
        boss.x += boss.speedX;
        boss.y += boss.speedY;

        if (boss.x <= 0 || boss.x + boss.size >= canvas.width) {
            boss.speedX = -boss.speedX;
        }
        if (boss.y <= 0 || boss.y + boss.size >= canvas.height) {
            boss.speedY = -boss.speedY;
        }

        if (boss.x < 0) boss.x = 0;
        if (boss.x + boss.size > canvas.width) boss.x = canvas.width - boss.size;
        if (boss.y < 0) boss.y = 0;
        if (boss.y + boss.size > canvas.height) boss.y = canvas.height - boss.size;

        if (Math.random() < 0.08) {
            boss.speedX = (Math.random() - 0.3) * 4;
            boss.speedY = (Math.random() - 0.3) * 4;
        }

        if (boss.shootInterval <= 0) {
            shootBossBullet(boss);
            boss.shootInterval = 900;
        } else {
            boss.shootInterval -= 16;
        }
    }
}

function updateTimer() {
    elapsedTime = performance.now() - startTime - pausedTime;
    timerElement.textContent = formatTime(elapsedTime);
}

function formatTime(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const ms = Math.floor(milliseconds % 1000);

    return `${pad(minutes)}:${pad(seconds)}.${pad(ms, 3)}`;
}

function pad(number, digits = 2) {
    return number.toString().padStart(digits, '0');
}

function shootEnemyBullet(enemy) {
    const bulletSpeed = 3.5;
    let bullet = {
        x: enemy.x + enemy.size / 2,
        y: enemy.y + enemy.size / 2,
        size: 10,
        speed: bulletSpeed,
        direction: enemy.direction
    };
    sounds.shoot.play();
    enemyBullets.push(bullet);
}

function shootBossBullet(boss) {
    const bulletSpeed = 5;
    const directions = ['up', 'down', 'left', 'right'];
    directions.forEach(direction => {
        let bullet = {
            x: boss.x + boss.size / 2,
            y: boss.y + boss.size / 2,
            size: 10,
            speed: bulletSpeed,
            direction: direction
        };
        sounds.bossShoot.play();
        bossBullets.push(bullet);
    });
}

function saveResult() {
    const playerTime = elapsedTime;
    const playerScore = score;

    const timeResults = loadResults('timeResults');
    const scoreResults = loadResults('scoreResults');

    updateTop10(timeResults, { name: playerName, value: playerTime });
    updateTop10(scoreResults, { name: playerName, value: playerScore });

    saveResults('timeResults', timeResults);
    saveResults('scoreResults', scoreResults);

    displayResults(timeTableBody, timeResults, formatTime);
    displayResults(scoreTableBody, scoreResults);
}

function loadResults(key) {
    const results = localStorage.getItem(key);
    return results ? JSON.parse(results) : [];
}

function saveResults(key, results) {
    localStorage.setItem(key, JSON.stringify(results));
}

function updateTop10(results, newResult) {
    results.push(newResult);
    results.sort((a, b) => a.value - b.value);
    if (results.length > 10) {
        results.pop();
    }
}

function displayResults(tableBody, results, formatter = v => v) {
    tableBody.innerHTML = '';
    results.forEach(result => {
        const row = document.createElement('tr');
        const nameCell = document.createElement('td');
        const valueCell = document.createElement('td');
        nameCell.textContent = result.name;
        valueCell.textContent = formatter(result.value);
        row.appendChild(nameCell);
        row.appendChild(valueCell);
        tableBody.appendChild(row);
    });
}

function gameLoop() {
    if (!gamePaused) {
        ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
        drawMap();
        moveTank();
        drawTank();
        updateBullets();
        updateEnemies();
        updateOrbs();
        drawBullets();
        drawEnemyBullets();
        if (boss) {
            drawBoss();
            drawBossBullets();
        }
        drawEnemies();
        drawCollectibles();
        drawOrbs();
        collectItem();
        collectOrbs();
        drawScore();
        if (tank.alive && !gameFinished) {
            requestAnimationFrame(gameLoop);
        }
    }
}

function drawMap() {
    const map = getCurrentMap();
    map.forEach((row, y) => {
        row.forEach((tile, x) => {
            if (tile === 1) {
                const gradient = ctx.createLinearGradient(x * tileSize, y * tileSize, (x + 1) * tileSize, (y + 1) * tileSize);
                gradient.addColorStop(0, '#7D7D7D');
                gradient.addColorStop(1, '#BEBEBE');
                ctx.fillStyle = gradient;
                if (wallsMoving) {
                    const moveDistance = Math.sin(Date.now() / 500) * 33;
                    if ((x + y) % 2 === 0) {
                        ctx.fillRect(x * tileSize, y * tileSize + moveDistance, tileSize, tileSize);
                    } else {
                        ctx.fillRect(x * tileSize + moveDistance, y * tileSize, tileSize, tileSize);
                    }
                } else {
                    ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
                }
            }
        });
    });

    if (currentMap !== 4) {
        ctx.fillStyle = 'blue';
        ctx.fillRect(canvas.width - blueTileSize, canvas.height - blueTileSize, blueTileSize, blueTileSize);
    }
}

function drawTank() {
    ctx.save();
    ctx.translate(tank.x + tank.size / 2, tank.y + tank.size / 2);
    switch (tank.direction) {
        case 'up':
            ctx.rotate(-Math.PI / 2);
            break;
        case 'down':
            ctx.rotate(Math.PI / 2);
            break;
        case 'left':
            ctx.rotate(Math.PI);
            break;
        case 'right':
            break;
    }
    ctx.drawImage(tankImage, -tank.size / 2, -tank.size / 2, tank.size, tank.size);
    ctx.restore();
}

function drawBullets() {
    bullets.forEach(bullet => {
        ctx.drawImage(bulletImage, bullet.x, bullet.y, bullet.size, bullet.size);
    });
}

function drawEnemyBullets() {
    enemyBullets.forEach(bullet => {
        ctx.drawImage(bulletImage, bullet.x, bullet.y, bullet.size, bullet.size);
    });
}

function drawBossBullets() {
    bossBullets.forEach(bullet => {
        ctx.drawImage(bossBulletImage, bullet.x, bullet.y, bullet.size, bullet.size);
    });
}

function drawEnemies() {
    enemies.forEach(enemy => {
        ctx.drawImage(enemyImage, enemy.x, enemy.y, enemy.size, enemy.size);
    });
}

function drawBoss() {
    ctx.drawImage(bossImage, boss.x, boss.y, boss.size, boss.size);
}

function drawCollectibles() {
    ctx.fillStyle = 'gold';
    collectibles.forEach(item => {
        ctx.fillRect(item.x, item.y, item.size, item.size);
    });
}

function drawOrbs() {
    orbs.forEach(orb => {
        ctx.beginPath();
        ctx.arc(orb.x + orb.size / 2, orb.y + orb.size / 2, orb.size / 2, 0, Math.PI * 2);
        if (orb.type === 'blue') {
            ctx.fillStyle = 'blue';
        } else if (orb.type === 'red') {
            ctx.fillStyle = 'red';
        } else if (orb.type === 'black') {
            ctx.fillStyle = 'black';
        }
        ctx.fill();
    });
}

function drawScore() {
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText(`Player: ${playerName}`, 10, 20);
    ctx.fillText(`Score: ${score}`, 10, 40);
    ctx.fillText(`Lives: ${lives}`, 10, 60);
}

requestAnimationFrame(gameLoop);
});

