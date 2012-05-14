var _ = require('underscore')
	, express = require('express')
    , fs = require('fs')
	, request = require('request');

// ---

var app
    , public = __dirname + '/src';

// ---

app = express.createServer();

// ---

app.configure(function() {
    app.use(express.static(public));
    app.use(app.router);
    app.listen(3000);
});

// ---

app.get('/', function(req, res) {

	res.send('Supersprd.js');

});

// ---

app.get('/tests', function(req, res) {

	fs.readFile(public + '/tests/index.html', 'utf8', function(err, html){
		res.send(html);
	});

});

// ---

app.get('/examples/sdk/:name', function(req, res) {

	fs.readFile(public + '/examples/sdk/' + req.params.name + '/index.html', 'utf8', function(err, html){
		res.send(html);
	});

});

// --- PROXY  -----------------------------------------------------------------

function proxySprd(req, res, next) {

	req.params.proxy = {
		platform : req.params.platform.toUpperCase(),
		query    : req.query,
		body     : JSON.stringify(req.body) || null,
		method   : req.method,
		uri      : req.params[0]
	};

	next();

}
function proxySprdRequest(req, res, next) {

	var endpoint = (req.params.platform === 'EU')
		? 'https://api.spreadshirt.net/api/v1'
		: 'https://api.spreadshirt.com/api/v1';

	var url = endpoint + '/' + req.params.proxy.uri;

	console.log(url);
	console.log(req.params);

	var options = {
		json     : true,
		encoding : 'utf8',
		method   : req.params.proxy.method,
		body     : req.params.proxy.body,
		qs       : req.params.proxy.query
	};

	request(url, options,
		function (err, response, responseBody) {

			console.log(err);
			console.log(response);
			console.log(response.statusCode);
			console.log(response.headers);
			console.log(responseBody);

			if (err || response.statusCode > 201) {

				req.o_O = {
					status   : response.status,
					response : 'Not found ...'
				};

			} else {

				var body = (_.isObject(responseBody))
					? responseBody
					: response.headers;

				req.o_O = {
					status   : response.status,
					response : body
				};

			}

			next();

		});

}


// --- PROXY: REST  -----------------------------------------------------------

app.get('/proxy/sprd/:platform/api/v1/*',
	proxySprd,
	proxySprdRequest,
	function (req, res) {

		res.contentType('application/json');
		res.send(req.o_O);

	});

app.post('/proxy/sprd/:platform/api/v1/*',
	proxySprd,
	proxySprdRequest,
	function (req, res) {

		res.contentType('application/json');
		res.send(req.o_O);

	});

app.put('/proxy/sprd/:platform/*',
	proxySprd,
	proxySprdRequest,
	function (req, res) {

		res.contentType('application/json');
		res.send(req.o_O);

	});

app.delete('/proxy/sprd/:platform/*',
	proxySprd,
	proxySprdRequest,
	function (req, res) {

		res.contentType('application/json');
		res.send(req.o_O);

	});




