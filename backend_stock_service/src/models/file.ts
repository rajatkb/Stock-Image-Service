import { injectable } from "inversify";
import { Database } from "../database/database";
import { Sequelize, Op } from "sequelize";
import { FileSchema, FileM, FileS } from '../schema/file'
import { HashTagsM, HashTagsSchema, HashTagS } from "../schema/hashtags";
import { FileHashTagsM, FileHashTagsSchema } from "../schema/filehashtags";
import { Logger } from "../utility/logger";
import { FileEntryCreationError } from "../errors/database";

export type Query = {
    tags?:string[], 
    desc?:string , 
    dateTime?:[Date|undefined , Date|undefined] | [number|undefined , number|undefined , number|undefined]
};



@injectable()
export class FileOpsModel {
    private readonly fmodel: Promise<typeof FileM>;
    private readonly hmodel: Promise<typeof HashTagsM>
    private readonly fhmodel: Promise<typeof FileHashTagsM>
    public readonly modelName = 'File'

    private logger = new Logger(this.constructor.name).getLogger()

    constructor(private database: Database<Sequelize>) {

        this.logger.info(`File Operations Model started !!`)

        this.fmodel = this.database.getConnection().then(async conn => {
            const model = FileSchema(conn)
            
            await model.sync({alter:false})
            return model
        })

        this.hmodel = this.database.getConnection().then(async conn => {
            const model = HashTagsSchema(conn)
            await model.sync({alter:false ,  force:false})
            return model
        })

        this.fhmodel = Promise.all([this.fmodel, this.hmodel]).then(() => {
            return this.database.getConnection().then(async conn => {
                const model = FileHashTagsSchema(conn)
                await model.sync({alter:false ,  force:false})
                return model
            })
        })




    }

    private getAllModel = () => Promise.all<typeof FileM, typeof HashTagsM, typeof FileHashTagsM>([this.fmodel, this.hmodel, this.fhmodel])

    /**
     * Find files and their hashtags by their ids
     *
     * @param {string[]} fileids
     * @returns {Promise<FileS[]>}
     * @memberof FileOpsModel
     */
    async findFilesfromIds(fileids: string[]): Promise<FileS[]> {
        this.logger.debug(`findFilesfromIds called for ${fileids}`)
        const [fmodel, hmodel, fhmodel] = await this.getAllModel()
        const data = await fmodel.findAll({
            where: {
                id: fileids,
            },
            order: [
                ['createdAt', 'DESC']
            ],
            include: [HashTagsM]
        })
        const res: any = data.map(v => v.get({ plain: true }))
        return res
    }


    async getOffsetNFiles(limit:number , offset:number): Promise<FileS[]>{
        const [fmodel, hmodel, fhmodel] = await this.getAllModel()
        const data = await fmodel.findAll({
            include:[HashTagsM],
            order: [
                ['createdAt', 'DESC']
            ],
            limit:limit,
            offset:offset
        })
        const res: any = data.map(v => v.get({ plain: true }))
        return res
    }

    
    /**
     *  Takes a description of an image and does text search on its title and description field
     * 
     * @param description 
     * @param limit 
     * @param offset 
     */
    async findFilesfromDescription(description:string , limit?:number , offset?:number):Promise<FileS[]>{
        this.logger.debug(`findFilesfromDescription called for ${description}`)

        const [fmodel , hmodel , fhmodel] = await this.getAllModel()
        const data = await fmodel.findAll({
            attributes:{
                include:[
                    [Sequelize.literal(`MATCH(description,name) AGAINST ('${description}' IN NATURAL LANGUAGE MODE)`) , 'relevance0']
                ]
            },
            where: Sequelize.literal(`MATCH(description,name) AGAINST ('${description}' IN NATURAL LANGUAGE MODE)`),
            
            include:[HashTagsM],
            limit:limit,
            offset:offset            
        })
        const res:any = data.map(v => v.get({plain:true}))
        return res
    }


    private buildQuery(query: Query){
        let fwhere:any[] = []
        let hwhere:any = undefined
        let fhwhere:any = undefined

        if(query.desc !== undefined && query.desc !=="")
            fwhere = [{
                attribute:Sequelize.literal(`MATCH(description,name) AGAINST ('${query.desc}' IN NATURAL LANGUAGE MODE)`)
            }]
            
        if(query.tags !== undefined && query.tags.length !== 0)
            hwhere = {
                tag:query.tags
            }
        if( query.dateTime !== undefined){
            if(query.dateTime.length == 2){
                if(query.dateTime[0] == undefined && query.dateTime[1] == undefined )
                    fhwhere = undefined 
                else if(query.dateTime[0] == undefined)
                    fhwhere = {
                        createdAt:{
                            [Op.lte]: query.dateTime[1]
                        }
                    }
                else if(query.dateTime[1] == undefined)
                    fhwhere =  {
                        createdAt:{
                            [Op.gte]: query.dateTime[0]
                        }
                    }
                else if(query.dateTime[0] !== undefined && query.dateTime[1] !== undefined )
                    fhwhere = {
                        createdAt:{
                            [Op.and]:[
                                {
                                    [Op.gte]:query.dateTime[0]
                                },
                                {
                                    [Op.lte]:query.dateTime[1]
                                }
                            ]
                        }
                    }
            }                
            else if(query.dateTime.length == 3){
                
                const arr = ["day","month","year"]
                fwhere = fwhere.concat(
                query.dateTime.map((val , i) => {
                    if(val !== undefined)
                        return {
                            attribute:Sequelize.literal(`${arr[i]}(createdAt) = ${val}`)
                        }
                }))
                
            }

        }
            
        
        const searchOrder = query.desc !== undefined && query.desc !==""?
                            undefined: [['createdAt','DESC']]

        return [fwhere , hwhere , fhwhere , searchOrder]
    }

    /**
     * Find files by a query of tags , description and date ranges
     * 
     * @param query 
     * @param limit 
     * @param offset 
     */
    async findFileByQueryAnd(query: Query , limit:number , offset:number):Promise<FileS[]> {

        const [fwhere,hwhere,fhwhere , searchOrder] = this.buildQuery(query) 
        
        const [fmodel, hmodel, fhmodel] = await this.getAllModel()
        
        const datas = await fmodel.findAll(
            {   
                
                where: {
                    [Op.and]:fwhere
                },
                include: [
                    {
                        model: HashTagsM,
                        where: hwhere,

                    },
                    {
                        
                        model: FileHashTagsM,
                        include: [HashTagsM],
                        where:fhwhere
                    }
                ],
                order: searchOrder,
                limit: limit,
                offset: offset
            }
        )
        const res: any = datas.map(v => {
            const data: any = v.get({ plain: true })
            data["HashTags"] = data["FileHashTags"].map((fh: any) => fh['HashTag'])
            delete data["FileHashTags"]
            return data
        })
        return res
    }


    /**
     * 
     * Query for getting Files from HashTags
     * Note: Current version is a bit hacky , because of sequelize and it's structure
     * and sql generation
     * @param tags 
     * @param limit 
     * @param offset 
     */
    async findFilesfromHashTags(tags: string[], limit?: number, offset?: number): Promise<FileS[]> {
        this.logger.debug(`findFilesfromHashTags called for ${tags}`)
        const [fmodel, hmodel, fhmodel] = await this.getAllModel()
        const res1 = await fmodel.findAll(
            {
                include: [
                    {
                        model: HashTagsM,
                        where: {
                            tag: tags
                        },

                    },
                    {
                        model: FileHashTagsM,
                        include: [HashTagsM]
                    }
                ],
                order: [
                    ['createdAt', 'DESC']
                ],
                limit: limit,
                offset: offset
            }
        )
        const res: any = res1.map(v => {
            const data: any = v.get({ plain: true })
            data["HashTags"] = data["FileHashTags"].map((fh: any) => fh['HashTag'])
            delete data["FileHashTags"]
            return data
        })
        return res
    }

    async delete(fileid:string):Promise<void>{
        const [fmodel, hmodel, fhmodel] = await this.getAllModel()
        fmodel.destroy({
            where:{
                id:fileid
            }
        }).catch( err => {
            this.logger.error(`Deletion of file: ${fileid} failed. error : ${err}`)
        })
    }


    async create(file: FileS, hashtags: HashTagS[]): Promise<FileS> {
        try {
            const [fmodel, hmodel, fhmodel] = await this.getAllModel()
            const [fileres, hashtagsres] = await Promise.all(
                [
                    fmodel.create(file),
                    Promise.all(
                        hashtags.map(
                            v => hmodel.findOrCreate(
                                {
                                    where: { tag: v.tag },
                                    defaults: v
                                }
                            )))
                ]
            )
            const file2hashtags = hashtagsres.map(v => {
                return {
                    fileid: fileres.get("id"),
                    hashtagid: v[0].get("id")
                }
            })
            await fhmodel.bulkCreate(file2hashtags)
            const data: any = fileres.get({ plain: true })
            return data
        } catch (err) {
            this.logger.error(new FileEntryCreationError(`failed to create file entry in database error: ${err}`));
            throw new FileEntryCreationError(`failed to create file entry in database error: ${err}`)
        }
    }
}