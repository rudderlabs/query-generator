# query-generator

This repository consists of tools that help in generating analytic queries on top of data warehouse populated by [Rudderstack](https://rudderstack.com) data.

There are two main tools

## Node.js Server for Information Retrieval

It accepts `POST` requests and supports following endpoints

* `getevents` - retrieves list of Rudder events for which data is present in the warehouse. Input for the query needs to be specified in the format outlined in `api/data/get_events_input.json` file and passed in the request body 
	
* `geteventproperties` - list of properties associated with each event from the list above. Input for the query needs to be specified in the format outlined in `api/data/get_event_properties_input.json` file and passed in the request body   
	
* `geteventpropertyvalues` - up to 500 distinct values for each of the properties of each of the events from the list mentioned above. Input for the query needs to be specified in the format outlined in `api/data/get_event_property_values_input.json` file and passed in the request body   
	
* `getquery` - generate event information retrieval query given the "filters" and "group by" clauses.Input for the query needs to be specified in the format outlined in `api/data/event_segmentation_query_gen_input.json` file and passed in the request body


The server can be started after cloning this repository and issuing following commands from the local repository root

```
cd api; npm start
```

All the sample input JSON files are under `api/data`

For each of the above cases a command to retrieve the information would look like `curl -X POST -G "Content-Type: application/json" --data-binary @<input JSON file path> http://localhost:3001/<endpoint>`

## Standalone Node.js Program for Information Prepopulation

This program can be used to pre-populate the list of events, their properties and list of values for those properties that have up to 500 distinct values. There are two variants to this program

* `populate_all_event_property_values.js` - works on Snowflake. Update connection details in 
 `populate_all_event_property_values_input.json`
	
* `redshift_populate_all_event_property_values.js` - works on Redshift. Update connection information in `redshift_populate_all_event_property_values_input.json`. Remember to append `PGUSER=... PGPASSWORD=...` at the command line before `node redshift_populate_all_event_property_values.js`
