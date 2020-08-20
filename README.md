# RudderStack Query Generator

RudderStack is an open-source Segment alternative for collecting, storing and routing customer event data securely to your data warehouse and dozens of other tools. Read more about RudderStack [here](https://github.com/rudderlabs/rudder-server).

## ⚡️ Why We Built This App
One of the primary aims of collecting the event data is to persist it in a data warehouse with the intent of performing analytics. However, this analytics can involve writing technically complex SQL queries - which might pose a challenge for non-technical business users. 

We aim to address this challenge for the RudderStack-specific data by providing a **query generator** tool that accepts user input through an **intuitive interface**. It then generates SQL queries by **leveraging your warehouse data** populated by [Rudderstack](https://rudderstack.com) for further analytics.

✔️ **Note**: As of this writing, the RudderStack warehouse schema is compatible with Segment. Hence, this tool can be applied to the downstream data warehouses where the Segment event data has been persisted.


## ⚡️ Key Features
* Easy-to-use interface for generating the queries <br>
* Fully tested for Snowflake; support for Redshift and other data warehouses is under development <br>

## ⚡️ How It Works

The RudderStack Query Generator has the following workflow:

- Pre-populates the list of RudderStack events and their associated properties present in the data warehouse
- Retrieves the list of events and their properties based on the filtering conditions set by you through the UI
- Automatically generates the SQL query based on the user-specified filters, which you can run on your data warehouse to obtain the required data

## ⚡️ How to Use the RudderStack Query Generator

### Step 1: Start the Backend Node.js Server

- Clone this repository
- Start the Node.js server and run the following command from the local repository root:

```
cd api; npm start
```

✔️ **Note**: All the sample input JSON files are placed under `api/data`.<br>

📘 To know more about how the backend server works, or how the events are pre-populated for query generation, check out our [Wiki]().
<br>

### Step 2: Start the Frontend App

* First, install the necessary dependencies for the app by running the `npm i` command, as shown:

![Step 1](https://user-images.githubusercontent.com/59817155/90634896-15d39f80-e246-11ea-836f-c9e6d2df9782.PNG)

* Then, run the following command:

`REACT_APP_QUERY_GEN_BACKEND_URL=<SERVER_URL> REACT_APP_WH=<SNOWFLAKE/REDSHIFT> REACT_APP_DATABASE=<WAREHOUSE_DB_NAME>  REACT_APP_SCHEMA=<WAREHOUSE_SCHEMA_NAME> REACT_APP_ACCOUNT=<WAREHOUSE_ACCOUNT_URL> REACT_APP_USERNAME=<WAREHOUSE_ACCOUNT_NAME> REACT_APP_PASSWORD=<WAREHOUSE_ACCOUNT_PASSWORD> REACT_APP_CACHE_REFRESH_HOURS=<INTERVAL_BETWEEN_LAST_UPDATED_TIME_OF_PREPOPULATED_FILE_AND_NOW> npm start`

⚠️ **Important**: The above command runs the app in the development mode.

![Step 2](https://user-images.githubusercontent.com/59817155/90635003-3b60a900-e246-11ea-81a1-39a01cb712d1.PNG)

The environment variables are:

- `REACT_APP_QUERY_GEN_BACKEND_URL` - The Query Generator backend runs on this URL
- `REACT_APP_DATABASE` - Name of the warehouse database goes here
- `REACT_APP_SCHEMA` - Name of the warehouse schema goes here
- `REACT_APP_ACCOUNT` - Specify the warehouse account URL
- `REACT_APP_USERNAME` - Specify the warehouse account username
- `EACT_APP_PASSWORD` - Specify the warehouse account password
- `REACT_APP_CACHE_REFRESH_HOURS` - This variable determines whether to fetch the data from the data warehouse or read from the cached files. **Set a higher value here to make the UI more responsive**

✔️ **Note**: The frontend app passes the variables needed by backend to make the warehouse connection and fetch the schema, column and row values from the respective event tables and cache them locally for future lookups via the frontend.

⚠️ **Important**: To build the app for production to the `build` folder, run the following command:

```
npm run build
```

The interface for the RudderStack Query Generator is bootstrapped with [Craco](https://github.com/gsoft-inc/craco). Make sure you pass the `env` variables, so that the Craco build picks them up before packaging.


## ⚡️ RudderStack Query Generator Demo

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
