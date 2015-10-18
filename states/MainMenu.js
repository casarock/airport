Airport.MainMenu = function (game) {
};

Airport.MainMenu.prototype = {

	create: function () {
		this.game.stage.backgroundColor = '#ACD8E2';
	},

	play: function() {
		this.state.start('Game');
	},

	update: function () {

	}
};
