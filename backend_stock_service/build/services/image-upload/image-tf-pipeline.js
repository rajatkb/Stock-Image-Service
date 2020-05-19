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
const sharp_1 = __importDefault(require("sharp"));
const image_1 = require("./image");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
let ImageTransformPipeline = class ImageTransformPipeline extends image_1.ImageSource {
    constructor() {
        super();
        this.resizeTransorm = (height, width) => {
            if (height >= width)
                return [[Math.floor(height * 240 / width), 240], [Math.floor(720 * height / width), 720]];
            else
                return [[240, Math.floor(width * 240 / height)], [720, Math.floor(width * 720 / height)]];
        };
        if (!fs_1.default.existsSync(this.getPrimaryLocation())) {
            fs_1.default.mkdirSync(this.getPrimaryLocation());
            fs_1.default.mkdirSync(this.get720Location());
            fs_1.default.mkdirSync(this.get240Location());
        }
    }
    async saveFile(id, file) {
        const image = sharp_1.default(file);
        return image.metadata().then((val) => {
            if (val.height === undefined || val.width === undefined)
                return Promise.reject(new Error(`Image dimension not available , bad encoded image`));
            const [dim240, dim720] = this.resizeTransorm(val.height, val.width);
            return [image.clone().resize(dim240[1], dim240[0]).png(),
                image.clone().resize(dim720[1], dim720[0]).png(),
                image
            ];
        }).then(images => {
            const file240name = path_1.default.join(this.get240Location(), id + ".png");
            const file720name = path_1.default.join(this.get720Location(), id + ".png");
            const filename = path_1.default.join(this.getPrimaryLocation(), id + ".png");
            return Promise.all([
                images[0].toFile(file240name),
                images[1].toFile(file720name),
                images[2].toFile(filename)
            ]);
        });
    }
};
ImageTransformPipeline = __decorate([
    inversify_1.injectable(),
    __metadata("design:paramtypes", [])
], ImageTransformPipeline);
exports.ImageTransformPipeline = ImageTransformPipeline;
