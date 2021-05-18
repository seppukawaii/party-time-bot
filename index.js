const nacl = require('tweetnacl');
const PUBLIC_KEY = process.env.PUBLIC_KEY;

exports.partytime = (req, res) => {
  const signature = req.get('X-Signature-Ed25519');
  const timestamp = req.get('X-Signature-Timestamp');
  const body = req.rawBody;

  const isVerified = nacl.sign.detached.verify(
    Buffer.from(timestamp + body),
    Buffer.from(signature, 'hex'),
    Buffer.from(PUBLIC_KEY, 'hex')
  );

  if (!isVerified) {
    return res.status(401).end('invalid request signature');
  }

  if (req.body.type == 1) {
    res.status(200).json({ type : 1 });
  }
  else {
    var d20 = require('d20');

    var response = {
      "content" : ""
    };

    try {
      var roll = req.body.data.options[0].value;
      var result = d20.roll(roll);
      const emojify = [':zero:', ':one:', ':two:', ':three:', ':four:', ':five:', ':six:', ':seven:', ':eight:', ':nine:'];
      var prettyResult = result.toString().split('').map((i) => emojify[i]).join('');

      response.content = `\`\`${roll}\`\` :game_die: ${prettyResult}`;
      
      res.status(200).json({
        "type": 4,
        "data": response
      });
    }
    catch (err) {
      console.log(err);
      res.status(200).json({
        "type" : 4,
        "flags" : 64,
        "data" : {
	  "content" : "Sorry, but I don't have any dice that can roll that."
	}
      });
    }
  }
};
