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
const image_1 = require("./image");
const logger_1 = require("../../utility/logger");
const ws_1 = __importDefault(require("ws"));
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const File_1 = require("../../utility/File");
const image_tf_pipeline_1 = require("./image-tf-pipeline");
class SocketManager {
    constructor(csocket) {
        this.csocket = csocket;
        this.getMessageStream = () => {
            return new rxjs_1.Observable((subscriber) => {
                this.csocket.socket.on("error", (err) => {
                    subscriber.error(err);
                });
                this.csocket.socket.on("close", (reason) => {
                    this.csocket.socket.close();
                    subscriber.complete();
                });
                this.csocket.socket.on("message", (data) => {
                    subscriber.next({
                        socket: this.csocket.socket,
                        client: this.csocket.client,
                        data: data
                    });
                });
            });
        };
    }
}
let ImageTransformServer = class ImageTransformServer extends image_1.ImageSource {
    constructor(imagePipe) {
        super();
        this.imagePipe = imagePipe;
        this.logger = new logger_1.Logger('Image-Transform-Server').getLogger();
        this.logger.info(`Started Image-Transform-Server  process id :${process.pid} at port: ${this.port}`);
        this.server = new ws_1.default.Server({
            port: this.port,
            perMessageDeflate: {
                zlibDeflateOptions: {
                    // See zlib defaults.
                    chunkSize: 1024,
                    memLevel: 7,
                    level: 3
                },
                zlibInflateOptions: {
                    chunkSize: 10 * 1024
                },
                // Other options settable:
                clientNoContextTakeover: true,
                serverNoContextTakeover: true,
                serverMaxWindowBits: 10,
                // Below options specified as default values.
                concurrencyLimit: 10,
                threshold: 1024 // Size (in bytes) below which messages
                // should not be compressed.
            }
        });
        this.server.on("listening", () => {
            this.logger.info(`Image Transformation Server listening on port :${this.port} pid: ${process.pid}`);
        });
        this.socketServer$ = new rxjs_1.Observable((subscriber) => {
            this.server.on("connection", (socket, req) => {
                this.logger.info(`new client connected from ip :${req.socket.remoteAddress}  on process : ${process.pid}`);
                subscriber.next({
                    socket: socket,
                    client: req.socket.remoteAddress
                });
            });
            this.server.on("close", () => {
                this.logger.info(`closing socket observer on process : ${process.pid}`);
                subscriber.complete();
            });
        }).pipe(operators_1.share(), operators_1.mergeMap((socket, index) => {
            return new SocketManager(socket).getMessageStream();
        }));
        this.socketServer$.subscribe((val) => {
            this.logger.debug(`Recieved data from client :${val.client} in process pid :${process.pid}`);
            const [id, file] = File_1.File.getIdandBuffer(val.data);
            this.imagePipe.saveFile(id, file)
                .then(status => {
                val.socket.send(id, (err) => {
                    if (err !== undefined)
                        this.logger.error(`failed to send data basck to client : ${val.client}`);
                });
            })
                .catch(err => {
                this.logger.error(`Failed to process image error: ${err}`);
            });
        });
    }
};
ImageTransformServer = __decorate([
    inversify_1.injectable(),
    __metadata("design:paramtypes", [image_tf_pipeline_1.ImageTransformPipeline])
], ImageTransformServer);
exports.ImageTransformServer = ImageTransformServer;
