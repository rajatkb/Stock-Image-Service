"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const file_1 = require("./file");
const hashtags_1 = require("./hashtags");
class FileHashTagsM extends sequelize_1.Model {
}
exports.FileHashTagsM = FileHashTagsM;
/**
 * Use a common table for referencing files and hashtags
 * So that search on hashtags => images does not require a join of image and hashtags table
 * Also more features like hashtag use count etc can be added later
 *
 * @param {Sequelize} sequelize
 * @returns
 */
const FileHashTagsSchema = (sequelize) => {
    FileHashTagsM.init({
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        fileid: {
            type: sequelize_1.DataTypes.UUID,
            references: {
                model: file_1.FileM,
                key: 'id'
            }
        },
        hashtagid: {
            type: sequelize_1.DataTypes.INTEGER,
            references: {
                model: hashtags_1.HashTagsM,
                key: 'id'
            }
        }
    }, {
        sequelize,
        modelName: 'FileHashTags'
    });
    file_1.FileM.belongsToMany(hashtags_1.HashTagsM, { through: FileHashTagsM, foreignKey: 'fileid' });
    hashtags_1.HashTagsM.belongsToMany(file_1.FileM, { through: FileHashTagsM, foreignKey: 'hashtagid' });
    FileHashTagsM.belongsTo(file_1.FileM, { foreignKey: 'fileid' });
    FileHashTagsM.belongsTo(hashtags_1.HashTagsM, { foreignKey: 'hashtagid' });
    file_1.FileM.hasMany(FileHashTagsM, { foreignKey: 'fileid' });
    hashtags_1.HashTagsM.hasMany(FileHashTagsM, { foreignKey: 'hashtagid' });
    return FileHashTagsM;
};
exports.FileHashTagsSchema = FileHashTagsSchema;
