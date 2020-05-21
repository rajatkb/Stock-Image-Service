"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const dotenv = __importStar(require("dotenv-safe"));
const server_1 = require("./errors/server");
dotenv.config({
    example: './.env'
});
if (process.env.FILE_SERVER_PORT === undefined)
    throw new server_1.UndefinedEnvironmentVariable(`FILE_SERVER_PORT not defined`);
if (process.env.STORAGE_LOCATION === undefined)
    throw new server_1.UndefinedEnvironmentVariable(`STORAGE_LOCATION not defined`);
if (process.env.APPLICATION_LOCATION === undefined)
    throw new server_1.UndefinedEnvironmentVariable(`APPLICATION_LOCATION not defined`);
const uploads = process.env.STORAGE_LOCATION;
const port = Number.parseInt(process.env.FILE_SERVER_PORT);
const application = process.env.APPLICATION_LOCATION;
const app = express_1.default();
app.use(cors_1.default());
// disabled compression control calculations
app.set('etag', false);
// for security purposes
app.use(helmet_1.default());
app.use('/uploads', express_1.default.static(uploads));
app.use(express_1.default.static(application));
app.get("*", (req, res) => {
    res.status(400).json({
        status: 400,
        payload: " (ノಠ益ಠ)ノ彡┻━┻ "
    });
});
app.listen(port, () => {
    console.log(`Server listening at port : ${port}`);
});
