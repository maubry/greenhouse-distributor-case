/**
 * List of alarms
 */
"use strict";
var https = require('https');

exports.get = function(request, pageresponse) {

    /*
     * Fetch all alarms
     */
    var options = {
        method : 'GET',
        host : 'qa-trunk.airvantage.net',
        path : '/api/v1/alerts?fields=uid,date,target,targetDescription,rule,acknowledgedBy&access_token=' + request.session.access_token,
    };
    console.log('Alerts request: ' + options.host + options.path);

    // Send request
    https.request(options, function(response) {
        response.setEncoding('utf8');
        response.on('data', function(data) {
            console.log('Alerts data: '+ data);
            data = JSON.parse(data);
            var alerts_count = 0;
            for(var a=0; a < data.items.length; a++){
                var alert = data.items[a];
                if (!alert.acknowledgedBy){
                    alerts_count++;
                }
            }
            pageresponse.render('alerts', {
                active : 'alerts',
                alerts : data.items,
                alerts_count : alerts_count
            });
        }).on('error', function(e) {
            console.log('Unable to get alarms details: ' + e.message);
        });
    }).on('error', function(e) {
        console.log('Unable to fetch alarms: ' + e.message);
    }).end();
};
