const fs = require('fs');
const express = require('express');
const cors = require('cors')
const bodyParser = require('body-parser');
const snowflake = require('snowflake-sdk');

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

// check if file name has been specified
/*
if (process.argv.length < 3){
    console.log("Usage: node event_segmentation_sql_generator.js <query input json file name>");
    return;
}
*/

const port = process.env.PORT || 3001;

const app = express();

app.use(bodyParser.json({ type: 'application/json' }));

app.use(cors())

app.get('/', (req, res) => {
  res.status(404).send('GET Not Supported');
});

app.post('/', (req, res) => {
  res
    .status(404)
    .send(
      'Please use one of endpoints - /getquery, /getevents, /geteventproperties, /geteventpropertyvalues',
    );
});

app.post('/getquery', (req, res) => {
  // parse query input
  try {
    /*
		var rawdata = JSON.parse(req.body);//fs.readFileSync(process.argv[2]);
		var queryInput = JSON.parse(rawdata);
		*/

    var queryInput = req.body;
  } catch (error) {
    console.log(`Error parsing query input JSON\n${error}`);
  }

  // extract prefix to be used for all tables
  if (!(queryInput.database && queryInput.schema)) {
    throw 'Database or schema information missing in input JSON';
  }
  const prefix = `${queryInput.database}.${queryInput.schema}.`;

  const usersTable = `${prefix}users`;

  // construct the user_id query portion. It will be common to all event retrieval subqueries

  if (queryInput.user_filter && queryInput.user_filter.length > 0) {
    var userQuery = `select id from ${usersTable} where `;

    try {
      userQuery += ` ${constructWhere(queryInput.user_filter)}`;
    } catch (error) {
      console.log(error);
    }
  }

  let aliasList = ''; // list of table aliases for final select query
  const queryMap = new Map();
  if (queryInput.events && queryInput.events.length > 0) {
    var eventQuery = 'with '; // start with derived tables

    for (let index = 0; index < queryInput.events.length; index++) {
      const tableAlias = `table_${index}`; // alias for derived table

      // add alias to list for final select
      if (index > 0) {
        aliasList += ' , ';
      }

      aliasList += tableAlias;

      if (
        !(
          queryInput.events[index].name
          && queryInput.events[index].name.length > 0
        )
      ) {
        throw 'Event name missing. Please check input JSON';
      }
      const eventTable = prefix + queryInput.events[index].name; // construct event table name

      if (index > 0) {
        eventQuery += ' , '; // add comma from second derived table onwards
      }

      // there will always be group by time field
      let groupByClause = ' group by sent_at ';

      eventQuery += `${tableAlias} as ( `;
      let singleQuery = 'select count(*) as event_count, cast(sent_at as timestamp) as sent_at ';
      // add the group by columns in select and also construct the group by clause
      if (
        queryInput.events[index].group_by
        && queryInput.events[index].group_by.length > 0
      ) {
        for (
          let groupByIndex = 0;
          groupByIndex < queryInput.events[index].group_by.length;
          groupByIndex++
        ) {
          singleQuery
            += ` , ${queryInput.events[index].group_by[groupByIndex]}`;
          groupByClause
            += ` , ${queryInput.events[index].group_by[groupByIndex]}`;
        }
      }

      singleQuery += ` from ${eventTable} `;

      // add where if supplied
      if (
        queryInput.events[index].filters
        && queryInput.events[index].filters.length > 0
      ) {
        singleQuery
          += ` where ${constructWhere(queryInput.events[index].filters)}`;
      }

      // add user filter if specified
      if (userQuery && userQuery.length > 0) {
        singleQuery += ` and user_id in ( ${userQuery} ) `;
      }

      // add group_by if supplied
      if (groupByClause) {
        singleQuery += ` ${groupByClause} `;
      }

      // add to query map
      queryMap.set(tableAlias, singleQuery);

      eventQuery += ` ${singleQuery} ) `;
    }
  }

  // collate
  eventQuery += ` select * from ${aliasList}`;

  // console.log(userQuery);

  // console.log(eventQuery);
  /*
	for (let [key, value] of queryMap) {
		console.log(key + ' = ' + value)
	}
	*/

  res.json(mapToObj(queryMap));
});

// get all events
app.post('/getevents', (req, res) => {
  const queryInput = req.body;
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

  const path = `./${tracksTable}.json`; // cache file for refresh

  try {
    if (fs.existsSync(path)) {
      // file exists, check last modified
      const stats = fs.statSync(path);
      const hours = Math.abs((Date.now() - stats.mtime.getTime()) / 3600000);
      if (
        queryInput
        && queryInput.cache_refresh_hours
        && queryInput.cache_refresh_hours >= hours
      ) {
        const data = fs.readFileSync(path);
        res.status(200).send(data.toString());
        return;
      }
    }
  } catch (err) {
    console.error(err);
  }

  const connection = getConnection(queryInput);

  const query = `select distinct(event) from ${tracksTable}`;

  // Try to connect to Snowflake, and check whether the connection was successful.
  connection.connect((err, conn) => {
    if (err) {
      console.error(`Unable to connect: ${err.message}`);
      res.status(500).send('Unable to connect to database');
    } else {
      console.log('Successfully connected to Snowflake.');
      // Optional: store the connection ID.
      // res.status(200).send("Connected");
    }
  });

  connection.execute({
    sqlText: query,
    complete(err, stmt, rows) {
      if (err) {
        console.error(
          `Failed to execute statement due to the following error: ${
            err.message}`,
        );
        res.status(500).send(`Failed to execute query${err.message}`);
      } else {
        console.log(`Number of rows produced: ${rows.length}`);
        const data = JSON.stringify(rows);
        fs.writeFileSync(path, data);
        res.status(200).send(data);
      }
    },
  });
});

// get all properties for an event
app.post('/geteventproperties', (req, res) => {
  const queryInput = req.body;

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

  const tableName = prefix + queryInput.event;

  const path = `./${tableName}.json`; // cache file

  try {
    if (fs.existsSync(path)) {
      // file exists, check last modified
      const stats = fs.statSync(path);
      const hours = Math.abs((Date.now() - stats.mtime.getTime()) / 3600000);
      if (
        queryInput
        && queryInput.cache_refresh_hours
        && queryInput.cache_refresh_hours >= hours
      ) {
        const data = fs.readFileSync(path);
        res.status(200).send(data.toString());
        return;
      }
    }
  } catch (err) {
    console.error(err);
  }

  const connection = getConnection(queryInput);

  const query = `describe table ${tableName}`;

  // Try to connect to Snowflake, and check whether the connection was successful.
  connection.connect((err, conn) => {
    if (err) {
      console.error(`Unable to connect: ${err.message}`);
      res.status(500).send('Unable to connect to database');
    } else {
      console.log('Successfully connected to Snowflake.');
      // Optional: store the connection ID.
      // res.status(200).send("Connected");
    }
  });

  connection.execute({
    sqlText: query,
    complete(err, stmt, rows) {
      if (err) {
        console.error(
          `Failed to execute statement due to the following error: ${
            err.message}`,
        );
        res.status(500).send(`Failed to execute query${err.message}`);
      } else {
        console.log(`Number of rows produced: ${rows.length}`);
        const data = JSON.stringify(rows);
        fs.writeFileSync(path, data);
        res.status(200).send(data);
        // res.status(200).send(JSON.stringify(rows));
      }
    },
  });
});

// get all values for an event property
app.post('/geteventpropertyvalues', (req, res) => {
  const queryInput = req.body;

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

  const tableName = prefix + queryInput.event;

  const columnName = queryInput.property;

  const path = `./${tableName}.${columnName}.json`; // cache file

  try {
    if (fs.existsSync(path)) {
      // file exists, check last modified
      const stats = fs.statSync(path);
      const hours = Math.abs((Date.now() - stats.mtime.getTime()) / 3600000);
      if (
        queryInput
        && queryInput.cache_refresh_hours
        && queryInput.cache_refresh_hours >= hours
      ) {
        const data = fs.readFileSync(path);
        res.status(200).send(data.toString());
        return;
      }
    }
  } catch (err) {
    console.error(err);
  }

  const connection = getConnection(queryInput);

  const query = `select distinct(${columnName}) from ${tableName} limit 100 `;

  // Try to connect to Snowflake, and check whether the connection was successful.
  connection.connect((err, conn) => {
    if (err) {
      console.error(`Unable to connect: ${err.message}`);
      res.status(500).send('Unable to connect to database');
    } else {
      console.log('Successfully connected to Snowflake.');
      // Optional: store the connection ID.
      // res.status(200).send("Connected");
    }
  });

  connection.execute({
    sqlText: query,
    complete(err, stmt, rows) {
      if (err) {
        console.error(
          `Failed to execute statement due to the following error: ${
            err.message}`,
        );
        res.status(500).send(`Failed to execute query${err.message}`);
      } else {
        console.log(`Number of rows produced: ${rows.length}`);
        const data = JSON.stringify(rows);
        fs.writeFileSync(path, data);
        res.status(200).send(data);

        // res.status(200).send(JSON.stringify(rows));
      }
    },
  });
});

app.listen(port, () => {
  console.log('Server listening on port ', port);
});
