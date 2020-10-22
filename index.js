'use strict';

var feature = require('./feature.js');
var weather = require('./weather.js');
var cricket = require('./cricket.js');
var movies = require('./movies.js');

var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var cheerio = require('cheerio');
var app = express();
var http = require('http');

let Wit = null;
let log = null;
try {
  // if running from repo
  Wit = require('../').Wit;
  log = require('../').log;
} catch (e) {
  Wit = require('node-wit').Wit;
  log = require('node-wit').log;
}

const WIT_TOKEN = 'RQBSH5VWRXHAV7HTJK3V3JXFV5QFKZBI';//process.env.WIT_TOKEN;

app.use(express.static(__dirname + '/bot_images'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.listen((process.env.PORT || 3000));


//----------------------------------------------------------------------------------
// This will contain all user sessions.
// Each session has an entry:
// sessionId -> {fbid: facebookUserId, context: sessionState}
const sessions = {};

const findOrCreateSession = (fbid) => {
  let sessionId;
  // Let's see if we already have a session for the user fbid
  Object.keys(sessions).forEach(k => {
    if (sessions[k].fbid === fbid) {
      // Yep, got it!
      sessionId = k;
    }
  });
  if (!sessionId) {
    // No session found for user fbid, let's create a new one
    sessionId = new Date().toISOString();
    sessions[sessionId] = {fbid: fbid, context: {}};
  }
  return sessionId;
};

const firstEntityValue = (entities, entity) => {
  const val = entities && entities[entity] &&
    Array.isArray(entities[entity]) &&
    entities[entity].length > 0 &&
    entities[entity][0].value
  ;
  if (!val) {
    return null;
  }
  return typeof val === 'object' ? val.value : val;
};

const actions = {

  send(request, response) {
    const {sessionId, context, entities} = request;
	const recipientId = sessions[sessionId].fbid;
    const {text, quickreplies} = response;
    return new Promise(function(resolve, reject) {
	console.log(context);
		
		/*if(feature.isObjectEmpty(context))
		{
		feature.sendMessage(recipientId, response);
		}
		else
		{
      if('weather' in context)
		{weather.getWeatherInfo(recipientId,context.weather,false); 
		delete context.weather;
		console.log(context);}
		else
		{feature.sendMessage(recipientId, response);}
		}*/
		//console.log(context);
		//console.log(response);
		feature.sendMessage(recipientId, response);
	  return resolve();
    });
  },
  
  getWeather({context, entities}) {
    return new Promise(function(resolve, reject) {
      var location = firstEntityValue(entities, 'location')
      if (location){
		//const recipientId = sessions[sessionId].fbid;
		//console.log(context);
        //context.weather = location; // we should call a weather API here
		//console.log(context);
		
		weather.getWeatherInfo("",location,false,function(resp)
			{
			context.weather=JSON.parse(resp).text;
			});
		delete context.missingLocation;
      } else {
        context.missingLocation = true;
        delete context.weather;
      }
      return resolve(context);
    });
  },
  // You should implement your custom actions here

};

const wit = new Wit({
  accessToken: WIT_TOKEN,
  actions,
  logger: new log.Logger(log.INFO)
});


//-------------------------------------------------------------------
app.get('/', function (req, res) {
    res.send('This is TestBot Server');
});

app.get('/webhook', function(req, res) {
  if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === 'Testing_Token') {
    console.log("Validating webhook");
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.error("Failed validation. Make sure the validation tokens match.");
    res.sendStatus(403);          
  }  
});

app.post('/webhook', function (req, res) {
    var events = req.body.entry[0].messaging;
    for (var i = 0; i < events.length; i++) {
        var event = events[i];
		
		if (event.message)
		{
			const sessionId = findOrCreateSession(event.sender.id);
			if(event.message.attachments && event.message.attachments[0].type == 'location' && event.message.attachments[0].payload.coordinates)
			{
				var latLng=event.message.attachments[0].payload.coordinates.lat+','+event.message.attachments[0].payload.coordinates.long;
				weather.getWeatherInfo(event.sender.id,latLng,true);
			}
			else if(event.message.text)
			{
				var msg=event.message.text.trim();
				var lc=msg.toLowerCase();
				
				if(lc.substring(0,6)=='movie:')
					{
					movies.similarMovies(event.sender.id, lc)
					}
			
				else if(msg=="help" || msg=="Help")
					{
					sendGenericMessage(event.sender.id);
					}
				else
				{
					wit.runActions(
					sessionId, // the user's current session
					event.message.text, //text, // the user's message
					sessions[sessionId].context // the user's current session state
					).then((context) => {
						if (context['done']) {
							delete sessions[sessionId];
						}
					//console.log('Waiting for next user messages');
					
					  // Based on the session state, you might want to reset the session.
					  // This depends heavily on the business logic of your bot.
					  // Example:
					  // if (context['done']) {
					  //   delete sessions[sessionId];
					  // }

					  // Updating the user's current session state
					  sessions[sessionId].context = context;
					})
					.catch((err) => {
					  console.error('Oops! Got an error from Wit: ', err.stack || err);
					})
				}
			/*
				var msg=event.message.text;
				var lc=msg.toLowerCase();
				
				if(lc.substring(0,6)=='movie:')
					{
					movies.similarMovies(event.sender.id, lc);
					}
				else if(msg=="what's your name?" || msg == "what's your name" || msg == "What's your name?" || msg == "What's your name" || msg == "what is your name?" || msg == "what is your name" || msg == "What is your name?" || msg == "What is your name")
					{
					feature.sendMessage(event.sender.id, {text: "I dont have a name."});
					}
				else if(msg=="help" || msg=="Help" || msg=="what  do you do" || msg == "what do you do?" || msg == "What do you do?" || msg == "What do you do")
					{
					//sendMessage(event.sender.id, {text: 'Enter a movie name...as "movie:<movie name>"'});
					sendGenericMessage(event.sender.id);
					}
				else if(msg=="how is the weather today?")
					{
					feature.sendMessage(event.sender.id, {text: "Send me your location"});
					}
				else if(msg=="get me cricket scores")
					{
					//sendGenericMessage(event.sender.id);
					cricket.createCricMessage(event.sender.id);
					}
				else 
					{
					feature.sendMessage(event.sender.id, {text: "Echo: " + msg});
					}*/
			}
		
		}
		else if(event.postback)
			{
				var text = JSON.stringify(event.postback);
				var x=JSON.parse(text);
				console.log(text);
				console.log(x.payload);
				
				if(x.payload=='get_movie')
				{
				feature.sendMessage(event.sender.id, {text: 'Enter a movie name...as "movie:<movie name>"'});
				}
				else if(x.payload=='get_weather')
				{
				feature.sendMessage(event.sender.id, {text: "Send me your location"});
				}
				else if(x.payload=='get_cricket')
				{
				cricket.createCricMessage(event.sender.id);
				}
				else if(x.payload.substring(0,4)=="cric")
				{	
					var cid=x.payload.substring(4,x.payload.length);
					var host='http://cricapi.com/api/cricketScore?unique_id='+cid;
					feature.getSource(host,function(requ)
						{
						var x=JSON.parse(requ);
						var t=x.score;
						feature.sendMessage(event.sender.id, {text: t});
						});
				}
			}
		
    }
    res.sendStatus(200);
});

// generic function sending messages

function sendGenericMessage(sender) {
    var messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": "Movies",
                    "subtitle": "Get movie suggestions",
                    "image_url": "http://thawing-shore-90669.herokuapp.com/movie.png",
                    "buttons": [{
                        "type": "postback",
                        "title": "Suggest me something",
                        "payload": "get_movie",
                    }],
                }, {
                    "title": "Weather",
                    "subtitle": "Get current weather information",
                    "image_url": "http://thawing-shore-90669.herokuapp.com/weather.png",
                    "buttons": [{
                        "type": "postback",
                        "title": "Get me weather information",
                        "payload": "get_weather",
                    }],
                }, {
                    "title": "Cricket",
                    "subtitle": "Get live cricket scores",
                    "image_url": "http://thawing-shore-90669.herokuapp.com/cricket.png",
                    "buttons": [{
                        "type": "postback",
                        "title": "Get scores",
                        "payload": "get_cricket",
                    }],
                }]
            }
        }
    }
	feature.sendMessage(sender,messageData);
}

