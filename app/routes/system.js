"use strict";
/*
 * GET users listing.
 */

var http = require('https');
var mod = require('forEachAsync');

// get systems
function getSystemDatas(system, next,accesstoken) {

	var options = {
		host : 'qa-trunk.airvantage.net',
		path : '/api/v1/systems/' + system.uid
				+ '/data?ids=greenhouse.data.temperature,greenhouse.data.luminosity,greenhouse.data.humidity&access_token='+accesstoken,
		method : 'GET'
	};
	console.log("request: " + options.host + options.path);

	var req = http.request(options, function(res) {
		res.setEncoding('utf8');
		res.on('data', function(data) {
			data = JSON.parse(data);
			if ("greenhouse.data.temperature" in data && data["greenhouse.data.temperature"] !== null){
				system.temperature = data["greenhouse.data.temperature"][0].value;
			}
			if ("greenhouse.data.luminosity" in data && data["greenhouse.data.luminosity"] !==null ){
				system.luminosity = data["greenhouse.data.luminosity"][0].value;
			}
			if ("greenhouse.data.humidity" in data && data["greenhouse.data.humidity"] !== null){
				system.humidity = data["greenhouse.data.humidity"][0].value;
			}
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
		path : '/api/v1/systems?fields=uid,name,lastCommDate&access_token='+pagerequest.session.access_token,
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
			
			var options = {
					host : 'qa-trunk.airvantage.net',
					path : '/api/v1/alerts?fields=uid,date,target&acknowledged=false&access_token='+pagerequest.session.access_token,
					method : 'GET'
				};
			console.log("request: " + options.host + options.path);
			var req = http.request(options, function(res) {
				res.setEncoding('utf8');
				
				res.on('data', function(data) {
					data = JSON.parse(data);
					
					//add alert to the system
					for ( var i = 0; i < data.items.length; i++) {
						for ( var j = 0; j < systems.length; j++){
							if (data.items[i].target === systems[j].uid){
								//create alarm node if needed
								if (!("alerts" in systems[j])){
									systems[j].alerts = [];
								}
								systems[j].alerts.push(data.items[i]);
							}
						}
					}
								
					// request all the datas
					mod.forEachAsync(systems, function(next, element, index, array) {
						getSystemDatas(element, next, pagerequest.session.access_token);

						// then after all of the elements have been handled
						// the final callback fires to let you know it's all done
					}).then(function() {
						console.log('All requests have finished');
						pageresponse.render('systems', {
							systems : systems,
							active : "systems"
						});
					});
					
				});
			}).on('error', function(e) {
				console.log("Unable to get alarms status");
			}).end();

		});
	});

	req.on('error', function(e) {
		console.log('Unable to retreive systems list: ' + e.message);
	});
	req.end();

};

// exports.list = function(req, res) { res.render('systemdetail', {}); };
