import { UndefinedEnvironmentVariable } from "../../errors/server";
import path from 'path'
import { injectable } from "inversify";

@injectable()
export abstract class ImageSource{
    protected readonly upload720='res720'
    protected readonly upload240='res240'
    protected root:string;

    protected readonly port:number
    protected readonly host:string
    protected readonly tfservercount:number

    constructor(){
        if(process.env.STORAGE_LOCATION === undefined)
            throw new UndefinedEnvironmentVariable(`STORAGE_LOCATION not defined`)   
        this.root = process.env.STORAGE_LOCATION

        if(process.env.IMAGE_TRANSFORM_SERVER_PORT === undefined)
            throw new UndefinedEnvironmentVariable('IMAGE_TRANSFORM_SERVER_PORT is not defined')
        if(process.env.IMAGE_TRANSFORM_SERVER_HOST === undefined)
            throw new UndefinedEnvironmentVariable("IMAGE_TRANSFORM_SERVER_HOST is not defined")
        this.port = Number.parseInt(process.env.IMAGE_TRANSFORM_SERVER_PORT)
        if(isNaN(this.port))
            throw new UndefinedEnvironmentVariable('IMAGE_TRANSFORM_SERVER_PORT is not a number')
        this.host = process.env.IMAGE_TRANSFORM_SERVER_HOST
        
        if(process.env.IMAGE_TF_PROCESS_COUNT === undefined)
            throw new UndefinedEnvironmentVariable('IMAGE_TF_PROCESS_COUNT is not defined')
        this.tfservercount = Number.parseInt(process.env.IMAGE_TF_PROCESS_COUNT)
        if(isNaN(this.tfservercount))
            throw new UndefinedEnvironmentVariable('IMAGE_TF_PROCESS_COUNT is not a number')
    }

    public getPrimaryLocation = () => this.root
    public get720Location = ()=> path.join(this.root , this.upload720)
    public get240Location = ()=> path.join(this.root , this.upload240)
}