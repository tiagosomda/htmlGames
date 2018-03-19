var config = {
    type: Phaser.AUTO,
    width: 500,
    height: 500,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 1500 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var populationSize = 5;
var population;
var player;
var coins;
var enemies;
var platforms;
var cursors;
var score = 0;
var gameOver = false;
var scoreText;

var game = new Phaser.Game(config);

function preload ()
{
    this.load.image('wall', 'assets/wall.png');
    this.load.image('coin', 'assets/coin.png');
    this.load.image('enemy', 'assets/enemy.png');

    this.load.image('sky', 'assets/sky.png');
    this.load.image('ground', 'assets/platform.png');
    this.load.image('star', 'assets/star.png');
    this.load.image('bomb', 'assets/bomb.png');
    this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 33, frameHeight: 50 });

    this.load.spritesheet('runner', 'assets/run.png', { frameWidth: 33, frameHeight: 57 });
    this.load.spritesheet('jump', 'assets/jump.png', { frameWidth: 31, frameHeight: 64 });
    this.load.spritesheet('jump-roll', 'assets/jump-roll.png', { frameWidth: 46.2, frameHeight: 59 });
}

function create ()
{
    //  A simple background for our game
    this.add.image(250, 250, 'sky');


    platforms = this.physics.add.group();
    coins = this.physics.add.group();
    enemies = this.physics.add.group();

    // The player and its settings
    //player = this.physics.add.sprite(175 , 75, 'runner');
    this.anims.create({
        key: 'run',
        frames: this.anims.generateFrameNumbers('runner', { start: 0, end: 5 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'jump',
        frames: this.anims.generateFrameNumbers('jump-roll', { start: 0, end: 9 }),
        frameRate: 10
    });

    //  Input Events
    cursors = this.input.keyboard.createCursorKeys();

    //  The score
    scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });

    population = [];
    //  createplayer population
    for(var i = 0; i < populationSize; i++)
    {
        population[i] = this.physics.add.sprite(175 + 10*i , 75, 'runner');
        population[i].anims.play('run', true);
        this.physics.add.collider(population[i], platforms);
        this.physics.add.overlap(population[i], enemies, hitEnemy, null, this);
    }

    spawnEnemy(600,450);

    for(var i = 0; i < 10; i++)
    {
        var platform = platforms.create(25 + 50*i, 475, 'wall');
        platform.body.allowGravity = false;
        platform.body.immovable = true;
    }

}

function update ()
{
    if (gameOver)
    {
        resetGame();
        return;
    }

    updatePopulation();

    // check is enemy has left the screen
    for(var i = 0; i < enemies.children.size; i++)
    {
        if(enemies.children.entries[i].x < 0)
        {
            enemies.remove(enemies.children.entries[i]);
        }
    }
}

function updatePopulation()
{
    var anyActive = false;
    for(var i = 0; i < population.length; i++)
    {
        if(population[i].active === false)
            continue;

        anyActive = true;
        if(population[i].isJumping && population[i].body.touching.down)
        {
            population[i].isJumping = false;
            population[i].anims.play('run', true);
        }
    
        if (cursors.up.isDown && population[i].body.touching.down)
        {
            population[i].setVelocityY(-550);
            population[i].isJumping = true;
            population[i].anims.play('jump', true);
        }
    }

    if(!anyActive)
    {
        gameOver = true;
    }
}

function resetGame()
{
    for(var i = 0; i < enemies.children.size; i++)
    {
        enemies.children.entries[i].destroy();
    }

    for(var i = 0; i < population.length; i++)
    {
        population[i].active = true;
        population[i].alpha = 1;
        population[i].setTint(0xffffff);
        population[i].body.allowGravity = true;
        population[i].anims.play('run', true);
        population[i].isJumping = false;
    }

    gameOver = false;
}

function hitEnemy(player, enemy)
{
    if(!player.active)
        return;

    player.active = false;
    player.alpha = 0.2;
    player.setTint(0xff0000);
    enemy.setTint(0xff0000);

    player.body.allowGravity = false;
    player.body.setVelocity(0,0);
}

function collectCoin (player, coin)
{
    coin.disableBody(true, true);

    //  Add and update the score
    score += 10;
    scoreText.setText('Score: ' + score);

    if (coins.countActive(true) === 0)
    {
        //  A new batch of stars to collect
        //coins.children.iterate(function (child) {
        //    child.enableBody(true, child.x, 0, true, true);
        //});

        // var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

        // var bomb = bombs.create(x, 16, 'bomb');
        // bomb.setBounce(1);
        // bomb.setCollideWorldBounds(true);
        // bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
        // bomb.allowGravity = false;

    }
}

function createMap()
{
    var level = [
        'xxxxxxxxxx',
        '!        x',
        '!     o  x',
        '!        x',
        '!        x',
        '!       ox',
        '!        x',
        '!        x',
        '! o  x!!!x',
        'xxxxxx!!!x',
    ];

    var cellSize = 50;
    for (var i = 0; i < level.length; i++) {
        for (var j = 0; j < level[i].length; j++) {
            if(level[i][j] === 'x') {
                platforms.create(cellSize*j + cellSize/2, cellSize*i + cellSize/2, 'wall');
            }
            else if (level[i][j] === 'o') {
                coins.create(cellSize*j + cellSize/2, cellSize*i + cellSize/2, 'coin');
            }
            // Create a enemy and add it to the 'enemies' group
            else if (level[i][j] === '!') {
                platforms.create(cellSize*j + cellSize/2, cellSize*i + cellSize/2, 'enemy');
                
            }
    
        }
    }
}

function spawnPlatform(x,y, width)
{
    while(width-- > 0)
        spawnOnePlatform(x + width*50, y);
}

function spawnOnePlatform(x, y)
{
    var platform = platforms.create(x, y, 'wall').setOrigin(1,1);  
    platform.setVelocity(-200, 0);
    platform.body.allowGravity = false;
    platform.body.immovable = true;
}


function spawnEnemy(x, y)
{
    var enemy = enemies.create(x, y, 'enemy').setOrigin(1,1);
    enemy.setVelocity(-200, 0);
    enemy.body.allowGravity = false;
    enemy.body.immovable = true;

    setTimeout(function(){spawnEnemy(x,y)}, Phaser.Math.Between(1000, 5000));
}

function spawnCoin(x, y)
{
    var coins = coins.create(x, y, 'coin').setOrigin(1,1);
    enemy.setVelocity(-200, 0);
    enemy.body.allowGravity = false;
    enemy.body.immovable = true;

    setTimeout(function(){spawnEnemy(x,y)}, Phaser.Math.Between(1000, 5000));
}