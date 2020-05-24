import { injectable } from "inversify";
import { FileOpsModel } from "../models/file";
import { Logger } from "../utility/logger";
import { QueryBuilder } from "./query-builder";
import { QueryError } from "../errors/database";
import { FileS } from "../schema/file";

@injectable()
export class SearchService {
    
    private logger = new Logger(this.constructor.name).getLogger()
    constructor(private fileOps:FileOpsModel , private queryBuilder:QueryBuilder){
        this.logger.info(`Search Service started !!`)
    }

    public async queryByString(query:string , limit:number , offset:number){
        try{
            let res:FileS[] = []
            if(query.length == 0)
                res = await this.fileOps.getOffsetNFiles(limit , offset)
            else{
                const querydata = this.queryBuilder.parseQuery(query)
                res = await this.fileOps.findFileByQueryAnd(querydata , limit , offset)
            }
            res.forEach( r => {
                delete r.filename
                delete r.updatedAt
                if(r.HashTags !== undefined)
                    r.HashTags.forEach( ht => {
                        delete ht.Files 
                        delete ht.createdAt
                        delete ht.id
                        delete ht.updatedAt
                    })
            })
            
            return res
        }catch(err){
            this.logger.error(`Failed to search database error: ${err}`)
            throw new QueryError(`query error when querying in database error : ${err}`)
        }
    }


}