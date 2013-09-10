'use strict';

var express = require('express');
var config = require('./config').Config;
var port = config.serverPort;
var app = module.exports = express();
var fs = require('fs');

try {
	app.configure(function() {
		app.use(express.cookieParser());
		app.use(express.bodyParser());
		app.use(express.methodOverride());
		app.use(app.router);
	});

	var routes = require('./request-handler').Routes;
	routes.init(app,config);

	config.ACCESS_LOG = __dirname + '/' + (config.accessLog ? config.accessLog : 'access.log');
	config.SERVER_LOG = __dirname + '/' + (config.serverLog ? config.serverLog : 'server.log');
	config.logger = new Logger(config);

	app.listen(port, function() {
		console.log('\n\n******************************************************************************************');
		console.log("Reference JSON server listening on port %d in %s mode", port, app.settings.env);
		console.log("Server Options:");
		console.log("\t JSON Directory:      \t" + __dirname + '/' + config.jsonDir);
		console.log("\t CORS support:        \t" + (config.useCORS ? 'ENABLED' : 'DISABLED'));
		console.log("\t Server Log:          \t" + config.SERVER_LOG);
		console.log("\t Access Log:          \t" + config.ACCESS_LOG);


		if(config.debug) {
			console.log("\t Debugging output is enabled");
		}
		console.log('******************************************************************************************\n\n');

		config.logger.serverLog("Server Started");
	});
} catch(error) {
	console.log("Caught an error: " + error);
	console.log("Configuration: " + JSON.stringify(config));
}


/**
 *	Class that performs logging for us.
 */
function Logger(config) {

	this.config = config;

	//
	// Logs to the server log
	//
	this.serverLog = function(message) {
		logTo(config.SERVER_LOG,' [SERVER]: ' + message, true);
	}

	//
	// Writes to the Access Log (not STDOUT)
	//
	this.accessLog = function(message,logToConsole) {

		if(logToConsole==undefined) {
			logToConsole = false;
		}

		logTo(config.ACCESS_LOG,' [ACCESS]: ' + message,logToConsole);
	}

	//
	// Logs to both STDOUT and the log file
	//
	function logTo(file, message, logToConsole) {
		var fs = require('fs');

		var fullMessage = new Date() + message;

		if(logToConsole) {
			console.log(fullMessage);
		}

		try {		
			var f = fs.open(file, "a", '0666', function(error, fd) {
				if(error) {
					console.log("Error opening log file for writing: '" + file + "'");
				} else {
					fs.writeSync(fd, fullMessage + "\n");
					fs.closeSync(fd);
				}
			});

		} catch (e) {
			console.log("Error writing log file: " + e);
		}
	}
}