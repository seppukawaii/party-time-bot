module.exports = {
  "cards" : [
	  {
		  "id" : 0,
		  "name" : "Spit in Cup",
		  "description" : "Spit in another player's cup",
		  "action" : function (data) {
			  console.log(data.entity);
			  console.log("i am an action");
		  }
	  }
  ]
}
