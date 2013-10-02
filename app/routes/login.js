// Modules dependencies
// ---------------------------
var https = require('https');

/**
 * Manage login/authentication Redirect on login page if there aren't access_token in current session
 */
exports.checkAuth = function(req, res, next) {
	if (!req.session.access_token) {
		res.redirect('/login');
	} else {
		next();
	}
};

exports.login = {};

/** render login page */
exports.login.get = function(req, res) {
	res.render('login', {title : "login"});
};

/** try access_token for AirVantage */
exports.login.post = function(req, res) {

	// request options
	var options = {
		host : 'qa-trunk.airvantage.net',
		path : '/api/oauth/token?grant_type=password&username=' + req.body.username + '&password=' + req.body.password + '&client_id=04bd864937ac4d6b9ef3852ff3d4cc19&client_secret=278dc41dded146e291d92e2154d9b708',
	};
	
	// create request to get access token to AirVantage
	var r = https.request(options, function(resp) {
		resp.setEncoding("utf8");
		
		resp.on('data', function(chunk) {
			if (resp.statusCode == 200) {
				// on success, get access token an redirect to main page
				var token = JSON.parse(chunk);
				req.session.access_token = token.access_token;
				req.session.refresh_token = token.refresh_token;
				res.redirect('/');
			} else {
				// on error, display login page with error message
				res.render('login', {
					title : "login",
					errormsg : chunk,
				});
			}
		});
	});

	// execute request
	r.end();
};

exports.logout = {};
exports.logout.post = function(req, res) {
	res.render('login', {});
	;
};