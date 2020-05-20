"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const dotenv = __importStar(require("dotenv-safe"));
const cluster_1 = __importDefault(require("cluster"));
cluster_1.default.schedulingPolicy = cluster_1.default.SCHED_RR; // forcing a round robin , as it greatly enhances the parllel execution
dotenv.config({
    example: './.env'
});
const image_transform_config_1 = require("./inversify-config/image-transform.config");
const image_tf_server_1 = require("./services/image-upload/image-tf-server");
const server_1 = require("./errors/server");
if (process.env.IMAGE_TF_PROCESS_COUNT === undefined)
    throw new server_1.UndefinedEnvironmentVariable("process.env.IMAGE_TF_PROCESS_COUNT : undefined in .env");
let nump = Number.parseInt(process.env.IMAGE_TF_PROCESS_COUNT);
if (cluster_1.default.isMaster) {
    for (let i = 0; i < nump; i++) {
        cluster_1.default.fork();
    }
}
else {
    console.log(`Process at pid : ${process.pid}`);
    let server = image_transform_config_1.container.get(image_tf_server_1.ImageTransformServer);
}
