export class UndefinedEnvironmentVariable extends Error{
    constructor(message: string){
        super(message)
        Object.setPrototypeOf(this , UndefinedEnvironmentVariable.prototype)
        this.name = this.constructor.name
    }
} 

export class ImageUploadError extends Error{
    constructor(message: string){
        super(message)
        Object.setPrototypeOf(this , ImageUploadError.prototype)
        this.name = this.constructor.name
    }
} 

export class UploadError extends Error{
    constructor(message: string){
        super(message)
        Object.setPrototypeOf(this , UploadError.prototype)
        this.name = this.constructor.name
    }
} 

export class AuthenticationError extends Error{
    constructor(message: string){
        super(message)
        Object.setPrototypeOf(this , AuthenticationError.prototype)
        this.name = this.constructor.name
    }
}