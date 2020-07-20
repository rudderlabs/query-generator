import { EventStore, IEventStore } from "./events";

export class Stores {
    eventStore:IEventStore;
    constructor() {
        this.eventStore =  new EventStore();
    } 
}

export const stores = new Stores();