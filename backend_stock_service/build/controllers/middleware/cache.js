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
const inversify_express_utils_1 = require("inversify-express-utils");
const logger_1 = require("../../utility/logger");
const cache_service_1 = require("../../services/cache-service");
let SearchCacheMiddleware = class SearchCacheMiddleware extends inversify_express_utils_1.BaseMiddleware {
    constructor(cache) {
        super();
        this.cache = cache;
        this.logger = new logger_1.Logger(this.constructor.name).getLogger();
        this.logger.info(`Search Cache Middleware started!!`);
    }
    async handler(req, res, next) {
        const query = req.query.query;
        const limit = Number.parseInt(req.query.limit);
        const offset = Number.parseInt(req.query.offset);
        if (isNaN(limit) || isNaN(offset))
            res.status(400).json({
                status: 400,
                message: "Bad query params"
            });
        else {
            const key = query + "|" + limit + "|" + offset;
            const val = this.cache.get(key);
            if (val !== undefined) {
                this.logger.debug("Search cache hit for key :" + key);
                res.status(200).json({
                    status: 200,
                    payload: val
                });
            }
            else
                next();
        }
    }
};
SearchCacheMiddleware = __decorate([
    inversify_1.injectable(),
    __metadata("design:paramtypes", [cache_service_1.CacheService])
], SearchCacheMiddleware);
exports.SearchCacheMiddleware = SearchCacheMiddleware;
