Airport.Preloader = function(game) {
    this.ready = false;
};

Airport.Preloader.prototype = {

    preload: function() {
        this.load.bitmapFont('kenneyfont', 'fonts/kenneyspace_72/kenneyspace_72.png', 'fonts/kenneyspace_72/kenneyspace_72.xml');
        this.load.image('white', 'images/white.png');
        this.load.image('plane', 'images/airbus_380.png');
        this.load.image('runway', 'images/runway.png');
        this.load.image('background', 'images/hills-scroll.png');
        this.load.spritesheet('explode', 'images/exp2_0.png', 64, 64);
    },

    create: function() {
        this.game.stage.backgroundColor = '#ffffff';
        this.game.physics.startSystem(Phaser.Physics.ARCADE);

        var logo = this.add.sprite(this.world.width/2, this.world.height/2, 'appsbude');
        logo.anchor.set(0.5, 0.5);

        /*this.game.time.events.add(Phaser.Timer.SECOND * 2.0, function() {

            var tween = this.add.tween(logo)
                .to({alpha: 0}, 750, Phaser.Easing.Linear.none);

            tween.onComplete.add(function() {
                logo.destroy();
                this.startGame();
            }, this);

            tween.start();
        }, this);*/
        this.startGame();
    },

    startGame: function() {
        this.state.start('Game');
    }

};
