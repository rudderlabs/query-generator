import {IVal, EventPropValue} from './values';
import { UserPropValue } from './uservalues';

export interface IUserProp {
    names: string[]
    values: IVal[]
    fetchProperties(): Promise<unknown>;
    fetchPropValues(prop: string): Promise<unknown>;
}

export class UserProperties implements IUserProp {
    names: string[];
    values: IVal[];

    constructor() {
        this.names = [];
        this.values = [];
    }

    async fetchProperties() {
        return new Promise(resolve => {
            setTimeout(() => {
                //console.log("pushing event properties");
                this.names.push("val1" +  Math.random(), "val2" +  Math.random());

                resolve()
            }, 1000);
        })
    }
    
    async fetchPropValues(prop: string) {
        return new Promise(resolve => {
            setTimeout(() => {
                //console.log("pushing event properties");
                this.values.push(new UserPropValue("val1" +  Math.random()), new UserPropValue("val2" +  Math.random()));

                resolve()
            }, 1000);
        })
    }
    
}