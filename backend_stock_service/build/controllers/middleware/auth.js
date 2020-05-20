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
const inversify_1 = require("inversify");
const inversify_express_utils_1 = require("inversify-express-utils");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const fs_1 = __importDefault(require("fs"));
const logger_1 = require("../../utility/logger");
const config_1 = __importDefault(require("config"));
class AdminPrincipal {
    constructor(details) {
        this.details = details;
    }
    isAuthenticated() {
        return Promise.resolve(this.details.authenticated);
    }
    isResourceOwner(action) {
        return Promise.resolve(this.details.authenticated);
    }
    isInRole(role) {
        return Promise.resolve(this.details.authenticated);
    }
}
exports.AdminPrincipal = AdminPrincipal;
let CustomAuthProvider = class CustomAuthProvider {
    constructor() {
        this.logger = new logger_1.Logger(this.constructor.name).getLogger();
        this.publickey = config_1.default.get('AuthService.publickey');
        this.pKey = new Promise((resolve, reject) => {
            fs_1.default.readFile(this.publickey, (err, data) => {
                if (err !== undefined)
                    resolve(data);
                else
                    reject(err);
            });
        });
    }
    async getUser(req, res, next) {
        try {
            const entry = req.headers["authorization"];
            if (entry === undefined) {
                this.logger.warn(`Unauthorized request from ${req.ip}`);
                return new AdminPrincipal({ authenticated: false });
            }
            const [_, token] = entry.split(' '); // Bearer xakjhs.....
            const pKey = await this.pKey;
            const ver = jsonwebtoken_1.default.verify(token, pKey);
            return new AdminPrincipal({ authenticated: true });
        }
        catch (err) {
            this.logger.error(`Error when authenticating :${err}`);
            return new AdminPrincipal({ authenticated: false });
        }
    }
};
CustomAuthProvider = __decorate([
    inversify_1.injectable()
], CustomAuthProvider);
exports.CustomAuthProvider = CustomAuthProvider;
let AuthMiddleWare = class AuthMiddleWare extends inversify_express_utils_1.BaseMiddleware {
    constructor() {
        super();
    }
    async handler(req, res, next) {
        let authenticated = await this.httpContext.user.isAuthenticated();
        if (authenticated)
            next();
        else {
            res.status(401).json({
                status: 401,
                message: "UnAuthorized access to service, please provide valid token in header"
            });
        }
    }
};
AuthMiddleWare = __decorate([
    inversify_1.injectable(),
    __metadata("design:paramtypes", [])
], AuthMiddleWare);
exports.AuthMiddleWare = AuthMiddleWare;
