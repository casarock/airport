Airport.Game = function(game) {
};

Airport.Game.prototype = {
	create: function() {
		this.timer = null;
		this.countdown = COUNTDOWN;
		this.landingVelocity = null;
		this.game.stage.backgroundColor = '#ACD8E2';

		this.game.world.setBounds(0, 0, 1920, this.game.height);

		this.farBackground = this.game.add.tileSprite(0, 100, 2048,  this.game.height, 'farbackground');
		this.background = this.game.add.sprite(0, this.game.height - 275, 'background');

		this.createClouds();
		this.generateBuildings(10);
		this.generateRunway();
		this.setupPlane();

		this.state = STATES.COUNTDOWN;

		this.scoreText = this.game.add.bitmapText(16, 16, 'kenneyfont', "Score: "+ this.game.GAME_DATA.score);
		this.scoreText.fixedToCamera = true;
	},

	createClouds: function() {
		var num = CLOUDS;
		this.clouds = this.game.add.group();

		for (var i = 0; i < num; i++) {
			var cloud = this.game.add.sprite(i * this.game.rnd.integerInRange(10, 200),
												 this.game.rnd.integerInRange(50, 400),
												 'cloud-' + this.game.rnd.integerInRange(0, 2));
			this.game.physics.enable(cloud, Phaser.Physics.ARCADE);
			cloud.body.velocity.x = -(this.game.rnd.integerInRange(5, 50));
			cloud.checkWorldBounds = true;
			cloud.events.onOutOfBounds.add(this.cloudOut, this);
			this.clouds.add(cloud);
		}
	},

	generateBuildings: function(num, maxHeight, distanceToRunway) {
		var buildings = {};

		num = num || 3;
		maxHeight = maxHeight || 200;
		distanceToRunway = distanceToRunway || 300;

		this.buildingGroup = this.game.add.group();

		// Todo: Check for overlapping buildings.
		for (var i = 0; i < num; i++) {
			var building = {
				x: this.game.rnd.integerInRange(100, RUNWAY_DISTANCE - distanceToRunway),
				height: this.game.rnd.integerInRange(100, maxHeight)
			};
			buildings["" + building.x] = building;
		}

		for(var bSprite in buildings) {
			var properties = buildings[bSprite],
				yPos = this.game.height - properties.height;

			var buildingCandidate = this.game.add.sprite(properties.x, yPos, 'white');
			this.game.physics.enable(buildingCandidate, Phaser.Physics.ARCADE);
			buildingCandidate.scale.y = properties.height/20;
			buildingCandidate.scale.x = this.game.rnd.integerInRange(1, 3);

			this.buildingGroup.add(buildingCandidate);
		}
	},

	setupPlane: function() {
		this.plane = this.game.add.sprite(100, 100, 'plane');
		this.game.physics.enable(this.plane, Phaser.Physics.ARCADE);
		//this.plane.body.setSize(55, 5, -10, 18);

		this.plane.scale.x = -1;
		this.plane.anchor.setTo(0.3, 0.5);

		this.plane.flies = false;

		this.plane.collideWorldBounds = true;
		this.game.camera.follow(this.plane);
	},

	generateRunway: function() {
		this.runway = this.game.add.sprite(RUNWAY_DISTANCE, this.game.height-20, 'runway');

		this.game.physics.enable(this.runway, Phaser.Physics.ARCADE);
		this.runway.body.setSize(this.runway.width, 4, 0, 10);

		this.runway.width = RUNWAY_WIDTH;

		this.runway.body.immovable = true;
	},

	update: function() {
		// Take off
		switch(this.state) {
			case STATES.PLANE_FLYING:
				this.stateFlying();
				break;

			case STATES.COUNTDOWN:
				this.stateCountdown();
				break;

			case STATES.GAMEOVER:
				break;

		}

		this.farBackground.tilePosition.x = this.game.camera.x*0.5;

	},

	stateCountdown: function() {
		if (this.timer === null) {
			this.countDownText = this.game.add.bitmapText(this.game.width/2, this.game.height/2, 'kenneyfont', ""+ this.countdown);
			this.countDownText.scale.setTo(2);
			this.timer = this.game.time.events.loop(Phaser.Timer.SECOND, this.updateCounter, this);
		}
	},

	updateCounter: function() {
		this.countdown -= 1;
		this.countDownText.setText(this.countdown);

		if (this.countdown <= 0) {
			this.countdown = COUNTDOWN;
			this.game.time.events.remove(this.timer);
			this.timer = null;
			this.countDownText.destroy();
			this.resetPlane();
		}
	},

	stateFlying: function() {
		// Input handling
		if (!this.plane.landed && this.game.input.activePointer.leftButton.isDown) {
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
				this.plane.body.velocity.x = this.plane.body.velocity.x <= MIN_PLANE_VELOCITY ? MIN_PLANE_VELOCITY : this.plane.body.velocity.x;
			}
		}

		this.checkPlanePosition();
		this.game.physics.arcade.overlap(this.plane, this.runway, this.checkLanding, this.shouldCheckLanding, this);
		this.game.physics.arcade.overlap(this.plane, this.buildingGroup, this.planeCrashed, null, this);
	},

	shouldCheckLanding: function() {

	},

	checkLanding: function() {
		var velY = this.plane.body.velocity.y;
		this.landingVelocity = this.landingVelocity === null ? velY : this.landingVelocity;

		if (velY > 175) {
			// Boom..
			this.planeCrashed();
		}
		else {

			this.plane.body.velocity.x -= 1;
			this.plane.body.gravity.y = 0;
			this.plane.body.velocity.y = 0;

			this.plane.landed = true;

			if (this.plane.body.velocity.x <= 0) {
				this.plane.body.velocity.x = 0;
				this.addScore();
				this.landingVelocity = null;
				this.resetPlanePostion();
			}
		}
	},

	planeCrashed: function() {
		this.hidePlane();
		this.state = STATES.COUNTDOWN;
		var explosion = this.add.sprite(this.plane.position.x, this.plane.position.y, 'explode');
        explosion.anchor.set(0.5, 0.5);

        var anim = explosion.animations.add('boom');
        anim.play('boom', 20);
		anim.onComplete.add(function() {
			explosion.destroy();
			this.resetPlanePostion();
		}, this);
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
		//this.resetPlanePostion();
		this.plane.body.gravity.set(0, 250);
		this.plane.body.velocity.x = 150;
		this.state = STATES.PLANE_FLYING;
	},

	stopPlane: function() {
		this.plane.body.gravity.set(0, 0);
		this.plane.body.velocity.x = 0;
		this.plane.body.velocity.y = 0;
	},

	resetPlanePostion: function() {
		this.farBackground.tilePosition.x = 0;
		this.buildingGroup.destroy();
		this.generateBuildings(10);

		this.plane.x = 100;
		this.plane.y = 100;
		this.plane.landed = false;

		this.stopPlane();

		this.plane.angle = 0;
		this.state = STATES.COUNTDOWN;
		this.plane.visible = true;
	},

	cloudOut: function(cloud) {
	    cloud.reset(this.game.world.width, this.game.rnd.integerInRange(25, 380));
		cloud.body.velocity.x = -(this.game.rnd.integerInRange(5, 50));
	},

	quitGame: function(pointer) {
		this.state.start('MainMenu');
	},

	addScore: function() {
		console.log(this.landingVelocity);
		var addScore = Math.floor(1000/this.landingVelocity);
		this.game.GAME_DATA.score += addScore;

		this.scoreText.setText("Score: " + this.game.GAME_DATA.score);
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
