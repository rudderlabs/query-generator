import { getByDisplayValue } from "@testing-library/dom";


export interface IVal {
    value: any;
    getValue(): any;
}

export class EventPropValue implements IVal {
    value: any;
    constructor(val: any) {
        this.value = '' + val;  // keeping it as string since the property doesn't have type info for now
    }

    getValue(): any {
        return this.value;
    }
    
}