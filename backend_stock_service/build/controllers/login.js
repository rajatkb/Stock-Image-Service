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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const inversify_express_utils_1 = require("inversify-express-utils");
const server_1 = require("../errors/server");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const fs_1 = __importDefault(require("fs"));
const config_1 = __importDefault(require("config"));
const cache_service_1 = require("../services/cache-service");
const logger_1 = require("../utility/logger");
let LoginController = class LoginController extends inversify_express_utils_1.BaseHttpController {
    constructor(cacheService) {
        super();
        this.cacheService = cacheService;
        this.privateKey = config_1.default.get('AuthService.privatekey');
        this.logger = new logger_1.Logger(this.constructor.name).getLogger();
        if (process.env.ADMIN_PASSWORD === undefined)
            throw new server_1.UndefinedEnvironmentVariable(`ADMIN_PASSWORD not defined`);
        this.password = process.env.ADMIN_PASSWORD;
    }
    async verfify(request, response, next) {
        response.status(200).json({
            status: 200,
            payload: "All Ok!!"
        });
    }
    async default(request, response, next) {
        try {
            const user = request.body.username;
            const password = request.body.password;
            if (user === undefined || password === undefined)
                throw new server_1.AuthenticationError(`Cannot authentciate bad credentials`);
            else {
                if (password !== this.password || user !== "admin")
                    throw new server_1.AuthenticationError(`Cannot authentcate , wrong password for user`);
                else {
                    let cpkey = this.cacheService.get('pemfile');
                    if (cpkey === undefined) {
                        cpkey = await new Promise((resolve, reject) => {
                            fs_1.default.readFile(this.privateKey, (err, data) => {
                                if (err !== undefined)
                                    resolve(data);
                                else
                                    reject(err);
                            });
                        });
                        this.cacheService.set('pemfile', cpkey, 10000);
                    }
                    const token = jsonwebtoken_1.default.sign({ user: user, time: Date.now() }, cpkey, {
                        expiresIn: "2 days",
                        algorithm: "RS256"
                    });
                    this.logger.info(`logged in new user ip : ${request.ip}`);
                    response.status(200).json({
                        status: 200,
                        payload: token
                    });
                }
            }
        }
        catch (err) {
            if (err instanceof server_1.AuthenticationError)
                response.status(401).json({
                    status: 401,
                    message: err.message
                });
            else {
                this.logger.error(`authentication gone wrong error: ${err}`);
                response.status(500).json({
                    status: 500,
                    message: "Internal error"
                });
            }
        }
    }
};
__decorate([
    inversify_express_utils_1.httpGet('/verify'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Function]),
    __metadata("design:returntype", Promise)
], LoginController.prototype, "verfify", null);
__decorate([
    inversify_express_utils_1.httpPost(''),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Function]),
    __metadata("design:returntype", Promise)
], LoginController.prototype, "default", null);
LoginController = __decorate([
    inversify_express_utils_1.controller('/login'),
    __metadata("design:paramtypes", [cache_service_1.CacheService])
], LoginController);
exports.LoginController = LoginController;
