import "reflect-metadata"  // needed by DI container
import { container } from './inversify-config/api.config'
import { InversifyExpressServer, getRouteInfo } from 'inversify-express-utils'
import bodyparser from 'body-parser'
import helmet from 'helmet'
import * as dotenv from 'dotenv-safe';
import cors from 'cors'
import express from 'express'
import prettyjson from 'prettyjson'
import cluster from 'cluster'

dotenv.config({
    example: './.env'
});

import {Logger} from './utility/logger'

// registers default at the very end
import './controllers/default';
// // initalising controllers
import './controllers/upload'
import './controllers/search'
import './controllers/login'



import { UndefinedEnvironmentVariable } from './errors/server'
import { Database } from "./database/database"
import { CustomAuthProvider } from "./controllers/middleware/auth"

if(process.env.API_PROCESS_COUNT === undefined)
        throw new UndefinedEnvironmentVariable("process.env.API_PROCESS_COUNT : undefined in .env")

let nump = Number.parseInt(process.env.API_PROCESS_COUNT)




if(process.env.SERVER_PORT === undefined)
    throw new UndefinedEnvironmentVariable("process.env.SERVER_PORT : undefined in .env")


if(cluster.isMaster){
    for(let i = 0 ; i < nump  ; i++){
       setTimeout(() => {
            cluster.fork() // sequelize issues , important for production
       } ,i*1000) 
    }
}else{
        
    console.log(`Server at pid : ${process.pid}`)

    const logger = new Logger('api').getLogger()
    logger.info(`App starting !!`)

    const database = container.get(Database)
    
    const eapp = express()
    eapp.use(cors())

    const server = new InversifyExpressServer(container , null ,null , eapp , CustomAuthProvider)

    server.setConfig((app) => {
        // disabled compression control calculations
        app.set('etag' , false)
        // for security purposes
        app.use(helmet())
        app.use(bodyparser.json())
        app.use(bodyparser.urlencoded({ extended: true }))
        
    })

    let app = server.build()

    let routerInfo = getRouteInfo(container)
    logger.info(" Router Info !! \n\n"+prettyjson.render(routerInfo)+" \n\n")

    
    app.listen(process.env.SERVER_PORT , () => {
        logger.info(`Server started at ${process.env.SERVER_PORT}`)
    })

    process.on("SIGINT" , () => {
        database.close()
    })
}
