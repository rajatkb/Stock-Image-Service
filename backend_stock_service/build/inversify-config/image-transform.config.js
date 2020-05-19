"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const inversify_1 = require("inversify");
const image_tf_server_1 = require("../services/image-upload/image-tf-server");
const image_tf_pipeline_1 = require("../services/image-upload/image-tf-pipeline");
let container = new inversify_1.Container();
exports.container = container;
container.bind(image_tf_server_1.ImageTransformServer).to(image_tf_server_1.ImageTransformServer);
container.bind(image_tf_pipeline_1.ImageTransformPipeline).to(image_tf_pipeline_1.ImageTransformPipeline);
