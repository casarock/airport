Airport.Game = function(game) {
};

Airport.Game.prototype = {
	create: function() {
		this.timer = null;
		this.gameOverInitialized = false;
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
		this.highScoreText = this.game.add.bitmapText(16, 48, 'kenneyfont', "Highscore: "+ this.game.GAME_DATA.score);
		this.highScoreText.fixedToCamera = true;

		this.upKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
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
		var shades = [
				0xcccccc,
				0xdddddd,
				0xaaaaaa,
				0x999999,
				0x555555,
				0xbbbbbb,
				0xffffff
			],
			multiplier = (this.game.GAME_DATA.score - (this.game.GAME_DATA.score%10)),
			maxHeightFactor = (multiplier + 200 < this.game.height - 100) ? multiplier + 200 : (this.game.height - 100),
			myDistanceFactor = (300 - multiplier < 200) ? 200 : (300- multiplier);

		num = num || 3;
		maxHeight = maxHeight || maxHeightFactor;
		distanceToRunway = distanceToRunway || myDistanceFactor;

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
			buildingCandidate.tint = shades[this.game.rnd.integerInRange(0, shades.length)];

			//this.game.physics.enable(buildingCandidate, Phaser.Physics.ARCADE);
			buildingCandidate.scale.y = properties.height/20;
			buildingCandidate.scale.x = this.game.rnd.integerInRange(1, 3);

			this.buildingGroup.add(buildingCandidate);
		}

		this.game.physics.enable(this.buildingGroup, Phaser.Physics.ARCADE);
	},

	setupPlane: function() {
		this.plane = this.game.add.sprite(100, 100, 'plane');
		this.game.physics.enable(this.plane, Phaser.Physics.ARCADE);
		this.plane.scale.x = -1;
		this.plane.anchor.setTo(0.3, 0.5);
		this.plane.body.setSize(55, 5, -10, 18);

		//this.plane.body.setSize(this.plane.width, this.plane.height - 10, 0, 10);

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
				this.stateGameOver();
				break;
		}

		this.farBackground.tilePosition.x = this.game.camera.x*0.5;

	},

	stateGameOver: function() {
		if (!this.gameOverInitialized) {
			this.uiBackdrop = this.game.add.sprite(0, 0, 'ui', 'menu_backdrop');
			this.uiBackdrop.anchor.setTo(0.5, 0.5);
			this.uiBackdrop.x = this.game.width/2;
			this.uiBackdrop.y = this.game.height/2;

			this.retryButton = this.add.button(-100, -400, 'ui', actionOnClickRetry, this, 'button_retry', 'button_retry', 'button_retry_pressed');
			this.retryButton.anchor.setTo(0.5);
			var buttonRetryPos = {
				x: this.uiBackdrop.x + this.uiBackdrop.width/2 - this.retryButton.width/2 - 16,
				y: this.uiBackdrop.y + this.uiBackdrop.height/2 - this.retryButton.height/2 - 16
			}

			this.aboutButton = this.add.button(-100, -400, 'ui', actionOnClickAbout, this, 'button_about', 'button_about', 'button_about_pressed');
			this.aboutButton.anchor.setTo(0.5);
			var buttonAboutPos = {
				x: this.uiBackdrop.x - this.uiBackdrop.width/2 + this.aboutButton.width/2 + 16,
				y: buttonRetryPos.y
			}

			this.retryButton.x = buttonRetryPos.x;
			this.retryButton.y = buttonRetryPos.y;
			this.aboutButton.x = buttonAboutPos.x;
			this.aboutButton.y = buttonAboutPos.y;

			var finalScoreText = "Your plane crashed\n";
			finalScoreText += "Your score: " + this.game.GAME_DATA.score;
			var text = this.game.add.bitmapText(this.game.width/2, this.uiBackdrop.y + 16, 'kenneyfont', finalScoreText);
			text.anchor.setTo(0.5, 1);

			if (this.game.GAME_DATA.highScore < this.game.GAME_DATA.score) {
				this.game.GAME_DATA.highScore = this.game.GAME_DATA.score;
				this.highScoreText.setText("Highscore: "+ this.game.GAME_DATA.score);
			}

			this.uiBackdrop.fixedToCamera = this.retryButton.fixedToCamera = this.aboutButton.fixedToCamera =  text.fixedToCamera = true;

			this.gameOverInitialized = true;
		}

		function actionOnClickRetry() {
			this.uiBackdrop.destroy();
			this.retryButton.destroy();
			this.aboutButton.destroy();
			this.gameOverInitialized = false;
			this.game.GAME_DATA.score = 0;
			this.scoreText.setText("Score: " + this.game.GAME_DATA.score);
			text.destroy();
			this.resetPlanePostion();
		}

		function actionOnClickAbout() {

		}
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
		if (!this.plane.landed &&
			 (this.game.input.activePointer.leftButton.isDown || this.upKey.isDown)) {
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
		this.state = STATES.GAMEOVER;
		var explosion = this.add.sprite(this.plane.position.x, this.plane.position.y, 'explode');
        explosion.anchor.set(0.5, 0.5);

        var anim = explosion.animations.add('boom');
        anim.play('boom', 20);
		anim.onComplete.add(function() {
			explosion.destroy();
			//this.resetPlanePostion();
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
		var loop = null,
			addScore = Math.floor(1000/this.landingVelocity),
			newScore = this.game.GAME_DATA.score + addScore;

		var loopCallback = function() {
			if (this.game.GAME_DATA.score < newScore) {
				this.game.GAME_DATA.score += 1
				this.scoreText.setText("Score: " + this.game.GAME_DATA.score);
			}
			else {
				this.game.time.events.remove(loop);
			}
		};

		loop = this.game.time.events.loop(Phaser.Timer.SECOND/50, loopCallback, this);
	},

	render: function() {
		//this.game.debug.body(this.plane);
		/* this.game.debug.body(this.planes[0].getSprite());
		this.game.debug.body(this.planes[1].getSprite());
		this.tubey.getGroup().forEachAlive(this.renderGroup, this);
		*/
		//this.buildingGroup.forEachAlive(this.renderGroup, this);

	},

	renderGroup: function(member) {
		this.game.debug.body(member);
	},
};
