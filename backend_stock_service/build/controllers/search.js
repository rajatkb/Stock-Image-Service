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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const inversify_express_utils_1 = require("inversify-express-utils");
const search_service_1 = require("../services/search-service");
const logger_1 = require("../utility/logger");
const database_1 = require("../errors/database");
const cache_1 = require("./middleware/cache");
const cache_service_1 = require("../services/cache-service");
const config_1 = __importDefault(require("config"));
let SearchController = class SearchController extends inversify_express_utils_1.BaseHttpController {
    constructor(searchService, cache) {
        super();
        this.searchService = searchService;
        this.cache = cache;
        this.logger = new logger_1.Logger(this.constructor.name).getLogger();
        this.ttl = Number.parseInt(config_1.default.get('SearchController.ttl'));
    }
    async test(req, res) {
        return "hello";
    }
    async default(query, limit, offset, request, response, next) {
        this.logger.info(`search request from ip : ${request.ip}`);
        const nlimit = Number.parseInt(limit);
        const noffset = Number.parseInt(offset);
        try {
            if (isNaN(nlimit) || isNaN(noffset))
                throw new Error(`Bad request recieved from ip : ${request.ip}`);
            const data = await this.searchService.queryByString(query, nlimit, noffset);
            const key = query + "|" + limit + "|" + offset;
            const ttl = this.ttl - Math.floor((noffset + 1) / (nlimit + 1));
            this.cache.set(key, data, ttl);
            response.status(200).json({
                status: 200,
                payload: data
            });
        }
        catch (err) {
            if (err instanceof database_1.QueryError)
                response.status(500).json({
                    status: 500,
                    payload: "Internal error"
                });
            else
                response.status(400).json({
                    status: 400,
                    payload: "bad query params"
                });
        }
    }
};
__decorate([
    inversify_express_utils_1.httpGet(''),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SearchController.prototype, "test", null);
__decorate([
    inversify_express_utils_1.httpGet('/images'),
    __param(0, inversify_express_utils_1.queryParam("query")),
    __param(1, inversify_express_utils_1.queryParam("limit")),
    __param(2, inversify_express_utils_1.queryParam("offset")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object, Object, Function]),
    __metadata("design:returntype", Promise)
], SearchController.prototype, "default", null);
SearchController = __decorate([
    inversify_express_utils_1.controller('/search', cache_1.SearchCacheMiddleware),
    __metadata("design:paramtypes", [search_service_1.SearchService, cache_service_1.CacheService])
], SearchController);
exports.SearchController = SearchController;
