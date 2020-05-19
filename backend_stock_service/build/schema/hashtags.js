"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
class HashTagsM extends sequelize_1.Model {
}
exports.HashTagsM = HashTagsM;
const HashTagsSchema = (sequelize) => {
    HashTagsM.init({
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        tag: {
            type: sequelize_1.DataTypes.CHAR(100),
            unique: true,
            allowNull: false,
        },
    }, {
        sequelize,
        modelName: 'HashTag'
    });
    return HashTagsM;
};
exports.HashTagsSchema = HashTagsSchema;
