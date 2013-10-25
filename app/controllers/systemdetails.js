"use strict";

// Modules dependencies
// ---------------------------
var airvantage = require('../model/airvantage');
var _ = require('underscore');
var async = require('async');


exports.get = function(req, resp) {

    var uid = req.query.uid;

    async.parallel({
        // get system info
        system : airvantage.systems_query({uid: uid, fields : "uid,name", access_token : req.session.access_token}),
        // get last 100 datapoints
        temperature : airvantage.data_raw_query({uid: uid, path:"greenhouse.temperature", size: 500, access_token : req.session.access_token}),
        luminosity  : airvantage.data_raw_query({uid: uid, path:"greenhouse.luminosity", size: 500, access_token : req.session.access_token}),
        humidity    : airvantage.data_raw_query({uid: uid, path:"greenhouse.humidity", size: 500, access_token : req.session.access_token}),
        // get all alerts
        alerts : airvantage.alerts_query({access_token : req.session.access_token}) 
    },
    function(err, res) {
        if (err) {
            console.log("ERR: " + err);
            next(err);
        } else {

            // count number of not acknowled alerts
            var alerts_count = _.size(_.reject(res.alerts.items, function(alert){return alert.acknowledgedAt}));

            var system = res.system.items[0] || {name: ""};

            // attach alerts to their system
            system.alerts = _.groupBy(res.alerts.items, 'target')[uid] || [];

            system.temperature = _.sortBy(_.map(res.temperature, convert), function(val){return val.x});
            system.luminosity  = _.sortBy(_.map(res.luminosity, convert), function(val){return val.x});
            system.humidity    = _.sortBy(_.map(res.humidity, convert), function(val){return val.x});

            // render the page
            resp.render('systemdetails', {
                alerts_count : alerts_count,
                system : system,
                redirect: req.originalUrl,
                active : 'none'
            });
        }
    });

};


// helper function to convert val to plot coordinates
var convert = function(val){
    return {x:Math.floor(val.timestamp/1000), y:val.value}
}
