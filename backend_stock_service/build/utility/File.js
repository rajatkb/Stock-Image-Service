"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class File {
    constructor(filename, encoding, mimetype, buffer) {
        this.filename = filename;
        this.encoding = encoding;
        this.mimetype = mimetype;
        this.buffer = buffer;
        this.size = this.buffer.length;
    }
    static asMessage(id, fileBuffer) {
        const idb = Buffer.from(id);
        if (idb.length !== 36)
            throw new Error(`BUffer cannot be constructed , id must be 36 char or 256 bit uuid`);
        return Buffer.concat([idb, fileBuffer]);
    }
    static getIdandBuffer(buffer) {
        const id = buffer.slice(0, 36);
        const img = buffer.slice(36, buffer.length);
        return [id.toString('utf8'), img];
    }
}
exports.File = File;
