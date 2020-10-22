var request = require('request');

var Feature = function() {}

Feature.prototype.isObjectEmpty = function(obj)
{
	return !Object.keys(obj).length;
};
	
Feature.prototype.getSource = function(host,req)
{
	request(host, function(error, response, body) {
		return req(body);
	});
};
	
Feature.prototype.sendMessage = function(recipientId, message) 
{
	var token = "EAADhSayo4xoBALkRzih5idr4rzemnV3gbcGO4uRna2s4xawXHjVSj8azg0X80gp8Br6mcjylofmWROCd06Jcy5tzBBr7WsEGi8EWwscmPlNGEwZCiKM08EOw8JUWEXhQD8CmSKDXPXVZC7V4fCsWVZAoOZBGJCRFXUvgd0honmgFPFUbS9yz"

	request({
		url: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {access_token: token},
		method: 'POST',
		json: {
			recipient: {id: recipientId},
			message: message,
		}
	}, function(error, response, body) {
		if (error) {
			console.log('Error sending message: ', error);
		} else if (response.body.error) {
			console.log('Error: ', response.body.error);
		}
	});
};
	
module.exports = new Feature;

