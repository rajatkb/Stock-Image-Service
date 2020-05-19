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
const query_1 = require("../errors/query");
const logger_1 = require("../utility/logger");
const config_1 = __importDefault(require("config"));
let QueryBuilder = class QueryBuilder {
    constructor() {
        this.tagPat = /(?:tags\:((?:[a-z0-9A-Z_-]+)(?:\,[a-z0-9A-Z_-]+)*))\s/;
        this.datePat = /date\:(?:(?:([0-9]{1,2})\-([0-9]{1,2})\-([0-9]{4}))|(?:([0-9]{4}))|(?:([0-9]{1,2})\-([0-9]{4})))|date\:(?:(?:([0-9]{1,2}|\*)\-([0-9]{1,2}|\*)\-([0-9]{4}|\*)))/;
        this.datePatRangeFrom = /from\:(?:([0-9]{1,2})\-([0-9]{1,2})\-([0-9]{4}))\s/;
        this.datePatRangeTo = /to\:(?:([0-9]{1,2})\-([0-9]{1,2})\-([0-9]{4}))\s/;
        this.descPat = /desc\:(?:\"(.*?)\")|(?:([^\s]*)\s)/;
        this.logger = new logger_1.Logger(this.constructor.name).getLogger();
        this.timeout = Number.parseInt(config_1.default.get('QueryBuilder.timeout')) * 1000;
        this.getInitDate = (str) => {
            let begDate = new Date(str);
            begDate.setUTCHours(0, 0, 0, 0);
            return begDate;
        };
        this.parseHashTags = (desc) => {
            const hashTagPat = /\#([a-z0-9A-Z_-]+)/g;
            const data = [];
            for (const d of desc.matchAll(hashTagPat))
                data.push(d[1]);
            return data;
        };
        this.logger.info("Query Builder started !!");
    }
    parseTags(query) {
        const tagr = this.tagPat.exec(query);
        if (tagr !== null)
            return tagr[1].split(',');
        else
            return [];
    }
    parseFromTo(query) {
        query = query + " ";
        const datePatFromRes = this.datePatRangeFrom.exec(query);
        const datePatToRes = this.datePatRangeTo.exec(query);
        if (datePatFromRes == null && datePatToRes == null)
            return undefined;
        const arr = [undefined, undefined];
        if (datePatFromRes !== null)
            if (datePatFromRes[1] !== undefined && datePatFromRes[2] !== undefined && datePatFromRes[3] !== undefined) {
                // single date mode date:24-12-2020
                const day = datePatFromRes[1];
                const month = datePatFromRes[2];
                const year = datePatFromRes[3];
                let begDate = this.getInitDate(`${month}/${day}/${year}`);
                if (begDate.toString() !== 'Invalid Date')
                    arr[0] = begDate;
            }
        if (datePatToRes !== null)
            if (datePatToRes[1] !== undefined && datePatToRes[2] !== undefined && datePatToRes[3] !== undefined) {
                // single date mode date:24-12-2020
                const day = datePatToRes[1];
                const month = datePatToRes[2];
                const year = datePatToRes[3];
                let endDate = this.getInitDate(`${month}/${day}/${year}`);
                if (endDate.toString() !== 'Invalid Date')
                    arr[1] = endDate;
            }
        return arr;
    }
    parseDate(query) {
        let datePatRes = this.datePat.exec(query);
        if (datePatRes === null)
            return undefined;
        try {
            if (datePatRes[1] !== undefined && datePatRes[2] !== undefined && datePatRes[3] !== undefined) {
                // single date mode date:24-12-2020
                const day = datePatRes[1];
                const month = datePatRes[2];
                const year = datePatRes[3];
                let begDate = this.getInitDate(`${month}/${day}/${year}`);
                if (begDate.toString() == 'Invalid Date')
                    throw new query_1.IllegalDateFormat(`Bad date format give (d , m , yyyy) : ${`${day}/${month}/${year}`}`);
                let endDate = new Date(begDate.getTime() + 24 * 60 * 60 * 1000);
                return [begDate, endDate];
            }
            else if (datePatRes[4] !== undefined) {
                // single year mode date:2016
                const dateStr = datePatRes[4];
                const dateNum = Number.parseInt(dateStr);
                if (isNaN(dateNum))
                    throw new query_1.IllegalDateFormat(`Bad date format given (yyyy):${dateStr}`);
                let begDate = this.getInitDate(`${dateNum}`);
                if (begDate.toString() == 'Invalid Date')
                    throw new query_1.IllegalDateFormat(`Bad date format given (yyyy):${dateStr}`);
                let endDate = this.getInitDate(`${dateNum + 1}`);
                return [begDate, endDate];
            }
            else if (datePatRes[5] !== undefined && datePatRes[6] !== undefined) {
                // month and date date:03-2018
                const month = Number.parseInt(datePatRes[5]);
                const year = Number.parseInt(datePatRes[6]);
                if (!isNaN(month) && !isNaN(year))
                    return [undefined, month, year];
                else
                    throw new query_1.IllegalDateFormat(`Bad Date format give (m-yyyy): ${datePatRes[4]}-${datePatRes[5]}`);
            }
            else if (datePatRes[7] !== undefined && datePatRes[8] !== undefined && datePatRes[9] !== undefined) {
                const day = Number.parseInt(datePatRes[7]);
                const month = Number.parseInt(datePatRes[8]);
                const year = Number.parseInt(datePatRes[9]);
                const arr = [undefined, undefined, undefined];
                if (!isNaN(day))
                    arr[0] = day;
                if (!isNaN(month))
                    arr[1] = month;
                if (!isNaN(year))
                    arr[2] = year;
                return arr;
            }
        }
        catch (err) {
            this.logger.error(err);
            return undefined;
        }
    }
    parseDescription(query) {
        const res = this.descPat.exec(query);
        if (res !== null)
            if (res[1] !== undefined)
                if (res[1].length !== 0)
                    return res[1];
    }
    parseQuery(query) {
        this.logger.debug(`query parser called`);
        let response = {};
        response.tags = this.parseTags(query);
        const date = this.parseDate(query);
        response.dateTime = date == undefined ? this.parseFromTo(query) : date;
        response.desc = this.parseDescription(query);
        return response;
    }
};
QueryBuilder = __decorate([
    inversify_1.injectable(),
    __metadata("design:paramtypes", [])
], QueryBuilder);
exports.QueryBuilder = QueryBuilder;
