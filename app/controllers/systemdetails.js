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
	
	console.log("System data request: " + options.host + options.path);
	var req = http.request(options, function(res) {
		res.setEncoding('utf8');
		res.on('data', function(data) {
			// Data is not shown: It is massive!
			console.log("System data recieved.");
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
		next();
	});
	req.end();
}

exports.get = function(pagerequest, pageresponse) {

	// get system from URL
	var system = {};
	system.uid = pagerequest.query.uid;

	// Fetch alert count
	var url = {
		host : 'qa-trunk.airvantage.net',
		path : '/api/v1/alerts?fields=uid,acknowledgedAt&access_token=' + pagerequest.session.access_token,
		method : 'GET'
	};

	console.log("Alert count request: " + url.host + url.path);
	http.request(url, function(response){
		response.on('data', function(data){
			console.log('Alert count data: '+ data);
			var alerts = JSON.parse(data);
			// TODO: use filters to avoid this loop of nonsense
			var alerts_count = 0;
			for(var a=0; a < alerts.items.length; a++){
				var alert = alerts.items[a];
				if (!alert.acknowledgedAt){
					alerts_count++;
				}
			}

			var options = {
				host : 'qa-trunk.airvantage.net',
				path : '/api/v1/systems?fields=name&uid=' + system.uid + '&access_token=' + pagerequest.session.access_token,
				method : 'GET'
			};

			console.log("System request: " + options.host + options.path);
			http.request(options, function(res) {
				res.setEncoding('utf8');
				res.on('data', function(data) {
					data = JSON.parse(data);
					system.name = data.items[0].name;
					
					//get the alerts on the system if any
					var options = {
						host : 'qa-trunk.airvantage.net',
						path : '/api/v1/alerts?target=' + system.uid + '&fields=uid,target,rule,date,acknowledgedAt&access_token=' + pagerequest.session.access_token,
						method : 'GET'
					};

					console.log("System alerts request: " + options.host + options.path);
					http.request(options, function(res) {
						res.setEncoding('utf8');
						res.on('data', function(data) {
							data = JSON.parse(data);
							system.alerts = data.items;

							//get the historical data
							mod.forEachAsync(["temperature","luminosity","humidity"], function(next, element, index, array) {
								getDatas(element, next, system, pagerequest.session.access_token);

								// then after all of the elements have been handled
								// the final callback fires to let you know it's all done
							}).then(function() {
								console.log('All requests are done.');
								pageresponse.render('systemDetails', {
									system : system,
									active : "none",
									alerts_count: alerts_count
								});
							});
						});

					}).on('error', function(e){
						console.log("Unable to fetch system's alerts: " + e.message);
					}).end();

				}).on('error', function(e) {
					console.log("Error while requesting alerts: " + e.message);
					next();
				});

			}).on('error', function(e) {
				console.log('Unable to retreive system: ' + e.message);
			}).end();

		}).on('error', function (e){
			console.log('Unable to fetch alert count: ' + e.message);
		});

	}).on('error', function (e){
		console.log('Unable to request alert count: ' + e.message);
	}).end();
};
