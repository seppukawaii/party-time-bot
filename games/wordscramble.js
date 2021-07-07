var BaseGame = require('./_base');

class Game extends BaseGame {
    startGame() {
        this.entity.rounds = [];

	    this.helpers.respond({
		    "content" : "The game is now starting!  There will be five rounds of escalating difficulty (currently this is a lie).  Use **/guess (answer)** to submit your best guess!"
	    }, () => {
              this.startRound();
	    });
    }

    startRound() {
        var words = require('../data/common-nouns.en.json');
        var word = words[Math.floor(Math.random() * words.length)];
        var scrambledWord = word.split('').sort(function() {
            return 0.5 - Math.random()
        }).join('');
        this.entity.rounds.push({
            "word": word,
            "scrambled": scrambledWord
        });

        this.helpers.saveData([{
            key: this.entity[this.db.KEY],
            data: this.entity
        }], () => {
            this.helpers.sendMessage({
                "content": `Round #${this.entity.rounds.length} : ${scrambledWord}`
            });
        });
    }

    guess() {
        if (this.entity.players.includes(this.player)) {
            const query = this.db.createQuery('Player').filter('game', '=', this.entity[this.db.KEY].id);

            this.db.runQuery(query, (err, entities, info) => {
                var round = this.entity.rounds.length - 1;
                var playerRounds = {};
                var playerEntity = {
                    rounds: []
                };
                entities.forEach((entity) => {
                    if (entity[`round_${round}`]) {
                        playerRounds[entity.player] = entity[`round_${round}`];
                    }
                    if (entity.player == this.player) {
                        playerEntity = entity;
                    }
                });

                if (playerRounds[this.player]) {
                    this.helpers.respond({
                        "content": "You already guessed correctly this round!",
                        "flags": 64
                    });
                } else {
                    if (!playerEntity[`round_${round}`]) {
                        playerEntity[`round_${round}`] = [];
                    }
                    playerEntity[`round_${round}`].push(this.options.guess.toLowerCase());
                    if (this.options.guess.toLowerCase().trim() == this.entity.rounds[round].word) {
                        this.helpers.saveData([{
                            key: playerEntity[this.db.KEY],
                            data: playerEntity
                        }], () => {
                            this.helpers.respond({
                                "content": `<@${this.player}> guessed correctly!`
                            }, () => {
				    console.log(Object.keys(playerRounds).length + 1, this.entity.players.length);
                                if (Object.keys(playerRounds).length + 1 == this.entity.players.length) {
                                    this.finishRound();
                                }
                            });
                        });
                    } else {
                        this.helpers.respond({
                            "content": "Sorry, but that isn't the word I'm looking for.",
                            "flags": 64
                        });
                    }
                }
            });
        } else {
            this.helpers.respond({
                "content": "You aren't signed up for this game.",
                "flags": 64
            });
        }
    }

    finishRound() {
        if (this.entity.rounds.length >= 5) {
            this.entity.state = 'done';
            this.helpers.saveData([{
                key: this.entity[this.db.KEY],
                data: this.entity
            }], () => {
                this.helpers.sendMessage({
                    "content": "Game over!"
                });
            });
        } else {
            this.startRound();
        }
    }
}

Game.prototype.displayName = "Word Scramble";

module.exports = Game;
