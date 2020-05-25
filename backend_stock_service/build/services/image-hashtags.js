"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const inversify_1 = require("inversify");
let ImageHashTags = class ImageHashTags {
    constructor() {
        this.hashtags = ["Interiors",
            "Wallpapers",
            "Experimental",
            "People",
            "Textures",
            "Food",
            "Spirituality",
            "Wellness",
            "Nature",
            "Events",
            "Culture",
            "Architecture",
            "Technology",
            "Athletics",
            "Work",
            "History",
            "Film",
            "Animals",
            "Travel",
            "Fashion"
        ];
    }
    shuffle(a) {
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }
    async getHashTags() {
        const count = Math.floor(Math.random() * (5));
        const a = this.shuffle(this.hashtags);
        return new Promise((resolve, reject) => {
            const time = setTimeout(() => {
                resolve(a.slice(0, count));
                clearTimeout(time);
            }, 5000);
        });
    }
};
ImageHashTags = __decorate([
    inversify_1.injectable()
], ImageHashTags);
exports.ImageHashTags = ImageHashTags;
