/**
 * List of alarms
 */
"use strict";
var airvantage = require('../model/airvantage');
var _ = require('underscore');
var async = require('async');



exports.get = function(req, resp) {

    //request alerts from AirVantage
    airvantage.alerts_query({"access_token": req.session.access_token})(function(err, res) {
        if (err) {
            console.log("ERR: " + err);
            next(err);
        } else {

            // alerts
            var alerts = res.items;

            // count alert not aknowledged
            var alerts_count = _.size(_.reject(alerts, function(alert){return alert.acknowledgedBy}));

            // render the page
            resp.render('alerts', {
                alerts : alerts,
                active : "alerts",
                redirect: req.originalUrl,
                alerts_count : alerts_count
            });
        }
    });

};




exports.post = function(req, resp, next){

    //post ack to AirVantage
    airvantage.alerts_ack({uid: req.body.uid, "access_token": req.session.access_token}, "")(function(err, res){
        if(err){
            next(err);
        }else{
            // redirect to the page that send the ack
            resp.redirect(req.body.redirect);
        }
    });

};
