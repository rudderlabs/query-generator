# RudderStack Query Generator

This repository contains two major tools that allow you to generate SQL queries on top of your warehouse data populated by [Rudderstack](https://rudderstack.com).

These are:
 - A **Node.js Server** for generating information retrieval queries based on the user-specified conditions
 - A standalone **Node.js program** for prepopulating the list of events and other associated properties

**Note**: We have tested these tools for Redshift and Snowflake. However, the generated queries should work on all the other data warehouses as well. Please [contact us](https://rudderstack.com/contact/) in case you come across any issues while using the RudderStack Query Generator for other data warehouses.

## Node.js Server for Information Retrieval

This tool allows you to retrieve the list of RudderStack events and their associated properties present in the data warehouse, and use them to automatically generate an information retrieval query based on the filters set by you. These queries can then be run on your data warehouse to obtain the data that can be used for further analytics and insight generation.

### How to Start the Server

You can start the Node.js server after cloning this repository and issuing following command from the local repository root:

```
cd api; npm start
```

All the sample input JSON files are placed under `api/data`.

### Features

The server accepts `POST` requests and supports following endpoints:

* `getevents` - This retrieves list of RudderStack events for which the data is present in the warehouse. The input for the query needs to be specified in the format outlined in the `api/data/get_events_input.json` file, and passed in the request body.
	
* `geteventproperties` - This contains the list of properties associated with each event from the list above. The input for the query needs to be specified in the format outlined in the `api/data/get_event_properties_input.json` file, and passed in the request body.
	
* `geteventpropertyvalues` - This contains up to 500 distinct values for each of the properties of each of the events from the list mentioned above. The input for the query needs to be specified in the format outlined in the `api/data/get_event_property_values_input.json` file, and passed in the request body.
	
* `getquery` - Allows you to generate event information retrieval query given the filters and *group by* clauses. The input for the query needs to be specified in the format outlined in the `api/data/event_segmentation_query_gen_input.json` file, and passed in the request body.

**Note**: For each of the above cases, the command to retrieve the information would look like the following:

`curl -X POST -G "Content-Type: application/json" --data-binary @<input JSON file path> http://localhost:3001/<endpoint>`

## Standalone Node.js Program for Pre-populating Information

This program can be used to pre-populate the list of events, their properties and list of values for those properties that have up to 500 distinct values. 

There are two variants to this program:

* `populate_all_event_property_values.js` - This works on Snowflake. You can update the connection details in `populate_all_event_property_values_input.json`
	
* `redshift_populate_all_event_property_values.js` - This works on Redshift. You can update the connection information in `redshift_populate_all_event_property_values_input.json`. Remember to append `PGUSER=... PGPASSWORD=...` at the command line before `node redshift_populate_all_event_property_values.js`.
