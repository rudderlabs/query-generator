import {IVal, EventPropValue} from './values';
import fetchService from '../services/fetchservice';
import { IEvent } from './event';

const warehouse:string = process.env.REACT_APP_WH || 'SNOWFLAKE'

export interface IProp {
    name: string,
    event: string,
    values: IVal[]
    fetchValues(): Promise<unknown>;
}

export class EventProperties implements IProp {
    name: string;
    values: IVal[];
    event: string;

    constructor(propName: string, event:string) {
        this.name = propName;
        this.values = [];
        this.event = event;
    }

    getValueIndex(): string {
       return warehouse == 'SNOWFLAKE' ?  this.name.toUpperCase() : this.name
    }
    
    async fetchValues() {
        console.log("=====fetching property values for event of type=====", this.event)
        return new Promise(resolve => {
            fetchService().post("/geteventpropertyvalues", {
                "database": process.env.REACT_APP_DATABASE, //"dev",
                "schema": process.env.REACT_APP_SCHEMA, //"unity_prod",
                "account": process.env.REACT_APP_ACCOUNT,
                "username": process.env.REACT_APP_USERNAME,
                "password": process.env.REACT_APP_PASSWORD,
                "event": this.event,
                "property": this.name,
                "cache_refresh_hours": 1000000000000000000000000000000000000
            }).then((res) => {
                    let valuesData: any[] = res.data;
                    this.values = [];
                    valuesData.map(value => {
                        //this.values.push(new EventPropValue(value[this.name.toUpperCase()]));
                        this.values.push(new EventPropValue(value[this.getValueIndex()]));
                    })

                    this.values.push(new EventPropValue("none"))

                    resolve()
                   
                }).catch((error) => {
                    this.values.push(new EventPropValue("none"))
                    resolve()
                })

        })
        // return new Promise(resolve => {
        //     setTimeout(() => {
        //         //console.log("pushing event properties");
        //         this.values.push(new EventPropValue("val1" +  Math.random()), new EventPropValue("val2" +  Math.random()));

        //         resolve()
        //     }, 1000);
        // })
    }
    
}