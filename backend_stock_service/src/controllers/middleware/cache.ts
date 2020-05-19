import { injectable } from "inversify";
import { BaseMiddleware, queryParam } from "inversify-express-utils";
import { Logger } from "../../utility/logger";
import { NextFunction , Request , Response} from "express";
import NodeCache from 'node-cache'
import config from 'config'
import { CacheService } from "../../services/cache-service";
import { FileS } from "../../schema/file";

@injectable()
export class SearchCacheMiddleware extends BaseMiddleware{

    private logger = new Logger(this.constructor.name).getLogger();

    
    constructor(private cache:CacheService<FileS>){
        super()
        this.logger.info(`Search Cache Middleware started!!`)
    }

    public async handler (
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        const query = req.query.query as string 
        const limit = Number.parseInt(req.query.limit as string)
        const offset = Number.parseInt(req.query.offset as string)
        if(isNaN(limit) || isNaN(offset))
            res.status(400).json({
                status:400,
                message:"Bad query params"
            })
        else{
            
            const key = query+"|"+limit+"|"+offset
            const val = this.cache.get(key)
            if(val !== undefined){
                this.logger.debug("Search cache hit for key :"+key)
                res.status(200).json({
                    status:200,
                    payload:val
                })
            }
                
            else
                next()
        }
    }
}