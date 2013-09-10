'use strict';

//
// Request Handler "Class".
//
var RequestHandler = function(config, request, response) {

	var fs = require('fs');

	var cacheDir = __dirname + '/' + config.jsonDir;	

	var yourRequest = "Your request: '" + request.url + "'\n\n";
	var cachedFile = cacheDir + request.url;

	// Set the Content-Type of the response to text/html (defaults to binary/octet-stream)
	// response.setHeader("Content-Type", "text/html");
	var CONTENT_TYPE_HTML = "text/html";
	var CONTENT_TYPE_JSON = "application/json";


	//
	// Call the entry point
	//
	main();

	//
	// Entry point of the application - inspect the request, and handle/delegate as necessary.
	//
	function main() {

		// If a URL with ".." is provided, then deny it and say "BAD CLIENT!" - we're not serving up access to the filesystem...
		if(request.url.match(/\/\.\./)) {
			config.logger.accessLog("Bad Request (from " + request.host + ") for url with '..': '" + request.url + "', Responded with 400");

			respondWith(400, CONTENT_TYPE_HTML, '<html><head><title>Bad Request</title></head><body><h1>Bad Request</h1><span><strong>' 
				+ yourRequest + '</strong> was a bad request: ".." is not allowed in the url</span></body></html>');
		}		
		// Otherwise - let's go fetch / build the cache for this:
		else {
			config.logger.accessLog("Handling Request (from " + request.host + ") for: '" + request.url + "'");

			lookupFile();
		}
	}

	//
	// Checks to see if the file exists in the cache or not.
	//
	function lookupFile() {
		fs.exists(cachedFile, function(exists) {
			if(exists) {
				
				handleFound();

			} else {
				
				config.logger.serverLog("cache miss: '" + cachedFile + "', building cache...");

				respondWith(404, CONTENT_TYPE_HTML, "<h1>File not found</h1>");
			}
		});
	}

	function handleFound() {
		fs.stat(cachedFile, function(err, stats){
			if(err) {
				respondWith(500, CONTENT_TYPE_HTML, "Error reading file: " + JSON.stringify(err));
			} else {
				if(stats.isDirectory()) {

					handleDirectory();

				} else if(stats.isFile()) {
					config.logger.serverLog("cache hit: '" + cachedFile + "', Responding with 200");

					respondWith(200, CONTENT_TYPE_JSON, fs.readFileSync(cachedFile));
				}
			}
		});
	}

	function handleDirectory() {
		fs.readdir(cachedFile, function(err, files) {
			if(err) {
				respondWith(500, CONTENT_TYPE_HTML, "Error reading directory: " + JSON.stringify(err));
			} else {
				var responseHtml = '<html><head><title>' + request.url + '</title></head><body>'
					+ '<h1>' + request.url + '</h1><br/><ul><li><a href="..">..</a></li>';
				for(var file in files) {
					responseHtml += '<li><a href="' + files[file] + '">' + files[file] + '</a></li>';
				}
				responseHtml += '</ul></body></html>';

				respondWith(200, CONTENT_TYPE_HTML, responseHtml);
			}
		});
	}

	function respondWith(code, contentType, data) {
		if(config.useCORS) {
			response.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With');
			response.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, PUT');
			response.setHeader('Access-Control-Allow-Origin', '*');
		}

		response.setHeader("Content-Type", contentType);

		response.send(code, data);
	}
	
}

exports.Routes = {
	init: function(app, config) {
		app.get( '*', function (req, res) {
			return new RequestHandler(config, req, res);		
		});
	}
};
