"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
class Logger {
    constructor(filename) {
        this.logger = winston_1.default.createLogger({
            level: process.env.LOG_LEVEL,
            transports: [
                new winston_1.default.transports.Console({ format: winston_1.default.format.colorize({ all: true }), }),
                new winston_1.default.transports.File({ filename: `${process.env.LOG_FOLDER}/${filename}.log` })
            ],
            format: winston_1.default.format.combine(winston_1.default.format.label({
                label: filename
            }), winston_1.default.format.timestamp(), winston_1.default.format.printf((info) => {
                return `${info.timestamp} - ${info.label}:[${info.level}] [pid - ${process.pid}]: ${info.message}`;
            }))
        });
    }
    getLogger() {
        return this.logger;
    }
}
exports.Logger = Logger;
