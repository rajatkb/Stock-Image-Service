import { Model, Sequelize, DataTypes } from "sequelize";
import { FileS } from "./file";
import { FileHashTagS } from "./filehashtags";

export interface HashTagS {
    id?:number,
    tag:string,
    createdAt?:Date,
    updatedAt?:Date
    Files?:FileS[]
}

export class HashTagsM extends Model{}

const HashTagsSchema = (sequelize:Sequelize) => { HashTagsM.init({
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    tag:{
        type:DataTypes.CHAR(100),
        unique:true,
        allowNull:false,
        primaryKey:true
    },
} , {
    sequelize,
    modelName: 'HashTag'
})

return HashTagsM
}

export { HashTagsSchema }