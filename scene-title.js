var SceneTitle = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize: function () {
        Phaser.Scene.call(this, { "key": "SceneTitle"});
    },
    init: function () {},

    cursors: null,
    scoreText: '',

    preload: function () {
        this.load.image('sky', 'assets/sky.png');
        this.load.image('ground', 'assets/platform.png');
        this.load.image('logo', 'assets/title.png');
    },
    create: function () {
        //  A simple background for our game
        this.add.image(400, 300, 'sky');

        //  Input Events
        this.cursors = this.input.keyboard.createCursorKeys();

        var logo = this.add.image(400, 250, 'logo');

        // Pulsa espacio para empezar
        this.scoreText = this.add.text(400, 530, '¡Pulsa espacio para empezar!', { fontSize: '28px', fill: '#000' }).setOrigin(0.5);
    },

    update: function() {
        if (this.cursors.space.isDown)
        {
            this.nextScene();
        }
    },

    nextScene() {
        // A los 3 segundos saltamos a la siguiente escena
        this.time.addEvent({
            delay: 500,
            loop: false,
            callback: () => {
                this.scene.start("SceneOne");
            }
        });        
    }
});