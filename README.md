# RudderStack Query Generator

This repository contains two major tools that allow you to generate SQL queries on top of your warehouse data populated by [Rudderstack](https://rudderstack.com).

These are:
 - A **Node.js Server** for generating information retrieval queries based on the user-specified conditions
 - A standalone **Node.js program** for prepopulating the list of events and other associated properties

**✓ We have tested the RudderStack Query Generator for Redshift and Snowflake. It is also fully compatible with the Segment data to the best of our knowledge.**

**⚠️The generated queries should also work on all the other data warehouses. Please [contact us](https://rudderstack.com/contact/) in case you come across any issues while using the RudderStack Query Generator for other data warehouses.**

## ⚡️ Node.js Server for Information Retrieval

This tool allows you to retrieve the list of RudderStack events and their associated properties present in the data warehouse, and use them to automatically generate an information retrieval query based on the filters set by you. These queries can then be run on your data warehouse to obtain the data that can be used for further analytics and insight generation.

### 💻 How to Start the Server

You can start the Node.js server after cloning this repository and issuing following command from the local repository root:

```
cd api; npm start
```

⚠️ All the sample input JSON files are placed under `api/data`.

### 👌 Features

The server accepts `POST` requests and supports following endpoints:

* `getevents` - This retrieves list of RudderStack events for which the data is present in the warehouse. The input for the query needs to be specified in the format outlined in the `api/data/get_events_input.json` file, and passed in the request body.
	
* `geteventproperties` - This contains the list of properties associated with each event from the list above. The input for the query needs to be specified in the format outlined in the `api/data/get_event_properties_input.json` file, and passed in the request body.
	
* `geteventpropertyvalues` - This contains up to 500 distinct values for each of the properties of each of the events from the list mentioned above. The input for the query needs to be specified in the format outlined in the `api/data/get_event_property_values_input.json` file, and passed in the request body.
	
* `getquery` - Allows you to generate event information retrieval query given the filters and *group by* clauses. The input for the query needs to be specified in the format outlined in the `api/data/event_segmentation_query_gen_input.json` file, and passed in the request body.

⚠️ For each of the above cases, the command to retrieve the information would look like the following:

`curl -X POST -G "Content-Type: application/json" --data-binary @<input JSON file path> http://localhost:3001/<endpoint>`

## ⚡️ Standalone Node.js Program for Pre-populating Information

This program can be used to pre-populate the list of events, their properties and list of values for those properties that have up to 500 distinct values. 

There are two variants to this program:

* `populate_all_event_property_values.js` - This works on Snowflake. You can update the connection details in `populate_all_event_property_values_input.json`
	
* `redshift_populate_all_event_property_values.js` - This works on Redshift. You can update the connection information in `redshift_populate_all_event_property_values_input.json`. Remember to append `PGUSER=... PGPASSWORD=...` at the command line before `node redshift_populate_all_event_property_values.js`.

## ⚡️ Complementary Interface for the RudderStack Query Generator

This interface was bootstrapped with [Craco](https://github.com/gsoft-inc/craco).

### ⚡️ How to Use

First, install the necessary dependencies for the app by running the `npm i` command:

![Step 1](https://user-images.githubusercontent.com/59817155/90634896-15d39f80-e246-11ea-836f-c9e6d2df9782.PNG)

Then, run the following command:

`REACT_APP_QUERY_GEN_BACKEND_URL=<SERVER_URL> REACT_APP_WH=<SNOWFLAKE/REDSHIFT> REACT_APP_DATABASE=<WAREHOUSE_DB_NAME>  REACT_APP_SCHEMA=<WAREHOUSE_SCHEMA_NAME> REACT_APP_ACCOUNT=<WAREHOUSE_ACCOUNT_URL> REACT_APP_USERNAME=<WAREHOUSE_ACCOUNT_NAME> REACT_APP_PASSWORD=<WAREHOUSE_ACCOUNT_PASSWORD> REACT_APP_CACHE_REFRESH_HOURS=<INTERVAL_BETWEEN_LAST_UPDATED_TIME_OF_PREPOPULATED_FILE_AND_NOW> npm start`

This command runs the app in the development mode. Open http://localhost:3000 to view it in the browser, like so:

![Step 2](https://user-images.githubusercontent.com/59817155/90635003-3b60a900-e246-11ea-81a1-39a01cb712d1.PNG)


⚠️ Make sure you provide the `env` variables that are applicable to the Query Generator backend.
	
`REACT_APP_CACHE_REFRESH_HOURS` - This `env` variable controls whether to fetch data from warehouse or read from cache files, set this high to make the UI responsive      

`npm run build` - This command builds the app for production to the `build` folder.

⚠️ Pass the `env` variables, so that the Craco build picks them up before packaging.


### ⚡️ RudderStack Query Generator Demo

![Query Generator Demo 1](https://user-images.githubusercontent.com/59817155/90628835-f0419880-e23b-11ea-88db-a83288d265a6.gif)


Here is how you can generate a query by adding the **Users** filter:

![Query Generator Demo 2](https://user-images.githubusercontent.com/59817155/90628927-16673880-e23c-11ea-8e9d-5786a1f39c28.gif)


You can then copy the queries and run them on your warehouse data to get the desired results!

![Queries Output](https://user-images.githubusercontent.com/59817155/90628949-21ba6400-e23c-11ea-83cb-9c600ce6bf79.gif)


## 👉 Contact Us

For more information on the RudderStack Query Generator, feel free to reach out to us on any of the platforms below:
- [Discord](https://discordapp.com/invite/xNEdEGw)
- [Twitter](https://twitter.com/rudderstack)
- [LinkedIn](https://www.linkedin.com/company/rudderlabs/)
