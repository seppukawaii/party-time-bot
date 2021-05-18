const axios = require('axios');
const secrets = require('./secrets.json');

const commands = [
{
    "name": "roll",
    "description": "Roll some dice!",
    "options": [
        {
            "name": "dice",
            "description": "The dice to roll and any modifiers (1d20, 3d12, 8d4 +2, 2d8 -1)",
            "type": 3,
            "required": true
        }
    ]
}
];

axios.post(
    `https://discord.com/api/v8/applications/${secrets.APPLICATION_ID}/commands`,
    commands[0],
    {
      headers: {
        "Authorization": `Bot ${secrets.BOT_TOKEN}`
      }
    }
  ).then(function (response) {
    console.log(response);
  }).catch(function (error) {
    console.log(error);
  });
