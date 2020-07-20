import { getByDisplayValue } from "@testing-library/dom";


export interface IVal {
    value: any;
    getValue(): any;
}

export class UserPropValue implements IVal {
    value: any;
    constructor(val: any) {
        this.value = val;
    }

    getValue(): any {
        return this.value;
    }
    
}