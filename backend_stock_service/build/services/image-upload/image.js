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
const server_1 = require("../../errors/server");
const path_1 = __importDefault(require("path"));
const inversify_1 = require("inversify");
let ImageSource = class ImageSource {
    constructor() {
        this.upload720 = 'res720';
        this.upload240 = 'res240';
        this.getPrimaryLocation = () => this.root;
        this.get720Location = () => path_1.default.join(this.root, this.upload720);
        this.get240Location = () => path_1.default.join(this.root, this.upload240);
        if (process.env.STORAGE_LOCATION === undefined)
            throw new server_1.UndefinedEnvironmentVariable(`STORAGE_LOCATION not defined`);
        this.root = process.env.STORAGE_LOCATION;
        if (process.env.IMAGE_TRANSFORM_SERVER_PORT === undefined)
            throw new server_1.UndefinedEnvironmentVariable('IMAGE_TRANSFORM_SERVER_PORT is not defined');
        if (process.env.IMAGE_TRANSFORM_SERVER_HOST === undefined)
            throw new server_1.UndefinedEnvironmentVariable("IMAGE_TRANSFORM_SERVER_HOST is not defined");
        this.port = Number.parseInt(process.env.IMAGE_TRANSFORM_SERVER_PORT);
        if (isNaN(this.port))
            throw new server_1.UndefinedEnvironmentVariable('IMAGE_TRANSFORM_SERVER_PORT is not a number');
        this.host = process.env.IMAGE_TRANSFORM_SERVER_HOST;
        if (process.env.IMAGE_TF_PROCESS_COUNT === undefined)
            throw new server_1.UndefinedEnvironmentVariable('IMAGE_TF_PROCESS_COUNT is not defined');
        this.tfservercount = Number.parseInt(process.env.IMAGE_TF_PROCESS_COUNT);
        if (isNaN(this.tfservercount))
            throw new server_1.UndefinedEnvironmentVariable('IMAGE_TF_PROCESS_COUNT is not a number');
    }
};
ImageSource = __decorate([
    inversify_1.injectable(),
    __metadata("design:paramtypes", [])
], ImageSource);
exports.ImageSource = ImageSource;
