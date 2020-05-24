import { controller, BaseHttpController, httpPost, httpGet } from "inversify-express-utils";
import {Request , Response , NextFunction} from 'express'
import { UndefinedEnvironmentVariable, AuthenticationError } from "../errors/server";
import jwt from 'jsonwebtoken'
import fs from 'fs'
import config from 'config'
import { CacheService } from "../services/cache-service";
import { Logger } from "../utility/logger";


@controller('/login')
export class LoginController extends BaseHttpController {

    private password:string;
    
    private privateKey =  config.get('AuthService.privatekey') as string 
    private logger = new Logger(this.constructor.name).getLogger();
    constructor(private cacheService:CacheService<Buffer>
        ){
        super()
        if(process.env.ADMIN_PASSWORD === undefined)
            throw new UndefinedEnvironmentVariable(`ADMIN_PASSWORD not defined`)
        this.password = process.env.ADMIN_PASSWORD
        
    }

    @httpGet('/verify')
    private async verfify(
        request:Request , 
        response:Response , 
        next:NextFunction){
            response.status(200).json({
                status:200,
                payload:"All Ok!!"
            })
    }

    @httpPost('')
    private async default(
        request:Request , 
        response:Response , 
        next:NextFunction){
            try{
                const user = request.body.username
                const password = request.body.password
                if(user === undefined || password === undefined)
                    throw new AuthenticationError(`Cannot authentciate bad credentials`)
                else{
                    if(password !== this.password || user !== "admin")
                        throw new AuthenticationError(`Cannot authentcate , wrong password for user`)
                    else{

                        let cpkey = this.cacheService.get('pemfile')
                        if(cpkey === undefined){
                            cpkey = await new Promise<Buffer>((resolve , reject) => { 
                                fs.readFile(this.privateKey , (err , data) => {
                                    if(err !== undefined)
                                        resolve(data)
                                    else
                                        reject(err)
                                })
                            })
                            this.cacheService.set('pemfile' , cpkey , 10000)
                        }
                        
                        const token = jwt.sign({user:user , time:Date.now() } , cpkey , {
                            expiresIn: "2 days",
                            algorithm:"RS256"
                        })
                        this.logger.info(`logged in new user ip : ${request.ip}`)
                        response.status(200).json({
                            status:200,
                            payload:token
                        })
                    }

                }
            }catch(err){

                if(err instanceof AuthenticationError)
                    response.status(401).json({
                        status:401,
                        message: err.message
                    })
                else{
                    this.logger.error(`authentication gone wrong error: ${err}`)
                    response.status(500).json({
                        status:500,
                        message: "Internal error"
                    })
                }
            }
    }

}