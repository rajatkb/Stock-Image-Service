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
const query_builder_1 = require("./query-builder");
const image_client_1 = require("./image-upload/image-client");
const logger_1 = require("../utility/logger");
const database_1 = require("../errors/database");
const server_1 = require("../errors/server");
const image_hashtags_1 = require("./image-hashtags");
const cache_service_1 = require("./cache-service");
let UploadService = class UploadService {
    constructor(fileOps, queryBuilder, imageclient, imageHashTag, cacheService) {
        this.fileOps = fileOps;
        this.queryBuilder = queryBuilder;
        this.imageclient = imageclient;
        this.imageHashTag = imageHashTag;
        this.cacheService = cacheService;
        this.logger = new logger_1.Logger(this.constructor.name).getLogger();
        this.logger.info("Upload Service started");
    }
    /**
     * Responsible for calling Upload routine
     * @param file
     * @param name
     * @param desc
     */
    async upload(file, name, desc) {
        const fileEntry = {
            description: desc,
            filename: file.filename,
            name: name,
        };
        const hashtags = (this.queryBuilder.parseHashTags(desc)).map(v => {
            return {
                tag: v
            };
        }).concat((await this.imageHashTag.getHashTags()).map(v => {
            return {
                tag: v
            };
        }));
        let entry = undefined;
        try {
            entry = await this.fileOps.create(fileEntry, hashtags);
            if (entry.id !== undefined)
                await this.imageclient.createFile(entry.id, file);
            this.cacheService.invalidateAll();
            return entry;
        }
        catch (err) {
            if (err instanceof database_1.FileEntryCreationError)
                this.logger.error(`failed to create database entry and upload image error: ${err}`);
            else if (err instanceof server_1.ImageUploadError) {
                this.logger.error(`failed to save image for id : ${entry === null || entry === void 0 ? void 0 : entry.id}`);
                if (entry !== undefined)
                    if (entry.id !== undefined)
                        this.fileOps.delete(entry.id);
            }
            throw new server_1.UploadError(`unable to upload data error: ${err}`);
        }
    }
};
UploadService = __decorate([
    inversify_1.injectable(),
    __metadata("design:paramtypes", [file_1.FileOpsModel,
        query_builder_1.QueryBuilder,
        image_client_1.ImageUploadClient,
        image_hashtags_1.ImageHashTags,
        cache_service_1.CacheService])
], UploadService);
exports.UploadService = UploadService;
