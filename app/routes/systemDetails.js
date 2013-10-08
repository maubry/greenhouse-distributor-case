"use strict";
/*
 * GET users listing.
 */

var http = require('https');
var mod = require('forEachAsync');
var threeDaysAgo = new Date();
threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

//get systems
function getDatas(element, next, system, access_token) {
	
	var options = {
			host : 'qa-trunk.airvantage.net',
			//TODO adding the from argument to have the last 3 days (but our test data have been set more than 3 days ago): from=' + threeDaysAgo.getTime() +
			path : '/api/v1/systems/' + system.uid + '/data/greenhouse.data.'+element+'/raw?access_token=' + access_token,
			method : 'GET'
		};
	
	console.log("request: " + options.host + options.path);
	var req = http.request(options, function(res) {
		res.setEncoding('utf8');
		res.on('data', function(data) {
			data = JSON.parse(data);
			system[element] = [];
			for (var i = 0; i < data.length; i++){
				system[element].push({y:data[i].value,x:(data[data.length-i-1].timestamp)/1000});
			}
			
			next();
			});
		});
	req.on('error', function(e) {
		console.log("Error while requesting datas");
	});
	req.end();
}

exports.display = function(pagerequest, pageresponse) {

	// get system from URL
	var system = {};
	system.uid = pagerequest.query.uid;

	var options = {
		host : 'qa-trunk.airvantage.net',
		path : '/api/v1/systems?fields=name&uid=' + system.uid + '&access_token=' + pagerequest.session.access_token,
		method : 'GET'
	};
	console.log("request: " + options.host + options.path);

	var req = http.request(options, function(res) {
		res.setEncoding('utf8');
		res.on('data', function(data) {
			data = JSON.parse(data);
			system.name = data.items[0].name;
			
			mod.forEachAsync(["temperature","luminosity","humidity"], function(next, element, index, array) {
				getDatas(element, next, system, pagerequest.session.access_token);

				// then after all of the elements have been handled
				// the final callback fires to let you know it's all done
			}).then(function() {
				console.log('All requests have finished');
				pageresponse.render('systemDetails', {
					system : system,
					active : "systems"
				});
			});
		});
	});

	req.on('error', function(e) {
		console.log('Unable to retreive system: ' + e.message);
	});
	req.end();

};
