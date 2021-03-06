"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const inversify_1 = require("inversify");
const multer_1 = require("../controllers/middleware/multer");
const database_1 = require("../database/database");
const mysql_1 = require("../database/mysql");
const file_1 = require("../models/file");
const search_service_1 = require("../services/search-service");
const query_builder_1 = require("../services/query-builder");
const upload_service_1 = require("../services/upload-service");
const image_client_1 = require("../services/image-upload/image-client");
const image_hashtags_1 = require("../services/image-hashtags");
const cache_1 = require("../controllers/middleware/cache");
const cache_service_1 = require("../services/cache-service");
const auth_1 = require("../controllers/middleware/auth");
let container = new inversify_1.Container();
exports.container = container;
container.bind(cache_service_1.CacheService).to(cache_service_1.CacheService).inSingletonScope();
container.bind(multer_1.MulterMiddleWare).to(multer_1.MulterMiddleWare).inSingletonScope();
container.bind(cache_1.SearchCacheMiddleware).to(cache_1.SearchCacheMiddleware).inSingletonScope();
container.bind(auth_1.AuthMiddleWare).to(auth_1.AuthMiddleWare).inRequestScope();
container.bind(database_1.Database).to(mysql_1.MYSQLDatabase).inRequestScope();
container.bind(file_1.FileOpsModel).to(file_1.FileOpsModel).inSingletonScope();
container.bind(search_service_1.SearchService).to(search_service_1.SearchService).inSingletonScope();
container.bind(query_builder_1.QueryBuilder).to(query_builder_1.QueryBuilder).inSingletonScope();
container.bind(upload_service_1.UploadService).to(upload_service_1.UploadService).inSingletonScope();
container.bind(image_client_1.ImageUploadClient).to(image_client_1.ImageUploadClient).inSingletonScope();
container.bind(image_hashtags_1.ImageHashTags).to(image_hashtags_1.ImageHashTags).inSingletonScope();
