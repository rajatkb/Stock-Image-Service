"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class IllegalDateFormat extends Error {
    constructor(message) {
        super(message);
        Object.setPrototypeOf(this, IllegalDateFormat.prototype);
        this.name = this.constructor.name;
    }
}
exports.IllegalDateFormat = IllegalDateFormat;
