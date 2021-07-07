var Game = require('./_base');
var data = require('../data/idrankwhat');

class Game_IDrankWhat extends Game {
	playerEntity = {
		"state" : "alive",
		"inCup" : "wine",
		"inHand" : []
	}



  startGame () {
	  data.cards[0].action(this);
    // deal cards to players
	  // pick current player
  }
}

module.exports = Game_IDrankWhat;
