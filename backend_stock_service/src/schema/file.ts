import { Model, Sequelize, DataTypes } from "sequelize";
import { FileHashTagsM } from "./filehashtags";
import { HashTagS } from "./hashtags";

export interface FileS{
    id?:string,
    name:string,
    description:string,
    filename:string,
    createdAt?:Date,
    updatedAt?:Date,
    HashTags?:HashTagS[]
}




export class FileM extends Model {}

const FileSchema = (sequelize:Sequelize) => { FileM.init({
        id:{
            type:DataTypes.UUID,
            primaryKey:true,
            defaultValue: DataTypes.UUIDV4,
            allowNull:false
        },
        name:{
            type:DataTypes.CHAR(100),
            allowNull:false
        },
        description:{
            type: DataTypes.STRING(200),
            allowNull:false
        },
        filename:{
            type:DataTypes.STRING(200),
            allowNull:false
        },

    } , {
        sequelize,
        modelName: 'File',
        indexes: [
            {
                unique:false,
                fields:['createdAt'],
            },
            { type:"FULLTEXT" , fields:["description" , "name"] },
        ]
    })
    
    return FileM
}

export { FileSchema }
