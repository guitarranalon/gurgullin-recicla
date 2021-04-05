var SceneTwo = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize: function () {
        Phaser.Scene.call(this, { "key": "SceneTwo"});
    },
    init: function (data) {
        this.score = data.waste;
    },

    player: null,
    platforms: null,
    cursors: null,
    bins: null,
    score: {
        organic: 0,
        plastic: 0,
        paper: 0,
        glass: 0
    },
    totalScore: null,
    points: 0,
    gameOver: false,
    scoreText: null,
    tipoReciclaje: 'paper',
    lastUsedBin: null,
    timeLastBinWasUsed: 0,    

    preload: function () {
        this.load.image('sky', 'assets/sky.png');
        this.load.image('ground', 'assets/platform.png');
        this.load.image('glass-bin', 'assets/glass-bin.png');
        this.load.image('plastic-bin', 'assets/plastic-bin.png');
        this.load.image('organic-bin', 'assets/organic-bin.png');
        this.load.image('paper-bin', 'assets/paper-bin.png');
        this.load.spritesheet('dude', 'assets/dude4.png', { frameWidth: 43, frameHeight: 64 });        
    },
    create: function() {
        this.cameras.main.fadeIn(400, 0, 0, 0);

        //  A simple background for our game
        this.add.image(400, 300, 'sky');

        //  The platforms group contains the ground and the 2 ledges we can jump on
        this.platforms = this.physics.add.staticGroup();

        this.bins = this.physics.add.staticGroup();

        //  Here we create the ground.
        //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
        this.platforms.create(400, 568, 'ground').setScale(2).refreshBody();

        this.bins.create(160, 504, 'plastic-bin');
        this.bins.create(320, 504, 'paper-bin');
        this.bins.create(480, 504, 'glass-bin');
        this.bins.create(640, 504, 'organic-bin');

        // The player and its settings
        this.player = this.physics.add.sprite(50, 450, 'dude');

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

        //  The score
        this.scoreText = this.add.text(400, 180, '¡Recicla los ' + this.score.paper  + ' residuos de papel!', { fontSize: '28px', fill: '#000' }).setOrigin(0.5);
        this.totalScore = this.add.text(16, 16, 'Puntos: 0', { fontSize: '32px', fill: '#000' });

        //  Collide the player and the stars with the platforms
        this.physics.add.collider(this.player, this.platforms);

        this.physics.add.collider(this.player, this.bins, this.useBin, null, this);        
    },
    update: function() {
        if (this.gameOver)
        {
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


    useBin: function(player, bin) {
        if ((this.lastUsedBin === bin.texture.key) && ((Date.now() - this.timeLastBinWasUsed) < 1500)) {
            this.timeLastBinWasUsed = Date.now();
            return;
        }
    
        this.lastUsedBin = bin.texture.key;
        this.timeLastBinWasUsed = Date.now();
    
        console.log('Necesario: ', this.tipoReciclaje, ' - Recibido: ', this.lastUsedBin);
    
        switch (this.tipoReciclaje) {
            case 'paper':
                if (bin.texture.key === 'paper-bin') {
                    this.scoreText.setText('¡Bien hecho! ¡Ahora los ' + this.score.organic + ' residuos orgánicos!');
                    this.points += this.score.paper * 100;
                } else {
                    this.scoreText.setText('¡Vaya! ¡Inténtalo con los ' + this.score.organic + ' residuos orgánicos!');
                }
    
                this.tipoReciclaje = 'organic';
                break;
            case 'organic':
                if (bin.texture.key === 'organic-bin') {
                    this.scoreText.setText('¡Eres increíble! ¡A por los ' + this.score.plastic + ' envases!');
                    this.points += this.score.organic * 100;
                } else {
                    this.scoreText.setText('¡Vaya! ¡Inténtalo con los ' + this.score.plastic + ' envases!');
                }
    
                this.tipoReciclaje = 'plastic';
                break;
            case 'plastic':
                if (bin.texture.key === 'plastic-bin') {
                    this.scoreText.setText('¡Turno de los ' + this.score.glass + ' residuos de vidrio!');
                    this.points += this.score.plastic * 100;
                } else {
                    this.scoreText.setText('¡Vaya! ¡Inténtalo con los ' + this.score.glass + ' residuos de vidrio!');
                }
                this.tipoReciclaje = 'glass';
                break;
            case 'glass':
                if (bin.texture.key === 'glass-bin') {
                    this.scoreText.setText('¡Eres una máquina de reciclar!');
                    this.points += this.score.glass * 100;
                } else {
                    this.scoreText.setText('¡Oh! ¡Creo que te has equivocado!');
                }
    
                this.gameOver = true;
    
                this.physics.pause();
                this.player.anims.play('turn');
    
                break;
        }

        // Actualizar la puntuación siempre al salir del switch
        this.totalScore.setText('Puntos: ' + this.points);
    }    
});