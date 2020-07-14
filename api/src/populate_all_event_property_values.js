const snowflake = require('snowflake-sdk');
const fs = require('fs');


// utility function for converting map to object
function mapToObj(inputMap) {
  const obj = {};

  inputMap.forEach((value, key) => {
    obj[key] = value;
  });

  return obj;
}

// utility function for constructing where clauses from 'filter' declarations
function constructWhere(filters) {
  let wherePart = ' ';

  for (let index = 0; index < filters.length; index++) {
    let likeSignRequired = false; // to be used for cases where 'contains' or 'does_not_contain' has been used
    const filter = filters[index];
    // console.log(filter);
    if (!(filter.field && filter.field.length > 0)) {
      throw 'Field specifications missing in filter. Please check JSON input';
    }
    if (index > 0) {
      // add 'and' from second where clause onwards
      wherePart += ' and ';
    }
    wherePart += `${filter.field} `;
    if (!(filter.operator && filter.operator.length > 0)) {
      throw 'Operator specifications missing in filter. Please check JSON input';
    }

    // append operator to query
    switch (filter.operator) {
      case '=':
        wherePart += ' = ';
        break;
      case '>=':
        wherePart += ' >= ';
        break;
      case '<=':
        wherePart += ' <= ';
        break;
      case '!=':
        wherePart += ' != ';
        break;
      case '>':
        wherePart += ' > ';
        break;
      case '<':
        wherePart += ' < ';
        break;
      case 'does_not_contain':
        wherePart += ' not like ';
        likeSignRequired = true;
        break;
      case 'contains':
        wherePart += ' like ';
        likeSignRequired = true;
        break;
      default:
        throw 'Unknown operator value. Please check JSON input';
    }

    if (!(filter.type && filter.type.length > 0)) {
      throw 'Type specifications missing in filter. Please check JSON input';
    }

    if (!(filter.target_value && filter.target_value.length > 0)) {
      throw 'Target Value specifications missing in filter. Please check JSON input';
    }

    // append RHS
    switch (filter.type) {
      case 'string':
        if (likeSignRequired) {
          wherePart += ` '%${filter.target_value}%' `;
        } else {
          wherePart += ` '${filter.target_value}' `;
        }
        break;
      case 'int':
        wherePart += ` ${parseInt(filter.target_value)} `;
        break;
      case 'float':
        wherePart += ` ${parseFloat(filter.target_value)} `;
        break;
      case 'timestamp':
        wherePart += ` cast(${filter.target_value} as timestamp) `;
        break;
    }
  }

  return wherePart;
}

// utility function to open connection
function getConnection(queryInput) {
  // Create a Connection object that we can use later to connect.
  console.log('About to open connection');
  snowflake.configure({ insecureConnect: true });
  const connection = snowflake.createConnection({
    account: queryInput.account,
    username: queryInput.username,
    password: queryInput.password,
  });

  return connection;
}


const queryInput = JSON.parse(fs.readFileSync(process.argv[2]||'populate_all_event_property_values_input.json'));

// extract prefix to be used for all tables
if (
	!(
		queryInput.database
		&& queryInput.schema
		&& queryInput.account
		&& queryInput.password
	)
) {
	throw 'Database/schema/login credentials information missing in input JSON';
}
const prefix = `${queryInput.database}.${queryInput.schema}.`;

const tracksTable = `${prefix}tracks`;

var tracksPath = `./${tracksTable}.json`; // cache file for refresh

var eventList = {};

/*
try {
	if (fs.existsSync(tracksPath)) {
		// file exists, check last modified
		const stats = fs.statSync(tracksPath);
		const hours = Math.abs((Date.now() - stats.mtime.getTime()) / 3600000);
		if (
			queryInput
			&& queryInput.cache_refresh_hours
			&& queryInput.cache_refresh_hours >= hours
		){
			//read event list last generated into JSON object
			eventList = JSON.parse(fs.readFileSync(tracksPath));
		}
	}

} catch (err) {
	console.error(err);
}
*/

//if (Object.keys(eventList).length === 0) { //event list empty either because never created before or because cache is stale
	var tracksConnection = getConnection(queryInput);

	var tracksQuery = `select distinct(event) from ${tracksTable}`;

	// Try to connect to Snowflake, and check whether the connection was successful.
	tracksConnection.connect((err, conn) => {
		if (err) {
			console.error(`Unable to connect: ${err.message}`);
		} else {
			console.log('Successfully connected to Snowflake.');
			// Optional: store the connection ID.
			// res.status(200).send("Connected");
		}
	});

	tracksConnection.execute({
		sqlText: tracksQuery,
		complete(err, stmt, rows) {
			if (err) {
				console.error(`Failed to execute statement due to the following error: ${err.message}`,);
			} else {
				console.log(`Number of rows produced: ${rows.length}`);
				const data = JSON.stringify(rows);
				fs.writeFileSync(tracksPath, data);
				processEventList(rows);
				tracksConnection.destroy();
			}
		},
	});
	
	

//}


function processEventList(eventList){
	//now proceed to query every every event table for list of properties
	for(let event of Object.values(eventList)){

		var eventTableName = prefix + String(Object.values(event)[0]); //entries are in form EVENT : <event name>
		
		//console.log(Object.values(event)[0]);

		//var eventPath = `./${eventTableName}.json`; // cache file
		
		var eventPropertyList = {};

		/*(
		try {
			if (fs.existsSync(eventPath)) {
			// file exists, check last modified
				const stats = fs.statSync(eventPath);
				const hours = Math.abs((Date.now() - stats.mtime.getTime()) / 3600000);
				if (
					queryInput
					&& queryInput.cache_refresh_hours
					&& queryInput.cache_refresh_hours >= hours
				) {
					tablePropertyList = JSON.parse(fs.readFileSync(eventPath));
					processPropertyList(tablePropertyList);
				}
			}
		} catch (err) {
			console.error(err);
		}
		
		
		if(Object.keys(tablePropertyList).length === 0) { //empty list, either never generated or stale cache
		*/
			var eventConnection = getConnection(queryInput);			
			
			var eventQuery = `describe table ${eventTableName}`;

			// Try to connect to Snowflake, and check whether the connection was successful.
			eventConnection.connect((err, conn) => {
				if (err) {
					console.error(`Unable to connect: ${err.message}`);
				} else {
					
					console.log('Successfully connected to Snowflake.');
					// Optional: store the connection ID.
					// res.status(200).send("Connected");
				}
			});
			console.log(eventQuery);
			eventConnection.execute({
				sqlText: eventQuery,
				complete(err, stmt, rows) {
					if (err) {
						console.error(`Failed to execute statement ${eventQuery} due to the following error: ${err.message}`,);
					} else {
						console.log(`Number of rows produced: ${rows.length}`);
						const data = JSON.stringify(rows);
						var eventPath = "./" + eventQuery.split(" ")[2] + ".json"; //due to async nature variable values will get changed 
						fs.writeFileSync(eventPath, data);
						processEventPropertyList(eventTableName, rows);
						eventConnection.destroy();
						
					}
				},
			});
			

		//}
	}
}
		
function processEventPropertyList(tableName, tablePropertyList){	
		//now iterate through every property in the event table
		for(let tableProperty of Object.values(tablePropertyList)) {
			var columnName = String(Object.values(tableProperty)[0]);
			//var propertyPath = `./${tableName}.${columnName}.json`; // cache file
			var propertyValues = {};
			/*
			try {
				if (fs.existsSync(propertyPath)) {
				  // file exists, check last modified
				  const stats = fs.statSync(propertyPath);
				  const hours = Math.abs((Date.now() - stats.mtime.getTime()) / 3600000);
				  if (
					queryInput
					&& queryInput.cache_refresh_hours
					&& queryInput.cache_refresh_hours < hours
				  ) {
					propertyValues = JSON.parse(fs.readFileSync(propertyPath));
				  }
				}
			} catch (err) {
			console.error(err);
			}
			
			if (Object.keys(propertyValues).length === 0) { //never generated or stale
			*/
				var propertyConnection = getConnection(queryInput);

				const propertyQuery = `select distinct(${columnName}) from ${tableName} limit 500 `;

				// Try to connect to Snowflake, and check whether the connection was successful.
				propertyConnection.connect((err, conn) => {
					if (err) {
						console.error(`Unable to connect: ${err.message}`);
					} else {
						console.log('Successfully connected to Snowflake.');
						// Optional: store the connection ID.
						// res.status(200).send("Connected");
					}
				});
				

				propertyConnection.execute({
					sqlText: propertyQuery,
					complete(err, stmt, rows) {
						if (err) {
							console.error(`Failed to execute statement ${propertyQuery} due to the following error: ${err.message}`,);
						} else {
							console.log(propertyQuery);
							console.log(`Number of rows produced: ${rows.length}`);
							var propertyPath = propertyQuery.split(" ")[3]  + "." + propertyQuery.split(" ")[1].split("(")[1].split(")")[0] + ".json"; //async, variable lost
							console.log(propertyPath);
							const data = JSON.stringify(rows);
							fs.writeFileSync(propertyPath, data);
							propertyConnection.destroy();

						}
					},
				});
			
			//}
			
		}
}
