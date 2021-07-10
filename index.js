const axios = require('axios');
const nacl = require('tweetnacl');
const fs = require('fs');

exports.partytime = (req, res) => {
    if (req.get('X-CloudScheduler')) {
        const Discord = require('discord.js');
        const client = new Discord.Client();

        client.login(process.env.BOT_TOKEN);

        client.on('ready', () => {
            var message = "It's Wednesday, and that means it's almost PARTY TIME!\r\n\r\n";
            message += "What's the vibe check, <@&639110351635480586>? Are we playing D&D? Doing some chill games? Watching a movie? Let's make sure we're all on the same page!";

            axios.get(
                    "https://api.thecatapi.com/v1/images/search?limit=1&size=full", {}, {
                        "x-api-key": process.env.CATS_API_KEY
                    }
                )
                .then((response) => {
                    message += "\r\n\r\n**obligatory cat pic!!**\r\n" + response.data[0].url;
                }).
            catch((err) => {
                    console.log(err);
                })
                .finally(() => {
                    client.channels.cache.get('711654357459927141').send(message).then(() => {
                        res.status(200).send('ok');
                    });
                });
        });
    } else {
        const signature = req.get('X-Signature-Ed25519');
        const timestamp = req.get('X-Signature-Timestamp');
        const body = req.rawBody;

        const isVerified = nacl.sign.detached.verify(
            Buffer.from(timestamp + body),
            Buffer.from(signature, 'hex'),
            Buffer.from(process.env.PUBLIC_KEY, 'hex')
        );

        if (!isVerified) {
            return res.status(401).end('invalid request signature');
        }

        if (req.body.type == 1) {
            res.status(200).json({
                type: 1
            });
        } else {
            try {
                if (/Discord\-Interactions\/[\d\.]+ \(\+https:\/\/discord.com\)/.test(req.get('user-agent'))) {
                    res.status(200).json({
                        type: 5
                    });
                    axios({
                        url: `https://${req.headers.host}/partytime`,
                        method: req.method,
                        headers: {
                            'X-Signature-Ed25519': req.get('X-Signature-Ed25519'),
                            'X-Signature-Timestamp': req.get('X-Signature-Timestamp')
                        },
                        data: req.body
                    });
                } else {
                    if (req.body.data.options) {
                        req.body.data.options = req.body.data.options.reduce((obj, item) => Object.assign(obj, {
                            [item.name]: item.value
                        }), {});
                    }

                    fs.access(`./functions/${req.body.data.name}.js`, fs.constants.R_OK, (err) => {
                        if (err) {
                            var Game = require('./games/_base');
                            new Game(req, res);
                        } else {
                            require(`./functions/${req.body.data.name}`).interaction(req, res);
                        }
                    });
                }
            } catch (err) {
                console.log(err.toString());
                res.status(200).json({
                    "type": 4,
                    "flags": 64,
                    "data": {
                        "content": "Sorry, but something went wrong."
                    }
                });
            }
        }
    }
};
