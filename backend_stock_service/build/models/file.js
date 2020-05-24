"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
const inversify_1 = require("inversify");
const database_1 = require("../database/database");
const sequelize_1 = require("sequelize");
const file_1 = require("../schema/file");
const hashtags_1 = require("../schema/hashtags");
const filehashtags_1 = require("../schema/filehashtags");
const logger_1 = require("../utility/logger");
const database_2 = require("../errors/database");
let FileOpsModel = class FileOpsModel {
    constructor(database) {
        this.database = database;
        this.modelName = 'File';
        this.logger = new logger_1.Logger(this.constructor.name).getLogger();
        this.getAllModel = () => Promise.all([this.fmodel, this.hmodel, this.fhmodel]);
        this.logger.info(`File Operations Model started !!`);
        this.fmodel = this.database.getConnection().then(async (conn) => {
            const model = file_1.FileSchema(conn);
            await model.sync({ alter: false });
            return model;
        });
        this.hmodel = this.database.getConnection().then(async (conn) => {
            const model = hashtags_1.HashTagsSchema(conn);
            await model.sync({ alter: false, force: false });
            return model;
        });
        this.fhmodel = Promise.all([this.fmodel, this.hmodel]).then(() => {
            return this.database.getConnection().then(async (conn) => {
                const model = filehashtags_1.FileHashTagsSchema(conn);
                await model.sync({ alter: false, force: false });
                return model;
            });
        });
    }
    /**
     * Find files and their hashtags by their ids
     *
     * @param {string[]} fileids
     * @returns {Promise<FileS[]>}
     * @memberof FileOpsModel
     */
    async findFilesfromIds(fileids) {
        this.logger.debug(`findFilesfromIds called for ${fileids}`);
        const [fmodel, hmodel, fhmodel] = await this.getAllModel();
        const data = await fmodel.findAll({
            where: {
                id: fileids,
            },
            order: [
                ['createdAt', 'DESC']
            ],
            include: [hashtags_1.HashTagsM]
        });
        const res = data.map(v => v.get({ plain: true }));
        return res;
    }
    async getOffsetNFiles(limit, offset) {
        const [fmodel, hmodel, fhmodel] = await this.getAllModel();
        const data = await fmodel.findAll({
            include: [hashtags_1.HashTagsM],
            order: [
                ['createdAt', 'DESC']
            ],
            limit: limit,
            offset: offset
        });
        const res = data.map(v => v.get({ plain: true }));
        return res;
    }
    /**
     *  Takes a description of an image and does text search on its title and description field
     *
     * @param description
     * @param limit
     * @param offset
     */
    async findFilesfromDescription(description, limit, offset) {
        this.logger.debug(`findFilesfromDescription called for ${description}`);
        const [fmodel, hmodel, fhmodel] = await this.getAllModel();
        const data = await fmodel.findAll({
            attributes: {
                include: [
                    [sequelize_1.Sequelize.literal(`MATCH(description,name) AGAINST ('${description}' IN NATURAL LANGUAGE MODE)`), 'relevance0']
                ]
            },
            where: sequelize_1.Sequelize.literal(`MATCH(description,name) AGAINST ('${description}' IN NATURAL LANGUAGE MODE)`),
            include: [hashtags_1.HashTagsM],
            limit: limit,
            offset: offset
        });
        const res = data.map(v => v.get({ plain: true }));
        return res;
    }
    buildQuery(query) {
        let fwhere = [];
        let hwhere = undefined;
        let fhwhere = undefined;
        if (query.desc !== undefined && query.desc !== "")
            fwhere = [{
                    attribute: sequelize_1.Sequelize.literal(`MATCH(description,name) AGAINST ('${query.desc}' IN NATURAL LANGUAGE MODE)`)
                }];
        if (query.tags !== undefined && query.tags.length !== 0)
            hwhere = {
                tag: query.tags
            };
        if (query.dateTime !== undefined) {
            if (query.dateTime.length == 2) {
                if (query.dateTime[0] == undefined && query.dateTime[1] == undefined)
                    fhwhere = undefined;
                else if (query.dateTime[0] == undefined)
                    fhwhere = {
                        createdAt: {
                            [sequelize_1.Op.lte]: query.dateTime[1]
                        }
                    };
                else if (query.dateTime[1] == undefined)
                    fhwhere = {
                        createdAt: {
                            [sequelize_1.Op.gte]: query.dateTime[0]
                        }
                    };
                else if (query.dateTime[0] !== undefined && query.dateTime[1] !== undefined)
                    fhwhere = {
                        createdAt: {
                            [sequelize_1.Op.and]: [
                                {
                                    [sequelize_1.Op.gte]: query.dateTime[0]
                                },
                                {
                                    [sequelize_1.Op.lte]: query.dateTime[1]
                                }
                            ]
                        }
                    };
            }
            else if (query.dateTime.length == 3) {
                const arr = ["day", "month", "year"];
                fwhere = fwhere.concat(query.dateTime.map((val, i) => {
                    if (val !== undefined)
                        return {
                            attribute: sequelize_1.Sequelize.literal(`${arr[i]}(createdAt) = ${val}`)
                        };
                }));
            }
        }
        const searchOrder = query.desc !== undefined && query.desc !== "" ?
            undefined : [['createdAt', 'DESC']];
        return [fwhere, hwhere, fhwhere, searchOrder];
    }
    /**
     * Find files by a query of tags , description and date ranges
     *
     * @param query
     * @param limit
     * @param offset
     */
    async findFileByQueryAnd(query, limit, offset) {
        const [fwhere, hwhere, fhwhere, searchOrder] = this.buildQuery(query);
        const [fmodel, hmodel, fhmodel] = await this.getAllModel();
        const datas = await fmodel.findAll({
            where: {
                [sequelize_1.Op.and]: fwhere
            },
            include: [
                {
                    model: hashtags_1.HashTagsM,
                    where: hwhere,
                },
                {
                    model: filehashtags_1.FileHashTagsM,
                    include: [hashtags_1.HashTagsM],
                    where: fhwhere
                }
            ],
            order: searchOrder,
            limit: limit,
            offset: offset
        });
        const res = datas.map(v => {
            const data = v.get({ plain: true });
            data["HashTags"] = data["FileHashTags"].map((fh) => fh['HashTag']);
            delete data["FileHashTags"];
            return data;
        });
        return res;
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
    async findFilesfromHashTags(tags, limit, offset) {
        this.logger.debug(`findFilesfromHashTags called for ${tags}`);
        const [fmodel, hmodel, fhmodel] = await this.getAllModel();
        const res1 = await fmodel.findAll({
            include: [
                {
                    model: hashtags_1.HashTagsM,
                    where: {
                        tag: tags
                    },
                },
                {
                    model: filehashtags_1.FileHashTagsM,
                    include: [hashtags_1.HashTagsM]
                }
            ],
            order: [
                ['createdAt', 'DESC']
            ],
            limit: limit,
            offset: offset
        });
        const res = res1.map(v => {
            const data = v.get({ plain: true });
            data["HashTags"] = data["FileHashTags"].map((fh) => fh['HashTag']);
            delete data["FileHashTags"];
            return data;
        });
        return res;
    }
    async delete(fileid) {
        const [fmodel, hmodel, fhmodel] = await this.getAllModel();
        fmodel.destroy({
            where: {
                id: fileid
            }
        }).catch(err => {
            this.logger.error(`Deletion of file: ${fileid} failed. error : ${err}`);
        });
    }
    async create(file, hashtags) {
        try {
            const [fmodel, hmodel, fhmodel] = await this.getAllModel();
            const [fileres, hashtagsres] = await Promise.all([
                fmodel.create(file),
                Promise.all(hashtags.map(v => hmodel.findOrCreate({
                    where: { tag: v.tag },
                    defaults: v
                })))
            ]);
            const file2hashtags = hashtagsres.map(v => {
                return {
                    fileid: fileres.get("id"),
                    hashtagid: v[0].get("id")
                };
            });
            await fhmodel.bulkCreate(file2hashtags);
            const data = fileres.get({ plain: true });
            return data;
        }
        catch (err) {
            this.logger.error(new database_2.FileEntryCreationError(`failed to create file entry in database error: ${err}`));
            throw new database_2.FileEntryCreationError(`failed to create file entry in database error: ${err}`);
        }
    }
};
FileOpsModel = __decorate([
    inversify_1.injectable(),
    __metadata("design:paramtypes", [database_1.Database])
], FileOpsModel);
exports.FileOpsModel = FileOpsModel;
