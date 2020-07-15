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



const queryInput = JSON.parse(fs.readFileSync(process.argv[2]||'redshift_populate_all_event_property_values_input.json'));

const prefix = `${queryInput.database}.${queryInput.schema}.`;

const tracksTable = `${prefix}tracks`;

var tracksPath = `./${tracksTable}.json`; // cache file for refresh

var eventList = {};


//if (Object.keys(eventList).length === 0) { //event list empty either because never created before or because cache is stale
	var tracksConnection = require("./redshift.js");
	
	
	var tracksQuery = `select distinct(event) from ${tracksTable}`;

	tracksConnection.query(tracksQuery, {raw: true}, (err, rows) => {
		if (err) {
			console.error(`Failed to execute statement due to the following error: ${err.message}`,);
		} else {
			console.log(`Number of rows produced: ${rows.length}`);
			const data = JSON.stringify(rows);
			fs.writeFileSync(tracksPath, data);
			processEventList(rows);
			//console.log(data);
			tracksConnection.close();
		}
	});
	


function processEventList(eventList){

	//now proceed to query every every event table for list of properties
	for(let event of Object.values(eventList)){

		var eventTableName = String(Object.values(event)); //entries are in form EVENT : <event name>
		
		
		var eventPropertyList = {};

		var eventConnection = require("./redshift.js");
		
		var eventQuery = `set search_path = ${queryInput.schema}; select "column" from PG_TABLE_DEF where schemaname = '${queryInput.schema}' and tablename = '${eventTableName}'`;

		console.log(eventQuery);
		eventConnection.query(eventQuery, {raw: true}, (err, rows) => {
			if (err) {
				console.error(`Failed to execute statement ${eventQuery} due to the following error: ${err.message}`,);
			} else {
				console.log(`Number of rows produced: ${rows.length}`);
				const data = JSON.stringify(rows);
				var eventPath = `${queryInput.database}.${queryInput.schema}.${eventTableName}.json`; //due to async nature variable values will get changed 
				fs.writeFileSync(eventPath, data);
				console.log(data);
				//processEventPropertyList(eventTableName, rows);
				eventConnection.close();
				
			}
		});
	}
}
		
function processEventPropertyList(tableName, tablePropertyList){	


	//now iterate through every property in the event table
	for(let tableProperty of Object.values(tablePropertyList)) {
		var columnName = String(Object.values(tableProperty));
		var propertyValues = {};
		var propertyConnection = require("./redshift.js");

		const propertyQuery = `select distinct('${columnName}') from ${tableName} limit 500 `;


		propertyConnection.query(propertyQuery, {raw: true}, (err,rows) => {
			if (err) {
				console.error(`Failed to execute statement ${propertyQuery} due to the following error: ${err.message}`,);
			} else {
				console.log(propertyQuery);
				console.log(`Number of rows produced: ${rows.length}`);
				var propertyPath = `${queryInput.database}.${queryInput.schema}.${tableName}.${columnName}.json`; //async, variable lost
				console.log(propertyPath);
				const data = JSON.stringify(rows);
				fs.writeFileSync(propertyPath, data);
				propertyConnection.close();

			}
		});
		
	}
}
