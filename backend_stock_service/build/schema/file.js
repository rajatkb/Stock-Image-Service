"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
class FileM extends sequelize_1.Model {
}
exports.FileM = FileM;
const FileSchema = (sequelize) => {
    FileM.init({
        id: {
            type: sequelize_1.DataTypes.UUID,
            primaryKey: true,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            allowNull: false
        },
        // date:{
        //     type:DataTypes.DATEONLY,    
        // }, 
        // created by sequelize automatically in createdAt 
        name: {
            type: sequelize_1.DataTypes.CHAR(100),
            allowNull: false
        },
        description: {
            type: sequelize_1.DataTypes.STRING(200),
            allowNull: false
        },
        filename: {
            type: sequelize_1.DataTypes.STRING(200),
            allowNull: false
        },
    }, {
        sequelize,
        modelName: 'File',
        indexes: [
            {
                unique: false,
                fields: ['createdAt']
            },
            { type: "FULLTEXT", fields: ["description", "name"] },
        ]
    });
    return FileM;
};
exports.FileSchema = FileSchema;
