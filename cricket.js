var feature = require('./feature.js');
var http = require('http');

var Cricket = function(){}

Cricket.prototype = Object.create(feature.__proto__);

Cricket.prototype.createCricMessage = function(senderId)
{
	var options= {
	  //host: 'cricscore-api.appspot.com',
	  //path: '/csa'
	  host: 'cricapi.com',
	  path: '/api/cricket'
	};
	
	var req = http.get(options, function(res) {
	  var bodyChunks = [];
	  res.on('data', function(chunk) {
	  bodyChunks.push(chunk);
	  }).on('end', function() {
			var body = Buffer.concat(bodyChunks);
			var d=JSON.parse(body);
			console.log(d.data);
			if(!Cricket.prototype.isObjectEmpty(d.data))
			{
				var msg={
						"attachment": {
							"type": "template",
							"payload": {
								"template_type": "generic",
								"elements": []
									}
							}
						};
				
				for (var i in d.data)
				{
				if(i==10)
				{break;}
				var item=d.data[i];
				msg.attachment.payload.elements.push({
					"title": d.data[i].description ,
					"buttons": [{
                        "type": "postback",
                        "title": "Get Scores",
						"payload": 'cric'+d.data[i].unique_id
                    }]
				});
				}
				
				Cricket.prototype.sendMessage(senderId,msg);
			}
			else
			{
				Cricket.prototype.sendMessage(senderId,{text: 'No live matches'});
			}
		})
		
	});

	req.on('error', function(e) {
	  console.log('ERROR: ' + e.message);
	});
};

module.exports = new Cricket;