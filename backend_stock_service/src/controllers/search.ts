import { controller, BaseHttpController, httpGet, queryParam } from "inversify-express-utils";
import { SearchService } from "../services/search-service";

import { Logger } from "../utility/logger";
import { QueryError } from "../errors/database";
import { NextFunction , Request , Response } from "express";
import { SearchCacheMiddleware } from "./middleware/cache";
import { CacheService } from "../services/cache-service";
import { FileS } from "../schema/file";
import config from 'config'
import { AuthMiddleWare } from "./middleware/auth";

@controller('/search' , AuthMiddleWare, SearchCacheMiddleware)
export class SearchController extends BaseHttpController {

    private logger = new Logger(this.constructor.name).getLogger();
    private ttl = Number.parseInt(config.get('SearchController.ttl'))

    constructor(private searchService: SearchService , private cache:CacheService<FileS[]>) {
        super()
    }


    @httpGet('/images')
    private async default(
        @queryParam("query") query: string,
        @queryParam("limit") limit: string,
        @queryParam("offset") offset: string,
        request: Request,
        response: Response,
        next: NextFunction) {

        this.logger.info(`search request from ip : ${request.ip}`)
        
        const nlimit = Number.parseInt(limit)
        const noffset = Number.parseInt(offset)
        try{
            if (isNaN(nlimit) || isNaN(noffset))
                throw new Error(`Bad request recieved from ip : ${ request.ip}`)
            
            const data = await this.searchService.queryByString(query , nlimit , noffset)
            const key = query+"|"+limit+"|"+offset
            const ttl = this.ttl - Math.floor((noffset+1)/(nlimit+1))
            this.cache.set(key , data , ttl)
            response.status(200).json({
                status:200,
                payload: data
            })
        }catch(err){
            if(err instanceof QueryError)
                response.status(500).json({
                    status: 500,
                    payload:"Internal error"
                })
            else
                response.status(400).json({
                    status: 400,
                    payload: "bad query params"
                })
        }
    }

}