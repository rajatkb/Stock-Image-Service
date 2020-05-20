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
const inversify_express_utils_1 = require("inversify-express-utils");
const multer_1 = require("./middleware/multer");
const logger_1 = require("../utility/logger");
const upload_service_1 = require("../services/upload-service");
const search_service_1 = require("../services/search-service");
const File_1 = require("../utility/File");
const image_client_1 = require("../services/image-upload/image-client");
const auth_1 = require("./middleware/auth");
let UploadController = class UploadController extends inversify_express_utils_1.BaseHttpController {
    constructor(uploadService, searchService, imageUploadClient) {
        super();
        this.uploadService = uploadService;
        this.searchService = searchService;
        this.imageUploadClient = imageUploadClient;
        this.logger = new logger_1.Logger(this.constructor.name).getLogger();
    }
    async default(request, response, next) {
        this.logger.debug(`/upload recieved request !! fromm : ${request.ip}`);
        const file = request.file;
        const name = request.body["name"];
        const desc = request.body["description"];
        const tfile = new File_1.File(file.originalname, file.encoding, file.mimetype, file.buffer);
        try {
            let res = await this.uploadService.upload(tfile, name, desc);
            response.status(200).send({
                status: 200,
                message: "success"
            });
        }
        catch (err) {
            this.logger.error(`failed to upload for IP: ${request.ip} error :${err}`);
            response.status(501).send({
                status: 501,
                message: "upload failed"
            });
        }
    }
};
__decorate([
    inversify_express_utils_1.httpPost("/images"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Function]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "default", null);
UploadController = __decorate([
    inversify_express_utils_1.controller('/upload', auth_1.AuthMiddleWare, multer_1.MulterMiddleWare),
    __metadata("design:paramtypes", [upload_service_1.UploadService,
        search_service_1.SearchService,
        image_client_1.ImageUploadClient])
], UploadController);
exports.UploadController = UploadController;
