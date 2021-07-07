const {
    Datastore
} = require('@google-cloud/datastore');

class BaseGame {
    player;
    channel;

    entity = {};

    db = new Datastore({
        namespace: 'partytime'
    });

    constructor(req, res) {
        this.helpers = require('../helpers')(req, res);
        this.channel = req.channel_id;
        this.player = req.member.user.id.toString();
        this.options = req.data.options;

        if (this.constructor.name == 'BaseGame') {
            const query = this.db.createQuery('Game').filter('channel', '=', this.channel).order('createdAt', {
                descending: true
            });

            this.db.runQuery(query, (err, entities, info) => {
                if (err || entities.length == 0 || entities[0].state == 'done')) {
                    this[req.data.name]();
                } else {
                    req.entity = entities[0];

                    var ActiveGame = require(`./${req.entity.game}`);
                    new ActiveGame(req, res);
                }
            });
        } else {
            this.entity = req.entity;
            this[req.data.name]();
        }
    }

    setup() {
        if (this.constructor.name == 'BaseGame') {
            this.helpers.saveData([{
                key: this.db.key('Game'),
                data: {
                    channel: this.channel,
                    game: this.options.game,
                    createdAt: (new Date()).toISOString(),
                    state: 'pending',
                    players: [
                        this.player
                    ]
                }
            }], (entities) => {
                var gameID = entities[0].key.id;
                this.helpers.saveData([{
                    key: this.db.key('Player', `${gameID}_${this.player}`),
                    data: {
                        game: gameID,
                        player: this.player
                    }
                }], () => {
                    var newGame = require(`./${this.options.game}`);
                    this.helpers.respond({
                        "content": `<@${this.player}> has initiated a new game of ${newGame.prototype.displayName}!  Type **/join** to get in on the action and **/start** to begin the game.`
                    });
                });
            });
        } else {
            this.helpers.respond({
                "content": "There is already a game running.",
                "flags": 64
            });
        }
    }

    join() {
        if (this.entity.state == 'active') {
            this.helpers.respond({
                "content": "The game has already started.",
                "flags": 64
            });
        } else if (this.entity.state == 'pending') {
            if (this.entity.players.includes(this.player)) {
                this.helpers.respond({
                    "content": "You already joined this game!",
                    "flags": 64
                });
            } else {
                this.entity.players.push(this.player);
                this.helpers.saveData([{
                    key: this.entity[this.db.KEY],
                    data: this.entity
                }, {
                    key: this.db.key('Player', `${this.entity[this.db.KEY].id}_${this.player}`),
                    data: {
                        game: this.entity[this.db.KEY].id,
                        player: this.player
                    }
                }], () => {
                    this.helpers.respond({
                        "content": `<@${this.player}> has joined the game!`
                    });
                });
            }
        } else {
            this.helpers.respond({
                "content": "There isn't a game running right now. Maybe you want to /setup one?",
                "flags": 64
            });
        }
    }

    start() {
        if (this.entity.state == 'active') {
            this.helpers.respond({
                "content": "The game has already started.",
                "flags": 64
            });
        } else if (this.entity.state == 'pending') {
            this.entity.state = 'active';
            this.helpers.saveData([{
                key: this.entity[this.db.KEY],
                data: this.entity
            }], () => {
                this.startGame();
            });
        } else {
            this.helpers.respond({
                "content": "There isn't a game running right now. Maybe you want to /setup one?",
                "flags": 64
            });
        }
    }

    startGame() {
        console.log("the game has started");
    }

    guess() {
        if (this.constructor.name == "BaseGame") {
            this.helpers.respond({
                "content": "There isn't a game running right now. Maybe you want to /setup one?",
                "flags": 64
            });
        } else {
            this.helpers.respond({
                "content": "That isn't a valid option right now.",
                "flags": 64
            });
        }
    }

    pass() {
        console.log("not a valid action");
    }

    play() {
        console.log("not a valid action");
    }
}

module.exports = BaseGame;
