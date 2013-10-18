// Modules dependencies
// ---------------------------
var https = require('https');

/**
 * Manage login/authentication Redirect on login page if there aren't access_token in current session
 */
exports.check = function(req, res, next) {
	// save the original URL in case we redirect to the login page
	// to allow it to return to the requested page
	req.session.originalUrl = req.originalUrl; 
	if (!req.session.access_token) {
		// to access-token, we go to the login page
		res.redirect('/signin');
	}else if (req.session.expires_at - 3600000 > new Date().getTime()){
		// access token will expire, so we try to get a new one transparently
		
		// request option
		var options = {
			host : 'qa-trunk.airvantage.net',
			path : '/api/oauth/token?grant_type=refresh_token&refresh_token='+req.session.refresh_token+'&client_id=04bd864937ac4d6b9ef3852ff3d4cc19&client_secret=278dc41dded146e291d92e2154d9b708',
		};
	
		// create request to get refresh token 
		var r = https.request(options, function(resp) {
			resp.setEncoding("utf8");
			
			resp.on('data', function(chunk) {
				try{
					if (resp.statusCode == 200) {
						// on success, refresh access token and continue to the requested page
						var token = JSON.parse(chunk);
						req.session.access_token = token.access_token;
						req.session.refresh_token = token.refresh_token;
						req.session.expires_at = new Date().getTime() + token.expires_in * 1000;
						console.log("refresh access token :"+ chunk);
						next();
					} else {
						// we don't succed to refresh token, we go to the login page.
						console.log('AirVantage return an unexpected status code ('+ resp.statusCode+") : "+ chunk);
						res.redirect('/signin');
					};
				}catch (e){
					// if we get an unexpected response, log it an go to the login page
					console.log(e);
					res.redirect('/signin');
				};
			});

		});
		
		// manage error on request
		r.on('error', function (e){
			// if an unexpected error occurred, log it an go to the login page
			console.log(e);
			res.redirect('/signin');
		});
		
		// execute request
		r.end();
	}else{
		next();
	}
};

exports.signin = {};

/** render login page */
exports.signin.get = function(req, res) {
	res.render('signin', {});
};

/** try get access_token for AirVantage */
exports.signin.post = function(req, res,next) {

	// request options
	var options = {
		host : 'qa-trunk.airvantage.net',
		path : '/api/oauth/token?grant_type=password&username=' + req.body.username + '&password=' + req.body.password + '&client_id=04bd864937ac4d6b9ef3852ff3d4cc19&client_secret=278dc41dded146e291d92e2154d9b708',
	};
	
	// create request to get access token to AirVantage
	var r = https.request(options, function(resp) {
		resp.setEncoding("utf8");
		
		resp.on('data', function(chunk) {
			try{
				if (resp.statusCode == 200) {
					// on success, get access token an redirect to main page
					console.log (chunk);
					var token = JSON.parse(chunk);
					req.session.access_token = token.access_token;
					req.session.refresh_token = token.refresh_token;
					req.session.expires_at = new Date().getTime() + token.expires_in * 1000;
					if (req.session.originalUrl)
						res.redirect(req.session.originalUrl);
					else
						res.redirect('/');
				} else if (resp.statusCode == 400) {
					// on error, display login page with error message
					var error = JSON.parse(chunk);
					res.render('signin', {
						errormsg : error.error_description,
					});
				}else{
					next (new Error('AirVantage return an unexpected status code : '+ resp.statusCode));
				}
			}catch(e){
				next(e);
			}
		});
	});

	// manage error on request
	r.on('error', function (e){
		next(e);
	});
	
	// execute request
	r.end();
};

exports.signout = {};
/** clear session : delete login information */
exports.signout.post = function(req, res) {
	req.session.access_token = null;
	req.session.refresh_token = null;
	req.session.expires_at = null;
	res.render('signin', {});
};
