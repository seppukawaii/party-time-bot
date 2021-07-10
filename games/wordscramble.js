var BaseGame = require('./_base');

class Game extends BaseGame {

    init(callback) {
        if (this.entity.rounds) {
            const query = this.db.createQuery('Player').filter('game', '=', this.entity[this.db.KEY].id);

            this.db.runQuery(query, (err, entities, info) => {
                var round = this.entity.rounds.length - 1;
                this.currentRound = {
                    num: round,
                    word: this.entity.rounds[round].word,
                    scrambled: this.entity.rounds[round].scrambled,
                    players: {}
                };

                entities.forEach((entity) => {
                    if (entity[`round_${round}`]) {
                        this.currentRound.players[entity.player] = entity[`round_${round}`];
                    }

                    if (entity.player == this.player) {
                        this.playerEntity = entity;
                    }
                });

                callback();
            });
        } else {
            this.entity.rounds = [];
            callback();
        }

    }

    startGame() {
        this.helpers.respond({
            "content": "The game is now starting!  There will be five rounds of escalating difficulty (currently this is a lie).  Use **/guess (answer)** to submit your best guess, or **/pass** if you give up!!"
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
            "scrambled": scrambledWord,
		"start" : new Date().toISOString()
        });

        this.helpers.saveData([{
            key: this.entity[this.db.KEY],
            data: this.entity
        }], () => {
		var message = "";

		if (this.entity.rounds.length > 1) {
			var message = `The answer I wanted was: **${this.currentRound.word}**\r\n\r\n`;
		}

		message += `Round #${this.entity.rounds.length} : **${scrambledWord}**`;

            this.helpers.sendMessage({
                "content": message
            });
        });
    }

    guess() {
        if (this.gameStarted() && this.playerJoined()) {
            if (this.currentRound.players[this.player]) {
                this.helpers.respond({
                    "content": this.currentRound.players[this.player] == 'x' ? "You already passed this round!" : "You already guessed correctly this round!",
                    "flags": 64
                });
            } else {
                if (this.options.guess.toLowerCase().trim() == this.currentRound.word) {
                    this.playerEntity[`round_${this.currentRound.num}`] = new Date().toISOString();
                    this.helpers.saveData([{
                        key: this.playerEntity[this.db.KEY],
                        data: this.playerEntity
                    }], () => {
                        this.helpers.respond({
                            "content": `<@${this.player}> guessed correctly!`
                        }, () => {
                            this.finishRound();
                        });
                    });
                } else {
                    this.helpers.respond({
                        "content": "Sorry, but that isn't the word I'm looking for.",
                        "flags": 64
                    });
                }
            }
        } else {
            this.helpers.respond({
                "content": "You aren't signed up for this game.",
                "flags": 64
            });
        }
    }

    pass() {
        if (this.gameStarted() && this.playerJoined()) {
            if (this.currentRound.players[this.player]) {
                this.helpers.respond({
                    "content": this.currentRound.players[this.player] == 'x' ? "You already passed this round!" : "You already guessed correctly this round!",
                    "flags": 64
                });
            } else {
                this.helpers.saveData([{
                    key: this.playerEntity[this.db.KEY],
                    data: this.playerEntity
                }], () => {
                    this.helpers.respond({
                        "content": `<@${this.player}> has passed!`
                    }, () => {
                        this.finishRound();
                    });
                });
            }
        }
    }

    finishRound() {
        if (Object.keys(this.currentRound.players).length + 1 == this.entity.players.length) {
            if (this.entity.rounds.length >= 5) {
                this.entity.state = 'done';
                this.helpers.saveData([{
                    key: this.entity[this.db.KEY],
                    data: this.entity
                }], () => {
			var message = ":confetti_ball: The final scores are...\r\n\r\n";

            const query = this.db.createQuery('Player').filter('game', '=', this.entity[this.db.KEY].id);

            this.db.runQuery(query, (err, entities, info) => {
		    var scores = {};
		    var ranking = [];

                entities.forEach((entity) => {
			scores[entity.player] = 0;

			for (var i = 0, len = this.entity.rounds.length; i < len; i++) {
                    if (entity[`round_${i}`] && entity[`round_${i}`] != 'x') {
			    scores[entity.player]++;
                    }
			}
			});

		    this.entity.players.sort((a, b) => {
			    return scores[a] - scores[b];
		    });

		    this.entity.players.forEach( (player) => {
			    message += `<@${player}> - ${scores[player]}/5 correct\r\n`;
		    });

                    this.helpers.sendMessage({
                        "content": message
                    });
                });
		});
            } else {
                    this.startRound();
            }
        } else {
            this.helpers.end();
        }
    }
}

Game.prototype.displayName = "Word Scramble";

module.exports = Game;
