var feature = require('./feature.js');
var request = require('request');
var cheerio = require('cheerio');

var Movies = function(){}

Movies.prototype = Object.create(feature.__proto__);

Movies.prototype.similarMovies = function(senderId,msg)
{
	var name=msg.substring(6,msg.length).trim();
	var host='http://www.tastekid.com/movies/like/'+name.replace(' ','-');
	request(host, function(error, response, body) {
		if(!error)
		{
		var json=[];
		var $ = cheerio.load(body);
		var list_title = [],list_score=[];
		$('div[class="tk-Resource js-resource-card"] span').each(function (index, element) {
		  if($(element).attr('class')=='tk-Resource-title')
			{	list_title.push($(this).text())	}
		  else if($(element).attr('class')=='js-card-likes-counter')
			{	list_score.push(parseInt($(this).text()))	}
		});
		
		var index=0;
		var max=-1000000;
		if(list_title.length>1)
		{
			if(list_title[0].toLowerCase()==name)
			{
				list_title.splice(0,1);
				list_score.splice(0,1);
			}
			else
			{
				var ind = list_title.indexOf(name);
				list_title.splice(ind, 1);
				list_score.splice(ind,1);
			}
			
			for(var i = 0; i<list_score.length; i++) {//find max index
				if(max<list_score[i])
				{
					index=i;
					max=list_score[i];
				}
			}
			json.push(list_title[index]);
			list_title.splice(index,1);//delete item at index
			list_score.splice(index,1);
			
			index=0;
			max=-1000000;
			if(list_title.length>0)
			{
				for(var i = 0; i<list_score.length; i++) {//find max index
					if(max<list_score[i])
					{
						index=i;
						max=list_score[i];
					}
				}
				json.push(list_title[index]);
				list_title.splice(index,1);//delete item at index
				list_score.splice(index,1);
			}
			//console.log(json);
			//console.log(list_title);
			//console.log(list_score);
		}
		Movies.prototype.sendMessage(senderId, {text: json[0]+'\n'+json[1]});
		}
	});
};

module.exports = new Movies;