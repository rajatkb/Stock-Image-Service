export class IllegalDateFormat extends Error{
    constructor(message: string){
        super(message)
        Object.setPrototypeOf(this , IllegalDateFormat.prototype)
        this.name = this.constructor.name
    }
}