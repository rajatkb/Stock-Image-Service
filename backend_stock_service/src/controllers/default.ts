import { controller, httpGet  , BaseHttpController} from "inversify-express-utils";
import { NextFunction , Request , Response } from "express";
import { ImageUploadClient } from "../services/image-upload/image-client";
import {File} from '../utility/File'


@controller('/')
export class DefaultController extends BaseHttpController{

    constructor(){super()}

    @httpGet("*")
    private default(request:Request , response: Response , next:NextFunction ){
        response.status(404).json({
            status:404,
            message:" (ノಠ益ಠ)ノ彡┻━┻ "
        })
    }

    
}