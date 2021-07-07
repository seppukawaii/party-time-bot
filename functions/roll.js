module.exports = {
    "command": {
        "name": "roll",
        "description": "Roll some dice!",
        "options": [{
            "name": "dice",
            "description": "The dice to roll and any modifiers (1d20, 3d12, 8d4 +2, 2d8 -1)",
            "type": 3,
            "required": true
        }]
    },
    "interaction": (req, res) => {
        var d20 = require('d20');

        var response = {
            "content": ""
        };

        try {
            var roll = req.body.data.options.dice;
            var result = d20.roll(roll);
            const emojify = [':zero:', ':one:', ':two:', ':three:', ':four:', ':five:', ':six:', ':seven:', ':eight:', ':nine:'];
            emojify['-'] = '**—**';

            var prettyResult = result.toString().split('').map((i) => emojify[i]).join('');

            response.content = `\`\`${roll}\`\` :game_die: ${prettyResult}`;

            res.status(200).json({
                "type": 4,
                "data": response
            });
        } catch (err) {
            console.log(err);
            res.status(200).json({
                "type": 4,
                "data": {
                    "content": "Sorry, but I don't have any dice that can roll that.",
			"flags" : 64
                }
            });
        }
    }
};
