// Create our 'main' state that will contain the game
var mainState = {
    preload: function() { 
        // This function will be executed at the beginning     
        // That's where we load the images and sounds 

        // Load the bird sprite
        //game.load.image('bird', 'assets/bird.png');
        game.load.spritesheet('bird', 'assets/bird.png', 36, 25);
        //game.load.spritesheet('mummy', 'assets/sprites/metalslug_mummy37x45.png', 37, 45, 18);

        game.load.image('day', 'assets/day.png');
        game.load.image('pipe', 'assets/pipe.png');
        game.load.image('pipe-top', 'assets/pipe_top.png'); 
        game.load.image('pipe-bot', 'assets/pipe_bottom.png'); 

        game.load.audio('jump', 'assets/jump.wav'); 
        game.load.audio('point', 'assets/point.wav'); 
        game.load.audio('hit', 'assets/hit.wav');
    },

    create: function() { 
        // This function is called after the preload function     
        // Here we set up the game, display sprites, etc.

        // background
        game.add.sprite(0, 0, 'day');

        // Change the background color of the game to blue
        //game.stage.backgroundColor = '#71c5cf';

        // Set the physics system
        game.physics.startSystem(Phaser.Physics.ARCADE);

        // Display the bird at the position x=100 and y=245
        this.bird = game.add.sprite(100, 245, 'bird');
        
        // Move the anchor to the left and downward
        this.bird.anchor.setTo(-0.2, 0.5);
        this.bird.animations.add('fly');
        this.bird.animations.play('fly', 5, true);

        this.jumpSound = game.add.audio('jump'); 
        this.pointSound = game.add.audio('point');
        this.hitSound = game.add.audio('hit');

        // Add physics to the bird
        // Needed for: movements, gravity, collisions, etc.
        game.physics.arcade.enable(this.bird);

        // Add gravity to the bird to make it fall
        this.bird.body.gravity.y = 1000;  

        // Call the 'jump' function when the spacekey is hit
        var spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        spaceKey.onDown.add(this.jump, this);  
        
        // Create an empty group
        this.pipes = game.add.group();

        // add first pipe
        this.addPipe(3);

        // spawn pipes every 1.5 seconds
        this.timer = game.time.events.loop(1500, this.addRowOfPipes, this);

        // set and show score
        this.score = 0;
        this.labelScore = game.add.text(20, 20, "0", { font: "30px Arial", fill: "#ffffff" }); 
    },

    update: function() {
        // This function is called 60 times per second    
        // It contains the game's logic

        // If the bird is out of the screen (too high or too low)
        // Call the 'restartGame' function
        if (this.bird.y < 0 || this.bird.y > 490)
        {
            this.restartGame();
        }

        //game.physics.arcade.overlap(this.bird, this.pipes, this.restartGame, null, this);
        game.physics.arcade.overlap(this.bird, this.pipes, this.hitPipe, null, this);


        if (this.bird.angle < 20)
            this.bird.angle += 1; 
    },

    jump: function() {
        
        if (this.bird.alive == false)
            return; 
        
        // disabling sound for dev
        //this.jumpSound.play(); 

        // Make the bird jump 
        // Add a vertical velocity to the bird
        this.bird.body.velocity.y = -350;

        // Create an animation on the bird
        // NOTE ON ANIMATION
        {
            // game.add.tween(this.bird).to({angle: -20}, 100).start(); 
            
            var animation = game.add.tween(this.bird);
            
            // Change the angle of the bird to -20° in 100 milliseconds
            animation.to({angle: -20}, 100);
            
            // And start the animation
            animation.start(); 
            //END NOTE ON ANIMATION
        }
    },

    hitPipe: function() {
        // If the bird has already hit a pipe, do nothing
        // It means the bird is already falling off the screen
        if (this.bird.alive == false)
            return;
    
            // Set the alive property of the bird to false
            this.bird.alive = false;
            
        this.hitSound.play();
        // Prevent new pipes from appearing
        game.time.events.remove(this.timer);
    
        // Go through all the pipes, and stop their movement
        this.pipes.forEach(function(p){
            p.body.velocity.x = 0;
        }, this);
    }, 

    // Restart the game
    restartGame: function() {
        // Start the 'main' state, which restarts the game
        game.state.start('main');
    },

    addOnePipe: function(x, y) {
        // Create a pipe at the position x and y
        var pipe = game.add.sprite(x, y, 'pipe');
    
        // Add the pipe to our previously created group
        this.pipes.add(pipe);
    
        // Enable physics on the pipe 
        game.physics.arcade.enable(pipe);
    
        // Add velocity to the pipe to make it move left
        pipe.body.velocity.x = -200; 
    
        // Automatically kill the pipe when it's no longer visible 
        pipe.checkWorldBounds = true;
        pipe.outOfBoundsKill = true;
    },

    addRowOfPipes: function() {
        
        // add score every time a new pipe is created
        this.score += 1;
        this.labelScore.text = this.score; 
        
        this.pointSound.play();

        // Randomly pick a number between 1 and 5
        // This will be the hole position
        var hole = Math.floor(Math.random() * 5) + 1;

        this.addPipe(hole)
    
        // Add the 6 pipes 
        // With one big hole at position 'hole' and 'hole + 1'
        // for (var i = 0; i < 8; i++)
        //     if (i != hole && i != hole + 1) 
        //         this.addOnePipe(400, i * 60 + 10);   
    },

    addPipe: function(hole) {
        
        var x = 400;
        var y_top = -300 + 60*hole;
        var y_bot = 120 + 60*hole;

        // Create a pipe at the position x and y
        var top = game.add.sprite(x, y_top, 'pipe-top');
        var bot = game.add.sprite(x, y_bot, 'pipe-bot');

        // Add the pipe to our previously created group
        this.pipes.add(top);
        this.pipes.add(bot);

        // Enable physics on the pipe 
        game.physics.arcade.enable(top);
        game.physics.arcade.enable(bot);

        // Add velocity to the pipe to make it move left
        top.body.velocity.x = -200;
        bot.body.velocity.x = -200;

        // Automatically kill the pipe when it's no longer visible 
        top.checkWorldBounds = true;
        bot.checkWorldBounds = true;

        top.outOfBoundsKill = true;
        bot.outOfBoundsKill = true;
    },
};

// Initialize Phaser, and create a 400px by 490px game
var game = new Phaser.Game(400, 490);

// Add the 'mainState' and call it 'main'
game.state.add('main', mainState); 

// Start the state to actually start the game
game.state.start('main');