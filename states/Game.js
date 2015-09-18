Airport.Game = function(game) {

};

Airport.Game.prototype = {
	create: function() {
		this.plane = this.game.add.sprite(100, 100, 'red');
		this.plane.scale.x *= 2;
		this.plane.anchor.setTo(0.5, 0.5);
		this.game.physics.enable(this.plane, Phaser.Physics.ARCADE);
		this.plane.body.gravity.set(0, 250);
		this.plane.body.velocity.x = 150;
	},

	update: function() {
		if (this.plane.y >= 350) {
			this.plane.body.gravity.set(0,0);
			this.plane.body.velocity.y = 0;
		}

		if (this.plane.x > this.game.width) {
			this.plane.x = 100;
			this.plane.y = 100;
			this.plane.body.gravity.set(0, 250);
			this.plane.body.velocity.x = 150;
		}
	},

	quitGame: function(pointer) {
		this.state.start('MainMenu');
	},

	render: function() {
		/* this.game.debug.body(this.planes[0].getSprite());
		this.game.debug.body(this.planes[1].getSprite());
		this.tubey.getGroup().forEachAlive(this.renderGroup, this);
		*/
		//this.bubbles.forEachAlive(this.renderGroup, this);

	},

	renderGroup: function(member) {
		this.game.debug.body(member);
	},
};
