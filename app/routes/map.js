"use strict";
/*
 * GET map
 */

var http = require('https');

exports.display = function(pagerequest, pageresponse) {

	var systems = [];

	var options = {
		host : 'qa-trunk.airvantage.net',
		path : '/api/v1/systems?fields=uid,name,data&access_token='+pagerequest.session.access_token,
		method : 'GET'
	};
	console.log("request: " + options.host + options.path);

	var req = http.request(options, function(res) {
		res.setEncoding('utf8');
		res.on('data', function(data) {
			data = JSON.parse(data);
			for ( var i = 0; i < data.items.length; i++) {
				systems.push(data.items[i]);
			}
			pageresponse.render('map', {
				systems : systems,
				active : "map"
			});
		});
	});

	req.on('error', function(e) {
		console.log('Unable to retreive systems list: ' + e.message);
	});
	req.end();

};