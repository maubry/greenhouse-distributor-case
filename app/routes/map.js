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
 	console.log("System request: " + options.host + options.path);

 	var req = http.request(options, function(res) {
 		res.setEncoding('utf8');
 		res.on('data', function(data) {
			console.log('Systems data: ' + data);
 			data = JSON.parse(data);
 			for ( var i = 0; i < data.items.length; i++) {
 				systems.push(data.items[i]);
 			}





 			var options = {
 				host : 'qa-trunk.airvantage.net',
 				path : '/api/v1/alerts?fields=uid,date,target,acknowledgedBy&access_token='+pagerequest.session.access_token,
 				method : 'GET'
 			};
 			console.log('Alerts request: ' + options.host + options.path);
 			http.request(options, function(res) {
 				res.setEncoding('utf8');
 				res.on('data', function(data) {

 					console.log( 'Alerts data: ' + data );
 					data = JSON.parse(data);
					// add alert to the system
 					var alerts_count = 0;
					for ( var i = 0; i < data.items.length; i++) {
						var alert = data.items[i];
						for ( var j = 0; j < systems.length; j++){
							if (alert.target === systems[j].uid){
								//create alarm node if needed
								if (!("alerts" in systems[j])){
									systems[j].alerts = [];
								}
								systems[j].alerts.push(alert);
							}
						}
						if (!alert.acknowledgedBy){
							alerts_count++;
						}
					}

					pageresponse.render('map', {
						alerts_count: alerts_count,
						systems : systems,
						active : 'map'
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
