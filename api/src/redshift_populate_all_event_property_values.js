const fs = require('fs');

const queryInput = JSON.parse(fs.readFileSync(process.argv[2]||'redshift_populate_all_event_property_values_input.json'));

const prefix = queryInput.database + "." + queryInput.schema + ".";

const tracksTable = prefix + "tracks";

var tracksPath = "./" + tracksTable + ".json"; // cache file for refresh

var eventList = {};


var tracksConnection = require("./redshift.js");


var tracksQuery = "select distinct(event) from " + tracksTable;


tracksConnection.query(tracksQuery, {raw: true})
.then(function(rows){
	//console.log(`Number of rows produced: ${rows.length}`);
	var data = JSON.stringify(rows);
	fs.writeFileSync(tracksPath, data);
	processEventList(rows);
	//console.log(data);

})
.catch(function(err){
	console.error("Failed to execute statement due to the following error: " + err.message);

});

function processEventList(eventList){

	//now proceed to query every every event table for list of properties
	eventList.forEach(function(event,index){
		
		var data = {};

		var eventTableName = String(Object.values(event)); //entries are in form EVENT : <event name>
		
		
		var eventPropertyList = {};
		
		var eventQuery = "set search_path = " + queryInput.schema + "; select \"column\" from PG_TABLE_DEF where schemaname = '"  + queryInput.schema + "' and tablename = '" + eventTableName + "'";
		
		var eventConnection = require("./redshift.js");


		/*
		eventConnection.connect(function(connectError){
			if(connectError) {
				console.error(`Failed to connect to Redshift: ${connectError.message}`,);
			}else{
			}
		});
		*/

		eventConnection.query(eventQuery, {raw: true})
		.then(function(rows){
			//console.log(`Number of rows produced: ${rows.length}`);
			data = JSON.stringify(rows);
			//console.log(data);
			var eventPath = queryInput.database + "." + queryInput.schema + "." + eventTableName + ".json"; //due to async nature variable values will get changed 
			fs.writeFileSync(eventPath, data);
			processEventPropertyList(eventTableName, rows);

		})
		.catch(function(err){
			console.error("Failed to execute statement " + eventQuery + " due to the following error: " + err.message);
		});

	});
}
		
function processEventPropertyList(tableName, tablePropertyList){	


	//now iterate through every property in the event table
	tablePropertyList.forEach(function(tableProperty,index) {
		var columnName = String(Object.values(tableProperty));
		var propertyValues = {};
		var data = {};


		var propertyConnection1 = require("./redshift.js");
		

		var distinctValCountQuery = "set search_path = " + queryInput.schema + "; select count(distinct(" + columnName + ")) from (select " + columnName + " from " + tableName + " limit 100000)";
		//console.log("Distinct Query : " + tableName + "." + columnName);

		propertyConnection1.query(distinctValCountQuery, {raw: true})
		.then(function(rows1){
			//console.log(rows1[0].count);
			if(rows1[0].count <= 500){ //only prepopulate for columns with 500 or less distinct values out of 100000

				var propertyConnection2 = require("./redshift.js");

				var propertyQuery = "set search_path = " + queryInput.schema + "; select distinct(" + columnName+ ") from " + tableName + " limit 500 ";

				propertyConnection2.query(propertyQuery, {raw: true})
				.then(function(rows2){
					//console.log("Retrieval Query : " + tableName + "." + columnName);		
					data = JSON.stringify(rows2);
					var propertyPath = queryInput.database + "." + queryInput.schema + "." + tableName + "." + columnName + ".json"; //async, variable lost
					fs.writeFileSync(propertyPath, data);
					console.log(propertyQuery);
					console.log(propertyPath);

				})
				.catch(function(err2){
					console.error("Failed to execute statement " + propertyQuery + " due to the following error: " + err2.message);
				});
			}
		})
		.catch(function(err1){
			console.error("Failed to execute statement " + distinctValCountQuery + " due to the following error: " + err1.message);
		});
	});
}
