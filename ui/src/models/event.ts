import { IProp, EventProperties } from "./properties";
import { observable } from "mobx";
import { resolve } from "q";
import fetchService from "../services/fetchservice";

const warehouse:string = process.env.REACT_APP_WH || 'SNOWFLAKE'
const propertyIndex = warehouse == 'SNOWFLAKE' ? 'name' : 'column'

export interface IEvent {
  name: string;
  properties: IProp[];
  type: string;
  fetchProperties(): Promise<unknown>;
}

export class Event implements IEvent {
  name: string;
  properties: IProp[];
  type: string;

  constructor(eventName: string, type: string) {
    this.name = eventName;
    this.properties = [];
    this.type = type;
  }
  
  async fetchProperties() {
    if (this.type == "users") {
      return new Promise((resolve) => {
        fetchService()
          .post("/geteventproperties", {
            database: process.env.REACT_APP_DATABASE, //"dev",
            schema: process.env.REACT_APP_SCHEMA, //"unity_prod",
            account: process.env.REACT_APP_ACCOUNT,
            username: process.env.REACT_APP_USERNAME,
            password: process.env.REACT_APP_PASSWORD,
            event: "users",
            cache_refresh_hours: 1000000000000000000000000000000000000,
          })
          .then((res) => {
            let propertiesData: any[] = res.data;
            this.properties = [];
            propertiesData.map((property) => {
              this.properties.push(
                new EventProperties(
                  property[propertyIndex].toLowerCase(),
                  this.type == "users" ? "users" : this.name
                )
              );
            });

            resolve();
          })
          .catch((error) => {
            this.properties.push(
              new EventProperties(
                "Unable to fetch values",
                this.type == "users" ? "users" : this.name
              )
            );
            resolve();
          });
      });
    } else {
      return new Promise((resolve) => {
        fetchService()
          .post("/geteventproperties", {
            database: process.env.REACT_APP_DATABASE, //"dev",
            schema: process.env.REACT_APP_SCHEMA, //"unity_prod",
            account: process.env.REACT_APP_ACCOUNT,
            username: process.env.REACT_APP_USERNAME,
            password: process.env.REACT_APP_PASSWORD,
            event: this.name,
            cache_refresh_hours: 1000000000000000000000000000000000000,
          })
          .then((res) => {
            let propertiesData: any[] = res.data;
            this.properties = [];
            propertiesData.map((property) => {
              //this.properties.push(new EventProperties(property['name'].toLowerCase(), this.type=="users"? "users":this.name));
              this.properties.push(
                new EventProperties(
                  property[propertyIndex].toLowerCase(),
                  this.type == "users" ? "users" : this.name
                )
              );
            });

            resolve();
          })
          .catch((error) => {
            this.properties.push(
              new EventProperties(
                "Unable to fetch values",
                this.type == "users" ? "users" : this.name
              )
            );
            resolve();
          });
      });
    }
    // return new Promise(resolve => {
    //     setTimeout(() => {
    //         this.properties.push(new EventProperties("prop7" +  Math.random()), new EventProperties("prop8" +  Math.random()));
    //         //console.log("pushed event properties" + this.properties);
    //         resolve()
    //     }, 1000);
    // })
    //throw new Error("Method not implemented.");
  }
}
