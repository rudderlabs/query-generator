import {IVal, EventPropValue} from './values';
import fetchService from '../services/fetchservice';
import { IEvent } from './event';

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
    
    async fetchValues() {
        console.log("=====fetching property values for event of type=====", this.event)
        return new Promise(resolve => {
            fetchService().post("/geteventpropertyvalues", {
                "database": "dev",
	            "schema": "unity_prod",
                "event": this.event,
                "property": this.name,
                "cache_refresh_hours": 1000000000000000000000000000000000000
            }).then((res) => {
                    let valuesData: any[] = res.data;
                    this.values = [];
                    valuesData.map(value => {
                        //this.values.push(new EventPropValue(value[this.name.toUpperCase()]));
                        this.values.push(new EventPropValue(value[this.name]));
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