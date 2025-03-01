// 获取画布和上下文
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 加载图片
const playerImg = new Image();
playerImg.src = 'SCBP-P-2.gif'; // 新的角色图片
const obstacleImg = new Image();
obstacleImg.src = 'obstacle.png'; // 障碍物图片
const backgroundImg = new Image();
backgroundImg.src = 'background.png'; // 背景图片

// 加载音频
const bgMusic = new Audio('bgm.mp3');
const jumpSound = new Audio('jump.mp3');
const hitSound = new Audio('hit.mp3');

// 游戏变量
let gameLoop;
let player;
let obstacles = [];
let score = 0;
let gameSpeed = 5;
let bgX = 0;

// 玩家类
class Player {
    constructor() {
        this.x = 50;
        this.y = canvas.height - 150;
        this.width = 80;  // 调整大小
        this.height = 120; // 调整大小
        this.jumping = false;
        this.jumpSpeed = 12; // 调整跳跃速度
        this.gravity = 0.6;  // 添加重力
        this.velocity = 0;   // 添加速度
    }

    draw() {
        ctx.drawImage(playerImg, this.x, this.y, this.width, this.height);
    }

    jump() {
        if (!this.jumping) {
            this.jumping = true;
            this.velocity = -this.jumpSpeed;
            jumpSound.play();
        }
    }

    update() {
        if (this.jumping) {
            this.velocity += this.gravity;
            this.y += this.velocity;

            // 着地检测
            if (this.y > canvas.height - 150) {
                this.y = canvas.height - 150;
                this.jumping = false;
                this.velocity = 0;
            }
        }
    }
}

// 障碍物类
class Obstacle {
    constructor() {
        this.width = 30;
        this.height = 30;
        this.x = canvas.width;
        this.y = canvas.height - this.height - 30;
        this.speed = gameSpeed;
    }

    draw() {
        ctx.drawImage(obstacleImg, this.x, this.y, this.width, this.height);
    }

    update() {
        this.x -= this.speed;
    }
}

// 初始化游戏
function init() {
    player = new Player();
    obstacles = [];
    score = 0;
    gameSpeed = 5;
    bgMusic.currentTime = 0;
    bgMusic.play();
    bgMusic.loop = true;
}

// 游戏主循环
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 绘制背景
    ctx.drawImage(backgroundImg, bgX, 0, canvas.width, canvas.height);
    ctx.drawImage(backgroundImg, bgX + canvas.width, 0, canvas.width, canvas.height);
    bgX -= gameSpeed;
    if (bgX <= -canvas.width) bgX = 0;

    // 更新和绘制玩家
    player.update();
    player.draw();

    // 生成障碍物
    if (Math.random() < 0.02) {
        obstacles.push(new Obstacle());
    }

    // 更新和绘制障碍物
    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].update();
        obstacles[i].draw();

        // 碰撞检测
        if (checkCollision(player, obstacles[i])) {
            gameOver();
            return;
        }

        // 移除屏幕外的障碍物并计分
        if (obstacles[i].x + obstacles[i].width < 0) {
            obstacles.splice(i, 1);
            score++;
            // 每10分增加游戏速度
            if (score % 10 === 0) {
                gameSpeed = Math.min(gameSpeed + 0.5, 12);
            }
        }
    }

    // 绘制分数
    ctx.fillStyle = '#333';
    ctx.font = 'bold 24px Arial';
    ctx.fillText(`得分: ${score}`, 20, 40);

    requestAnimationFrame(gameLoop);
}

// 碰撞检测函数
function checkCollision(player, obstacle) {
    const playerHitbox = {
        x: player.x + player.width * 0.2,
        y: player.y + player.height * 0.1,
        width: player.width * 0.6,
        height: player.height * 0.8
    };

    return playerHitbox.x < obstacle.x + obstacle.width &&
           playerHitbox.x + playerHitbox.width > obstacle.x &&
           playerHitbox.y < obstacle.y + obstacle.height &&
           playerHitbox.y + playerHitbox.height > obstacle.y;
}

// 游戏结束
function gameOver() {
    cancelAnimationFrame(gameLoop);
    bgMusic.pause();
    hitSound.play();
    
    const highScore = Math.max(score, localStorage.getItem('highScore') || 0);
    localStorage.setItem('highScore', highScore);
    
    document.getElementById('final-score').textContent = score;
    document.getElementById('high-score').textContent = highScore;
    document.getElementById('game-screen').style.display = 'none';
    document.getElementById('end-screen').style.display = 'block';
}

// 事件监听
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault(); // 防止页面滚动
        player.jump();
    }
});

canvas.addEventListener('click', () => {
    player.jump();
});

document.getElementById('start-button').addEventListener('click', () => {
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'block';
    init();
    gameLoop();
});

document.getElementById('restart-button').addEventListener('click', () => {
    document.getElementById('end-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'block';
    init();
    gameLoop();
});

// 暂停功能
let isPaused = false;
document.getElementById('pause-button').addEventListener('click', () => {
    if (isPaused) {
        gameLoop();
        bgMusic.play();
        isPaused = false;
        document.getElementById('pause-button').textContent = '暂停';
    } else {
        cancelAnimationFrame(gameLoop);
        bgMusic.pause();
        isPaused = true;
        document.getElementById('pause-button').textContent = '继续';
    }
});