Airport.Game = function(game) {
};

Airport.Game.prototype = {
	create: function() {
		this.game.world.setBounds(0, 0, 1920, this.game.height);

		this.background = this.game.add.sprite(0, this.game.height - 300, 'background');

		this.generateRunway();
		this.setupPlane();

		this.startKey = this.game.input.keyboard.addKey(Phaser.Keyboard.X);
	},

	setupPlane: function() {
		this.plane = this.game.add.sprite(100, 100, 'plane');
		this.game.physics.enable(this.plane, Phaser.Physics.ARCADE);
		this.plane.body.setSize(55, 5, -10, 18);

		this.plane.scale.x = -1;
		this.plane.anchor.setTo(0.3, 0.5);

		this.planeFlies = false;

		this.plane.collideWorldBounds = true;
		this.game.camera.follow(this.plane);
	},

	generateRunway: function() {
		this.runway = this.game.add.sprite(1200, this.game.height-50, 'runway');

		this.game.physics.enable(this.runway, Phaser.Physics.ARCADE);
		this.runway.body.setSize(this.runway.width, 4, 0, 10);

		this.runway.width = 700;

		this.runway.body.immovable = true;
	},

	update: function() {
		// Take off
		if (this.planeFlies) {
			// Input handling
			if(!this.planeLanded && this.game.input.activePointer.leftButton.isDown) {
				if (this.plane.angle >= -20) {
					this.plane.angle -= 0.25;
					this.plane.body.velocity.x += 2;
				}

				this.plane.body.velocity.y -= 8;
			}
			else {
				if (this.plane.angle < 0) {
					this.plane.angle += 0.5;
					this.plane.body.velocity.x -= 15;
					this.plane.body.velocity.x = this.plane.body.velocity.x <= 150 ? 150 : this.plane.body.velocity.x;
				}
			}

			this.checkPlanePosition();

			this.game.physics.arcade.overlap(this.plane, this.runway, this.checkLanding, this.shouldCheckLanding, this);
		}
		else {
			if (this.startKey.isDown) {
				this.resetPlane();
			}
		}
	},

	shouldCheckLanding: function() {

	},

	checkLanding: function() {

		var velY = this.plane.body.velocity.y;

		if (velY > 175) {
			// Boom..
			this.planeCrashed();
		}
		else {
			this.plane.body.velocity.x -= 1;
			this.plane.body.gravity.y = 0;
			this.plane.body.velocity.y = 0;

			this.planeLanded = true;

			if (this.plane.body.velocity.x <= 0) {
				this.plane.body.velocity.x = 0;
				this.resetPlanePostion();
			}
		}
	},

	planeCrashed: function() {
		this.hidePlane();
		this.planeFlies = false;
		var explosion = this.add.sprite(this.plane.position.x, this.plane.position.y, 'explode');
        explosion.anchor.set(0.5, 0.5);

        var anim = explosion.animations.add('boom');
        anim.play('boom', 20);
		anim.onComplete.add(this.explosionEnded, this);
		//this.resetPlanePostion();
	},

	explosionEnded: function() {
		this.resetPlanePostion();
	},

	checkPlanePosition: function() {
		if (this.plane.y >= this.game.height - 50 && this.plane.x < this.runway.x) {
			this.planeCrashed();
		}

		if (this.plane.x > this.game.world.width) {
			this.planeCrashed();
		}
	},

	hidePlane: function() {
		this.plane.visible = false;
		this.stopPlane();
	},

	resetPlane: function() {
		this.resetPlanePostion();
		this.plane.body.gravity.set(0, 250);
		this.plane.body.velocity.x = 150;
		this.planeFlies = true;
	},

	stopPlane: function() {
		this.plane.body.gravity.set(0, 0);
		this.plane.body.velocity.x = 0;
		this.plane.body.velocity.y = 0;
	},

	resetPlanePostion: function() {
		this.plane.x = 100;
		this.plane.y = 100;
		this.planeLanded = false;

		this.stopPlane();

		this.plane.angle = 0;
		this.planeFlies = false;
		this.plane.visible = true;
	},

	quitGame: function(pointer) {
		this.state.start('MainMenu');
	},

	render: function() {
		// this.game.debug.body(this.plane);
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
