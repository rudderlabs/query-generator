//redshift.js
const fs = require('fs');

var Redshift = require('node-redshift');

const queryInput = JSON.parse(fs.readFileSync(process.argv[2]||'redshift_populate_all_event_property_values_input.json'));

// extract prefix to be used for all tables
if (
	!(
		queryInput.database
		&& queryInput.schema
		&& queryInput.username
		&& queryInput.password
		&& queryInput.host
		&& queryInput.port
	)
) {
	throw 'Database/schema/host/port/login credentials information missing in input JSON';
}
/*
var client = {
  user: user,
  database: database,
  password: password,
  port: port,
  host: host,
};
*/

var client = {
	user: queryInput.user,
	database: queryInput.database,
	password: queryInput.password,
	port: queryInput.port,
	host: queryInput.host,
};


// The values passed in to the options object will be the difference between a connection pool and raw connection
var redshiftClient = new Redshift(client, {rawConnection: false});

module.exports = redshiftClient;