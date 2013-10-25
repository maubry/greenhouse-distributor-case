"use strict";

// Modules dependencies
// ---------------------------
var airvantage = require('../model/airvantage');
var _ = require('underscore');
var async = require('async');


/**
 * Manage get request on systems.
 */
exports.get = function(req, resp) {

    async.parallel({
         // get all systems and their data         
         systems : async.apply(
             async.waterfall, [
                 airvantage.systems_query({fields : "uid,name,lastCommDate",access_token : req.session.access_token}),
                 function(systems, callback){
                     async.map(systems.items, function(system, cb){                         
                         airvantage.data_query({uid : system.uid, ids : "greenhouse.temperature,greenhouse.luminosity,greenhouse.humidity", access_token : req.session.access_token})
                             (function(err, data) {
                                if (data) {
                                    if ("greenhouse.temperature" in data && data["greenhouse.temperature"] !== null) {
                                        system.temperature = data["greenhouse.temperature"][0].value;
                                    }
                                    if ("greenhouse.luminosity" in data && data["greenhouse.luminosity"] !== null) {
                                        system.luminosity = data["greenhouse.luminosity"][0].value;
                                    }
                                    if ("greenhouse.humidity" in data && data["greenhouse.humidity"] !== null) {
                                        system.humidity = data["greenhouse.humidity"][0].value;
                                    };
                                }
                                console.log(system);
                                cb(err, system);
                             });
                     }, callback);
                 }
            ]
         ),
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

            var systems = _.map(res.systems, function(system) {
                var a = alerts[system.uid];
                if (a) {
                    var alerts_count = _.size(_.reject(a, function(alert){return alert.acknowledgedAt}));
                    if (alerts_count > 0) system.alerts_count = alerts_count;
                }
                return system;
            });

            // render the page
            resp.render('systems', {
                alerts_count : alerts_count,
                systems : systems,
                active : "systems"
            });
        }
    });

};
