"use strict";
/*
 * GET map
 */

var airvantage = require('../model/airvantage');
var _ = require('underscore');
var async = require('async');

exports.get = function(req, resp) {

    async.parallel({
         // get all systems
         systems : airvantage.systems_query({fields : "uid,name,data",access_token : req.session.access_token}),
         // get all alerts
         alerts : airvantage.alerts_query({fields : "uid,date,target,acknowledgedAt",access_token : req.session.access_token}) 
    },
    function(err, res) {
        if (err) {
            console.log("ERR: " + err);
            next(err);
        } else {

            // count number of not acknowled alerts
            var alerts_count = _.size(_.reject(res.alerts.items, function(alert){return alert.acknowledgedAt}));

            // attach alerts to their system
            var alerts = _.groupBy(res.alerts.items, 'target');

            var systems = _.map(res.systems.items, function(system) {
                var a = alerts[system.uid];
                if (a) {
                    var alerts_count = _.size(_.reject(a, function(alert){return alert.acknowledgedAt}));
                    
                    if (alerts_count > 0) system.alerts_count = alerts_count;

                }
                return system;
            });

            // render the page
            resp.render('map', {
                alerts_count : alerts_count,
                systems : systems,
                active : 'map'
            });
        }
    });

};
