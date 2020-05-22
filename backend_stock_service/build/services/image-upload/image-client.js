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
const server_1 = require("../../errors/server");
const File_1 = require("../../utility/File");
const image_1 = require("./image");
const rxjs_1 = require("rxjs");
const ws_1 = __importDefault(require("ws"));
const logger_1 = require("../../utility/logger");
const operators_1 = require("rxjs/operators");
const config_1 = __importDefault(require("config"));
let ImageUploadClient = class ImageUploadClient extends image_1.ImageSource {
    constructor() {
        super();
        this.serverEventSource$ = new rxjs_1.Subject();
        this.serverEventSink$ = new rxjs_1.Subject();
        this.logger = new logger_1.Logger(this.constructor.name).getLogger();
        this.requestTimeout = 1000 * Number.parseInt(config_1.default.get("ImageUploadClient.requestTimeout"));
        this.setupSocket = (websocket, subscribe) => {
            websocket.on("error", (err) => {
                this.logger.error(`could not connect to image processing serevr error :${err}`);
                websocket.terminate();
                websocket.close();
            });
            websocket.on("close", (err) => {
                this.logger.error(`connection lost to image processing serevr error :${err}`);
                websocket.terminate();
                websocket.close();
            });
            websocket.on("open", () => {
                this.logger.info(`Connected with ImageTransormServer made at port : ${this.port}`);
                subscribe.next(websocket);
            });
            websocket.on("message", (data) => {
                this.serverEventSink$.next(data);
            });
        };
        this.logger.info(`Started Image Upload Client`);
        this.logger.debug(`trying to connected at ws://${this.host}:${this.port}`);
        this.server$ = new rxjs_1.Observable((subscribe) => {
            let websocket;
            this.logger.warn(`trying to connect to server`);
            websocket = new ws_1.default(`ws://${this.host}:${this.port}`);
            this.setupSocket(websocket, subscribe);
        }).pipe(operators_1.share());
        const sub = rxjs_1.combineLatest([this.serverEventSource$, this.server$]).subscribe(([data, socket]) => {
            if (data !== undefined)
                socket.send(data, (err) => {
                    if (err !== undefined) {
                        this.logger.error(`failed to send data error: ${err}`);
                    }
                });
        });
    }
    async createFile(id, file) {
        this.logger.debug(`recieved createFile request for id :${id} and file :${file.filename}`);
        const data = File_1.File.asMessage(id, file.buffer);
        return new Promise((resolve, reject) => {
            const sub = this.serverEventSink$.subscribe(data => {
                if (data == id) {
                    this.logger.debug(`file uploaded successfully id : ${id}`);
                    sub.unsubscribe();
                    resolve(data);
                }
            });
            this.serverEventSource$.next(data);
            this.serverEventSource$.next(undefined);
            setTimeout(() => {
                sub.unsubscribe();
                reject(new server_1.ImageUploadError(`took too much time for upload, above ${this.requestTimeout / 1000}s`));
            }, this.requestTimeout);
        });
    }
};
ImageUploadClient = __decorate([
    inversify_1.injectable(),
    __metadata("design:paramtypes", [])
], ImageUploadClient);
exports.ImageUploadClient = ImageUploadClient;
