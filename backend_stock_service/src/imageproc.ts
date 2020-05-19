import "reflect-metadata"
import * as dotenv from 'dotenv-safe';
import cluster from 'cluster'
import os from 'os'

dotenv.config({
    example: './.env'
});



import {container} from './inversify-config/image-transform.config'
import { ImageTransformServer } from './services/image-upload/image-tf-server';
import { UndefinedEnvironmentVariable } from "./errors/server";


if(process.env.IMAGE_TF_PROCESS_COUNT === undefined)
        throw new UndefinedEnvironmentVariable("process.env.IMAGE_TF_PROCESS_COUNT : undefined in .env")

let nump = Number.parseInt(process.env.IMAGE_TF_PROCESS_COUNT)

nump = nump !== 0 ? nump : 1


if(cluster.isMaster){
    
    for(let i = 0 ; i < nump ; i++){
       cluster.fork()
    }
}else {
    console.log(`Process at pid : ${process.pid}`)
    let server = container.get(ImageTransformServer)
}


   








