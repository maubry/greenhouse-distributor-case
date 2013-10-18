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
                         airvantage.data_query({uid : system.uid, ids : "greenhouse.data.temperature,greenhouse.data.luminosity,greenhouse.data.humidity", access_token : req.session.access_token})
                             (function(err, data) {
                                if (data) {
                                    if ("greenhouse.data.temperature" in data && data["greenhouse.data.temperature"] !== null) {
                                        system.temperature = data["greenhouse.data.temperature"][0].value;
                                    }
                                    if ("greenhouse.data.luminosity" in data && data["greenhouse.data.luminosity"] !== null) {
                                        system.luminosity = data["greenhouse.data.luminosity"][0].value;
                                    }
                                    if ("greenhouse.data.humidity" in data && data["greenhouse.data.humidity"] !== null) {
                                        system.humidity = data["greenhouse.data.humidity"][0].value;
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
        } else {
            // attach alerts to their system
            res.alerts = _.groupBy(res.alerts.items, 'target');
            res.systems = _.map(res.systems, function(system) {
                var a = res.alerts[system.uid];
                if (a) system.alerts = a;
                return system;
            });

            // render the page
            resp.render('systems', {
                alerts_count : 0,
                systems : res.systems,
                active : "systems"
            });
        }
    });

};
