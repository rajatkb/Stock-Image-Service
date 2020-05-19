"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DatabaseConnectionError extends Error {
    constructor(message) {
        super(message);
        Object.setPrototypeOf(this, DatabaseConnectionError.prototype);
        this.name = this.constructor.name;
    }
}
exports.DatabaseConnectionError = DatabaseConnectionError;
class FileEntryCreationError extends Error {
    constructor(message) {
        super(message);
        Object.setPrototypeOf(this, FileEntryCreationError.prototype);
        this.name = this.constructor.name;
    }
}
exports.FileEntryCreationError = FileEntryCreationError;
class QueryError extends Error {
    constructor(message) {
        super(message);
        Object.setPrototypeOf(this, QueryError.prototype);
        this.name = this.constructor.name;
    }
}
exports.QueryError = QueryError;
