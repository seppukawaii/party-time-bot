const axios = require('axios');
const secrets = require('./secrets/webhook.json');

const commands = [{
        "name": "roll",
        "description": "Roll some dice!",
        "options": [{
            "name": "dice",
            "description": "The dice to roll and any modifiers (1d20, 3d12, 8d4 +2, 2d8 -1)",
            "type": 3,
            "required": true
        }]
    },
    {
        "name": "setup",
        "description": "Set up a new game",
	    "options" : [
		    {
			    "name" : "game",
			    "description" : "Which game do you want to play?",
			    "type" : 3,
			    "required" : true,
			    "choices" : [
				    {
					    "name" : "Word Scramble",
					    "value" : "wordscramble"
				    }
			    ]
		    }
	    ]
    },
	{
		"name" : "join",
		"description" : "Join a game"
	},
	{
		"name" : "start",
		"description" : "Start the game!"
	},
	{
		"name" : "guess",
		"description" : "Submit a guess",
		"options" : [
			{
				"name" : "guess",
				"description" : "Give it your best shot!",
				"type" : 3,
				"required" : true
			}
		]
	}
];

const headers = {
    headers: {
        "Authorization": `Bot ${secrets.BOT_TOKEN}`
    }
};

axios.put(
    `https://discord.com/api/v8/applications/${secrets.APPLICATION_ID}/commands`,
    commands,
    headers
).catch( (err) => {
console.log(err);
});
