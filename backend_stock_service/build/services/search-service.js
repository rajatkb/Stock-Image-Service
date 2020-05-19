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
const file_1 = require("../models/file");
const logger_1 = require("../utility/logger");
const query_builder_1 = require("./query-builder");
const database_1 = require("../errors/database");
let SearchService = class SearchService {
    constructor(fileOps, queryBuilder) {
        this.fileOps = fileOps;
        this.queryBuilder = queryBuilder;
        this.logger = new logger_1.Logger(this.constructor.name).getLogger();
        this.logger.info(`Search Service started !!`);
    }
    async queryByString(query, limit, offset) {
        try {
            let res = [];
            if (query.length == 0)
                res = await this.fileOps.getOffsetNFiles(limit, offset);
            else {
                const querydata = this.queryBuilder.parseQuery(query);
                res = await this.fileOps.findFileByQueryAnd(querydata, limit, offset);
            }
            res.forEach(r => {
                delete r.filename;
                delete r.updatedAt;
                if (r.HashTags !== undefined)
                    r.HashTags.forEach(ht => {
                        delete ht.Files;
                        delete ht.createdAt;
                        delete ht.id;
                        delete ht.updatedAt;
                    });
            });
            return res;
        }
        catch (err) {
            this.logger.error(`Failed to search database error: ${err}`);
            throw new database_1.QueryError(`query error when querying in database error : ${err}`);
        }
    }
};
SearchService = __decorate([
    inversify_1.injectable(),
    __metadata("design:paramtypes", [file_1.FileOpsModel, query_builder_1.QueryBuilder])
], SearchService);
exports.SearchService = SearchService;
