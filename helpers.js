const axios = require('axios');
const {
    Datastore
} = require('@google-cloud/datastore');

const headers = {
    headers: {
        "Authorization": `Bot ${process.env.BOT_TOKEN}`
    }
};

module.exports = function(req, res) {
    this.interaction = {
        id: req.body.id,
        token: req.body.token
    };

    this.db = new Datastore({
        namespace: 'partytime'
    });

    this.respond = function(content, callback) {
        return axios.patch(
                `https://discord.com/api/v8/webhooks/${process.env.APPLICATION_ID}/${this.interaction.token}/messages/@original`,
                content,
                headers
            )
            .catch((err) => {
                this.errorHandler(err);
            })
            .finally(() => {
                if (callback) {
                    callback();
                } else {
                    res.end();
                }
            });
    };

    this.sendMessage = function(content, callback) {
        if (!content.flags) {
            content.flags = null;
        }
        return axios.post(
                `https://discord.com/api/v8/webhooks/${process.env.APPLICATION_ID}/${this.interaction.token}`,
                content,
                headers
            )
            .catch((err) => {
                this.errorHandler(err);
            })
            .finally(() => {
                if (callback) {
                    callback();
                } else {
                    res.end();
                }
            });
    };

    this.end = function() {
        res.end();
    }

    this.errorHandler = function(err) {
        axios.post(
                `https://discord.com/api/v8/webhooks/${process.env.APPLICATION_ID}/${this.interaction.token}`, {
                    "content": "Sorry, but something went wrong. ``(" + err.toString() + ")``",
                    "flags": 64
                },
                headers
            )
            .catch((err) => {
                console.log(err.toString());
            })
            .finally(() => {
                res.end();
            });
    }

    this.saveData = function(entities, callback) {
        const transaction = this.db.transaction();
        transaction.run((err) => {
            transaction.save(entities);

            transaction.commit((err) => {
                if (err) {
                    console.log(err);
                }

                callback(entities);
            });
        });
    }

    return this;
}