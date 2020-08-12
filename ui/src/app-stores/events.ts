import { observable, computed, action, autorun } from "mobx"
import {IEvent, Event} from '../models/event';
import fetchService from "../services/fetchservice";

export interface IEventStore {
    events: IEvent[];
    addEvent(name: string): void;
    getEvent(name: string): IEvent;
    fetchEvents():  Promise<unknown>;
}

export class EventStore implements IEventStore {
    @observable events: IEvent[];
    eventCount: number;  

    constructor() {
        this.events = [];
        this.eventCount = 0;
        autorun(() => {
            this.eventCount = this.computedTotal;
        })
        //setInterval(() => this.events.push(new Event('demo' + Math.random())), 1000);
    }

    addEvent(name: string): void {
        throw new Error("Method not implemented.");
    }
    getEvent(name: string): IEvent {
        throw new Error("Method not implemented.");
    }

    async fetchEvents() : Promise<unknown> {
        return new Promise(resolve => {
            fetchService().post("/getevents", {
                "database": "dev",
                "schema": "unity_prod",
                "cache_refresh_hours": 1000000000000000000000000000000000000}).then((res) => {
                    let eventData: any[] = res.data;
                    this.events = [];
                    eventData.map(event => {
                        //this.events.push(new Event(event['EVENT'],"events"));
                        this.events.push(new Event(event['event'],"events"));
                    })

                    resolve()
                   
                }).catch((error) => {
                    this.events.push(new Event("Unable to fetch values","events"));
                })

        })

        return new Promise(resolve => {
            setTimeout(() => {
                //console.log("pushing event properties");
                this.events.push(new Event('demo1' + Math.random(),'event'), new Event('demo2' + + Math.random(),'event'), new Event('demo3' + + Math.random(),'event'));
                resolve()
            }, 1000);
        })
        //throw new Error("Method not implemented.");
    }

    @computed get computedTotal() {
        return this.events.length;
    }

}

export const eventStore = new EventStore();