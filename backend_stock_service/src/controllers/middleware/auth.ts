import { injectable  } from "inversify";
import { interfaces , BaseHttpController , BaseMiddleware } from 'inversify-express-utils'
import {Request , Response , NextFunction} from 'express'
import jwt from 'jsonwebtoken'
import fs from 'fs'
import { Logger } from "../../utility/logger";
import config from 'config'

type principalData = {
    authenticated:boolean,
}


export class AdminPrincipal implements interfaces.Principal{
    public constructor(public details:principalData) {}
    public isAuthenticated(): Promise<boolean> {
        return Promise.resolve(this.details.authenticated);
    }
    public isResourceOwner(action: string): Promise<boolean> {
        return Promise.resolve(this.details.authenticated)
    }
    public isInRole(role: string): Promise<boolean> {
        return Promise.resolve(this.details.authenticated);
    }
}



@injectable()
export class CustomAuthProvider implements interfaces.AuthProvider {
    
    private logger = new Logger(this.constructor.name).getLogger()

    private publickey =  config.get('AuthService.publickey') as string 

    private pKey =  new Promise<Buffer>((resolve , reject) => {
        fs.readFile(this.publickey , (err , data) => {
            if(err !== undefined)
                resolve(data)
            else
                reject(err)
        })
    })
    
    public async getUser(
        req:Request, 
        res:Response,
        next: NextFunction
    ): Promise<interfaces.Principal> {
        try{
            const entry:string = req.headers["authorization"] as string

            if(entry === undefined){
                this.logger.warn(`Unauthorized request from ${req.ip}`)
                return new AdminPrincipal({authenticated:false})
            }
                
            const [_ , token] = entry.split(' ') // Bearer xakjhs.....
            
            const pKey = await this.pKey

            const ver = jwt.verify(token , pKey )
            return new AdminPrincipal({authenticated:true})
        }catch(err){
            this.logger.error(`Error when authenticating :${err}`)
            return new AdminPrincipal({authenticated:false});
        }
    }

}


@injectable()
export class AuthMiddleWare extends BaseMiddleware{
    constructor(){
        super()
    }
    public async handler(
        req: Request,
        res: Response,
        next: NextFunction
    ){

        console.log(this.httpContext.user)
        let authenticated  = await this.httpContext.user.isAuthenticated()
        if(authenticated)
            next()
        else{
            res.status(401).json({
                status:401,
                message: "UnAuthorized access to service, please provide valid token in header"
            })
        }
    }
}