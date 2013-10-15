/**
 * List of alarms
 */
"use strict";
var https = require('https');

exports.list = function(request, pageresponse) {

	/*
	 * Fetch all alarms
	 */
	var options = {
		method : 'GET',
		host : 'qa-trunk.airvantage.net',
		path : '/api/v1/alerts?fields=uid,date,target,targetDescription,rule,acknowledged,acknowledgedBy&access_token=' + request.session.access_token,
	};
	console.log("Request: " + options.host + options.path);

	// Send request
	https.request(options, function(response) {
		response.setEncoding('utf8');
		response.on('data', function(data) {
			console.log(data);
			data = JSON.parse(data);
			pageresponse.render('alerts', {
				active : 'alerts',
				alerts : data.items,
				alerts_count : data.count
			});
		}).on('error', function(e) {
			console.log('Unable to get alarms details.');
		});
	}).on('error', function(e) {
		console.log("Unable to fetch alarms.");
	}).end();
	// res.render('alerts', {active : 'alerts'} );
};
