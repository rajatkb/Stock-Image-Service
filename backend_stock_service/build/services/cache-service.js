"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const inversify_1 = require("inversify");
const node_cache_1 = __importDefault(require("node-cache"));
const config_1 = __importDefault(require("config"));
let CacheService = class CacheService {
    constructor() {
        this.stdttl = Number.parseInt(config_1.default.get("CacheService.ttl"));
        this.nodecache = new node_cache_1.default({
            stdTTL: this.stdttl
        });
    }
    set(key, value, ttl) {
        this.nodecache.set(key, value, ttl);
    }
    get(key) {
        return this.nodecache.get(key);
    }
};
CacheService = __decorate([
    inversify_1.injectable()
], CacheService);
exports.CacheService = CacheService;
