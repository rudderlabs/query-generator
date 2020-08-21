# Event Query Generator

The Event Query Generator is a tool that allows you to seamlessly navigate through the warehouse event schema through an intuitive UI, and generate complex SQL queries to interact with your customer event data.

## ⚡️ What is the Event Query Generator?

Businesses collect the event data and persist it in a data warehouse with the intent of performing analytics, which generally involves writing complex SQL queries. To generate these SQL queries, you also need access to a lot of implicit information within the event data, such as the different events and their attributes.

With the query generator tool, you can navigate through the event schema through an easy-to-use interface. You can specify the data filtering conditions through the UI, and the tool generates the SQL queries. You can then run these queries on your warehouse to obtain the required data.

> ✔️ **Note**: As of this writing, the RudderStack warehouse schema is compatible with Segment. Hence, this tool can be applied to the downstream data warehouses where the Segment event data is persisted.


## ⚡️ Key Features
* Simple, easy-to-use interface for generating the queries <br>
* Caches data from the warehouse for better performance<br>
* Fully tested for Snowflake; support for Redshift and other data warehouses is under development <br>

## ⚡️ How It Works

The Event Query Generator has the following workflow:

- Pre-populates the list of events and their associated properties present in the data warehouse.
- Retrieves the list of events and their properties based on the filtering conditions set by you through the UI.
- Automatically generates the SQL query based on the user-specified filters. You can then run the query on your data warehouse to obtain the required data.

## ⚡️ How to Use the Event Query Generator

### Step 1: Start the Backend Node.js Server

- Clone this repository
- Start the Node.js server by running the following command from the local repository root:

```
cd api; npm install; npm start
```
[![asciicast](https://asciinema.org/a/kG0ns8oFDJ8yJhKCvRWflhtBW.svg)](https://asciinema.org/a/kG0ns8oFDJ8yJhKCvRWflhtBW)

> ✔️ **Note**: All the sample input JSON files are placed under `api/data`.
<br>

> ✔️ To know more about how the backend server works, how to operate the backend server in the standalone mode, or how the events are pre-populated for query generation, check out our [Wiki](https://github.com/rudderlabs/query-generator/wiki).
<br>

### Step 2: Start the Frontend App

* First, install the necessary dependencies for the app by running the `npm i` command, as shown:

![Step 1](https://user-images.githubusercontent.com/59817155/90634896-15d39f80-e246-11ea-836f-c9e6d2df9782.PNG)

* Then, run the following command:

`REACT_APP_QUERY_GEN_BACKEND_URL=<SERVER_URL> REACT_APP_WH=<SNOWFLAKE/REDSHIFT> REACT_APP_DATABASE=<WAREHOUSE_DB_NAME>  REACT_APP_SCHEMA=<WAREHOUSE_SCHEMA_NAME> REACT_APP_ACCOUNT=<WAREHOUSE_ACCOUNT_URL> REACT_APP_USERNAME=<WAREHOUSE_ACCOUNT_NAME> REACT_APP_PASSWORD=<WAREHOUSE_ACCOUNT_PASSWORD> REACT_APP_CACHE_REFRESH_HOURS=<INTERVAL_BETWEEN_LAST_UPDATED_TIME_OF_PREPOPULATED_FILE_AND_NOW> npm start`
<br><br>

> ⚠️ **Important**: The above command runs the app in the development mode.
<br>

![Step 2](https://user-images.githubusercontent.com/59817155/90635003-3b60a900-e246-11ea-81a1-39a01cb712d1.PNG)

The environment variables are:

- `REACT_APP_QUERY_GEN_BACKEND_URL` - The Query Generator backend runs on this URL
- `REACT_APP_DATABASE` - Name of the warehouse database goes here
- `REACT_APP_SCHEMA` - Name of the warehouse schema goes here
- `REACT_APP_ACCOUNT` - Specify the warehouse account URL
- `REACT_APP_USERNAME` - Specify the warehouse account username
- `REACT_APP_PASSWORD` - Specify the warehouse account password
- `REACT_APP_CACHE_REFRESH_HOURS` - This variable determines whether to fetch the data from the data warehouse or read from the cached files. **Set a higher value here to make the UI more responsive**.
<br>

> ✔️ **Note**: The frontend app passes the variables needed by backend to make the warehouse connection and fetch the schema, column and row values from the respective event tables and cache them locally for future lookups via the frontend.
<br>

To build the app for production to the `build` folder, run the following command:

```
npm run build
```

The interface for the Event Query Generator is bootstrapped with [Craco](https://github.com/gsoft-inc/craco). Make sure you pass the `env` variables, so that the Craco build picks them up before packaging.
<br>

## ⚡️ Event Query Generator Demo

![Query Generator Demo 1](https://user-images.githubusercontent.com/59817155/90628835-f0419880-e23b-11ea-88db-a83288d265a6.gif)

Here is how you can generate a query by adding the **Users** filter:

![Query Generator Demo 2](https://user-images.githubusercontent.com/59817155/90628927-16673880-e23c-11ea-8e9d-5786a1f39c28.gif)

You can then copy the queries and run them on your warehouse data to get the desired results!

![Queries Output](https://user-images.githubusercontent.com/59817155/90628949-21ba6400-e23c-11ea-83cb-9c600ce6bf79.gif)
<br>

## ⚡️ What is RudderStack?

RudderStack is an open-source Segment alternative for collecting, storing and routing customer event data securely to your data warehouse and dozens of other tools. Read more about RudderStack [here](https://github.com/rudderlabs/rudder-server).

## 👉 Contact Us

For more information on the Event Query Generator, feel free to reach out to us on any of the platforms below:
- [Discord](https://discordapp.com/invite/xNEdEGw)
- [Twitter](https://twitter.com/rudderstack)
- [LinkedIn](https://www.linkedin.com/company/rudderlabs/)
