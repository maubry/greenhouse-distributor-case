/**
* Systems views
*/

exports.list = function(req, res) {
	res.render('systems', {
		systems : [ {
			name : "B1",
			uid : "001",
			temperature : 45,
			lastcommdate : 1380210799215
		}, {
			name : "B2",
			uid : "002",
			temperature : 25,
			lastcommdate : 1380210799215
		}, {
			name : "C1",
			uid : "003",
			temperature : 38,
			lastcommdate : 1380210799215
		} ]
	});
};

// exports.list = function(req, res) { res.render('systemdetail', {}); };
