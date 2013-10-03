"use strict";
/*
 * GET users listing.
 */

var http = require('https');

// get systems
function getSystemDatas(system, next,accesstoken) {

	var options = {
		host : 'qa-trunk.airvantage.net',
		path : '/api/v1/systems/' + system.uid
				+ '/data?ids=temperature&access_token='+accesstoken,
		method : 'GET'
	};
	console.log("request: " + options.host + options.path);

	var req = http.request(options, function(res) {
		res.setEncoding('utf8');
		res.on('data', function(data) {
			data = JSON.parse(data);
			system.temperature = data.temperature[0].value;
			next();
		});
	});
	req.on('error', function(e) {
		next();
	});
	req.end();
}

exports.display = function(pagerequest, pageresponse) {

	// get system from URL
	var system = {};
	system.uid = pagerequest.query.uid;
	var threeDaysAgo = new Date();
	threeDaysAgo.setDate( threeDaysAgo.getDate() - 3);
	
	var options = {
			host : 'qa-trunk.airvantage.net',
			path : '/api/v1/systems?fields=name&uid='+system.uid+'&access_token='+pagerequest.session.access_token,
			method : 'GET'
		};
		console.log("request: " + options.host + options.path);

		var req = http.request(options, function(res) {
			res.setEncoding('utf8');
			res.on('data', function(data) {
				data = JSON.parse(data);
				system.name = data.items[0].name;

				pageresponse.render('systemDetails', {
					system : system
				});
				
				});
		});

		req.on('error', function(e) {
			console.log('Unable to retreive system: ' + e.message);
		});
		req.end();
	

};
