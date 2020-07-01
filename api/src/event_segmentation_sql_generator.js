"use strict";

const fs = require("fs");
const express = require("express");
const bodyParser = require("body-parser");
const snowflake = require("snowflake-sdk");

//utility function for converting map to object
function mapToObj(inputMap) {
  let obj = {};

  inputMap.forEach(function (value, key) {
    obj[key] = value;
  });

  return obj;
}

//utility function for constructing where clauses from 'filter' declarations
function constructWhere(filters) {
  var wherePart = " ";

  for (var index = 0; index < filters.length; index++) {
    var likeSignRequired = false; //to be used for cases where 'contains' or 'does_not_contain' has been used
    var filter = filters[index];
    //console.log(filter);
    if (!(filter.field && filter.field.length > 0)) {
      throw "Field specifications missing in filter. Please check JSON input";
    }
    if (index > 0) {
      //add 'and' from second where clause onwards
      wherePart += " and ";
    }
    wherePart += filter.field + " ";
    if (!(filter.operator && filter.operator.length > 0)) {
      throw "Operator specifications missing in filter. Please check JSON input";
    }

    //append operator to query
    switch (filter.operator) {
      case "=":
        wherePart += " = ";
        break;
      case ">=":
        wherePart += " >= ";
        break;
      case "<=":
        wherePart += " <= ";
        break;
      case "!=":
        wherePart += " != ";
        break;
      case ">":
        wherePart += " > ";
        break;
      case "<":
        wherePart += " < ";
        break;
      case "does_not_contain":
        wherePart += " not like ";
        likeSignRequired = true;
        break;
      case "contains":
        wherePart += " like ";
        likeSignRequired = true;
        break;
      default:
        throw "Unknown operator value. Please check JSON input";
    }

    if (!(filter.type && filter.type.length > 0)) {
      throw "Type specifications missing in filter. Please check JSON input";
    }

    if (!(filter.target_value && filter.target_value.length > 0)) {
      throw "Target Value specifications missing in filter. Please check JSON input";
    }

    //append RHS
    switch (filter.type) {
      case "string":
        if (likeSignRequired) {
          wherePart += " '%" + filter.target_value + "%' ";
        } else {
          wherePart += " '" + filter.target_value + "' ";
        }
        break;
      case "int":
        wherePart += " " + parseInt(filter.target_value) + " ";
        break;
      case "float":
        wherePart += " " + parseFloat(filter.target_value) + " ";
        break;
      case "timestamp":
        wherePart += " cast(" + filter.target_value + " as timestamp) ";
        break;
    }
  }

  return wherePart;
}

//utility function to open connection
function getConnection(queryInput) {
  // Create a Connection object that we can use later to connect.
  console.log("About to open connection");
  snowflake.configure({ insecureConnect: true });
  var connection = snowflake.createConnection({
    account: queryInput.account,
    username: queryInput.username,
    password: queryInput.password,
  });

  return connection;
}

//check if file name has been specified
/*
if (process.argv.length < 3){
    console.log("Usage: node event_segmentation_sql_generator.js <query input json file name>");
    return;
}
*/

var port = process.env.PORT || 3000;

var app = express();

app.use(bodyParser.json({ type: "application/json" }));

app.get("/", function (req, res) {
  res.status(404).send("GET Not Supported");
});

app.post("/", function (req, res) {
  res
    .status(404)
    .send(
      "Please use one of endpoints - /getquery, /getevents, /geteventproperties, /geteventpropertyvalues"
    );
});

app.post("/getquery", function (req, res) {
  //parse query input
  try {
    /*
		var rawdata = JSON.parse(req.body);//fs.readFileSync(process.argv[2]);
		var queryInput = JSON.parse(rawdata);
		*/

    var queryInput = req.body;
  } catch (error) {
    console.log("Error parsing query input JSON\n" + error);
  }

  //extract prefix to be used for all tables
  if (!(queryInput.database && queryInput.schema)) {
    throw "Database or schema information missing in input JSON";
  }
  var prefix = queryInput.database + "." + queryInput.schema + ".";

  var usersTable = prefix + "users";

  //construct the user_id query portion. It will be common to all event retrieval subqueries

  if (queryInput.user_filter && queryInput.user_filter.length > 0) {
    var userQuery = "select id from " + usersTable + " where ";

    try {
      userQuery += " " + constructWhere(queryInput.user_filter);
    } catch (error) {
      console.log(error);
    }
  }

  var aliasList = ""; //list of table aliases for final select query
  var queryMap = new Map();
  if (queryInput.events && queryInput.events.length > 0) {
    var eventQuery = "with "; //start with derived tables

    for (var index = 0; index < queryInput.events.length; index++) {
      var tableAlias = "table_" + index; //alias for derived table

      //add alias to list for final select
      if (index > 0) {
        aliasList += " , ";
      }

      aliasList += tableAlias;

      if (
        !(
          queryInput.events[index].name &&
          queryInput.events[index].name.length > 0
        )
      ) {
        throw "Event name missing. Please check input JSON";
      }
      var eventTable = prefix + queryInput.events[index].name; //construct event table name

      if (index > 0) {
        eventQuery += " , "; //add comma from second derived table onwards
      }

      //there will always be group by time field
      var groupByClause = " group by sent_at ";

      eventQuery += tableAlias + " as ( ";
      var singleQuery =
        "select count(*) as event_count, cast(sent_at as timestamp) as sent_at ";
      //add the group by columns in select and also construct the group by clause
      if (
        queryInput.events[index].group_by &&
        queryInput.events[index].group_by.length > 0
      ) {
        for (
          var groupByIndex = 0;
          groupByIndex < queryInput.events[index].group_by.length;
          groupByIndex++
        ) {
          singleQuery +=
            " , " + queryInput.events[index].group_by[groupByIndex];
          groupByClause +=
            " , " + queryInput.events[index].group_by[groupByIndex];
        }
      }

      singleQuery += " from " + eventTable + " ";

      //add where if supplied
      if (
        queryInput.events[index].filters &&
        queryInput.events[index].filters.length > 0
      ) {
        singleQuery +=
          " where " + constructWhere(queryInput.events[index].filters);
      }

      //add user filter if specified
      if (userQuery && userQuery.length > 0) {
        singleQuery += " and user_id in ( " + userQuery + " ) ";
      }

      //add group_by if supplied
      if (groupByClause) {
        singleQuery += " " + groupByClause + " ";
      }

      //add to query map
      queryMap.set(tableAlias, singleQuery);

      eventQuery += " " + singleQuery + " ) ";
    }
  }

  //collate
  eventQuery += " select * from " + aliasList;

  //console.log(userQuery);

  //console.log(eventQuery);
  /*
	for (let [key, value] of queryMap) {
		console.log(key + ' = ' + value)
	}
	*/

  res.json(mapToObj(queryMap));
});

//get all events
app.post("/getevents", function (req, res) {
  var queryInput = req.body;
  //extract prefix to be used for all tables
  if (
    !(
      queryInput.database &&
      queryInput.schema &&
      queryInput.account &&
      queryInput.password
    )
  ) {
    throw "Database/schema/login credentials information missing in input JSON";
  }
  var prefix = queryInput.database + "." + queryInput.schema + ".";

  var tracksTable = prefix + "tracks";

  var path = "./" + tracksTable + ".json"; //cache file for refresh

  try {
    if (fs.existsSync(path)) {
      //file exists, check last modified
      var stats = fs.statSync(path);
      var hours = Math.abs((Date.now() - stats.mtime.getTime()) / 3600000);
      if (
        queryInput &&
        queryInput.cache_refresh_hours &&
        queryInput.cache_refresh_hours >= hours
      ) {
        var data = fs.readFileSync(path);
        res.status(200).send(data.toString());
        return;
      }
    }
  } catch (err) {
    console.error(err);
  }

  var connection = getConnection(queryInput);

  var query = "select distinct(event) from " + tracksTable;

  // Try to connect to Snowflake, and check whether the connection was successful.
  connection.connect(function (err, conn) {
    if (err) {
      console.error("Unable to connect: " + err.message);
      res.status(500).send("Unable to connect to database");
    } else {
      console.log("Successfully connected to Snowflake.");
      // Optional: store the connection ID.
      //res.status(200).send("Connected");
    }
  });

  connection.execute({
    sqlText: query,
    complete: function (err, stmt, rows) {
      if (err) {
        console.error(
          "Failed to execute statement due to the following error: " +
            err.message
        );
        res.status(500).send("Failed to execute query" + err.message);
      } else {
        console.log("Number of rows produced: " + rows.length);
        var data = JSON.stringify(rows);
        fs.writeFileSync(path, data);
        res.status(200).send(data);
      }
    },
  });
});

//get all properties for an event
app.post("/geteventproperties", function (req, res) {
  var queryInput = req.body;

  //extract prefix to be used for all tables
  if (
    !(
      queryInput.database &&
      queryInput.schema &&
      queryInput.account &&
      queryInput.password
    )
  ) {
    throw "Database/schema/login credentials information missing in input JSON";
  }
  var prefix = queryInput.database + "." + queryInput.schema + ".";

  var tableName = prefix + queryInput.event;

  var path = "./" + tableName + ".json"; //cache file

  try {
    if (fs.existsSync(path)) {
      //file exists, check last modified
      var stats = fs.statSync(path);
      var hours = Math.abs((Date.now() - stats.mtime.getTime()) / 3600000);
      if (
        queryInput &&
        queryInput.cache_refresh_hours &&
        queryInput.cache_refresh_hours >= hours
      ) {
        var data = fs.readFileSync(path);
        res.status(200).send(data.toString());
        return;
      }
    }
  } catch (err) {
    console.error(err);
  }

  var connection = getConnection(queryInput);

  var query = "describe table " + tableName;

  // Try to connect to Snowflake, and check whether the connection was successful.
  connection.connect(function (err, conn) {
    if (err) {
      console.error("Unable to connect: " + err.message);
      res.status(500).send("Unable to connect to database");
    } else {
      console.log("Successfully connected to Snowflake.");
      // Optional: store the connection ID.
      //res.status(200).send("Connected");
    }
  });

  connection.execute({
    sqlText: query,
    complete: function (err, stmt, rows) {
      if (err) {
        console.error(
          "Failed to execute statement due to the following error: " +
            err.message
        );
        res.status(500).send("Failed to execute query" + err.message);
      } else {
        console.log("Number of rows produced: " + rows.length);
        var data = JSON.stringify(rows);
        fs.writeFileSync(path, data);
        res.status(200).send(data);
        //res.status(200).send(JSON.stringify(rows));
      }
    },
  });
});

//get all values for an event property
app.post("/geteventpropertyvalues", function (req, res) {
  var queryInput = req.body;

  //extract prefix to be used for all tables
  if (
    !(
      queryInput.database &&
      queryInput.schema &&
      queryInput.account &&
      queryInput.password
    )
  ) {
    throw "Database/schema/login credentials information missing in input JSON";
  }
  var prefix = queryInput.database + "." + queryInput.schema + ".";

  var tableName = prefix + queryInput.event;

  var columnName = queryInput.property;

  var path = "./" + tableName + "." + columnName + ".json"; //cache file

  try {
    if (fs.existsSync(path)) {
      //file exists, check last modified
      var stats = fs.statSync(path);
      var hours = Math.abs((Date.now() - stats.mtime.getTime()) / 3600000);
      if (
        queryInput &&
        queryInput.cache_refresh_hours &&
        queryInput.cache_refresh_hours >= hours
      ) {
        var data = fs.readFileSync(path);
        res.status(200).send(data.toString());
        return;
      }
    }
  } catch (err) {
    console.error(err);
  }

  var connection = getConnection(queryInput);

  var query =
    "select distinct(" + columnName + ") from " + tableName + " limit 100 ";

  // Try to connect to Snowflake, and check whether the connection was successful.
  connection.connect(function (err, conn) {
    if (err) {
      console.error("Unable to connect: " + err.message);
      res.status(500).send("Unable to connect to database");
    } else {
      console.log("Successfully connected to Snowflake.");
      // Optional: store the connection ID.
      //res.status(200).send("Connected");
    }
  });

  connection.execute({
    sqlText: query,
    complete: function (err, stmt, rows) {
      if (err) {
        console.error(
          "Failed to execute statement due to the following error: " +
            err.message
        );
        res.status(500).send("Failed to execute query" + err.message);
      } else {
        console.log("Number of rows produced: " + rows.length);
        var data = JSON.stringify(rows);
        fs.writeFileSync(path, data);
        res.status(200).send(data);

        //res.status(200).send(JSON.stringify(rows));
      }
    },
  });
});

app.listen(port, function () {
  console.log("Server listening on port ", port);
});
