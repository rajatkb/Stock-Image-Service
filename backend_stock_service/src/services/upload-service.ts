import { injectable } from "inversify";
import { FileOpsModel } from "../models/file";
import { QueryBuilder } from "./query-builder";
import { FileS } from "../schema/file";
import { HashTagS } from "../schema/hashtags";
import { ImageUploadClient } from "./image-upload/image-client";
import { Logger } from "../utility/logger";
import { FileEntryCreationError } from "../errors/database";
import { ImageUploadError, UploadError } from "../errors/server";

import { File} from '../utility/File'
import { ImageHashTags } from "./image-hashtags";

@injectable()
export class UploadService{

    private logger = new Logger(this.constructor.name).getLogger()
    constructor(private fileOps:FileOpsModel , 
                private queryBuilder:QueryBuilder , 
                private imageclient:ImageUploadClient,
                private imageHashTag:ImageHashTags){
        this.logger.info("Upload Service started")
    }

    /**
     * Responsible for calling Upload routine
     * @param file 
     * @param name 
     * @param desc 
     */
    public async upload(file:File , name:string , desc:string): Promise<FileS>{
        
        const fileEntry:FileS = {
            description:desc,
            filename:file.filename,
            name:name,
        }
        const hashtags:HashTagS[] =(this.queryBuilder.parseHashTags(desc)).map( v => {
            return {
                tag:v
            }
        }).concat((await this.imageHashTag.getHashTags()).map(v => {
            return {
                tag:v
            }
        }))

        

        let entry:FileS| undefined = undefined;
        try{
            entry = await this.fileOps.create(fileEntry , hashtags)
            if(entry.id !== undefined)
                await this.imageclient.createFile(entry.id , file)
            return entry
        }catch(err){
            if( err instanceof FileEntryCreationError )
                this.logger.error(`failed to create database entry and upload image error: ${err}`)
            else if(err instanceof ImageUploadError){
                this.logger.error(`failed to save image for id : ${entry?.id}`)
                if(entry !== undefined)
                    if(entry.id !== undefined)
                        this.fileOps.delete(entry.id)
            }   
            throw new UploadError(`unable to upload data error: ${err}`)
        }
    }
}