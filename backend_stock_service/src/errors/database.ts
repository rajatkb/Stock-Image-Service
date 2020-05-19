export class DatabaseConnectionError extends Error{
    constructor(message: string){
        super(message)
        Object.setPrototypeOf(this , DatabaseConnectionError.prototype)
        this.name = this.constructor.name
    }
}

export class FileEntryCreationError extends Error{
    constructor(message: string){
        super(message)
        Object.setPrototypeOf(this , FileEntryCreationError.prototype)
        this.name = this.constructor.name
    }
}

export class QueryError extends Error{
    constructor(message: string){
        super(message)
        Object.setPrototypeOf(this , QueryError.prototype)
        this.name = this.constructor.name
    }
}
