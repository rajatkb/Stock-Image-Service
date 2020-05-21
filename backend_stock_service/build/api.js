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
require("reflect-metadata"); // needed by DI container
const api_config_1 = require("./inversify-config/api.config");
const inversify_express_utils_1 = require("inversify-express-utils");
const body_parser_1 = __importDefault(require("body-parser"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv = __importStar(require("dotenv-safe"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const prettyjson_1 = __importDefault(require("prettyjson"));
const cluster_1 = __importDefault(require("cluster"));
dotenv.config({
    example: './.env'
});
const logger_1 = require("./utility/logger");
// registers default at the very end
require("./controllers/default");
// // initalising controllers
require("./controllers/upload");
require("./controllers/search");
require("./controllers/login");
const server_1 = require("./errors/server");
const database_1 = require("./database/database");
const auth_1 = require("./controllers/middleware/auth");
if (process.env.API_PROCESS_COUNT === undefined)
    throw new server_1.UndefinedEnvironmentVariable("process.env.API_PROCESS_COUNT : undefined in .env");
let nump = Number.parseInt(process.env.API_PROCESS_COUNT);
if (process.env.SERVER_PORT === undefined)
    throw new server_1.UndefinedEnvironmentVariable("process.env.SERVER_PORT : undefined in .env");
if (cluster_1.default.isMaster) {
    for (let i = 0; i < nump; i++) {
        setTimeout(() => {
            cluster_1.default.fork(); // sequelize issues , important for production
        }, i * 1000);
    }
}
else {
    console.log(`Server at pid : ${process.pid}`);
    const logger = new logger_1.Logger('api').getLogger();
    logger.info(`App starting !!`);
    const database = api_config_1.container.get(database_1.Database);
    const eapp = express_1.default();
    eapp.use(cors_1.default());
    const server = new inversify_express_utils_1.InversifyExpressServer(api_config_1.container, null, null, eapp, auth_1.CustomAuthProvider);
    server.setConfig((app) => {
        // disabled compression control calculations
        app.set('etag', false);
        // for security purposes
        app.use(helmet_1.default());
        app.use(body_parser_1.default.json());
        app.use(body_parser_1.default.urlencoded({ extended: true }));
    });
    let app = server.build();
    let routerInfo = inversify_express_utils_1.getRouteInfo(api_config_1.container);
    logger.info(" Router Info !! \n\n" + prettyjson_1.default.render(routerInfo) + " \n\n");
    app.listen(process.env.SERVER_PORT, () => {
        logger.info(`Server started at ${process.env.SERVER_PORT}`);
    });
    process.on("SIGINT", () => {
        database.close();
    });
}
