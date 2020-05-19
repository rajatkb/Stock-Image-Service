import { Model, Sequelize, DataTypes } from "sequelize";
import { FileM, FileS } from './file'
import { HashTagsM, HashTagS } from './hashtags'

export interface FileHashTagS{
    id?:number
    fileid:string,
    hashtagid:number,
    Files?:FileS[]
    HashTags?:HashTagS[]
}

export class FileHashTagsM extends Model{}

/**
 * Use a common table for referencing files and hashtags
 * So that search on hashtags => images does not require a join of image and hashtags table
 * Also more features like hashtag use count etc can be added later
 *
 * @param {Sequelize} sequelize
 * @returns
 */
const FileHashTagsSchema = (sequelize:Sequelize) => { FileHashTagsM.init({
        id:{
            type:DataTypes.INTEGER,
            primaryKey:true,
            autoIncrement:true
        },
        fileid:{
            type:DataTypes.UUID,
            references: {
                model:FileM,
                key: 'id'     
            }   
        },
        hashtagid:{
            type:DataTypes.INTEGER,
            references: {
                model:HashTagsM,
                key:'id'
            }
        }
    } , {
        sequelize,
        modelName: 'FileHashTags'
    })
    FileM.belongsToMany(HashTagsM , {through: FileHashTagsM , foreignKey:'fileid'})
    HashTagsM.belongsToMany(FileM , {through: FileHashTagsM , foreignKey: 'hashtagid'})
    FileHashTagsM.belongsTo(FileM , {foreignKey:'fileid'})
    FileHashTagsM.belongsTo(HashTagsM , {foreignKey:'hashtagid'})
    FileM.hasMany(FileHashTagsM , { foreignKey:'fileid'})
    HashTagsM.hasMany(FileHashTagsM , {foreignKey:'hashtagid'})
    return FileHashTagsM
}

export { FileHashTagsSchema }