var feature = require('./feature.js');

var Weather = function(){}

Weather.prototype = Object.create(feature.__proto__);

Weather.prototype.getWeatherInfo = function(senderId,city,Latlng,resp)
{
	if(Latlng==true)
	{
	var host = 'https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20weather.forecast%20where%20woeid%20in%20(SELECT%20woeid%20FROM%20geo.places%20WHERE%20text=%22('+city+')%22)&format=json&env=store://datatables.org/alltableswithkeys';
	}
	else
	{
	var host = 'https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20weather.forecast%20where%20woeid%20in%20(select%20woeid%20from%20geo.places(1)%20where%20text%3D%22'+city+'%22)&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys';
	}
	
	Weather.prototype.getSource(host,function(weatherText){
		//res.send(weatherText); 
		var weatherJson=JSON.parse(weatherText);
		var temperature=weatherJson.query.results.channel.item.condition.temp;
		var forecast=weatherJson.query.results.channel.item.condition.text;
		var response={text: "The weather in "+city+" is "+temperature+"°F and "+forecast};
		if(Latlng==true)
		{
		Weather.prototype.sendMessage(senderId, {text: "The weather in your location is "+temperature+"°F and "+forecast});
		}
		else
		{
		//Weather.prototype.sendMessage(senderId, {text: "The weather in "+city+" is "+temperature+"°F and "+forecast});
			setTimeout(function() { callback(arg * 2); }, 1000);
		return resp({text: "The weather in "+city+" is "+temperature+"°F and "+forecast});
		}
		});
};

module.exports = new Weather;