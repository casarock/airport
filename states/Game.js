Airport.Game = function(game) {

};

Airport.Game.prototype = {
	create: function() {
		this.game.world.setBounds(0, 0, 1920, this.game.height);

		this.background = this.game.add.sprite(0, this.game.height - 300, 'background');

		this.plane = this.game.add.sprite(100, 100, 'red');
		this.plane.scale.x *= 2;
		this.plane.anchor.setTo(0.5, 0.5);
		this.game.physics.enable(this.plane, Phaser.Physics.ARCADE);

		this.planeFlies = false;

		this.plane.collideWorldBounds = true;
		this.game.camera.follow(this.plane);

		this.startKey = this.game.input.keyboard.addKey(Phaser.Keyboard.X);
	},

	update: function() {
		// Take off
		if (this.planeFlies) {
			// Input handling
			if(this.game.input.activePointer.leftButton.isDown) {
				this.plane.body.velocity.y -= 10;
			}

			this.checkPlanePosition();
		}
		else {
			if (this.startKey.isDown) {
				this.resetPlane();
			}
		}
	},

	checkPlanePosition: function() {
		if (this.plane.y >= this.game.height - 50) {
			var velY = this.plane.body.velocity.y;

			if (velY > 75) {
				this.resetPlanePostion();
			}
			else {
				this.plane.body.gravity.set(0, 0);
				this.plane.body.velocity.y = 0;
			}
		}

		if (this.plane.x > this.game.world.width) {
			this.resetPlanePostion();
		}
	},

	resetPlane: function() {
		this.resetPlanePostion();
		this.plane.body.gravity.set(0, 250);
		this.plane.body.velocity.x = 150;
		this.planeFlies = true;
	},

	resetPlanePostion: function() {
		this.plane.x = 100;
		this.plane.y = 100;
		this.plane.body.gravity.set(0, 0);
		this.plane.body.velocity.x = 0;
		this.plane.body.velocity.y = 0;

		this.planeFlies = false;
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
