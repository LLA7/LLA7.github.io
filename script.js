document.addEventListener('DOMContentLoaded', function() {
    // 获取画布和上下文
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    // 加载图片
    const cxkImg = new Image();
    cxkImg.src = 'SCBP-P-2.gif'; // 确保路径正确
    const basketballImg = new Image();
    basketballImg.src = 'basketball.png'; // 确保您有这个图片
    const backgroundImg = new Image();
    backgroundImg.src = 'background.png'; // 确保您有这个图片

    // 加载音频
    const bgMusic = new Audio('background_music.mp3'); // 确保您有这个音频文件
    const jumpSound = new Audio('jump_sound.mp3'); // 确保您有这个音频文件
    const gameOverSound = new Audio('game_over_sound.mp3'); // 确保您有这个音频文件

    // 游戏变量
    let gameLoop;
    let cxk;
    let basketballs = [];
    let score = 0;
    let gameSpeed = 5;
    let bgX = 0;

    // 蔡徐坤角色
    class Cxk {
        constructor() {
            this.x = 50;
            this.y = canvas.height - 150;
            this.width = 100;
            this.height = 150;
            this.jumping = false;
            this.jumpHeight = 100;
            this.jumpCount = 0;
        }

        draw() {
            ctx.drawImage(cxkImg, this.x, this.y, this.width, this.height);
        }

        jump() {
            if (!this.jumping) {
                this.jumping = true;
                this.jumpCount = 0;
                jumpSound.play();
            }
        }

        update() {
            if (this.jumping) {
                this.jumpCount++;
                if (this.jumpCount < 15) {
                    this.y -= 5;
                } else if (this.jumpCount > 15 && this.jumpCount < 30) {
                    this.y += 5;
                } else {
                    this.jumping = false;
                    this.y = canvas.height - 150;
                }
            }
        }
    }

    // 篮球障碍物
    class Basketball {
        constructor() {
            this.x = canvas.width;
            this.y = canvas.height - 30 - Math.random() * 50;
            this.width = 30;
            this.height = 30;
        }

        draw() {
            ctx.drawImage(basketballImg, this.x, this.y, this.width, this.height);
        }

        update() {
            this.x -= gameSpeed;
        }
    }

    // 初始化游戏
    function init() {
        cxk = new Cxk();
        score = 0;
        basketballs = [];
        gameSpeed = 5;
        bgMusic.play();
        bgMusic.loop = true;
    }

    // 游戏主循环
    function gameLoop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 绘制滚动背景
        ctx.drawImage(backgroundImg, bgX, 0, canvas.width, canvas.height);
        ctx.drawImage(backgroundImg, bgX + canvas.width, 0, canvas.width, canvas.height);
        bgX -= gameSpeed;
        if (bgX <= -canvas.width) bgX = 0;

        cxk.update();
        cxk.draw();

        if (Math.random() < 0.02) {
            basketballs.push(new Basketball());
        }

        for (let i = basketballs.length - 1; i >= 0; i--) {
            basketballs[i].update();
            basketballs[i].draw();

            if (
                cxk.x < basketballs[i].x + basketballs[i].width &&
                cxk.x + cxk.width * 0.6 > basketballs[i].x &&
                cxk.y < basketballs[i].y + basketballs[i].height &&
                cxk.y + cxk.height * 0.9 > basketballs[i].y
            ) {
                gameOver();
                return;
            }

            if (basketballs[i].x + basketballs[i].width < 0) {
                basketballs.splice(i, 1);
                score++;
            }
        }

        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.fillText(`得分: ${score}`, 10, 30);

        if (score % 10 === 0 && score !== 0) {
            gameSpeed += 0.2;
            if (gameSpeed > 10) gameSpeed = 10;
        }

        requestAnimationFrame(gameLoop);
    }

    // 游戏结束
    function gameOver() {
        cancelAnimationFrame(gameLoop);
        bgMusic.pause();
        gameOverSound.play();
        document.getElementById('final-score').textContent = score;
        document.getElementById('high-score').textContent = Math.max(score, localStorage.getItem('highScore') || 0);
        localStorage.setItem('highScore', Math.max(score, localStorage.getItem('highScore') || 0));
        document.getElementById('game-screen').style.display = 'none';
        document.getElementById('end-screen').style.display = 'block';
    }

    // 事件监听器
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            cxk.jump();
        }
    });

    canvas.addEventListener('click', () => {
        cxk.jump();
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

    // 其他功能
    function searchBing() {
        var query = document.querySelector('.search-box input').value;
        window.open('https://www.bing.com/search?q=' + encodeURIComponent(query), '_blank');
    }

    function getWeather() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                
                // 使用高德地图的天气API
                const url = `https://restapi.amap.com/v3/weather/weatherInfo?key=YOUR_API_KEY&city=${lon},${lat}&extensions=base&output=JSON`;
                
                fetch(url)
                    .then(response => response.json())
                    .then(data => {
                        if (data.status === '1' && data.lives.length > 0) {
                            const weather = data.lives[0];
                            document.getElementById('location').textContent = weather.city;
                            document.getElementById('weather-desc').textContent = weather.weather;
                            document.getElementById('temperature').textContent = `${weather.temperature}°C`;
                        } else {
                            document.getElementById('weather').textContent = '无法获取天气信息';
                        }
                    })
                    .catch(error => {
                        console.error('获取天气信息时出错:', error);
                        document.getElementById('weather').textContent = '获取天气信息失败';
                    });
            }, () => {
                document.getElementById('weather').textContent = '无法获取位置信息';
            });
        } else {
            document.getElementById('weather').textContent = '您的浏览器不支持地理位置';
        }
    }

    // 添加滚动动画
    function checkScroll() {
        var sections = document.querySelectorAll('section');
        sections.forEach(function(section) {
            var sectionTop = section.getBoundingClientRect().top;
            var screenPosition = window.innerHeight / 1.3;
            
            if(sectionTop < screenPosition) {
                section.classList.add('visible');
            }
        });
    }

    window.addEventListener('scroll', checkScroll);
    window.addEventListener('load', function() {
        getWeather();
        checkScroll();
    });
});