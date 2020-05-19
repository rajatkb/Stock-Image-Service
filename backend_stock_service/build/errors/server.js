"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class UndefinedEnvironmentVariable extends Error {
    constructor(message) {
        super(message);
        Object.setPrototypeOf(this, UndefinedEnvironmentVariable.prototype);
        this.name = this.constructor.name;
    }
}
exports.UndefinedEnvironmentVariable = UndefinedEnvironmentVariable;
class ImageUploadError extends Error {
    constructor(message) {
        super(message);
        Object.setPrototypeOf(this, ImageUploadError.prototype);
        this.name = this.constructor.name;
    }
}
exports.ImageUploadError = ImageUploadError;
class UploadError extends Error {
    constructor(message) {
        super(message);
        Object.setPrototypeOf(this, UploadError.prototype);
        this.name = this.constructor.name;
    }
}
exports.UploadError = UploadError;
