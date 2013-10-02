"use strict";
/*
 * GET users listing.
 */

var http = require('https');
var mod = require('forEachAsync');

// get systems
function getSystemDatas(system, next) {

	var options = {
		host : 'qa-trunk.airvantage.net',
		path : '/api/v1/systems/' + system.uid
				+ '/data?ids=temperature&access_token=?',
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

exports.list = function(pagerequest, pageresponse) {

	var systems = [];

	var options = {
		host : 'qa-trunk.airvantage.net',
		path : '/api/v1/systems?fields=uid,name,lastCommDate&access_token=?',
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

			// request all the temperatures
			mod.forEachAsync(systems, function(next, element, index, array) {
				getSystemDatas(element, next);

				// then after all of the elements have been handled
				// the final callback fires to let you know it's all done
			}).then(function() {
				console.log('All requests have finished');
				pageresponse.render('systems', {
					systems : systems
				});
			});

		});
	});

	req.on('error', function(e) {
		console.log('Unable to retreive systems list: ' + e.message);
	});
	req.end();

};

// exports.list = function(req, res) { res.render('systemdetail', {}); };
