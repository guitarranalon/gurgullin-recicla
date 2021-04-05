var SceneOne = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize: function () {
        Phaser.Scene.call(this, { "key": "SceneOne"});
    },
    init: function () {},

    player: null,
    stars: null,
    bombs: null,
    platforms: null,
    cursors: null,
    score: {
        organic: 0,
        plastic: 0,
        paper: 0,
        glass: 0
    },
    faded: false,
    gameOver: false,
    scoreText: '',

    preload: function () {
        this.load.image('sky', 'assets/sky.png');
        this.load.image('ground', 'assets/platform.png');
        this.load.image('paper', 'assets/paper.png');
        this.load.image('glass', 'assets/glass.png');
        this.load.image('organic', 'assets/organic.png');
        this.load.image('plastic', 'assets/plastic.png');
        this.load.image('bomb', 'assets/bomb.png');
        this.load.spritesheet('dude', 'assets/dude4.png', { frameWidth: 43, frameHeight: 64 });
    },
    create: function () {
        this.cameras.main.fadeIn(600, 0, 0, 0);

        this.cameras.main.once('camerafadeoutcomplete', function () {
            console.log('aterriza')
            this.faded = true;
            // change to next level
            this.nextScene();
        }, this);

        //  A simple background for our game
        this.add.image(400, 300, 'sky');

        //  The platforms group contains the ground and the 2 ledges we can jump on
        this.platforms = this.physics.add.staticGroup();

        //  Here we create the ground.
        //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
        this.platforms.create(400, 568, 'ground').setScale(2).refreshBody();

        //  Now let's create some ledges
        this.platforms.create(600, 400, 'ground');
        this.platforms.create(50, 250, 'ground');
        this.platforms.create(750, 220, 'ground');

        // The player and its settings
        this.player = this.physics.add.sprite(100, 450, 'dude');

        //  Player physics properties. Give the little guy a slight bounce.
        this.player.setBounce(0.2);
        this.player.setCollideWorldBounds(true);

        //  Our player animations, turning, walking left and walking right.
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('dude', { start: 1, end: 4 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'turn',
            frames: [ { key: 'dude', frame: 0 } ],
            frameRate: 20
        });

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('dude', { start: 1, end: 4 }),
            frameRate: 10,
            repeat: -1
        });

        //  Input Events
        this.cursors = this.input.keyboard.createCursorKeys();

        //  Some waste to collect, 12 in total, evenly spaced 70 pixels apart along the x axis
        this.stars = this.physics.add.group();

        for (var i = 0; i < 12; i++) {
            this.stars.create(12 + i * 70, 0 , this.generateWaste());
        }

        this.stars.children.iterate(function (child) {

            //  Give each star a slightly different bounce
            child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));

        });

        this.bombs = this.physics.add.group();

        //  The score
        this.scoreText = this.add.text(16, 16, 'Org: 0 Plást: 0 Pap: 0 Vid: 0', { fontSize: '32px', fill: '#000' });

        //  Collide the player and the stars with the platforms
        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.stars, this.platforms);
        this.physics.add.collider(this.bombs, this.platforms);

        //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
        this.physics.add.overlap(this.player, this.stars, this.collectStar, null, this);

        this.physics.add.collider(this.player, this.bombs, this.hitBomb, null, this);
    },

    update: function() {
        if (this.gameOver)
        {
            if (!this.cameras.main.fadeEffect.isRunning && !this.faded) {
                this.time.addEvent({
                    delay: 500,
                    loop: false,
                    callback: () => {
                        this.cameras.main.fadeOut(600, 0, 0, 0);
                    }
                }); 
            }

            return;
        }
    
        if (this.cursors.left.isDown)
        {
            this.player.setVelocityX(-160);
    
            this.player.anims.play('left', true);
            this.player.flipX = true;
        }
        else if (this.cursors.right.isDown)
        {
            this.player.setVelocityX(160);
            this.player.flipX = false;
            this.player.anims.play('right', true);
        }
        else
        {
            this.player.setVelocityX(0);
    
            this.player.anims.play('turn');
        }
    
        if (this.cursors.up.isDown && this.player.body.touching.down)
        {
            this.player.setVelocityY(-410);
        }
    },

    collectStar: function(player, star)
    {
        // star.texture.key
        star.disableBody(true, true);
    
        //  Add and update the score
        this.score[star.texture.key]++;
        this.scoreText.setText('Org: ' + this.score.organic + ' Plást: ' + this.score.plastic + ' Pap: ' + this.score.paper + ' Vid: ' + this.score.glass);
    
        if (this.stars.countActive(true) === 0)
        {
            //  A new batch of stars to collect
            this.stars.children.iterate(function (child) {
    
                child.enableBody(true, child.x, 0, true, true);
    
            });
    
            var x = (this.player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
    
            var bomb = this.bombs.create(x, 16, 'bomb');
            bomb.setBounce(1);
            bomb.setCollideWorldBounds(true);
            bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
            bomb.allowGravity = false;
    
        }
    },

    hitBomb: function(player, bomb)
    {
        this.physics.pause();
    
        this.player.setTint(0xff0000);
    
        this.player.anims.play('turn');
    
        this.gameOver = true;
    },
    
    generateWaste: function() {
        var type = Math.floor(Math.random() * 4);
    
        switch(type) {
            case 0: return 'glass';
            case 1: return 'paper';
            case 2: return 'plastic';
            case 3: return 'organic';
        }
    },

    nextScene() {
        // A los 100 milisegundos saltamos a la siguiente escena
        this.time.addEvent({
            delay: 100,
            loop: false,
            callback: () => {
                this.scene.start("SceneTwo", {
                    "waste": this.score
                });
            }
        });        
    }
});