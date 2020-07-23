import {IProp, EventProperties} from './properties';
import { observable } from 'mobx';
import { resolve } from 'q';
import fetchService from '../services/fetchservice';

export interface IEvent {
    name: string
    properties: IProp[]
    type: string,
    fetchProperties(): Promise<unknown>;
}

export class Event implements IEvent {
    name: string;   
    properties: IProp[];
    type: string

    
    constructor(eventName: string, type:string) {
        this.name = eventName;
        this.properties = [];
        this.type= type;
    }
    
    async fetchProperties() {
        if(this.type == "users") {
            return new Promise(resolve => {
                fetchService().post("/geteventproperties", {
                    "database": "dev",
	                "schema": "unity_prod",
                    "event": "users",
                    "cache_refresh_hours": 200
                }).then((res) => {
                        let propertiesData: any[] = res.data;
                        this.properties = []
                        propertiesData.map(property => {
                            this.properties.push(new EventProperties(property['name'].toLowerCase(), this.type=="users"? "users":this.name));
                        })
    
                        resolve()
                       
                    })
    
            })
        } else{
            return new Promise(resolve => {
                fetchService().post("/geteventproperties", {
                    "database": "dev",
                    "schema": "unity_prod",
                    "event": this.name,
                    "cache_refresh_hours": 200
                }).then((res) => {
                        let propertiesData: any[] = res.data;
                        this.properties = []
                        propertiesData.map(property => {
                            //this.properties.push(new EventProperties(property['name'].toLowerCase(), this.type=="users"? "users":this.name));
                            this.properties.push(new EventProperties(property['column'].toLowerCase(), this.type=="users"? "users":this.name));
                        })
    
                        resolve()
                       
                    })
    
            })
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