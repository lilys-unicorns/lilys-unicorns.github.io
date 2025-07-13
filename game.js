// Progress tracking system
class ProgressManager {
    static getProgress() {
        try {
            const progress = localStorage.getItem('lily_unicorns_progress');
            return progress ? JSON.parse(progress) : { completedLevels: [], currentLevel: 1 };
        } catch (error) {
            console.warn('Failed to load progress:', error);
            return { completedLevels: [], currentLevel: 1 };
        }
    }
    
    static saveProgress(progress) {
        try {
            localStorage.setItem('lily_unicorns_progress', JSON.stringify(progress));
        } catch (error) {
            console.warn('Failed to save progress:', error);
        }
    }
    
    static completeLevel(level) {
        const progress = this.getProgress();
        
        // Add to completed levels if not already there
        if (!progress.completedLevels.includes(level)) {
            progress.completedLevels.push(level);
            progress.completedLevels.sort((a, b) => a - b);
        }
        
        // Update current level to the next one
        progress.currentLevel = Math.max(progress.currentLevel, level + 1);
        
        this.saveProgress(progress);
        return progress;
    }
    
    static getCurrentLevel() {
        return this.getProgress().currentLevel;
    }
    
    static getCompletedLevels() {
        return this.getProgress().completedLevels;
    }
    
    static isLevelCompleted(level) {
        return this.getCompletedLevels().includes(level);
    }
    
    static resetProgress() {
        this.saveProgress({ completedLevels: [], currentLevel: 1 });
    }
}

// Lily Unicorns - JavaScript Version
class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = 1280;
        this.height = 720;
        
        // Game state
        this.gameState = 'MENU'; // MENU, PLAYING, LEVEL_COMPLETE, GAME_OVER
        this.currentLevel = 1;
        this.maxLevels = null;
        this.levelData = null;
        this.levelComplete = false;
        this.gameOver = false;
        this.gameOverMessage = '';
        this.glitterParticles = [];
        
        // Sprites
        this.unicornSprite = null;
        this.spriteLoaded = false;
        
        // Audio
        this.backgroundMusic = null;
        this.musicLoaded = false;
        
        // Game objects
        this.player1 = null;
        this.player2 = null;
        this.platforms = [];
        this.trees = [];
        this.clouds = [];
        this.whiteItems = [];
        this.blackItems = [];
        this.triangles = [];
        this.swamps = [];
        this.rainbow = null;
        
        // Scoring
        this.player1Score = 0;
        this.player2Score = 0;
        
        // Input handling
        this.keys = {};
        this.menuSelection = 0;
        this.menuOptions = ['PLAY', 'CREDITS', 'EXIT'];
        this.musicMuted = false;
        
        // Initialize
        this.init();
    }
    
    async init() {
        this.setupInput();
        this.loadSprite();
        this.loadMusic();
        await this.detectMaxLevels();
        
        // Check if a level parameter is provided in URL
        const urlParams = new URLSearchParams(window.location.search);
        const levelParam = urlParams.get('level');
        
        if (levelParam) {
            // Direct level access - bypass menu and start game
            this.startGame();
        }
        
        this.gameLoop();
    }
    
    setupInput() {
        document.addEventListener('keydown', (e) => {
            // Use both e.key and e.code for better compatibility
            let keyToUse = e.key;
            
            // Map common codes to consistent keys
            const codeMap = {
                'KeyA': 'a', 'KeyD': 'd', 'KeyW': 'w', 'KeyS': 's',
                'KeyR': 'r', 'KeyN': 'n', 'KeyF': 'f'
            };
            
            if (codeMap[e.code]) {
                keyToUse = codeMap[e.code];
            } else if (e.key.length === 1) {
                keyToUse = e.key.toLowerCase();
            }
            
            this.keys[keyToUse] = true;
            this.handleKeyPress(keyToUse);
        });
        
        document.addEventListener('keyup', (e) => {
            // Use the same mapping for keyup
            let keyToUse = e.key;
            
            const codeMap = {
                'KeyA': 'a', 'KeyD': 'd', 'KeyW': 'w', 'KeyS': 's',
                'KeyR': 'r', 'KeyN': 'n', 'KeyF': 'f'
            };
            
            if (codeMap[e.code]) {
                keyToUse = codeMap[e.code];
            } else if (e.key.length === 1) {
                keyToUse = e.key.toLowerCase();
            }
            
            this.keys[keyToUse] = false;
        });
    }
    
    handleKeyPress(key) {
        if (this.gameState === 'MENU') {
            if (key === 'ArrowUp' || key === 'ArrowDown') {
                this.menuSelection = (this.menuSelection + 1) % this.menuOptions.length;
            } else if (key === 'Enter') {
                if (this.menuSelection === 0) { // PLAY
                    window.location.href = 'level-map.html';
                } else if (this.menuSelection === 1) { // CREDITS
                    window.open('credits.html', '_blank');
                } else { // EXIT
                    window.close();
                }
            } else if (key === 'm' || key === 'M') {
                this.toggleMusic();
            }
        } else if (this.gameState === 'PLAYING') {
            if (key === 'r' || key === 'R') {
                this.resetLevel();
            } else if (key === 'n' || key === 'N') {
                if (this.levelComplete) {
                    this.nextLevel();
                }
            } else if (key === 'Escape') {
                this.gameState = 'MENU';
                this.stopMusic();
            } else if (key === 'F5') {
                // Force reload level data
                this.loadLevel();
            } else if (key === 'm' || key === 'M') {
                this.toggleMusic();
            }
        } else if (this.gameState === 'GAME_OVER') {
            if (key === 'r' || key === 'R' || key === 'Enter') {
                this.resetLevel();
            } else if (key === 'Escape') {
                this.gameState = 'MENU';
                this.stopMusic();
            }
        }
    }
    
    loadSprite() {
        this.unicornSprite = new Image();
        this.unicornSprite.onload = () => {
            this.spriteLoaded = true;
            this.createPlayers();
        };
        this.unicornSprite.src = 'assets/sprites/kaitlyn_unicorn.png';
    }
    
    loadMusic() {
        this.backgroundMusic = new Audio('assets/music/old_city_theme.ogg');
        this.backgroundMusic.loop = true;
        this.backgroundMusic.volume = 0.5;
        this.backgroundMusic.addEventListener('canplaythrough', () => {
            this.musicLoaded = true;
        });
        this.backgroundMusic.addEventListener('error', (e) => {
            this.musicLoaded = false;
        });
    }
    
    createPlayers() {
        if (!this.spriteLoaded) return;
        
        this.player1 = new Unicorn(
            this.unicornSprite,
            this.width * 0.15,
            this.height / 2,
            false, // not inverted
            'player1'
        );
        
        this.player2 = new Unicorn(
            this.unicornSprite,
            this.width * 0.45,
            this.height / 2,
            true, // inverted colors
            'player2'
        );
    }
    
    async detectMaxLevels() {
        this.maxLevels = 3; // Default fallback
        
        // Try to detect levels by attempting to load level files
        let levelNumber = 1;
        while (levelNumber <= 10) { // Reasonable upper limit
            try {
                const response = await fetch(`levels/level${levelNumber}.json`, {
                    cache: 'no-store',
                    headers: {
                        'Cache-Control': 'no-cache'
                    }
                });
                
                if (response.ok) {
                    levelNumber++;
                } else {
                    break;
                }
            } catch (error) {
                // Check embedded data as fallback
                if (typeof LEVEL_DATA !== 'undefined' && LEVEL_DATA[levelNumber]) {
                    levelNumber++;
                } else {
                    break;
                }
            }
        }
        
        this.maxLevels = levelNumber - 1;
    }
    
    playMusic() {
        if (this.backgroundMusic && this.musicLoaded && !this.musicMuted) {
            this.backgroundMusic.play().catch(e => {
                // Audio playback failed, continue silently
            });
        }
    }
    
    pauseMusic() {
        if (this.backgroundMusic) {
            this.backgroundMusic.pause();
        }
    }
    
    stopMusic() {
        if (this.backgroundMusic) {
            this.backgroundMusic.pause();
            this.backgroundMusic.currentTime = 0;
        }
    }
    
    toggleMusic() {
        this.musicMuted = !this.musicMuted;
        if (this.musicMuted) {
            this.pauseMusic();
        } else {
            this.playMusic();
        }
    }
    
    parseURLParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const levelParam = urlParams.get('level');
        
        if (levelParam) {
            const level = parseInt(levelParam);
            if (level >= 1 && level <= this.maxLevels) {
                return level;
            }
        }
        
        // If no URL parameter, check saved progress
        const savedCurrentLevel = ProgressManager.getCurrentLevel();
        return Math.min(savedCurrentLevel, this.maxLevels);
    }
    
    startGame() {
        this.gameState = 'PLAYING';
        this.currentLevel = this.parseURLParams();
        this.playMusic();
        this.loadLevel();
    }
    
    async loadLevel() {
        try {
            // Try to load from JSON file first (for server environments)
            const response = await fetch(`levels/level${this.currentLevel}.json?t=${Date.now()}`, {
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            this.levelData = await response.json();
            this.setupLevel();
        } catch (error) {
            // Fallback to embedded level data (for file:// environments)
            if (typeof LEVEL_DATA !== 'undefined' && LEVEL_DATA[this.currentLevel]) {
                this.levelData = LEVEL_DATA[this.currentLevel];
                this.setupLevel();
            } else {
                this.createDefaultLevel();
            }
        }
    }
    
    setupLevel() {
        if (!this.levelData) return;
        
        this.levelComplete = false;
        this.gameOver = false;
        this.gameOverMessage = '';
        this.player1Score = 0;
        this.player2Score = 0;
        this.glitterParticles = [];
        
        // Reset player positions
        if (this.levelData.unicorns) {
            this.player1.x = this.width * (this.levelData.unicorns.unicorn1.x / 100);
            this.player1.y = this.levelData.unicorns.unicorn1.y ? 
                this.height - (this.height * (this.levelData.unicorns.unicorn1.y / 100)) : 
                this.height / 2;
            
            this.player2.x = this.width * (this.levelData.unicorns.unicorn2.x / 100);
            this.player2.y = this.levelData.unicorns.unicorn2.y ? 
                this.height - (this.height * (this.levelData.unicorns.unicorn2.y / 100)) : 
                this.height / 2;
        }
        
        // Reset physics
        this.player1.velocityY = 0;
        this.player1.onGround = false;
        this.player2.velocityY = 0;
        this.player2.onGround = false;
        
        // Create platforms
        this.platforms = [];
        if (this.levelData.platforms) {
            this.levelData.platforms.forEach(platform => {
                this.platforms.push(new Platform(
                    this.width * (platform.x / 100),
                    this.height - (this.height * (platform.y / 100)),
                    this.width * (platform.width / 100),
                    this.height * (platform.height / 100),
                    platform.color || [255, 0, 0],
                    platform.alpha || 255
                ));
            });
        }
        
        // Create trees
        this.trees = [];
        if (this.levelData.trees) {
            this.levelData.trees.forEach(tree => {
                this.trees.push(new Tree(
                    this.width * (tree.x / 100),
                    this.height - (this.height * (tree.y / 100)),
                    this.width * (tree.width / 100),
                    this.height * (tree.height / 100)
                ));
            });
        }
        
        // Create clouds
        this.clouds = [];
        if (this.levelData.clouds) {
            this.levelData.clouds.forEach(cloud => {
                this.clouds.push(new Cloud(
                    this.width * (cloud.x / 100),
                    this.height - (this.height * (cloud.y / 100)),
                    this.width * (cloud.width / 100),
                    this.height * (cloud.height / 100),
                    cloud.alpha || 180
                ));
            });
        }
        
        // Create items
        this.whiteItems = [];
        this.blackItems = [];
        
        if (this.levelData.white_items) {
            this.levelData.white_items.forEach(item => {
                this.whiteItems.push(new Item(
                    this.width * (item.x / 100),
                    this.height - (this.height * (item.y / 100)),
                    'white'
                ));
            });
        }
        
        if (this.levelData.black_items) {
            this.levelData.black_items.forEach(item => {
                this.blackItems.push(new Item(
                    this.width * (item.x / 100),
                    this.height - (this.height * (item.y / 100)),
                    'black'
                ));
            });
        }
        
        // Create triangles
        this.triangles = [];
        if (this.levelData.triangles) {
            this.levelData.triangles.forEach(triangle => {
                this.triangles.push(new Triangle(
                    this.width * (triangle.x / 100),
                    this.height - (this.height * (triangle.y / 100)),
                    this.width * (triangle.size / 100),
                    triangle.color || [255, 0, 0]
                ));
            });
        }
        
        // Create swamps
        this.swamps = [];
        if (this.levelData.swamps) {
            this.levelData.swamps.forEach(swamp => {
                this.swamps.push(new Swamp(
                    this.width * (swamp.x / 100),
                    this.height - (this.height * (swamp.y / 100)),
                    this.width * (swamp.width / 100),
                    this.height * (swamp.height / 100),
                    swamp.color || [139, 69, 19]
                ));
            });
        }
        
        // Create rainbow
        if (this.levelData.rainbow) {
            this.rainbow = new Rainbow(
                this.width - (this.width * (this.levelData.rainbow.x / 100)),
                this.height - (this.height * (this.levelData.rainbow.y / 100)),
                this.width * (this.levelData.rainbow.width / 100),
                this.height * (this.levelData.rainbow.height / 100)
            );
        }
    }
    
    createDefaultLevel() {
        // Fallback default level
        this.levelComplete = false;
        this.player1Score = 0;
        this.player2Score = 0;
        this.glitterParticles = [];
        
        this.platforms = [
            new Platform(200, 500, 150, 30, [255, 0, 0], 255),
            new Platform(400, 400, 150, 30, [0, 255, 0], 255),
            new Platform(600, 300, 150, 30, [0, 0, 255], 255)
        ];
        
        this.trees = [
            new Tree(100, 400, 80, 200)
        ];
        
        this.clouds = [
            new Cloud(300, 100, 150, 80, 180)
        ];
        
        this.whiteItems = [
            new Item(250, 470, 'white'),
            new Item(450, 370, 'white')
        ];
        
        this.blackItems = [
            new Item(650, 270, 'black'),
            new Item(850, 570, 'black')
        ];
        
        this.triangles = [
            new Triangle(500, 550, 30, [255, 0, 0])
        ];
        
        this.swamps = [
            new Swamp(300, 500, 100, 50, [139, 69, 19])
        ];
        
        this.rainbow = new Rainbow(1000, 200, 150, 200);
    }
    
    resetLevel() {
        this.gameState = 'PLAYING';
        this.playMusic();
        this.loadLevel();
    }
    
    nextLevel() {
        if (this.currentLevel < this.maxLevels) {
            this.currentLevel++;
            this.loadLevel();
        }
    }
    
    update() {
        if (this.gameState === 'PLAYING' && this.player1 && this.player2) {
            // Update players
            this.player1.update(this.keys, this.platforms, this.trees);
            this.player2.update(this.keys, this.platforms, this.trees);
            
            // Check item collection
            this.checkItemCollection();
            
            // Check triangle collisions
            this.checkTriangleCollisions();
            
            // Check swamp collisions
            this.checkSwampCollisions();
            
            // Update swamps (for enhanced bubble and evaporation effects)
            this.swamps.forEach(swamp => swamp.update());
            
            // Check rainbow completion
            this.checkRainbowCompletion();
            
            // Update glitter particles
            this.updateGlitter();
            
            // Update clouds
            this.updateClouds();
        }
    }
    
    checkItemCollection() {
        // Check white items for player 1
        for (let i = this.whiteItems.length - 1; i >= 0; i--) {
            if (this.whiteItems[i].checkCollision(this.player1)) {
                this.whiteItems.splice(i, 1);
                this.player1Score++;
            }
        }
        
        // Check black items for player 2
        for (let i = this.blackItems.length - 1; i >= 0; i--) {
            if (this.blackItems[i].checkCollision(this.player2)) {
                this.blackItems.splice(i, 1);
                this.player2Score++;
            }
        }
    }
    
    checkTriangleCollisions() {
        if (this.gameOver) return;
        
        // Check if either player touches a triangle
        for (let triangle of this.triangles) {
            if (triangle.checkCollision(this.player1)) {
                this.triggerGameOver('Player 1');
                return;
            }
            if (triangle.checkCollision(this.player2)) {
                this.triggerGameOver('Player 2');
                return;
            }
        }
    }
    
    checkSwampCollisions() {
        if (this.gameOver) return;
        
        // Check if either player steps in a swamp
        for (let swamp of this.swamps) {
            if (swamp.checkCollision(this.player1)) {
                this.triggerGameOver('Player 1');
                return;
            }
            if (swamp.checkCollision(this.player2)) {
                this.triggerGameOver('Player 2');
                return;
            }
        }
    }
    
    triggerGameOver(player) {
        this.gameOver = true;
        this.gameOverMessage = `${player} touched a hazard!`;
        this.gameState = 'GAME_OVER';
        
        // Auto-restart after 2 seconds
        setTimeout(() => {
            if (this.gameState === 'GAME_OVER') {
                this.resetLevel();
            }
        }, 2000);
    }
    
    checkRainbowCompletion() {
        if (this.rainbow && !this.levelComplete && !this.gameOver) {
            const p1InRainbow = this.rainbow.contains(this.player1);
            const p2InRainbow = this.rainbow.contains(this.player2);
            
            if (p1InRainbow && p2InRainbow) {
                this.levelComplete = true;
                this.createGlitterExplosion();
                
                // Save progress when level is completed
                ProgressManager.completeLevel(this.currentLevel);
            }
        }
    }
    
    createGlitterExplosion() {
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        
        for (let i = 0; i < 100; i++) {
            this.glitterParticles.push(new GlitterParticle(
                centerX + (Math.random() - 0.5) * 200,
                centerY + (Math.random() - 0.5) * 200,
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 10,
                this.getRandomColor()
            ));
        }
    }
    
    getRandomColor() {
        const colors = [
            [255, 0, 0],    // Red
            [255, 165, 0],  // Orange
            [255, 255, 0],  // Yellow
            [0, 255, 0],    // Green
            [0, 0, 255],    // Blue
            [75, 0, 130],   // Indigo
            [238, 130, 238] // Violet
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    updateGlitter() {
        for (let i = this.glitterParticles.length - 1; i >= 0; i--) {
            this.glitterParticles[i].update();
            if (this.glitterParticles[i].alpha <= 0) {
                this.glitterParticles.splice(i, 1);
            }
        }
    }
    
    updateClouds() {
        this.clouds.forEach(cloud => cloud.update());
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = '#87CEEB';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        if (this.gameState === 'MENU') {
            this.renderMenu();
        } else if (this.gameState === 'PLAYING') {
            this.renderGame();
        } else if (this.gameState === 'GAME_OVER') {
            this.renderGameOver();
        }
    }
    
    renderMenu() {
        // Draw title
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 48px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText("LILY'S UNICORNS", this.width / 2, this.height / 2 - 100);
        
        // Draw menu options
        this.ctx.font = '24px monospace';
        this.menuOptions.forEach((option, index) => {
            this.ctx.fillStyle = index === this.menuSelection ? '#ff6b6b' : '#fff';
            this.ctx.fillText(option, this.width / 2, this.height / 2 + (index * 50));
        });
        
        // Draw background clouds
        this.renderBackgroundClouds();
        
        // Music indicator
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '18px monospace';
        this.ctx.textAlign = 'right';
        this.ctx.fillText(`Music: ${this.musicMuted ? 'OFF' : 'ON'} (Press M)`, this.width - 20, 30);
    }
    
    renderBackgroundClouds() {
        // Simple background clouds for menu
        this.ctx.globalAlpha = 0.3;
        this.ctx.fillStyle = '#fff';
        
        // Draw some simple cloud shapes
        for (let i = 0; i < 5; i++) {
            const x = (i * 250) + 100;
            const y = 100 + Math.sin(Date.now() * 0.001 + i) * 20;
            this.drawSimpleCloud(x, y, 80, 40);
        }
        
        this.ctx.globalAlpha = 1.0;
    }
    
    drawSimpleCloud(x, y, width, height) {
        const circles = 5;
        const circleRadius = width / (circles * 1.5);
        
        for (let i = 0; i < circles; i++) {
            const circleX = x + (i * circleRadius * 1.2);
            const circleY = y + Math.sin(i * 0.5) * (height / 4);
            
            this.ctx.beginPath();
            this.ctx.arc(circleX, circleY, circleRadius, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    renderGame() {
        // Render game objects
        this.clouds.forEach(cloud => cloud.render(this.ctx));
        this.trees.forEach(tree => tree.render(this.ctx));
        this.platforms.forEach(platform => platform.render(this.ctx));
        
        if (this.rainbow) {
            this.rainbow.render(this.ctx);
        }
        
        this.whiteItems.forEach(item => item.render(this.ctx));
        this.blackItems.forEach(item => item.render(this.ctx));
        this.triangles.forEach(triangle => triangle.render(this.ctx));
        this.swamps.forEach(swamp => swamp.render(this.ctx));
        
        // Render players (only if not game over)
        if (!this.gameOver) {
            if (this.player1) this.player1.render(this.ctx);
            if (this.player2) this.player2.render(this.ctx);
        }
        
        // Render glitter
        this.glitterParticles.forEach(particle => particle.render(this.ctx));
        
        // Render UI
        this.renderUI();
    }
    
    renderUI() {
        // Ground line
        this.ctx.strokeStyle = '#8B4513';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.height - 10);
        this.ctx.lineTo(this.width, this.height - 10);
        this.ctx.stroke();
        
        // Score display
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '24px monospace';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Player 1: ${this.player1Score}`, 20, 40);
        this.ctx.fillText(`Player 2: ${this.player2Score}`, 200, 40);
        
        // Level display
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`Level ${this.currentLevel}`, this.width / 2, 40);
        
        // Music indicator
        this.ctx.textAlign = 'right';
        this.ctx.font = '18px monospace';
        this.ctx.fillStyle = this.musicMuted ? '#666' : '#fff';
        this.ctx.fillText(`Music: ${this.musicMuted ? 'OFF' : 'ON'} (M)`, this.width - 20, 30);
        
        // Level complete message
        if (this.levelComplete) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.width, this.height);
            
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 48px monospace';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('LEVEL COMPLETE!', this.width / 2, this.height / 2);
            
            this.ctx.font = '24px monospace';
            if (this.currentLevel < this.maxLevels) {
                this.ctx.fillText('Press N for next level', this.width / 2, this.height / 2 + 60);
            } else {
                this.ctx.fillText('You completed all levels!', this.width / 2, this.height / 2 + 60);
            }
        }
    }
    
    renderGameOver() {
        // Draw current game state first
        this.renderGame();
        
        // Overlay game over screen
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        this.ctx.fillStyle = '#ff0000';
        this.ctx.font = 'bold 72px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('OUCH!', this.width / 2, this.height / 2 - 50);
        
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '32px monospace';
        this.ctx.fillText(this.gameOverMessage, this.width / 2, this.height / 2 + 20);
        
        this.ctx.font = '24px monospace';
        this.ctx.fillText('Restarting level...', this.width / 2, this.height / 2 + 70);
        this.ctx.fillText('Press R to restart now', this.width / 2, this.height / 2 + 100);
    }
    
    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Unicorn class
class Unicorn {
    constructor(spriteImage, x, y, inverted = false, playerType = 'player1') {
        this.spriteImage = spriteImage;
        this.x = x;
        this.y = y;
        this.width = 64;
        this.height = 64;
        this.inverted = inverted;
        this.playerType = playerType;
        
        // Animation
        this.frameIndex = 0;
        this.frameTimer = 0;
        this.frameDelay = 0.15;
        this.animationState = 'idle'; // idle, running, jumping
        this.lastAnimationState = 'idle';
        this.animationStateTimer = 0;
        
        // Physics
        this.velocityX = 0;
        this.velocityY = 0;
        this.gravity = 0.5;
        this.jumpStrength = -12;
        this.speed = 5;
        this.onGround = false;
        this.facingRight = true;
        this.climbingPlatform = null;
        
        // Sprite sheet info (5x3 grid, 16x16 per frame)
        this.frameWidth = 16;
        this.frameHeight = 16;
        this.framesPerRow = 5;
        this.totalFrames = 15;
        
        this.groundLevel = (720 - 10) - this.height; // Unicorn's Y position when bottom touches ground
    }
    
    update(keys, platforms, trees) {
        this.handleInput(keys);
        this.updatePhysics();
        this.handleCollisions(platforms, trees);
        this.updateAnimationState();
        this.updateAnimation();
    }
    
    handleInput(keys) {
        let leftKey, rightKey, upKey, downKey;
        
        if (this.playerType === 'player1') {
            leftKey = 'ArrowLeft';
            rightKey = 'ArrowRight';
            upKey = 'ArrowUp';
            downKey = 'ArrowDown';
        } else {
            leftKey = 'a';
            rightKey = 'd';
            upKey = 'w';
            downKey = 's';
        }
        
        
        // Horizontal movement
        this.velocityX = 0;
        if (keys[leftKey]) {
            this.velocityX = -this.speed;
            this.facingRight = false;
        }
        if (keys[rightKey]) {
            this.velocityX = this.speed;
            this.facingRight = true;
        }
        
        // Jumping and climbing
        if (keys[upKey]) {
            if (this.onGround) {
                this.velocityY = this.jumpStrength;
                this.onGround = false;
            } else if (this.climbingPlatform) {
                this.y -= this.speed;
            }
        }
        
        if (keys[downKey] && this.climbingPlatform) {
            this.y += this.speed;
        }
    }
    
    updatePhysics() {
        this.x += this.velocityX;
        this.y += this.velocityY;
        
        // Apply gravity
        if (!this.onGround) {
            this.velocityY += this.gravity;
        }
        
        // Ground collision
        if (this.y >= this.groundLevel) {
            this.y = this.groundLevel;
            this.velocityY = 0;
            this.onGround = true;
        }
        
        // Screen boundaries
        if (this.x < 0) this.x = 0;
        if (this.x > 1280 - this.width) this.x = 1280 - this.width;
    }
    
    handleCollisions(platforms, trees) {
        // Start by checking ground collision
        let onGroundThisFrame = this.y >= this.groundLevel;
        this.climbingPlatform = null;
        
        // Platform collisions - predictive detection
        platforms.forEach(platform => {
            const playerBottom = this.y + this.height;
            const playerLeft = this.x;
            const playerRight = this.x + this.width;
            const platformTop = platform.y;
            const platformLeft = platform.x;
            const platformRight = platform.x + platform.width;
            
            // Check horizontal overlap first
            const overlapLeft = Math.max(playerLeft, platformLeft);
            const overlapRight = Math.min(playerRight, platformRight);
            const overlapWidth = overlapRight - overlapLeft;
            
            if (overlapWidth > 0) {
                // Predictive collision: check if unicorn will cross platform top in next frame
                const nextPlayerBottom = playerBottom + this.velocityY;
                
                // If unicorn is above platform and will cross it, or is very close to it
                if (this.velocityY > 0 && 
                    playerBottom <= platformTop && 
                    nextPlayerBottom >= platformTop - 5) {
                    
                    this.y = platform.y - this.height;
                    this.velocityY = 0;
                    onGroundThisFrame = true;
                }
            }
            
            // Side collision (climbing) - check full intersection
            if (this.intersects(platform) && Math.abs(this.velocityX) > 0) {
                this.climbingPlatform = platform;
            }
        });
        
        // Tree collisions (top only) - predictive detection
        trees.forEach(tree => {
            const playerBottom = this.y + this.height;
            const playerLeft = this.x;
            const playerRight = this.x + this.width;
            const treeTop = tree.y + (tree.height * 0.3); // Tree top area
            const treeLeft = tree.x;
            const treeRight = tree.x + tree.width;
            
            // Check horizontal overlap first
            const overlapLeft = Math.max(playerLeft, treeLeft);
            const overlapRight = Math.min(playerRight, treeRight);
            const overlapWidth = overlapRight - overlapLeft;
            
            if (overlapWidth > 0) {
                // Predictive collision: check if unicorn will cross tree top in next frame
                const nextPlayerBottom = playerBottom + this.velocityY;
                
                // If unicorn is above tree top and will cross it, or is very close to it
                if (this.velocityY > 0 && 
                    playerBottom <= treeTop && 
                    nextPlayerBottom >= treeTop - 5) {
                    
                    this.y = treeTop - this.height;
                    this.velocityY = 0;
                    onGroundThisFrame = true;
                }
            }
        });
        
        // Update onGround state (after both platforms and trees)
        this.onGround = onGroundThisFrame;
    }
    
    intersects(rect) {
        return this.x < rect.x + rect.width &&
               this.x + this.width > rect.x &&
               this.y < rect.y + rect.height &&
               this.y + this.height > rect.y;
    }
    
    updateAnimationState() {
        let newState = 'idle';
        
        // Determine animation state based on unicorn's movement
        if (!this.onGround || this.velocityY < -1) {
            newState = 'jumping';
        } else if (Math.abs(this.velocityX) > 0.1) {
            newState = 'running';
        } else {
            newState = 'idle';
        }
        
        // Add stability - only change state if it's been consistent for a few frames
        if (newState === this.lastAnimationState) {
            this.animationStateTimer++;
            if (this.animationStateTimer >= 3) { // Require 3 frames of consistency
                this.animationState = newState;
            }
        } else {
            this.animationStateTimer = 0;
        }
        
        this.lastAnimationState = newState;
        
        // Reset frame index when changing animation states
        if (this.animationState !== newState && this.animationStateTimer >= 3) {
            this.frameIndex = 0;
        }
    }
    
    updateAnimation() {
        this.frameTimer += this.frameDelay;
        if (this.frameTimer >= 1) {
            this.frameIndex = (this.frameIndex + 1) % this.framesPerRow;
            this.frameTimer = 0;
        }
    }
    
    render(ctx) {
        if (!this.spriteImage) return;
        
        // Calculate sprite position in sheet based on animation state
        const col = this.frameIndex % this.framesPerRow;
        
        // Determine row based on animation state
        let row = 2; // Default to idle (row 3, index 2)
        switch (this.animationState) {
            case 'jumping':
                row = 0; // First row (index 0)
                break;
            case 'running':
                row = 1; // Second row (index 1)
                break;
            case 'idle':
                row = 2; // Third row (index 2)
                break;
        }
        
        const srcX = col * this.frameWidth;
        const srcY = row * this.frameHeight;
        
        ctx.save();
        
        // Flip horizontally if facing left
        if (!this.facingRight) {
            ctx.scale(-1, 1);
            ctx.translate(-this.x - this.width, 0);
        } else {
            ctx.translate(this.x, 0);
        }
        
        // Color inversion for player 2
        if (this.inverted) {
            ctx.filter = 'invert(1)';
        }
        
        ctx.drawImage(
            this.spriteImage,
            srcX, srcY, this.frameWidth, this.frameHeight,
            0, this.y, this.width, this.height
        );
        
        ctx.restore();
    }
}

// Platform class
class Platform {
    constructor(x, y, width, height, color, alpha) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.alpha = alpha;
    }
    
    render(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha / 255;
        ctx.fillStyle = `rgb(${this.color[0]}, ${this.color[1]}, ${this.color[2]})`;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.restore();
    }
}

// Tree class
class Tree {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    
    render(ctx) {
        // Draw trunk
        const trunkWidth = this.width * 0.3;
        const trunkHeight = this.height * 0.7;
        const trunkX = this.x + (this.width - trunkWidth) / 2;
        const trunkY = this.y + this.height - trunkHeight;
        
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(trunkX, trunkY, trunkWidth, trunkHeight);
        
        // Draw foliage
        const foliageRadius = this.width * 0.6;
        const foliageX = this.x + this.width / 2;
        const foliageY = this.y + this.height * 0.3;
        
        ctx.fillStyle = '#228B22';
        ctx.beginPath();
        ctx.arc(foliageX, foliageY, foliageRadius, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Cloud class
class Cloud {
    constructor(x, y, width, height, alpha) {
        this.baseX = x;
        this.baseY = y;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.alpha = alpha;
        
        // Floating animation properties
        this.floatSpeed = 0.5 + Math.random() * 0.5; // Random speed between 0.5 and 1.0
        this.floatRange = 20 + Math.random() * 30; // Random range between 20 and 50 pixels
        this.floatOffset = Math.random() * Math.PI * 2; // Random starting phase
    }
    
    update() {
        // Calculate floating position around base point
        const time = Date.now() * 0.001 * this.floatSpeed;
        this.x = this.baseX + Math.sin(time + this.floatOffset) * this.floatRange * 0.5;
        this.y = this.baseY + Math.cos(time * 0.7 + this.floatOffset) * this.floatRange * 0.3;
    }
    
    render(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha / 255;
        ctx.fillStyle = '#fff';
        
        // Draw cloud as overlapping circles
        const circles = 5;
        const circleRadius = this.width / (circles * 1.5);
        
        for (let i = 0; i < circles; i++) {
            const circleX = this.x + (i * circleRadius * 1.2);
            const circleY = this.y + Math.sin(i * 0.5) * (this.height / 4);
            
            ctx.beginPath();
            ctx.arc(circleX, circleY, circleRadius, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
}

// Item class
class Item {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 20;
        this.type = type;
    }
    
    checkCollision(player) {
        return player.x < this.x + this.width &&
               player.x + player.width > this.x &&
               player.y < this.y + this.height &&
               player.y + player.height > this.y;
    }
    
    render(ctx) {
        ctx.fillStyle = this.type === 'white' ? '#fff' : '#000';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Add border
        ctx.strokeStyle = this.type === 'white' ? '#000' : '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
}

// Rainbow class
class Rainbow {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.colors = [
            [255, 0, 0],    // Red
            [255, 165, 0],  // Orange
            [255, 255, 0],  // Yellow
            [0, 255, 0],    // Green
            [0, 0, 255],    // Blue
            [75, 0, 130],   // Indigo
            [238, 130, 238] // Violet
        ];
    }
    
    contains(player) {
        // More forgiving collision - only requires significant overlap (50% of player)
        const playerCenterX = player.x + player.width / 2;
        const playerCenterY = player.y + player.height / 2;
        
        // Check if player center is in rainbow, OR if there's significant overlap
        const centerInRainbow = playerCenterX >= this.x && playerCenterX <= this.x + this.width &&
                               playerCenterY >= this.y && playerCenterY <= this.y + this.height;
        
        // Calculate overlap area
        const overlapLeft = Math.max(player.x, this.x);
        const overlapRight = Math.min(player.x + player.width, this.x + this.width);
        const overlapTop = Math.max(player.y, this.y);
        const overlapBottom = Math.min(player.y + player.height, this.y + this.height);
        
        const overlapWidth = Math.max(0, overlapRight - overlapLeft);
        const overlapHeight = Math.max(0, overlapBottom - overlapTop);
        const overlapArea = overlapWidth * overlapHeight;
        
        const playerArea = player.width * player.height;
        const overlapPercentage = overlapArea / playerArea;
        
        // Accept if center is in rainbow OR if at least 40% of player overlaps
        return centerInRainbow || overlapPercentage >= 0.4;
    }
    
    render(ctx) {
        ctx.save();
        ctx.globalAlpha = 0.7;
        
        const bandHeight = this.height / this.colors.length;
        
        this.colors.forEach((color, index) => {
            ctx.fillStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
            ctx.fillRect(this.x, this.y + (index * bandHeight), this.width, bandHeight);
        });
        
        ctx.restore();
    }
}

// GlitterParticle class
class GlitterParticle {
    constructor(x, y, velocityX, velocityY, color) {
        this.x = x;
        this.y = y;
        this.velocityX = velocityX;
        this.velocityY = velocityY;
        this.color = color;
        this.alpha = 255;
        this.size = Math.random() * 6 + 2;
        this.gravity = 0.1;
        this.life = 60;
    }
    
    update() {
        this.x += this.velocityX;
        this.y += this.velocityY;
        this.velocityY += this.gravity;
        
        this.life--;
        this.alpha = (this.life / 60) * 255;
        
        // Bounce off ground
        if (this.y > (720 - 10) - this.size) {
            this.y = (720 - 10) - this.size;
            this.velocityY *= -0.5;
        }
    }
    
    render(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha / 255;
        ctx.fillStyle = `rgb(${this.color[0]}, ${this.color[1]}, ${this.color[2]})`;
        ctx.fillRect(this.x, this.y, this.size, this.size);
        ctx.restore();
    }
}

// Triangle class
class Triangle {
    constructor(x, y, size, color) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.color = color;
        this.width = size;
        this.height = size;
    }
    
    checkCollision(player) {
        // Triangle vertices
        const topX = this.x + this.size / 2;
        const topY = this.y;
        const bottomLeftX = this.x;
        const bottomLeftY = this.y + this.size;
        const bottomRightX = this.x + this.size;
        const bottomRightY = this.y + this.size;
        
        // Check multiple points on the player for more forgiving collision
        const playerPoints = [
            // Center point
            { x: player.x + player.width / 2, y: player.y + player.height / 2 },
            // Corner points
            { x: player.x, y: player.y }, // Top left
            { x: player.x + player.width, y: player.y }, // Top right
            { x: player.x, y: player.y + player.height }, // Bottom left
            { x: player.x + player.width, y: player.y + player.height }, // Bottom right
            // Edge midpoints for better coverage
            { x: player.x + player.width / 2, y: player.y }, // Top center
            { x: player.x + player.width / 2, y: player.y + player.height }, // Bottom center
            { x: player.x, y: player.y + player.height / 2 }, // Left center
            { x: player.x + player.width, y: player.y + player.height / 2 } // Right center
        ];
        
        // Check if any of the player points are inside the triangle
        for (let point of playerPoints) {
            if (this.isPointInTriangle(point.x, point.y, 
                                     topX, topY, 
                                     bottomLeftX, bottomLeftY, 
                                     bottomRightX, bottomRightY)) {
                return true;
            }
        }
        
        return false;
    }
    
    isPointInTriangle(px, py, x1, y1, x2, y2, x3, y3) {
        // Calculate barycentric coordinates
        const denominator = ((y2 - y3) * (x1 - x3) + (x3 - x2) * (y1 - y3));
        if (Math.abs(denominator) < 0.0001) return false; // Avoid division by zero
        
        const a = ((y2 - y3) * (px - x3) + (x3 - x2) * (py - y3)) / denominator;
        const b = ((y3 - y1) * (px - x3) + (x1 - x3) * (py - y3)) / denominator;
        const c = 1 - a - b;
        
        // Point is inside triangle if all barycentric coordinates are positive
        return a >= 0 && b >= 0 && c >= 0;
    }
    
    render(ctx) {
        ctx.fillStyle = `rgb(${this.color[0]}, ${this.color[1]}, ${this.color[2]})`;
        ctx.beginPath();
        ctx.moveTo(this.x + this.size / 2, this.y); // Top point
        ctx.lineTo(this.x, this.y + this.size); // Bottom left
        ctx.lineTo(this.x + this.size, this.y + this.size); // Bottom right
        ctx.closePath();
        ctx.fill();
        
        // Add border
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

// SwampBubble class for enhanced bubble effects
class SwampBubble {
    constructor(x, y, maxSize, swampWidth, swampHeight) {
        this.x = x;
        this.y = y;
        this.maxSize = maxSize;
        this.size = Math.random() * (maxSize * 0.5) + (maxSize * 0.3);
        this.growthRate = 0.3 + Math.random() * 0.4;
        this.alpha = 0.4 + Math.random() * 0.3;
        this.offsetX = (Math.random() - 0.5) * 10;
        this.offsetY = (Math.random() - 0.5) * 8;
        this.timeOffset = Math.random() * Math.PI * 2;
        this.swampWidth = swampWidth;
        this.swampHeight = swampHeight;
        this.life = 0;
        this.maxLife = 100 + Math.random() * 100;
        this.popAnimation = 0;
        this.popped = false;
    }
    
    update() {
        this.life++;
        
        // Grow bubble over time
        if (!this.popped && this.size < this.maxSize) {
            this.size += this.growthRate;
        }
        
        // Pop bubble when it reaches max size or max life
        if ((this.size >= this.maxSize || this.life >= this.maxLife) && !this.popped) {
            this.popped = true;
            this.popAnimation = 10;
        }
        
        // Handle pop animation
        if (this.popped && this.popAnimation > 0) {
            this.popAnimation--;
            this.alpha *= 0.8;
        }
        
        return this.popAnimation <= 0 && this.popped;
    }
    
    render(ctx, time, swampX, swampY) {
        if (this.popped && this.popAnimation <= 0) return;
        
        const animX = swampX + this.x + this.offsetX + Math.sin(time * 0.002 + this.timeOffset) * 3;
        const animY = swampY + this.y + this.offsetY + Math.sin(time * 0.003 + this.timeOffset) * 2;
        
        ctx.save();
        ctx.globalAlpha = this.alpha;
        
        if (this.popped) {
            // Pop animation - expanding ring
            ctx.strokeStyle = 'rgba(101, 67, 33, 0.8)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(animX, animY, this.size + (10 - this.popAnimation) * 2, 0, Math.PI * 2);
            ctx.stroke();
        } else {
            // Normal bubble
            const gradient = ctx.createRadialGradient(
                animX - this.size * 0.3, 
                animY - this.size * 0.3, 
                0,
                animX, 
                animY, 
                this.size
            );
            gradient.addColorStop(0, 'rgba(139, 100, 69, 0.8)');
            gradient.addColorStop(0.7, 'rgba(101, 67, 33, 0.6)');
            gradient.addColorStop(1, 'rgba(85, 55, 25, 0.4)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(animX, animY, this.size, 0, Math.PI * 2);
            ctx.fill();
            
            // Add bubble highlight
            ctx.fillStyle = 'rgba(200, 180, 140, 0.3)';
            ctx.beginPath();
            ctx.arc(animX - this.size * 0.3, animY - this.size * 0.3, this.size * 0.4, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
}

// EvaporationParticle class for upward steam effects
class EvaporationParticle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.velocityX = (Math.random() - 0.5) * 0.5;
        this.velocityY = -0.5 - Math.random() * 0.8;
        this.size = 2 + Math.random() * 4;
        this.alpha = 0.6 + Math.random() * 0.4;
        this.life = 120 + Math.random() * 80;
        this.maxLife = this.life;
        this.sway = Math.random() * 0.02 + 0.01;
        this.timeOffset = Math.random() * Math.PI * 2;
    }
    
    update() {
        this.life--;
        
        // Move upward with sway
        this.x += this.velocityX + Math.sin(Date.now() * this.sway + this.timeOffset) * 0.3;
        this.y += this.velocityY;
        
        // Fade and grow slightly as it rises
        this.alpha = (this.life / this.maxLife) * 0.6;
        this.size += 0.01;
        
        // Slow down over time
        this.velocityY *= 0.998;
        this.velocityX *= 0.998;
        
        return this.life <= 0;
    }
    
    render(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.size
        );
        gradient.addColorStop(0, 'rgba(200, 200, 200, 0.8)');
        gradient.addColorStop(0.5, 'rgba(180, 180, 180, 0.4)');
        gradient.addColorStop(1, 'rgba(160, 160, 160, 0.1)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}

// Enhanced Swamp class with particle management
class Swamp {
    constructor(x, y, width, height, color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.bubbles = [];
        this.evaporationParticles = [];
        this.bubbleSpawnTimer = 0;
        this.evaporationSpawnTimer = 0;
        this.maxBubbles = Math.floor(this.width / 30) + 3; // More bubbles for larger swamps
        this.bubbleSpawnRate = 40 + Math.random() * 30;
        this.evaporationSpawnRate = 15 + Math.random() * 10;
    }
    
    update() {
        // Spawn new bubbles
        this.bubbleSpawnTimer++;
        if (this.bubbleSpawnTimer >= this.bubbleSpawnRate && this.bubbles.length < this.maxBubbles) {
            this.spawnBubble();
            this.bubbleSpawnTimer = 0;
            this.bubbleSpawnRate = 40 + Math.random() * 30;
        }
        
        // Spawn evaporation particles
        this.evaporationSpawnTimer++;
        if (this.evaporationSpawnTimer >= this.evaporationSpawnRate) {
            this.spawnEvaporationParticle();
            this.evaporationSpawnTimer = 0;
            this.evaporationSpawnRate = 15 + Math.random() * 10;
        }
        
        // Update bubbles
        this.bubbles = this.bubbles.filter(bubble => !bubble.update());
        
        // Update evaporation particles
        this.evaporationParticles = this.evaporationParticles.filter(particle => !particle.update());
    }
    
    spawnBubble() {
        const bubbleX = Math.random() * (this.width - 40) + 20;
        const bubbleY = this.height * 0.3 + Math.random() * (this.height * 0.4);
        const maxSize = 15 + Math.random() * 25; // Bigger bubbles (15-40px)
        
        this.bubbles.push(new SwampBubble(bubbleX, bubbleY, maxSize, this.width, this.height));
    }
    
    spawnEvaporationParticle() {
        const particleX = this.x + Math.random() * this.width;
        const particleY = this.y + Math.random() * (this.height * 0.3);
        
        this.evaporationParticles.push(new EvaporationParticle(particleX, particleY));
    }
    
    checkCollision(player) {
        // Check if any part of the player overlaps with the swamp
        const playerLeft = player.x;
        const playerRight = player.x + player.width;
        const playerTop = player.y;
        const playerBottom = player.y + player.height;
        
        const swampLeft = this.x;
        const swampRight = this.x + this.width;
        const swampTop = this.y;
        const swampBottom = this.y + this.height;
        
        // Check for overlap
        return playerLeft < swampRight && 
               playerRight > swampLeft && 
               playerTop < swampBottom && 
               playerBottom > swampTop;
    }
    
    render(ctx) {
        // Draw swamp with muddy brown color and enhanced texture
        const gradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
        gradient.addColorStop(0, `rgba(${this.color[0]}, ${this.color[1]}, ${this.color[2]}, 0.9)`);
        gradient.addColorStop(0.6, `rgb(${this.color[0]}, ${this.color[1]}, ${this.color[2]})`);
        gradient.addColorStop(1, `rgba(${Math.max(0, this.color[0]-20)}, ${Math.max(0, this.color[1]-20)}, ${Math.max(0, this.color[2]-20)}, 1)`);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Add darker border
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        
        // Add some surface texture
        ctx.fillStyle = 'rgba(85, 55, 25, 0.3)';
        for (let i = 0; i < 3; i++) {
            const waveX = this.x + (i * this.width / 3);
            const waveY = this.y + Math.sin(Date.now() * 0.001 + i) * 2;
            const waveWidth = this.width / 3;
            const waveHeight = 4;
            ctx.fillRect(waveX, waveY, waveWidth, waveHeight);
        }
        
        // Render evaporation particles first (behind bubbles)
        this.evaporationParticles.forEach(particle => particle.render(ctx));
        
        // Render bubbles
        const time = Date.now();
        this.bubbles.forEach(bubble => bubble.render(ctx, time, this.x, this.y));
    }
}

// Start the game
const game = new Game();
