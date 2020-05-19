import { controller, httpPost  , BaseHttpController, httpGet} from "inversify-express-utils";
import { NextFunction , Request , Response } from "express";
import { MulterMiddleWare } from "./middleware/multer";
import { Logger } from "../utility/logger";
import { UploadService } from "../services/upload-service";
import { SearchService } from "../services/search-service";

import {File } from '../utility/File'
import { UploadError } from "../errors/server";
import { ImageUploadClient } from "../services/image-upload/image-client";
import { AuthMiddleWare } from "./middleware/auth";

@controller('/upload' , AuthMiddleWare, MulterMiddleWare)
export class UploadController extends BaseHttpController{
    
    private logger = new Logger(this.constructor.name).getLogger();
    
    constructor(private uploadService:UploadService ,
                private searchService:SearchService ,
                private imageUploadClient:ImageUploadClient){
        super()
    }

    
    @httpPost("/images")
    private async default(request:Request , response: Response , next:NextFunction ){
        this.logger.debug(`/upload recieved request !! fromm : ${request.ip}`)
        const file:Express.Multer.File = request.file
        const name:string = request.body["name"]
        const desc:string = request.body["description"]
        console.log(file)
        const tfile = new File(file.originalname , file.encoding , file.mimetype , file.buffer)    
        try{
            let res = await this.uploadService.upload(tfile , name , desc)
            response.status(200).send({
                status: 200,
                message:"success"
            })
        }catch(err){       
            this.logger.error(`failed to upload for IP: ${request.ip} error :${err}`)
            response.status(501).send({
                status:501,
                message:"upload failed"
            })
        }
    }

    
    

}