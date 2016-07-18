/* Set of arrays used as render 'layers'
 * and as memory containers for classes instances 
 * so they could be easily purged by setting equal to []
 */
var backgroundLayer = [];
var playerLayer = []
var enemiesLayer = [];
var collectablesLayer = [];
var textLayer = [];

// Scene class: defines whole level and contain all its objects
var Scene = function (w, h, difficulty) {

    // w and h should be equal to canvas width and height respectively
    this.w = w;
    this.h = h;
    this.difficulty = difficulty;

    // Images dimensions parameters for coordinates calculations
    this.BLOCK_WIDTH = 101;
    this.BLOCK_TOP = 50;
    this.BLOCK_HEIGHT = 83;
    this.BLOCK_BOTTOM = 38;

    // Minimum game area is 3x3
    this.MIN_HORIZONTAL = 3;
    this.MIN_VERTICAL = 3;

    // Calculate dimensions of game level area
    this.horizontalBlocksNumber = Math.floor(this.w / this.BLOCK_WIDTH);

    // Exception (not enough horizontal space)
    if (this.horizontalBlocksNumber < this.MIN_HORIZONTAL) {
        alert('Not enough horizontal space on the scene!');
        return;
    }
    this.verticalBlocksNumber = Math.floor((this.h - this.BLOCK_TOP - this.BLOCK_BOTTOM) / this.BLOCK_HEIGHT);

    // Exception (not enough vertical space)
    if (this.verticalBlocksNumber < this.MIN_VERTICAL) {
        alert('Not enough vertical space on the scene!');
        return;
    }

    // Call method to create backgroud
    this.composeLevel();

    // Call method to create player
    this.selectPlayer();

};

Scene.prototype.composeLevel = function () {
    /* Method creates the bottom canvas layer — background.
     * Background consist of water, stone and grass rows,
     * which numbers are relate to scene width and height
     * and current difficulty of the level
     * (if there is enough space, thr number of stone rows increases every 5 levels)
     */

    // clearing current background setup
    backgroundLayer = [];

    // Calculate number of stone rows based on difficulty.
    // Normal case minimum is 2 stone rows
    this.stoneRowsNumber = Math.floor(this.difficulty / 5) + 2;

    // Checke if there is not enough space for calculated stone rows number
    if (this.verticalBlocksNumber - this.stoneRowsNumber < 2) {
        // If not — defining stone rows number as (the max number of vertical blocks - 2),
        // so there will be space for 1 water row, 1 grass row and all the rest is for stone
        this.stoneRowsNumber = this.verticalBlocksNumber - 2;
    }

    // Calculate vertical points where stone and grass rows begin
    // Water rows always begin from y = 0
    this.stoneRowStart = Math.floor((this.verticalBlocksNumber - this.stoneRowsNumber) / 2);
    this.grassRowStart = this.stoneRowStart + this.stoneRowsNumber;

    // Create Background instances for current scene parameters
    for (var rowIndex = 0; rowIndex < this.verticalBlocksNumber; rowIndex++) {
        for (var colIndex = 0; colIndex < this.horizontalBlocksNumber; colIndex++) {
            if (rowIndex < this.stoneRowStart) {
                new Background(colIndex * this.BLOCK_WIDTH, rowIndex * this.BLOCK_HEIGHT, 'images/water-block.png');
            } else if (rowIndex < this.grassRowStart) {
                new Background(colIndex * this.BLOCK_WIDTH, rowIndex * this.BLOCK_HEIGHT, 'images/stone-block.png');
            } else {
                new Background(colIndex * this.BLOCK_WIDTH, rowIndex * this.BLOCK_HEIGHT, 'images/grass-block.png');
            }
        }
    }
};
Scene.prototype.selectPlayer = function () {
    // Method allows user to select sprite for Player instance.

    // Create info text for user and show him sprites
    new TextSprite(this.w / 2, 200, 'Select Player:', Math.min(this.horizontalBlocksNumber * 12, 50), 'center');
    new TextSprite(this.w / 2, 260, 'Press a number to select', Math.min(this.horizontalBlocksNumber * 7, 30), 'center');
    var players = [
        'images/char-boy.png',
        'images/char-cat-girl.png',
        'images/char-horn-girl.png',
        'images/char-pink-girl.png',
        'images/char-princess-girl.png'
    ];
    for (var i = 0; i < players.length; i++) {
        playerLayer.push(new Sprite(i * this.w / 5 + this.w / 10 - this.BLOCK_WIDTH / 2, this.grassRowStart * this.BLOCK_HEIGHT - 10, players[i]));
        textLayer.push(new TextSprite(i * this.w / 5 + this.w / 10, (this.grassRowStart + 1) * this.BLOCK_HEIGHT + 80, i + 1, 40, 'center'));
    }

    // Create sprite-select keyboard handler
    var scene = this;
    var playerSelectHandler = function (e) {
        var allowedKeys = {
            // Normal keyboard codes
            49: '0',
            50: '1',
            51: '2',
            52: '3',
            53: '4',

            // Numpad codes
            97: '0',
            98: '1',
            99: '2',
            100: '3',
            101: '4'
        };
        // Check if one of correct buttons is pressed
        if (e.keyCode >= 49 && e.keyCode <= 53 || e.keyCode >= 97 && e.keyCode <= 101) {
            // Remove this event listner and handler from document
            document.removeEventListener('keyup', playerSelectHandler);

            // Call next Scene method to launch level with selected sprite
            scene.startLevel(players[allowedKeys[e.keyCode]]);
        }
    };

    // Add this event listner untill user select sprite
    document.addEventListener('keyup', playerSelectHandler);
};
Scene.prototype.startLevel = function (playerSprite) {
    /* Clear playerLevel and textLayer,
     * and then create two text user interface elements:
     * - scores
     * - level number (difficulty indicator)
     * and then call for spawnCollectables and summonEnemies methods
     */

    playerLayer = [];
    textLayer = [];
    this.player = new Player(Math.floor(this.horizontalBlocksNumber / 2) * this.BLOCK_WIDTH, this.grassRowStart * this.BLOCK_HEIGHT - 10, playerSprite, this);
    this.scores = new TextSprite(this.w, 35, 0, 22, 'right');
    this.sceneTitle = new TextSprite(0, 35, 'Level ' + this.difficulty, 22, 'left');
    this.spawnCollectable();
    this.summonEnemies();
};
Scene.prototype.summonEnemies = function () {
    /* This method places enemy bugs on the Scene
     * bugs quanity and speed depend on Scene stoneRowsNumber and difficulty
     */

    enemiesLayer = [];
    for (var i = 0; i < this.stoneRowsNumber; i++) {
        new Enemy(
            this.BLOCK_WIDTH * Math.round(Math.random() * (Math.floor(this.horizontalBlocksNumber + 2) / 2) - 1),
            (this.stoneRowStart + i) * this.BLOCK_HEIGHT - 20,
            'images/enemy-bug.png',
            this,
            this.difficulty * 5 + 25 + Math.random() * this.difficulty * 10
        );
    }
};
Scene.prototype.spawnCollectable = function () {
    /* This method places orange Gem on the Scene
     * probability of Gem spawn depends on level difficulty
     */

    collectablesLayer = [];
    if (this.difficulty - Math.random() * 50 >= 0) {
        new Collectable(
            Math.floor(Math.random() * (this.horizontalBlocksNumber - 1)) * this.BLOCK_WIDTH,
            Math.floor(Math.random() * (this.stoneRowsNumber - 1) + this.stoneRowStart) * this.BLOCK_HEIGHT,
            'images/Gem Orange.png',
            this
        );
    }
};
Scene.prototype.gameOver = function () {
    textLayer = [];
    enemiesLayer = [];
    collectablesLayer = [];
    new TextSprite(this.w / 2, this.h / 4, 'Game Over!', Math.min(this.horizontalBlocksNumber * 12, 50), 'center');
    new TextSprite(this.w / 2, this.h / 2, 'Your score is', Math.min(this.horizontalBlocksNumber * 7, 30), 'center');
    new TextSprite(this.w / 2, this.h / 2 + 60, this.scores.text, Math.min(this.horizontalBlocksNumber * 7, 40), 'center');
    new TextSprite(this.w / 2, this.h * 0.8, 'Press F5 to reset', Math.min(this.horizontalBlocksNumber * 7, 30), 'center');
    this.player.handleInput = function (e) {
        return;
    };
};

// Sprite class: parent class for almost every renderable object
var Sprite = function (x, y, sprite) {
    this.x = x;
    this.y = y;
    this.sprite = sprite;
};
Sprite.prototype.render = function () {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// TextSprite class: allows to draw text on the screen
var TextSprite = function (x, y, text, fontSize, align) {
    this.x = x;
    this.y = y;
    this.text = text;
    this.fontSize = fontSize;
    this.align = align;
    textLayer.push(this);
};
TextSprite.prototype.render = function () {
    ctx.font = this.fontSize + 'pt Impact';
    ctx.textAlign = this.align;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.fillStyle = '#fff';
    ctx.fillText(this.text, this.x, this.y);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = this.fontSize / 20;
    ctx.strokeText(this.text, this.x, this.y);
};

// Background class: extend of Sprite class
// Instances of this class automatically added to backgroundLayer
var Background = function (x, y, sprite, scene) {
    Sprite.call(this, x, y, sprite);
    this.scene = scene;
    backgroundLayer.push(this);
};
Background.prototype = Object.create(Sprite.prototype);
Background.prototype.constructor = Background;

/* Collectable class: extend of Sprite class
 * Instances of this class automatically added to collectablesLayer
 * have its own render() method
 * and also update() method
 */
var Collectable = function (x, y, sprite, scene) {
    Sprite.call(this, x * 2 + scene.BLOCK_WIDTH / 2, y * 2 + scene.BLOCK_HEIGHT * 0.8, sprite);
    this.scene = scene;
    collectablesLayer.push(this);
};
Collectable.prototype = Object.create(Sprite.prototype);
Collectable.prototype.constructor = Collectable;
Collectable.prototype.render = function () {
    // Orange Gem sprite is scales to 50%
    ctx.scale(1 / 2, 1 / 2);
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    ctx.scale(2, 2);
};
Collectable.prototype.update = function (dt) {
    // Collision check
    if (this.scene.player.x <= this.x / 2 &&
        this.scene.player.x >= this.x / 2 - +this.scene.BLOCK_WIDTH &&
        this.scene.player.y >= this.y / 2 - this.scene.BLOCK_HEIGHT * 0.8 &&
        this.scene.player.y <= this.y / 2) {

        // On collision player's scores are doubled
        this.scene.scores.text *= 2;

        // and Gem is removed
        collectablesLayer = [];
    }
};

/* Player class: extend of Sprite class
 * Instances of this class automatically added to playerLayer
 */
var Player = function (x, y, sprite, scene) {
    Sprite.call(this, x, y, sprite);
    this.scene = scene;
    playerLayer.push(this);

    // Have health property
    // And creates Health class instance linked to *this* player
    this.health = 3;
    new Health(this.scene.w / 2, -10, 'images/Heart.png', this);

    // On creation adds event listener to the document
    // so user can control its movement
    document.addEventListener('keyup', function (e) {
        var allowedKeys = {
            37: 'left',
            38: 'up',
            39: 'right',
            40: 'down'
        };

        // If one of allowed keys is pressed,
        // handleInput method is called
        if (e.keyCode in allowedKeys) {
            scene.player.handleInput(allowedKeys[e.keyCode]);
        }
    });
};
Player.prototype = Object.create(Sprite.prototype);
Player.prototype.constructor = Player;
Player.prototype.handleInput = function (code) {
    // Movements and Scene borders check
    if (code == 'left' && this.x >= this.scene.BLOCK_WIDTH) {
        this.x -= this.scene.BLOCK_WIDTH;
    }
    if (code == 'right' && this.x <= this.scene.BLOCK_WIDTH * (this.scene.horizontalBlocksNumber - 2)) {
        this.x += this.scene.BLOCK_WIDTH;
    }
    if (code == 'down' && this.y <= this.scene.BLOCK_HEIGHT * (this.scene.verticalBlocksNumber - 2)) {
        this.y += this.scene.BLOCK_HEIGHT;
    }

    // 'up' movement is special, because it allows player to reach the water
    // which means that level is finished
    if (code == 'up' && this.y >= 0) {
        this.y -= this.scene.BLOCK_HEIGHT;

        // Check if new coordinates contain water
        if (this.y <= this.scene.BLOCK_HEIGHT * (this.scene.stoneRowStart - 1)) {

            // If player reached the water, win method is called
            this.win();
        }
    }
};
Player.prototype.win = function () {
    // he gets 500 * difficulty score points
    this.scene.scores.text += 500 * this.scene.difficulty;

    // Every 5 levels player gets one more health point
    // but no more than 5
    if (Math.floor((this.scene.difficulty + 1) / 5) > Math.floor(this.scene.difficulty / 5)) {
        this.health++;
        this.health = Math.min(5, this.health++);
    }

    // Difficulty grows every time player reaches the water
    this.scene.difficulty++;
    this.scene.sceneTitle.text = 'Level ' + this.scene.difficulty;

    // Level reset
    this.scene.composeLevel();
    this.scene.spawnCollectable();
    this.scene.summonEnemies();

    // And player position reset too
    this.x = Math.floor(level.horizontalBlocksNumber / 2) * level.BLOCK_WIDTH;
    this.y = level.grassRowStart * level.BLOCK_HEIGHT - 10;
};
Player.prototype.hit = function () {
    // Method applies damage on player due to Emeny-Player collision
    this.health--;

    if (this.health > 0) {

        // If a player is still alive his position will be reset
        this.x = Math.floor(this.scene.horizontalBlocksNumber / 2) * this.scene.BLOCK_WIDTH;
        this.y = this.scene.grassRowStart * this.scene.BLOCK_HEIGHT - 10;

    } else {

        // Else scene.gameOver method is called
        this.scene.gameOver();
    }
};

/* Health class: extend of Sprite class
 * Instance of this class automatically added to playerLayer
 * and used for player health indication
 */
var Health = function (x, y, sprite, player) {
    Sprite.call(this, x, y, sprite);
    this.player = player;
    playerLayer.push(this);
};
Health.prototype = Object.create(Sprite.prototype);
Health.prototype.constructor = Health;
Health.prototype.render = function () {
    for (var i = 0; i < this.player.health; i++) {
        ctx.scale(1 / 3, 1 / 3);
        ctx.drawImage(Resources.get(this.sprite), this.x * 3 + i * this.player.scene.BLOCK_WIDTH - this.player.scene.BLOCK_WIDTH * this.player.health / 2, this.y);
        ctx.scale(3, 3);
    }
};

/* Enemy class: extend of Sprite class
 * Instance of this class automatically added to enemiesLayer
 */
var Enemy = function (x, y, sprite, scene, speed) {
    Sprite.call(this, x, y, sprite);
    this.scene = scene;
    this.speed = speed;
    enemiesLayer.push(this);
};
Enemy.prototype = Object.create(Sprite.prototype);
Enemy.prototype.constructor = Enemy;
Enemy.prototype.update = function (dt) {
    // This method controls movements of all enemies
    this.x += this.speed * dt;

    // When some bug reaches Scene border
    // he is returned to other side
    if (this.x >= this.scene.w) {
        this.x = -this.scene.BLOCK_WIDTH;
    }

    // Emeny-Player collision check
    if (this.x - this.scene.BLOCK_WIDTH * 0.7 <= this.scene.player.x &&
        this.x + this.scene.BLOCK_WIDTH * 0.7 >= this.scene.player.x &&
        this.y - this.scene.BLOCK_HEIGHT / 2 <= this.scene.player.y &&
        this.y + this.scene.BLOCK_HEIGHT >= this.scene.player.y) {

        // On collision player.hit method is called
        this.scene.player.hit();
    }
};

/* Create Scene with canvas parameters and difficulty of 1
 * You may try other parameters, like:
 * (303, 400, 50) - 3x3 game area with a fast enemies
 * (303, 800, 1) - 3x8 long corridor challenge
 */
var CANVAS_WIDTH = 505;
var CANVAS_HEIGHT = 600;
var INITIAL_DIFFICULTY = 30;
var level = new Scene(CANVAS_WIDTH, CANVAS_HEIGHT, INITIAL_DIFFICULTY);