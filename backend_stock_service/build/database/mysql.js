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
const database_1 = require("./database");
const sequelize_1 = require("sequelize");
const mysql2_1 = __importDefault(require("mysql2"));
const server_1 = require("../errors/server");
const inversify_1 = require("inversify");
const database_2 = require("../errors/database");
const logger_1 = require("../utility/logger");
let MYSQLDatabase = class MYSQLDatabase extends database_1.Database {
    constructor() {
        super();
        this.dbName = process.env.MYSQL_DB_NAME !== undefined ? process.env.MYSQL_DB_NAME : "image_db";
        this.logger = new logger_1.Logger(this.constructor.name).getLogger();
        const username = process.env.MYSQL_DB_USERNAME;
        const password = process.env.MYSQL_DB_PASSWORD;
        const host = process.env.MYSQL_DB_HOST;
        const port = process.env.MYSQL_DB_PORT;
        if (username === undefined)
            throw new server_1.UndefinedEnvironmentVariable("MYSQL_DB_USERNAME not defined");
        if (password === undefined)
            throw new server_1.UndefinedEnvironmentVariable("MYSQL_DB_PASSWORD not defined");
        if (port === undefined)
            throw new server_1.UndefinedEnvironmentVariable("MYSQL_DB_PORT not defined");
        if (Number.parseInt(port) === NaN)
            throw new server_1.UndefinedEnvironmentVariable("MYSQL_DB_PORT not a valid number");
        if (host === undefined)
            throw new server_1.UndefinedEnvironmentVariable("MYSQL_DB_HOST not defined");
        this.sequelizeP = new Promise((resolve, reject) => {
            let conn = mysql2_1.default.createConnection({
                host: host,
                port: Number.parseInt(port),
                user: username,
                password: password
            });
            conn.query(`create database if not exists ${this.dbName}`, (err, results) => {
                if (!err) {
                    const seq = new sequelize_1.Sequelize({
                        dialect: 'mysql',
                        host: `${host}`,
                        port: Number.parseInt(port),
                        username: username,
                        password: password,
                        database: this.dbName,
                        logging: (msg) => this.logger.debug(msg)
                    });
                    conn.end();
                    this.logger.info(`started database connection !!`);
                    resolve(seq);
                }
                else {
                    reject(new database_2.DatabaseConnectionError(`Failed to connect to database error :${err}`));
                }
            });
        });
    }
    async getConnection() {
        let seq = await this.sequelizeP;
        return Promise.resolve(seq);
    }
    async close() {
        this.logger.info("Closing database connection !!!");
        (await this.sequelizeP).close();
    }
};
MYSQLDatabase = __decorate([
    inversify_1.injectable(),
    __metadata("design:paramtypes", [])
], MYSQLDatabase);
exports.MYSQLDatabase = MYSQLDatabase;
