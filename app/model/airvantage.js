// Modules dependencies
// ---------------------------
var https = require('https');
var _ = require('underscore');

// create a new query for the given host, base URL and ending URL.
// URL could  contains path parameter which will be passed to the query as a map
// 
// e.g :  
//       var myquery = query_get_ctor('localhost', '/myrootpath/',  'mypath/:param1/pathend');
//       myquery ({param1:'val1', param2:'val2', param3:'val3'}) ( function (err, data) {}) 
// 
// this will request https://localhost/myrootpath/mypath/value1/pathend?param2='val2'&param3='val3'
var query_get_ctor = function (host, base, url){
    return function (params){
        return function (callback){
            // manage URL path parameters
            var u = _.reduce(_.pairs(params), function(u, p){return u.replace(":"+p[0], p[1]);}, url);
            
            // manage URL query parameters
            var param_section = _.reduce(_.pairs(params), function(memo, pair){return memo + pair[0] + "=" + pair[1] + "&";}, "?");
            
            // define url option
            var options = {
                host : host,
                path : base + u + param_section,
                method : 'GET'
            };
            console.log("GET REQ: " + host + base + u + param_section);
            // execute the request
            https.request(options, function(resp){
                resp.setEncoding('utf8');
                var value = "";
                resp.on('data', function(data){
                    value = value + data;
                });
                resp.on('end', function(){
                    var err = null, res = null;
                    if (resp.statusCode != 200){
                        err="Status Code " + resp.statusCode
                        callback(err,res);
                    } else {
                        try{
                            res = JSON.parse(value);
                        }catch(e){
                            err=e;
                        }
                        callback(err,res);
                    }
                    
                });
            }).on('error', function(e) {
                callback(e);
            }).end();
        };

    };
};

var query_post_ctor = function (host, base, url){
    return function (params, content){
        return function (callback){
            // manage URL path parameters
            var u = _.reduce(_.pairs(params), function(u, p){return u.replace(":"+p[0], p[1]);}, url);
            
            // manage URL query parameters
            var param_section = _.reduce(_.pairs(params), function(memo, pair){return memo + pair[0] + "=" + pair[1] + "&";}, "?");
            
            // define url option
            var options = {
                host : host,
                path : base + u + param_section,
                method : 'POST',
                headers: {"Content-Type": "application/json"}
            };
            console.log("POST REQ: " + host + base + u + param_section);
            // execute the request
            https.request(options, function(resp){
                resp.setEncoding('utf8');
                var value = "";
                resp.on('data', function(data){
                    value = value + data;
                });
                resp.on('end', function(){
                    var err = null, res = null;
                    if (resp.statusCode != 200){
                        err="Status Code " + resp.statusCode
                        callback(err,res);
                    } else {
                        try{
                            res = JSON.parse(value);
                        }catch(e){
                            err=e;
                        }
                        callback(err,res);
                    }
                    
                });
            }).on('error', function(e) {
                callback(e);
            }).end(content);
        };

    };
};





// AirVantage API, see API documentation.
// ---------------------------------------
var host = "na.airvantage.net";
var apiurl = "/api/v1/";
var authurl = "/api/oauth/";





/** Get all systems */
exports.systems_query = query_get_ctor(host, apiurl, "systems");

/** Get all alert */
exports.alerts_query = query_get_ctor(host, apiurl, "alerts");

/** Acknowledge an alert */
exports.alerts_ack = query_post_ctor(host, apiurl, "alerts/:uid/acknowledge");

/** Get last data of a system */
exports.data_query = query_get_ctor(host, apiurl, "systems/:uid/data");

/** Get raw datapoints of a system */
exports.data_raw_query = query_get_ctor(host, apiurl, "systems/:uid/data/:path/raw");

/** Get access token */
exports.token_query = query_get_ctor(host, authurl, "token");



